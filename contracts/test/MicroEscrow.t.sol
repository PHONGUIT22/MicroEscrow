// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {console2} from "forge-std/console2.sol";
import {MicroEscrow} from "../src/MicroEscrow.sol";
import {IMicroEscrow} from "../src/interfaces/IMicroEscrow.sol";

/**
 * @title MicroEscrowTest
 * @author MicroEscrow Team
 * @notice Comprehensive unit tests for MicroEscrow contract covering happy paths,
 *         dispute settlements, security invariants, and edge cases.
 */
contract MicroEscrowTest is Test {
    MicroEscrow public escrowContract;

    address public arbiter = makeAddr("arbiter");
    address public client = makeAddr("client");
    address public freelancer = makeAddr("freelancer");
    address public stranger = makeAddr("stranger");

    uint256 public constant INITIAL_BALANCE = 10 ether;
    uint256 public constant ESCROW_AMOUNT = 1 ether;
    uint256 public constant DURATION = 3 days;

    string public constant SAMPLE_METADATA_URI = "ipfs://QmProjectScopeTermsHash123";
    string public constant SAMPLE_PROOF_URI = "ipfs://QmDeliverableWorkProofHash456";

    function setUp() public {
        // Deploy MicroEscrow with arbiter as the owner
        escrowContract = new MicroEscrow(arbiter);

        // Fund accounts
        vm.deal(client, INITIAL_BALANCE);
        vm.deal(freelancer, INITIAL_BALANCE);
        vm.deal(stranger, INITIAL_BALANCE);
    }

    // =============================================================
    //                       HAPPY PATH TESTS
    // =============================================================

    /**
     * @notice Test standard lifecycle: Create & Fund -> Submit Work -> Client Release.
     */
    function test_HappyPath_CompleteLifecycle() public {
        uint256 deadline = block.timestamp + DURATION;

        // 1. Client creates and funds escrow
        vm.prank(client);
        vm.expectEmit(true, true, true, true);
        emit IMicroEscrow.EscrowCreated(
            1,
            client,
            freelancer,
            ESCROW_AMOUNT,
            deadline,
            SAMPLE_METADATA_URI
        );

        uint256 escrowId = escrowContract.createEscrow{value: ESCROW_AMOUNT}(
            freelancer,
            deadline,
            SAMPLE_METADATA_URI
        );

        assertEq(escrowId, 1);
        assertEq(address(escrowContract).balance, ESCROW_AMOUNT);

        IMicroEscrow.Escrow memory item = escrowContract.getEscrow(escrowId);
        assertEq(uint8(item.status), uint8(IMicroEscrow.EscrowStatus.Funded));
        assertEq(item.amount, ESCROW_AMOUNT);

        // 2. Freelancer submits deliverables
        vm.prank(freelancer);
        vm.expectEmit(true, true, false, true);
        emit IMicroEscrow.WorkSubmitted(escrowId, freelancer, SAMPLE_PROOF_URI);

        escrowContract.submitWork(escrowId, SAMPLE_PROOF_URI);

        item = escrowContract.getEscrow(escrowId);
        assertEq(uint8(item.status), uint8(IMicroEscrow.EscrowStatus.Submitted));
        assertEq(item.proofURI, SAMPLE_PROOF_URI);

        // 3. Client approves deliverables and releases funds
        uint256 freelancerBalanceBefore = freelancer.balance;

        vm.prank(client);
        vm.expectEmit(true, true, false, true);
        emit IMicroEscrow.FundsReleased(escrowId, freelancer, ESCROW_AMOUNT);

        escrowContract.releaseFunds(escrowId);

        // Verify state & balance changes
        item = escrowContract.getEscrow(escrowId);
        assertEq(uint8(item.status), uint8(IMicroEscrow.EscrowStatus.Completed));
        assertEq(item.amount, 0);
        assertEq(freelancer.balance, freelancerBalanceBefore + ESCROW_AMOUNT);
        assertEq(address(escrowContract).balance, 0);
    }

    /**
     * @notice Test auto-release by freelancer when client becomes unresponsive past deadline.
     */
    function test_FreelancerAutoRelease_AfterDeadline() public {
        uint256 deadline = block.timestamp + DURATION;

        // Client creates escrow
        vm.prank(client);
        uint256 escrowId = escrowContract.createEscrow{value: ESCROW_AMOUNT}(
            freelancer,
            deadline,
            SAMPLE_METADATA_URI
        );

        // Freelancer submits deliverables
        vm.prank(freelancer);
        escrowContract.submitWork(escrowId, SAMPLE_PROOF_URI);

        // Fast forward time past deadline
        vm.warp(deadline + 1 seconds);

        // Freelancer triggers auto-release
        uint256 balanceBefore = freelancer.balance;
        vm.prank(freelancer);
        escrowContract.releaseFunds(escrowId);

        assertEq(freelancer.balance, balanceBefore + ESCROW_AMOUNT);
        IMicroEscrow.Escrow memory item = escrowContract.getEscrow(escrowId);
        assertEq(uint8(item.status), uint8(IMicroEscrow.EscrowStatus.Completed));
    }

    // =============================================================
    //                      DISPUTE PATH TESTS
    // =============================================================

    /**
     * @notice Test dispute workflow with a 70/30 split ruling from arbiter.
     */
    function test_DisputeWorkflow_SplitResolution() public {
        uint256 deadline = block.timestamp + DURATION;

        vm.prank(client);
        uint256 escrowId = escrowContract.createEscrow{value: ESCROW_AMOUNT}(
            freelancer,
            deadline,
            SAMPLE_METADATA_URI
        );

        // Freelancer raises dispute
        vm.prank(freelancer);
        vm.expectEmit(true, true, false, false);
        emit IMicroEscrow.DisputeRaised(escrowId, freelancer);
        escrowContract.raiseDispute(escrowId);

        IMicroEscrow.Escrow memory item = escrowContract.getEscrow(escrowId);
        assertEq(uint8(item.status), uint8(IMicroEscrow.EscrowStatus.Disputed));

        // Arbiter resolves dispute: 70% to freelancer, 30% to client
        uint8 freelancerSplit = 70;
        uint256 expectedFreelancerShare = (ESCROW_AMOUNT * 70) / 100;
        uint256 expectedClientShare = ESCROW_AMOUNT - expectedFreelancerShare;

        uint256 clientBalBefore = client.balance;
        uint256 freelancerBalBefore = freelancer.balance;

        vm.prank(arbiter);
        vm.expectEmit(true, false, false, true);
        emit IMicroEscrow.DisputeResolved(
            escrowId,
            expectedClientShare,
            expectedFreelancerShare,
            freelancerSplit
        );

        escrowContract.resolveDispute(escrowId, freelancerSplit);

        assertEq(freelancer.balance, freelancerBalBefore + expectedFreelancerShare);
        assertEq(client.balance, clientBalBefore + expectedClientShare);
        assertEq(address(escrowContract).balance, 0);

        item = escrowContract.getEscrow(escrowId);
        assertEq(uint8(item.status), uint8(IMicroEscrow.EscrowStatus.Completed));
        assertEq(item.amount, 0);
    }

    /**
     * @notice Test dispute resolved with 0% split (Full refund to client).
     */
    function test_DisputeWorkflow_FullClientRefund() public {
        uint256 deadline = block.timestamp + DURATION;

        vm.prank(client);
        uint256 escrowId = escrowContract.createEscrow{value: ESCROW_AMOUNT}(
            freelancer,
            deadline,
            SAMPLE_METADATA_URI
        );

        vm.prank(client);
        escrowContract.raiseDispute(escrowId);

        uint256 clientBalBefore = client.balance;

        vm.prank(arbiter);
        escrowContract.resolveDispute(escrowId, 0);

        assertEq(client.balance, clientBalBefore + ESCROW_AMOUNT);
        IMicroEscrow.Escrow memory item = escrowContract.getEscrow(escrowId);
        assertEq(uint8(item.status), uint8(IMicroEscrow.EscrowStatus.Refunded));
    }

    // =============================================================
    //                  TIMEOUT REFUND TESTS
    // =============================================================

    /**
     * @notice Test client reclaiming full deposit if freelancer never submits work and deadline passes.
     */
    function test_ClaimTimeoutRefund_Success() public {
        uint256 deadline = block.timestamp + DURATION;

        vm.prank(client);
        uint256 escrowId = escrowContract.createEscrow{value: ESCROW_AMOUNT}(
            freelancer,
            deadline,
            SAMPLE_METADATA_URI
        );

        // Advance time past deadline
        vm.warp(deadline + 1 seconds);

        uint256 clientBalBefore = client.balance;

        vm.prank(client);
        vm.expectEmit(true, true, false, true);
        emit IMicroEscrow.EscrowRefunded(escrowId, client, ESCROW_AMOUNT);

        escrowContract.claimTimeoutRefund(escrowId);

        assertEq(client.balance, clientBalBefore + ESCROW_AMOUNT);
        IMicroEscrow.Escrow memory item = escrowContract.getEscrow(escrowId);
        assertEq(uint8(item.status), uint8(IMicroEscrow.EscrowStatus.Refunded));
    }

    // =============================================================
    //                 SECURITY & REVERT TESTS
    // =============================================================

    function test_RevertIf_ZeroDeposit() public {
        vm.prank(client);
        vm.expectRevert(IMicroEscrow.ZeroDeposit.selector);
        escrowContract.createEscrow{value: 0}(
            freelancer,
            block.timestamp + 1 days,
            SAMPLE_METADATA_URI
        );
    }

    function test_RevertIf_ZeroAddressFreelancer() public {
        vm.prank(client);
        vm.expectRevert(IMicroEscrow.ZeroAddress.selector);
        escrowContract.createEscrow{value: ESCROW_AMOUNT}(
            address(0),
            block.timestamp + 1 days,
            SAMPLE_METADATA_URI
        );
    }

    function test_RevertIf_SelfEscrow() public {
        vm.prank(client);
        vm.expectRevert(IMicroEscrow.SelfEscrowNotAllowed.selector);
        escrowContract.createEscrow{value: ESCROW_AMOUNT}(
            client,
            block.timestamp + 1 days,
            SAMPLE_METADATA_URI
        );
    }

    function test_RevertIf_DeadlineInThePast() public {
        vm.prank(client);
        vm.expectRevert(
            abi.encodeWithSelector(
                IMicroEscrow.InvalidDeadline.selector,
                block.timestamp,
                block.timestamp
            )
        );
        escrowContract.createEscrow{value: ESCROW_AMOUNT}(
            freelancer,
            block.timestamp,
            SAMPLE_METADATA_URI
        );
    }

    function test_RevertIf_UnauthorizedSubmitsWork() public {
        uint256 deadline = block.timestamp + DURATION;
        vm.prank(client);
        uint256 escrowId = escrowContract.createEscrow{value: ESCROW_AMOUNT}(
            freelancer,
            deadline,
            SAMPLE_METADATA_URI
        );

        vm.prank(stranger);
        vm.expectRevert(
            abi.encodeWithSelector(IMicroEscrow.UnauthorizedCaller.selector, stranger)
        );
        escrowContract.submitWork(escrowId, SAMPLE_PROOF_URI);
    }

    function test_RevertIf_SubmitWorkEmptyURI() public {
        uint256 deadline = block.timestamp + DURATION;
        vm.prank(client);
        uint256 escrowId = escrowContract.createEscrow{value: ESCROW_AMOUNT}(
            freelancer,
            deadline,
            SAMPLE_METADATA_URI
        );

        vm.prank(freelancer);
        vm.expectRevert(IMicroEscrow.EmptyProofURI.selector);
        escrowContract.submitWork(escrowId, "");
    }

    function test_RevertIf_StrangerAttemptsRelease() public {
        uint256 deadline = block.timestamp + DURATION;
        vm.prank(client);
        uint256 escrowId = escrowContract.createEscrow{value: ESCROW_AMOUNT}(
            freelancer,
            deadline,
            SAMPLE_METADATA_URI
        );

        vm.prank(stranger);
        vm.expectRevert(
            abi.encodeWithSelector(IMicroEscrow.UnauthorizedCaller.selector, stranger)
        );
        escrowContract.releaseFunds(escrowId);
    }

    function test_RevertIf_FreelancerReleasesBeforeDeadline() public {
        uint256 deadline = block.timestamp + DURATION;
        vm.prank(client);
        uint256 escrowId = escrowContract.createEscrow{value: ESCROW_AMOUNT}(
            freelancer,
            deadline,
            SAMPLE_METADATA_URI
        );

        vm.prank(freelancer);
        escrowContract.submitWork(escrowId, SAMPLE_PROOF_URI);

        // Attempt early release before deadline
        vm.prank(freelancer);
        vm.expectRevert(
            abi.encodeWithSelector(
                IMicroEscrow.DeadlineNotPassed.selector,
                deadline,
                block.timestamp
            )
        );
        escrowContract.releaseFunds(escrowId);
    }

    function test_RevertIf_NonOwnerResolvesDispute() public {
        uint256 deadline = block.timestamp + DURATION;
        vm.prank(client);
        uint256 escrowId = escrowContract.createEscrow{value: ESCROW_AMOUNT}(
            freelancer,
            deadline,
            SAMPLE_METADATA_URI
        );

        vm.prank(client);
        escrowContract.raiseDispute(escrowId);

        vm.prank(stranger);
        vm.expectRevert(); // OwnableUnauthorizedAccount
        escrowContract.resolveDispute(escrowId, 50);
    }

    function test_RevertIf_InvalidSplitPercentage() public {
        uint256 deadline = block.timestamp + DURATION;
        vm.prank(client);
        uint256 escrowId = escrowContract.createEscrow{value: ESCROW_AMOUNT}(
            freelancer,
            deadline,
            SAMPLE_METADATA_URI
        );

        vm.prank(client);
        escrowContract.raiseDispute(escrowId);

        vm.prank(arbiter);
        vm.expectRevert(
            abi.encodeWithSelector(IMicroEscrow.InvalidSplitPercentage.selector, 101)
        );
        escrowContract.resolveDispute(escrowId, 101);
    }
}