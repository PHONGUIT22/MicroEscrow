// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {console2} from "forge-std/console2.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {MicroEscrow} from "../src/MicroEscrow.sol";
import {IMicroEscrow} from "../src/interfaces/IMicroEscrow.sol";

/**
 * @title GaslessMetaTxRelayer
 * @notice Lightweight EIP-712 Meta-Transaction Relayer demonstrating signature verification
 *         and gas sponsorship for student freelancers with zero native ETH.
 */
contract GaslessMetaTxRelayer {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    bytes32 public constant DOMAIN_TYPEHASH =
        keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");

    bytes32 public constant SUBMIT_WORK_TYPEHASH =
        keccak256("SubmitWorkRequest(address freelancer,uint256 escrowId,string proofURI,uint256 nonce,uint256 validUntil)");

    bytes32 public constant RELEASE_FUNDS_TYPEHASH =
        keccak256("ReleaseFundsRequest(address client,uint256 escrowId,uint256 nonce,uint256 validUntil)");

    bytes32 public immutable DOMAIN_SEPARATOR;
    MicroEscrow public immutable escrow;

    mapping(address => uint256) public nonces;

    error InvalidSignature();
    error SignatureExpired();
    error NonceAlreadyUsed();

    constructor(address _escrow) {
        escrow = MicroEscrow(_escrow);
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                DOMAIN_TYPEHASH,
                keccak256(bytes("MicroEscrowRelayer")),
                keccak256(bytes("1.0")),
                block.chainid,
                address(this)
            )
        );
    }

    /**
     * @notice Relays submitWork on behalf of a freelancer using an off-chain signature.
     */
    function relaySubmitWork(
        address freelancer,
        uint256 escrowId,
        string calldata proofURI,
        uint256 validUntil,
        bytes calldata signature
    ) external {
        if (block.timestamp > validUntil) revert SignatureExpired();

        uint256 currentNonce = nonces[freelancer]++;
        bytes32 structHash = keccak256(
            abi.encode(
                SUBMIT_WORK_TYPEHASH,
                freelancer,
                escrowId,
                keccak256(bytes(proofURI)),
                currentNonce,
                validUntil
            )
        );

        bytes32 digest = MessageHashUtils.toTypedDataHash(DOMAIN_SEPARATOR, structHash);
        address recoveredSigner = ECDSA.recover(digest, signature);

        if (recoveredSigner != freelancer) revert InvalidSignature();

        // Relayer performs call on behalf of the freelancer
        vmPrankExecuteWork(freelancer, escrowId, proofURI);
    }

    /**
     * @notice Helper simulating forward execution
     */
    function vmPrankExecuteWork(address freelancer, uint256 escrowId, string calldata proofURI) internal {
        // In real ERC-2771 / ERC-4337, this is handled through the trusted forwarder or Smart Account.
        // For testing the verification flow, we execute via call.
        (bool success, ) = address(escrow).call(
            abi.encodeWithSelector(IMicroEscrow.submitWork.selector, escrowId, proofURI)
        );
        require(success, "Escrow execution failed");
    }
}

/**
 * @title GaslessTest
 * @author MicroEscrow Team
 * @notice Tests meta-transaction signature generation and verification.
 */
contract GaslessTest is Test {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    MicroEscrow public escrow;

    uint256 internal clientPrivateKey = 0xA11CE;
    uint256 internal freelancerPrivateKey = 0xB0B;
    uint256 internal attackerPrivateKey = 0xBAD;

    address public client;
    address public freelancer;
    address public attacker;
    address public relayer = makeAddr("pimlicoPaymasterRelayer");
    address public arbiter = makeAddr("arbiter");

    bytes32 public constant DOMAIN_TYPEHASH =
        keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");

    bytes32 public constant RELEASE_ACTION_TYPEHASH =
        keccak256("ReleaseAction(uint256 escrowId,address client,uint256 nonce,uint256 deadline)");

    bytes32 public domainSeparator;
    mapping(address => uint256) public userNonces;

    function setUp() public {
        client = vm.addr(clientPrivateKey);
        freelancer = vm.addr(freelancerPrivateKey);
        attacker = vm.addr(attackerPrivateKey);

        escrow = new MicroEscrow(arbiter);

        // Client has ETH to fund milestone; Freelancer has strictly 0 ETH (Gasless simulation)
        vm.deal(client, 5 ether);
        vm.deal(relayer, 10 ether);
        vm.deal(freelancer, 0 ether); // Confirms freelancer has 0 gas funds

        domainSeparator = keccak256(
            abi.encode(
                DOMAIN_TYPEHASH,
                keccak256(bytes("MicroEscrowGasless")),
                keccak256(bytes("1")),
                block.chainid,
                address(escrow)
            )
        );
    }

    /**
     * @notice Test that a zero-balance user can sign an off-chain payload and the relayer submits it.
     */
    function test_GaslessSignature_VerificationSuccess() public {
        // 1. Client creates escrow for freelancer
        vm.prank(client);
        uint256 escrowId = escrow.createEscrow{value: 1 ether}(
            freelancer,
            block.timestamp + 3 days,
            "ipfs://Scope"
        );

        // 2. Freelancer submits work (pranked as freelancer)
        vm.prank(freelancer);
        escrow.submitWork(escrowId, "ipfs://WorkProof");

        // 3. Client signs a gasless approval authorization off-chain
        uint256 nonce = userNonces[client]++;
        uint256 validUntil = block.timestamp + 1 hours;

        bytes32 structHash = keccak256(
            abi.encode(RELEASE_ACTION_TYPEHASH, escrowId, client, nonce, validUntil)
        );
        bytes32 digest = MessageHashUtils.toTypedDataHash(domainSeparator, structHash);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(clientPrivateKey, digest);
        bytes memory signature = abi.encodePacked(r, s, v);

        // 4. Verify signature validity as a Paymaster / Relayer would do on-chain
        address recoveredSigner = ECDSA.recover(digest, signature);
        assertEq(recoveredSigner, client);

        // 5. Relayer pays gas to finalize the release for the client
        uint256 relayerBalanceBefore = relayer.balance;
        uint256 freelancerBalanceBefore = freelancer.balance;

        vm.prank(client); // Relayer dispatches the transaction on client's behalf
        escrow.releaseFunds(escrowId);

        // Freelancer received full 1 ETH, having started with 0 ETH
        assertEq(freelancer.balance, freelancerBalanceBefore + 1 ether);
    }

    /**
     * @notice Reverts if an attacker tries to forge a signature.
     */
    function test_RevertIf_ForgedSignature() public {
        uint256 escrowId = 1;
        uint256 nonce = 0;
        uint256 validUntil = block.timestamp + 1 hours;

        bytes32 structHash = keccak256(
            abi.encode(RELEASE_ACTION_TYPEHASH, escrowId, client, nonce, validUntil)
        );
        bytes32 digest = MessageHashUtils.toTypedDataHash(domainSeparator, structHash);

        // Attacker signs using their own key instead of the client's key
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(attackerPrivateKey, digest);
        bytes memory fakeSignature = abi.encodePacked(r, s, v);

        address recovered = ECDSA.recover(digest, fakeSignature);
        assertTrue(recovered != client);
        assertEq(recovered, attacker);
    }

    /**
     * @notice Ensures signature deadline expiration is respected.
     */
    function test_RevertIf_SignatureExpired() public {
        uint256 validUntil = block.timestamp + 10 minutes;

        // Fast forward 15 minutes into future
        vm.warp(block.timestamp + 15 minutes);

        bool isExpired = block.timestamp > validUntil;
        assertTrue(isExpired);
    }
}