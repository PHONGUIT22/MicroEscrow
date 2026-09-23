// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IMicroEscrow
 * @author MicroEscrow Team
 * @notice Interface defining the core data structures, events, custom errors, 
 *         and external functions for the MicroEscrow protocol.
 */
interface IMicroEscrow {
    // =============================================================
    //                           ENUMS
    // =============================================================

    /**
     * @notice Represents the operational lifecycle of an escrow contract.
     * @param Created Escrow initialized (transitional state).
     * @param Funded Escrow deposited with native ETH; work is in progress.
     * @param Submitted Work completed and deliverables submitted by freelancer.
     * @param Completed Funds settled and released to freelancer.
     * @param Disputed Conflict raised by either party; awaiting arbiter intervention.
     * @param Refunded Escrow cancelled or resolved in favor of the client.
     */
    enum EscrowStatus {
        Created,
        Funded,
        Submitted,
        Completed,
        Disputed,
        Refunded
    }

    // =============================================================
    //                          STRUCTS
    // =============================================================

    /**
     * @notice Stores the state and metadata of an individual milestone escrow.
     * @param id Unique identifier of the escrow.
     * @param client Address of the employer/client depositing funds.
     * @param freelancer Address of the contractor/freelancer providing the work.
     * @param amount Total deposited native currency (ETH/wei) locked in escrow.
     * @param status Current lifecycle state of the escrow.
     * @param deadline Unix timestamp representing the delivery/review cut-off.
     * @param metadataURI Decentralized URI (IPFS/Arweave) pointing to the agreement/terms.
     * @param proofURI Decentralized URI or link to the submitted work deliverables.
     */
    struct Escrow {
        uint256 id;
        address client;
        address freelancer;
        uint256 amount;
        EscrowStatus status;
        uint256 deadline;
        string metadataURI;
        string proofURI;
    }

    // =============================================================
    //                       CUSTOM ERRORS
    // =============================================================

    /// @notice Thrown when an input address is address(0).
    error ZeroAddress();

    /// @notice Thrown when creating an escrow without depositing native currency.
    error ZeroDeposit();

    /// @notice Thrown when client and freelancer addresses are identical.
    error SelfEscrowNotAllowed();

    /// @notice Thrown when the provided deadline is in the past or zero.
    error InvalidDeadline(uint256 deadline, uint256 currentTimestamp);

    /// @notice Thrown when an escrow ID does not exist.
    error EscrowNotFound(uint256 escrowId);

    /// @notice Thrown when an action is executed during an incompatible escrow status.
    error InvalidEscrowStatus(uint256 escrowId, EscrowStatus current, EscrowStatus expected);

    /// @notice Thrown when caller does not have permission to execute the action.
    error UnauthorizedCaller(address caller);

    /// @notice Thrown when submitting work with an empty URI string.
    error EmptyProofURI();

    /// @notice Thrown when the dispute resolution split percentage exceeds 100%.
    error InvalidSplitPercentage(uint8 percentage);

    /// @notice Thrown when auto-release is triggered before the review deadline has elapsed.
    error DeadlineNotPassed(uint256 deadline, uint256 currentTimestamp);

    /// @notice Thrown when safe ETH transfer fails.
    error EtherTransferFailed(address recipient, uint256 amount);

    // =============================================================
    //                          EVENTS
    // =============================================================

    /**
     * @notice Emitted when a new escrow milestone is created and funded.
     * @param escrowId Unique identifier assigned to the created escrow.
     * @param client Address of the client depositing the funds.
     * @param freelancer Address of the assigned freelancer.
     * @param amount Amount of native currency deposited.
     * @param deadline Expiration timestamp for the escrow milestone.
     * @param metadataURI Specification details URI stored on decentralized storage.
     */
    event EscrowCreated(
        uint256 indexed escrowId,
        address indexed client,
        address indexed freelancer,
        uint256 amount,
        uint256 deadline,
        string metadataURI
    );

    /**
     * @notice Emitted when the freelancer submits work deliverables.
     * @param escrowId Unique identifier of the escrow.
     * @param freelancer Address of the freelancer who submitted the deliverables.
     * @param proofURI Link or content identifier pointing to the deliverables.
     */
    event WorkSubmitted(
        uint256 indexed escrowId,
        address indexed freelancer,
        string proofURI
    );

    /**
     * @notice Emitted when escrow funds are released to the freelancer.
     * @param escrowId Unique identifier of the completed escrow.
     * @param freelancer Address receiving the released payout.
     * @param amount Payout amount in native currency.
     */
    event FundsReleased(
        uint256 indexed escrowId,
        address indexed freelancer,
        uint256 amount
    );

    /**
     * @notice Emitted when a dispute is opened by either party.
     * @param escrowId Unique identifier of the disputed escrow.
     * @param raisedBy Address of the party initiating the dispute.
     */
    event DisputeRaised(
        uint256 indexed escrowId,
        address indexed raisedBy
    );

    /**
     * @notice Emitted when an arbiter settles a disputed escrow.
     * @param escrowId Unique identifier of the resolved escrow.
     * @param clientAmount Amount refunded to the client.
     * @param freelancerAmount Amount awarded to the freelancer.
     * @param splitPercentage Percentage awarded to the freelancer (0-100).
     */
    event DisputeResolved(
        uint256 indexed escrowId,
        uint256 clientAmount,
        uint256 freelancerAmount,
        uint8 splitPercentage
    );

    /**
     * @notice Emitted when an escrow is cancelled or fully refunded to the client.
     * @param escrowId Unique identifier of the refunded escrow.
     * @param client Address of the client receiving the refund.
     * @param amount Amount refunded.
     */
    event EscrowRefunded(
        uint256 indexed escrowId,
        address indexed client,
        uint256 amount
    );

    // =============================================================
    //                     EXTERNAL FUNCTIONS
    // =============================================================

    /**
     * @notice Creates and immediately funds an escrow milestone for a freelancer.
     * @param freelancer Address of the service provider.
     * @param deadline Unix timestamp for delivery or auto-resolution criteria.
     * @param metadataURI Specification details URI (terms/scope of work).
     * @return escrowId Unique identifier of the newly created escrow.
     */
    function createEscrow(
        address freelancer,
        uint256 deadline,
        string calldata metadataURI
    ) external payable returns (uint256 escrowId);

    /**
     * @notice Submits the work deliverables for client review.
     * @dev Only callable by the designated freelancer when status is Funded.
     * @param escrowId ID of the target escrow.
     * @param proofURI Deliverables link/URI (e.g., GitHub PR, IPFS hash, Google Drive).
     */
    function submitWork(uint256 escrowId, string calldata proofURI) external;

    /**
     * @notice Releases all escrowed funds to the freelancer.
     * @dev Can be called by the client at any time once funded/submitted, or by the
     *      freelancer if the submission deadline has elapsed without client response.
     * @param escrowId ID of the target escrow.
     */
    function releaseFunds(uint256 escrowId) external;

    /**
     * @notice Freezes the escrow into a Disputed state.
     * @dev Callable by either the client or the freelancer during Funded or Submitted states.
     * @param escrowId ID of the target escrow.
     */
    function raiseDispute(uint256 escrowId) external;

    /**
     * @notice Resolves a disputed escrow according to an arbiter ruling.
     * @dev Only callable by the contract owner/designated arbiter.
     * @param escrowId ID of the disputed escrow.
     * @param splitPercentage Percentage of funds awarded to the freelancer (0 to 100).
     */
    function resolveDispute(uint256 escrowId, uint8 splitPercentage) external;

    /**
     * @notice Allows the client to reclaim deposited funds if the deadline has passed
     *         and the freelancer never submitted deliverables.
     * @param escrowId ID of the target escrow.
     */
    function claimTimeoutRefund(uint256 escrowId) external;

    /**
     * @notice Retrieves the full data struct of an escrow.
     * @param escrowId ID of the target escrow.
     * @return Escrow struct containing all state parameters.
     */
    function getEscrow(uint256 escrowId) external view returns (Escrow memory);

    /**
     * @notice Returns the total count of escrows created on the platform.
     * @return Total escrows count.
     */
    function getEscrowCount() external view returns (uint256);
}