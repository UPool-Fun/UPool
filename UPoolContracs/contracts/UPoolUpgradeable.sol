// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title UPoolUpgradeable
 * @dev Upgradeable main contract for managing individual UPool instances with complete pool settings
 * @notice Captures all pool creation settings including milestones, voting, and yield strategies
 * @custom:security-contact security@upool.fun
 * @custom:oz-upgrades-from UPoolUpgradeable
 */
contract UPoolUpgradeable is 
    Initializable, 
    OwnableUpgradeable, 
    ReentrancyGuardUpgradeable, 
    PausableUpgradeable, 
    UUPSUpgradeable 
{
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @dev Version of the UPool contract
    string public constant VERSION = "2.0.0";

    // ========== ENUMS ==========

    /// @dev Pool visibility levels
    enum Visibility { PRIVATE, LINK, PUBLIC }
    
    /// @dev Approval methods for milestone completion
    enum ApprovalMethod { MAJORITY, PERCENTAGE, NUMBER, CREATOR }
    
    /// @dev Risk strategies for yield generation
    enum RiskStrategy { LOW, MEDIUM, HIGH }
    
    /// @dev Pool status lifecycle
    enum PoolStatus { DRAFT, PENDING_PAYMENT, PAYMENT_PROCESSING, ACTIVE, COMPLETED, CANCELLED }
    
    /// @dev Milestone completion status
    enum MilestoneStatus { LOCKED, PENDING_VOTE, APPROVED, REJECTED }

    /// @dev Supported pool currencies
    enum PoolCurrency { ETH, USDC, EURC }

    // ========== STRUCTS ==========

    /// @dev Milestone information
    struct Milestone {
        string id;                  // Unique milestone identifier
        string title;               // Milestone title
        string description;         // Detailed description
        uint256 percentage;         // Percentage of total funds (basis points)
        uint256 amount;             // Calculated amount in wei
        MilestoneStatus status;     // Current status
        address submittedBy;        // Who submitted completion proof
        string proofUrl;            // IPFS hash or URL for proof
        string proofDescription;    // Description of the proof
        uint256 votesFor;          // Votes in favor
        uint256 votesAgainst;      // Votes against
        uint256 submissionTime;    // When proof was submitted
        uint256 approvalTime;      // When milestone was approved
    }

    /// @dev Pool metadata and settings
    struct PoolData {
        string title;                   // Pool title
        string description;             // Pool description
        uint256 fundingGoal;            // Target funding amount in wei
        PoolCurrency currency;          // Pool currency (ETH, USDC, EURC)
        uint256 platformFeeRate;        // Platform fee rate in basis points (10 = 0.1%)
        address platformFeeRecipient;   // Address to receive platform fees
        Visibility visibility;          // Pool visibility setting
        ApprovalMethod approvalMethod;  // How milestones are approved
        uint256 approvalThreshold;      // Threshold for approval (percentage or count)
        string poolName;                // Custom pool name
        string vanityUrl;               // Custom URL identifier
        RiskStrategy riskStrategy;      // Risk level for yield strategies
    }

    /// @dev Member information
    struct Member {
        address memberAddress;      // Member wallet address
        string fid;                 // Farcaster ID (optional)
        uint256 contributed;        // Total contributed amount
        uint256 joinedAt;          // Timestamp when joined
        bool isActive;             // Active status
        uint256 votingWeight;      // Calculated voting weight
    }

    /// @dev Contribution record
    struct Contribution {
        address contributor;        // Who made the contribution
        uint256 amount;            // Amount contributed
        uint256 timestamp;         // When contribution was made
        string transactionHash;    // Transaction hash for tracking
        string source;             // Source of contribution (web, farcaster, mobile)
    }

    // ========== STORAGE VARIABLES ==========

    /// @dev Pool metadata and settings
    PoolData public poolData;
    
    /// @dev Pool status
    PoolStatus public poolStatus;
    
    /// @dev Pool creator information
    address public creator;
    string public creatorFid;
    
    /// @dev Timestamps
    uint256 public createdAt;
    uint256 public updatedAt;
    uint256 public activatedAt;
    uint256 public completedAt;
    
    /// @dev Financial tracking
    uint256 public totalRaised;
    uint256 public totalYieldEarned;
    uint256 public totalDistributed;
    
    /// @dev Pool wallet integration (CDP Server Wallet)
    string public poolWalletId;      // CDP wallet identifier
    address public poolWalletAddress; // Blockchain address
    
    /// @dev Payment tracking
    string public paymentId;
    string public paymentStatus;
    uint256 public paymentAmount;
    string public transactionHash;
    
    /// @dev Milestones
    Milestone[] public milestones;
    mapping(string => uint256) public milestoneIndex; // milestone id => array index
    
    /// @dev Members
    Member[] public members;
    mapping(address => uint256) public memberIndex; // address => array index
    mapping(address => bool) public isMember;
    
    /// @dev Contributions
    Contribution[] public contributions;
    uint256 public contributionCount;
    
    /// @dev Voting tracking
    mapping(string => mapping(address => bool)) public hasVoted; // milestone id => voter => voted
    mapping(string => mapping(address => bool)) public voteChoice; // milestone id => voter => choice (true=for, false=against)

    /// @dev Storage gap for future upgrades - CRITICAL for upgradeable contracts
    uint256[50] private __gap;

    // ========== EVENTS ==========

    event PoolCreated(
        address indexed creator,
        string creatorFid,
        string title,
        uint256 fundingGoal,
        uint256 timestamp
    );
    
    event PoolActivated(uint256 timestamp);
    event PoolCompleted(uint256 timestamp);
    event PoolCancelled(uint256 timestamp);
    event PoolUpgraded(address indexed newImplementation, uint256 timestamp);
    
    event MilestoneAdded(
        string indexed milestoneId,
        string title,
        uint256 percentage,
        uint256 amount
    );
    
    event MilestoneProofSubmitted(
        string indexed milestoneId,
        address indexed submitter,
        string proofUrl,
        string proofDescription,
        uint256 timestamp
    );
    
    event MilestoneVoted(
        string indexed milestoneId,
        address indexed voter,
        bool vote,
        uint256 votingWeight,
        uint256 timestamp
    );
    
    event MilestoneApproved(
        string indexed milestoneId,
        uint256 amount,
        uint256 timestamp
    );
    
    event MilestoneRejected(
        string indexed milestoneId,
        uint256 timestamp
    );
    
    event ContributionMade(
        address indexed contributor,
        uint256 amount,
        string transactionHash,
        string source,
        uint256 timestamp
    );
    
    event PlatformFeeCollected(
        address indexed recipient,
        uint256 amount,
        address indexed contributor
    );
    
    event MemberJoined(
        address indexed member,
        string fid,
        uint256 contribution,
        uint256 timestamp
    );
    
    event YieldDistributed(
        uint256 totalYield,
        uint256 timestamp
    );
    
    event FundsDistributed(
        string indexed milestoneId,
        uint256 amount,
        address recipient,
        uint256 timestamp
    );

    // ========== ERRORS ==========

    error OnlyCreator();
    error OnlyActiveMember();
    error InvalidMilestone();
    error MilestoneNotFound();
    error AlreadyVoted();
    error VotingClosed();
    error InsufficientFunds();
    error InvalidApprovalMethod();
    error MilestonePercentageMismatch();
    error PoolNotActive();
    error PoolAlreadyActive();
    error InvalidContribution();
    error MemberNotFound();
    error UnauthorizedUpgrade();

    // ========== MODIFIERS ==========

    modifier onlyCreator() {
        if (msg.sender != creator) revert OnlyCreator();
        _;
    }

    modifier onlyActiveMember() {
        if (!isMember[msg.sender]) revert OnlyActiveMember();
        _;
    }

    modifier onlyActivePool() {
        if (poolStatus != PoolStatus.ACTIVE) revert PoolNotActive();
        _;
    }

    modifier validMilestone(string memory milestoneId) {
        if (milestoneIndex[milestoneId] == 0 && 
            keccak256(bytes(milestones[0].id)) != keccak256(bytes(milestoneId))) {
            revert MilestoneNotFound();
        }
        _;
    }

    // ========== INITIALIZER ==========

    /**
     * @dev Initialize the upgradeable contract
     * @param _poolData Pool metadata and settings
     * @param _creator Pool creator address
     * @param _creatorFid Farcaster ID of creator (optional)
     */
    function initialize(
        PoolData memory _poolData,
        address _creator,
        string memory _creatorFid
    ) public initializer {
        __Ownable_init(_creator);
        __ReentrancyGuard_init();
        __Pausable_init();
        __UUPSUpgradeable_init();

        poolData = _poolData;
        creator = _creator;
        creatorFid = _creatorFid;
        poolStatus = PoolStatus.DRAFT;
        
        createdAt = block.timestamp;
        updatedAt = block.timestamp;
        
        // Add creator as first member
        _addMember(_creator, _creatorFid, 0);
        
        emit PoolCreated(_creator, _creatorFid, _poolData.title, _poolData.fundingGoal, block.timestamp);
    }

    // ========== UPGRADE AUTHORIZATION ==========

    /**
     * @dev Authorize upgrade (only owner can upgrade)
     * @param newImplementation Address of new implementation
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {
        emit PoolUpgraded(newImplementation, block.timestamp);
    }

    // ========== MILESTONE MANAGEMENT ==========

    /**
     * @dev Add a milestone to the pool
     * @param _milestone Milestone data
     */
    function addMilestone(Milestone memory _milestone) external onlyCreator {
        // Validate milestone percentage
        uint256 totalPercentage = 0;
        for (uint256 i = 0; i < milestones.length; i++) {
            totalPercentage += milestones[i].percentage;
        }
        totalPercentage += _milestone.percentage;
        
        if (totalPercentage > 10000) revert MilestonePercentageMismatch(); // 100% in basis points
        
        // Calculate amount based on percentage
        _milestone.amount = (poolData.fundingGoal * _milestone.percentage) / 10000;
        _milestone.status = MilestoneStatus.LOCKED;
        
        // Add to array and mapping
        milestoneIndex[_milestone.id] = milestones.length;
        milestones.push(_milestone);
        
        emit MilestoneAdded(_milestone.id, _milestone.title, _milestone.percentage, _milestone.amount);
    }

    /**
     * @dev Submit proof for milestone completion
     * @param milestoneId Milestone identifier
     * @param proofUrl IPFS hash or URL for proof
     * @param proofDescription Description of the proof
     */
    function submitMilestoneProof(
        string memory milestoneId,
        string memory proofUrl,
        string memory proofDescription
    ) external onlyCreator validMilestone(milestoneId) onlyActivePool {
        uint256 index = milestoneIndex[milestoneId];
        Milestone storage milestone = milestones[index];
        
        if (milestone.status != MilestoneStatus.LOCKED) revert InvalidMilestone();
        
        milestone.status = MilestoneStatus.PENDING_VOTE;
        milestone.submittedBy = msg.sender;
        milestone.proofUrl = proofUrl;
        milestone.proofDescription = proofDescription;
        milestone.submissionTime = block.timestamp;
        milestone.votesFor = 0;
        milestone.votesAgainst = 0;
        
        emit MilestoneProofSubmitted(milestoneId, msg.sender, proofUrl, proofDescription, block.timestamp);
    }

    // ========== VOTING SYSTEM ==========

    /**
     * @dev Vote on milestone completion
     * @param milestoneId Milestone identifier
     * @param vote True for approval, false for rejection
     */
    function voteOnMilestone(string memory milestoneId, bool vote) 
        external 
        onlyActiveMember 
        validMilestone(milestoneId) 
        onlyActivePool 
    {
        if (hasVoted[milestoneId][msg.sender]) revert AlreadyVoted();
        
        uint256 index = milestoneIndex[milestoneId];
        Milestone storage milestone = milestones[index];
        
        if (milestone.status != MilestoneStatus.PENDING_VOTE) revert VotingClosed();
        
        // Record vote
        hasVoted[milestoneId][msg.sender] = true;
        voteChoice[milestoneId][msg.sender] = vote;
        
        // Get member voting weight
        uint256 memberIdx = memberIndex[msg.sender];
        uint256 votingWeight = members[memberIdx].votingWeight;
        
        if (vote) {
            milestone.votesFor += votingWeight;
        } else {
            milestone.votesAgainst += votingWeight;
        }
        
        emit MilestoneVoted(milestoneId, msg.sender, vote, votingWeight, block.timestamp);
        
        // Check if voting is complete
        _checkVotingCompletion(milestoneId);
    }

    /**
     * @dev Internal function to check if voting is complete and process result
     * @param milestoneId Milestone identifier
     */
    function _checkVotingCompletion(string memory milestoneId) internal {
        uint256 index = milestoneIndex[milestoneId];
        Milestone storage milestone = milestones[index];
        
        bool approved = false;
        
        // Check approval based on method
        if (poolData.approvalMethod == ApprovalMethod.CREATOR) {
            // Only creator can approve
            approved = hasVoted[milestoneId][creator] && voteChoice[milestoneId][creator];
        } else if (poolData.approvalMethod == ApprovalMethod.MAJORITY) {
            // Simple majority
            approved = milestone.votesFor > milestone.votesAgainst;
        } else if (poolData.approvalMethod == ApprovalMethod.PERCENTAGE) {
            // Percentage threshold
            uint256 totalVotes = milestone.votesFor + milestone.votesAgainst;
            if (totalVotes > 0) {
                uint256 approvalRate = (milestone.votesFor * 10000) / totalVotes;
                approved = approvalRate >= poolData.approvalThreshold;
            }
        } else if (poolData.approvalMethod == ApprovalMethod.NUMBER) {
            // Minimum number of approvals
            approved = milestone.votesFor >= poolData.approvalThreshold;
        }
        
        if (approved) {
            milestone.status = MilestoneStatus.APPROVED;
            milestone.approvalTime = block.timestamp;
            emit MilestoneApproved(milestoneId, milestone.amount, block.timestamp);
        } else {
            // Check if enough votes to reject
            uint256 totalWeight = _getTotalVotingWeight();
            uint256 totalVotes = milestone.votesFor + milestone.votesAgainst;
            
            // If majority of weight has voted and result is negative
            if (totalVotes >= (totalWeight / 2)) {
                milestone.status = MilestoneStatus.REJECTED;
                emit MilestoneRejected(milestoneId, block.timestamp);
            }
        }
    }

    // ========== CONTRIBUTION MANAGEMENT ==========

    /**
     * @dev Record a contribution to the pool
     * @param contributor Contributor address
     * @param amount Contribution amount
     * @param txHash Transaction hash
     * @param source Source of contribution
     * @param fid Farcaster ID (optional)
     */
    function recordContribution(
        address contributor,
        uint256 amount,
        string memory txHash,
        string memory source,
        string memory fid
    ) external onlyOwner {
        if (amount == 0) revert InvalidContribution();
        
        // Calculate platform fee
        uint256 platformFee = (amount * poolData.platformFeeRate) / 10000; // basis points
        uint256 netAmount = amount - platformFee;
        
        // Record contribution (net amount after fee)
        contributions.push(Contribution({
            contributor: contributor,
            amount: netAmount,
            timestamp: block.timestamp,
            transactionHash: txHash,
            source: source
        }));
        
        contributionCount++;
        totalRaised += netAmount;
        
        // Transfer platform fee if there's a recipient and fee > 0
        if (platformFee > 0 && poolData.platformFeeRecipient != address(0)) {
            (bool success, ) = poolData.platformFeeRecipient.call{value: platformFee}("");
            if (success) {
                emit PlatformFeeCollected(poolData.platformFeeRecipient, platformFee, contributor);
            }
        }
        
        // Add or update member
        if (!isMember[contributor]) {
            _addMember(contributor, fid, netAmount);
            emit MemberJoined(contributor, fid, netAmount, block.timestamp);
        } else {
            _updateMemberContribution(contributor, netAmount);
        }
        
        emit ContributionMade(contributor, netAmount, txHash, source, block.timestamp);
        
        // Update voting weights
        _updateVotingWeights();
        
        // Check if funding goal is reached
        if (totalRaised >= poolData.fundingGoal && poolStatus == PoolStatus.PAYMENT_PROCESSING) {
            _activatePool();
        }
    }

    /**
     * @dev Activate the pool
     */
    function _activatePool() internal {
        poolStatus = PoolStatus.ACTIVE;
        activatedAt = block.timestamp;
        emit PoolActivated(block.timestamp);
    }

    /**
     * @dev Add a new member to the pool
     */
    function _addMember(address memberAddr, string memory fid, uint256 contribution) internal {
        memberIndex[memberAddr] = members.length;
        members.push(Member({
            memberAddress: memberAddr,
            fid: fid,
            contributed: contribution,
            joinedAt: block.timestamp,
            isActive: true,
            votingWeight: 0 // Will be calculated later
        }));
        isMember[memberAddr] = true;
    }

    /**
     * @dev Update member contribution
     */
    function _updateMemberContribution(address memberAddr, uint256 amount) internal {
        uint256 index = memberIndex[memberAddr];
        members[index].contributed += amount;
    }

    /**
     * @dev Update voting weights for all members
     */
    function _updateVotingWeights() internal {
        if (totalRaised == 0) return;
        
        for (uint256 i = 0; i < members.length; i++) {
            members[i].votingWeight = (members[i].contributed * 10000) / totalRaised;
        }
    }

    /**
     * @dev Get total voting weight
     */
    function _getTotalVotingWeight() internal view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < members.length; i++) {
            total += members[i].votingWeight;
        }
        return total;
    }

    // ========== POOL MANAGEMENT ==========

    /**
     * @dev Update pool status
     * @param newStatus New status
     */
    function updatePoolStatus(PoolStatus newStatus) external onlyOwner {
        poolStatus = newStatus;
        updatedAt = block.timestamp;
        
        if (newStatus == PoolStatus.ACTIVE) {
            activatedAt = block.timestamp;
            emit PoolActivated(block.timestamp);
        } else if (newStatus == PoolStatus.COMPLETED) {
            completedAt = block.timestamp;
            emit PoolCompleted(block.timestamp);
        } else if (newStatus == PoolStatus.CANCELLED) {
            emit PoolCancelled(block.timestamp);
        }
    }

    /**
     * @dev Set pool wallet information
     * @param walletId CDP wallet identifier
     * @param walletAddress Blockchain address
     */
    function setPoolWallet(string memory walletId, address walletAddress) external onlyOwner {
        poolWalletId = walletId;
        poolWalletAddress = walletAddress;
    }

    /**
     * @dev Set payment information
     * @param _paymentId Payment identifier
     * @param _paymentStatus Payment status
     * @param _paymentAmount Payment amount
     * @param _transactionHash Transaction hash
     */
    function setPaymentInfo(
        string memory _paymentId,
        string memory _paymentStatus,
        uint256 _paymentAmount,
        string memory _transactionHash
    ) external onlyOwner {
        paymentId = _paymentId;
        paymentStatus = _paymentStatus;
        paymentAmount = _paymentAmount;
        transactionHash = _transactionHash;
    }

    /**
     * @dev Emergency pause function
     */
    function emergencyPause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause function
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // ========== VIEW FUNCTIONS ==========

    /**
     * @dev Get milestone by ID
     * @param milestoneId Milestone identifier
     * @return Milestone data
     */
    function getMilestone(string memory milestoneId) 
        external 
        view 
        validMilestone(milestoneId) 
        returns (Milestone memory) 
    {
        uint256 index = milestoneIndex[milestoneId];
        return milestones[index];
    }

    /**
     * @dev Get all milestones
     * @return Array of all milestones
     */
    function getAllMilestones() external view returns (Milestone[] memory) {
        return milestones;
    }

    /**
     * @dev Get member by address
     * @param memberAddr Member address
     * @return Member data
     */
    function getMember(address memberAddr) external view returns (Member memory) {
        if (!isMember[memberAddr]) revert MemberNotFound();
        uint256 index = memberIndex[memberAddr];
        return members[index];
    }

    /**
     * @dev Get all members
     * @return Array of all members
     */
    function getAllMembers() external view returns (Member[] memory) {
        return members;
    }

    /**
     * @dev Get all contributions
     * @return Array of all contributions
     */
    function getAllContributions() external view returns (Contribution[] memory) {
        return contributions;
    }

    /**
     * @dev Get pool statistics
     * @return _totalRaised Total amount raised in wei
     * @return _memberCount Number of pool members
     * @return _milestoneCount Total number of milestones
     * @return _contributionCount Number of contributions made
     * @return _completedMilestones Number of completed milestones
     * @return _fundingProgress Funding progress as percentage (basis points)
     */
    function getPoolStats() external view returns (
        uint256 _totalRaised,
        uint256 _memberCount,
        uint256 _milestoneCount,
        uint256 _contributionCount,
        uint256 _completedMilestones,
        uint256 _fundingProgress
    ) {
        _totalRaised = totalRaised;
        _memberCount = members.length;
        _milestoneCount = milestones.length;
        _contributionCount = contributionCount;
        
        // Count completed milestones
        for (uint256 i = 0; i < milestones.length; i++) {
            if (milestones[i].status == MilestoneStatus.APPROVED) {
                _completedMilestones++;
            }
        }
        
        // Calculate funding progress (percentage in basis points)
        if (poolData.fundingGoal > 0) {
            _fundingProgress = (totalRaised * 10000) / poolData.fundingGoal;
        }
    }

    /**
     * @dev Get current contract version
     * @return Current version string
     */
    function getVersion() external pure returns (string memory) {
        return VERSION;
    }
}