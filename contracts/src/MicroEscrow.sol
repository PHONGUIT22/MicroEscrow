// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IMicroEscrow} from "./interfaces/IMicroEscrow.sol";

/**
 * @title MicroEscrow
 * @author MicroEscrow Team
 * @notice Core smart contract for gasless micro-escrows designed for student freelancers.
 * @dev Manages the escrow lifecycle: deposits, deliverable submission, dispute raising, 
 *      arbiter resolutions, and automated deadline claims. Inherits ReentrancyGuard for 
 *      fund safety and Ownable for decentralized/arbiter governance.
 */
contract MicroEscrow is IMicroEscrow, ReentrancyGuard, Ownable {
    // =============================================================
    //                      STATE VARIABLES
    // =============================================================

    /// @notice Monotonically increasing counter for unique escrow identifiers.
    uint256 private _escrowIdCounter;

    /// @notice Storage mapping from escrow ID to Escrow record.
    mapping(uint256 => Escrow) private _escrows;

    // =============================================================
    //                       CONSTRUCTOR
    // =============================================================

    /**
     * @notice Initializes the contract and designates the primary arbiter.
     * @param initialArbiter Address of the trusted mediator / protocol administrator.
     */
    constructor(address initialArbiter) Ownable(initialArbiter) {
        if (initialArbiter == address(0)) {
            revert ZeroAddress();
        }
    }

    // =============================================================
    //                    EXTERNAL FUNCTIONS
    // =============================================================

    /**
     * @inheritdoc IMicroEscrow
     */
    function createEscrow(
        address freelancer,
        uint256 deadline,
        string calldata metadataURI
    ) external payable override returns (uint256 escrowId) {
        if (msg.value == 0) {
            revert ZeroDeposit();
        }
        if (freelancer == address(0)) {
            revert ZeroAddress();
        }
        if (freelancer == msg.sender) {
            revert SelfEscrowNotAllowed();
        }
        if (deadline <= block.timestamp) {
            revert InvalidDeadline(deadline, block.timestamp);
        }

        unchecked {
            escrowId = ++_escrowIdCounter;
        }

        _escrows[escrowId] = Escrow({
            id: escrowId,
            client: msg.sender,
            freelancer: freelancer,
            amount: msg.value,
            status: EscrowStatus.Funded,
            deadline: deadline,
            metadataURI: metadataURI,
            proofURI: ""
        });

        emit EscrowCreated(
            escrowId,
            msg.sender,
            freelancer,
            msg.value,
            deadline,
            metadataURI
        );
    }

    /**
     * @inheritdoc IMicroEscrow
     */
    function submitWork(
        uint256 escrowId,
        string calldata proofURI
    ) external override {
        Escrow storage escrow = _getValidEscrow(escrowId);

        if (msg.sender != escrow.freelancer) {
            revert UnauthorizedCaller(msg.sender);
        }
        if (escrow.status != EscrowStatus.Funded) {
            revert InvalidEscrowStatus(escrowId, escrow.status, EscrowStatus.Funded);
        }
        if (bytes(proofURI).length == 0) {
            revert EmptyProofURI();
        }

        escrow.proofURI = proofURI;
        escrow.status = EscrowStatus.Submitted;

        emit WorkSubmitted(escrowId, msg.sender, proofURI);
    }

    /**
     * @inheritdoc IMicroEscrow
     */
    function releaseFunds(uint256 escrowId) external override nonReentrant {
        Escrow storage escrow = _getValidEscrow(escrowId);

        if (
            escrow.status != EscrowStatus.Funded &&
            escrow.status != EscrowStatus.Submitted
        ) {
            revert InvalidEscrowStatus(escrowId, escrow.status, EscrowStatus.Submitted);
        }

        // Authorization rule:
        // 1. Client can release funds at any time.
        // 2. Freelancer can trigger auto-release ONLY IF work was submitted AND review deadline has passed.
        bool isClient = (msg.sender == escrow.client);
        bool isFreelancerWithExpiredDeadline = (msg.sender == escrow.freelancer &&
            escrow.status == EscrowStatus.Submitted &&
            block.timestamp >= escrow.deadline);

        if (!isClient && !isFreelancerWithExpiredDeadline) {
            if (msg.sender == escrow.freelancer && block.timestamp < escrow.deadline) {
                revert DeadlineNotPassed(escrow.deadline, block.timestamp);
            }
            revert UnauthorizedCaller(msg.sender);
        }

        uint256 payout = escrow.amount;
        address freelancerRecipient = escrow.freelancer;

        // Effects
        escrow.status = EscrowStatus.Completed;
        escrow.amount = 0;

        // Interaction
        _safeTransferETH(freelancerRecipient, payout);

        emit FundsReleased(escrowId, freelancerRecipient, payout);
    }

    /**
     * @inheritdoc IMicroEscrow
     */
    function raiseDispute(uint256 escrowId) external override {
        Escrow storage escrow = _getValidEscrow(escrowId);

        if (msg.sender != escrow.client && msg.sender != escrow.freelancer) {
            revert UnauthorizedCaller(msg.sender);
        }
        if (
            escrow.status != EscrowStatus.Funded &&
            escrow.status != EscrowStatus.Submitted
        ) {
            revert InvalidEscrowStatus(escrowId, escrow.status, EscrowStatus.Submitted);
        }

        escrow.status = EscrowStatus.Disputed;

        emit DisputeRaised(escrowId, msg.sender);
    }

    /**
     * @inheritdoc IMicroEscrow
     */
    function resolveDispute(
        uint256 escrowId,
        uint8 splitPercentage
    ) external override onlyOwner nonReentrant {
        if (splitPercentage > 100) {
            revert InvalidSplitPercentage(splitPercentage);
        }

        Escrow storage escrow = _getValidEscrow(escrowId);

        if (escrow.status != EscrowStatus.Disputed) {
            revert InvalidEscrowStatus(escrowId, escrow.status, EscrowStatus.Disputed);
        }

        uint256 totalAmount = escrow.amount;
        uint256 freelancerShare = (totalAmount * splitPercentage) / 100;
        uint256 clientShare = totalAmount - freelancerShare;

        // Effects: Update state before external transfers
        escrow.status = (splitPercentage == 0)
            ? EscrowStatus.Refunded
            : EscrowStatus.Completed;
        escrow.amount = 0;

        address clientRecipient = escrow.client;
        address freelancerRecipient = escrow.freelancer;

        // Interactions
        if (freelancerShare > 0) {
            _safeTransferETH(freelancerRecipient, freelancerShare);
        }
        if (clientShare > 0) {
            _safeTransferETH(clientRecipient, clientShare);
        }

        emit DisputeResolved(
            escrowId,
            clientShare,
            freelancerShare,
            splitPercentage
        );
    }

    /**
     * @inheritdoc IMicroEscrow
     */
    function claimTimeoutRefund(uint256 escrowId) external override nonReentrant {
        Escrow storage escrow = _getValidEscrow(escrowId);

        if (msg.sender != escrow.client) {
            revert UnauthorizedCaller(msg.sender);
        }
        if (escrow.status != EscrowStatus.Funded) {
            revert InvalidEscrowStatus(escrowId, escrow.status, EscrowStatus.Funded);
        }
        if (block.timestamp < escrow.deadline) {
            revert DeadlineNotPassed(escrow.deadline, block.timestamp);
        }

        uint256 refundAmount = escrow.amount;
        address clientRecipient = escrow.client;

        // Effects
        escrow.status = EscrowStatus.Refunded;
        escrow.amount = 0;

        // Interaction
        _safeTransferETH(clientRecipient, refundAmount);

        emit EscrowRefunded(escrowId, clientRecipient, refundAmount);
    }

    // =============================================================
    //                       VIEW FUNCTIONS
    // =============================================================

    /**
     * @inheritdoc IMicroEscrow
     */
    function getEscrow(
        uint256 escrowId
    ) external view override returns (Escrow memory) {
        Escrow memory escrow = _escrows[escrowId];
        if (escrow.id == 0) {
            revert EscrowNotFound(escrowId);
        }
        return escrow;
    }

    /**
     * @inheritdoc IMicroEscrow
     */
    function getEscrowCount() external view override returns (uint256) {
        return _escrowIdCounter;
    }

    // =============================================================
    //                    INTERNAL HELPERS
    // =============================================================

    /**
     * @dev Validates the existence of an escrow and returns its storage pointer.
     * @param escrowId Identifier to look up.
     */
    function _getValidEscrow(
        uint256 escrowId
    ) internal view returns (Escrow storage) {
        Escrow storage escrow = _escrows[escrowId];
        if (escrow.id == 0) {
            revert EscrowNotFound(escrowId);
        }
        return escrow;
    }

    /**
     * @dev Safely transfers native ETH using a low-level call, preventing reentrancy and transfer failures.
     * @param to Recipient address.
     * @param amount Quantity of wei to transfer.
     */
    function _safeTransferETH(address to, uint256 amount) internal {
        (bool success, ) = to.call{value: amount}("");
        if (!success) {
            revert EtherTransferFailed(to, amount);
        }
    }
}