// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./UPool.sol";
import "./UPoolRegistry.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title UPoolFactory
 * @dev Factory contract for creating and managing UPool instances
 * @notice Handles pool creation, registry integration, and factory-level settings
 */
contract UPoolFactory is Ownable, ReentrancyGuard, Pausable {
    /// @dev Version of the factory contract
    string public constant VERSION = "1.0.0";

    /// @dev Registry contract for pool management
    UPoolRegistry public immutable registry;
    
    /// @dev Pool creation fee (in wei)
    uint256 public poolCreationFee;
    
    /// @dev Treasury address for collecting fees
    address public treasury;
    
    /// @dev Template settings for pool creation
    struct PoolTemplate {
        string name;
        string description;
        UPool.RiskStrategy defaultRiskStrategy;
        UPool.ApprovalMethod defaultApprovalMethod;
        uint256 defaultApprovalThreshold;
        bool isActive;
    }
    
    /// @dev Available pool templates
    mapping(string => PoolTemplate) public poolTemplates;
    string[] public templateNames;
    
    /// @dev Mapping of created pools
    mapping(address => address) public poolCreator; // pool => creator
    mapping(address => address[]) public creatorPools; // creator => pools[]
    mapping(string => address) public vanityUrlToPool; // vanityUrl => pool
    
    /// @dev Pool creation statistics
    uint256 public totalPoolsCreated;
    uint256 public totalFeesCollected;

    // ========== EVENTS ==========

    event PoolCreated(
        address indexed poolAddress,
        address indexed creator,
        string creatorFid,
        string title,
        string vanityUrl,
        uint256 fundingGoal,
        uint256 timestamp
    );
    
    event PoolTemplateAdded(
        string indexed templateName,
        string description,
        UPool.RiskStrategy riskStrategy,
        UPool.ApprovalMethod approvalMethod,
        uint256 approvalThreshold
    );
    
    event PoolTemplateUpdated(
        string indexed templateName,
        bool isActive
    );
    
    event PoolCreationFeeUpdated(uint256 oldFee, uint256 newFee);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event FeesWithdrawn(address indexed to, uint256 amount);

    // ========== ERRORS ==========

    error InsufficientCreationFee();
    error VanityUrlTaken();
    error InvalidTemplate();
    error InvalidTreasuryAddress();
    error WithdrawalFailed();
    error TemplateAlreadyExists();
    error TemplateNotFound();

    // ========== CONSTRUCTOR ==========

    /**
     * @dev Constructor
     * @param _registry Address of the UPoolRegistry contract
     * @param _treasury Treasury address for fee collection
     * @param _poolCreationFee Initial pool creation fee
     * @param _initialOwner Initial owner of the contract
     */
    constructor(
        address _registry,
        address _treasury,
        uint256 _poolCreationFee,
        address _initialOwner
    ) Ownable(_initialOwner) {
        if (_treasury == address(0)) revert InvalidTreasuryAddress();
        
        registry = UPoolRegistry(_registry);
        treasury = _treasury;
        poolCreationFee = _poolCreationFee;
        
        // Templates can be added later by owner to reduce deployment size
        // Call addTemplate() to add default templates after deployment
    }

    // ========== POOL CREATION ==========

    /**
     * @dev Create a new UPool
     * @param poolData Pool metadata and settings
     * @param creatorFid Farcaster ID of creator (optional)
     * @param milestones Array of initial milestones
     * @param templateName Template to use (optional)
     */
    function createPool(
        UPool.PoolData memory poolData,
        string memory creatorFid,
        UPool.Milestone[] memory milestones,
        string memory templateName
    ) external payable nonReentrant whenNotPaused returns (address) {
        // Check creation fee
        if (msg.value < poolCreationFee) revert InsufficientCreationFee();
        
        // Check vanity URL availability
        if (bytes(poolData.vanityUrl).length > 0) {
            if (vanityUrlToPool[poolData.vanityUrl] != address(0)) {
                revert VanityUrlTaken();
            }
        }
        
        // Apply template settings if specified
        if (bytes(templateName).length > 0) {
            _applyTemplate(templateName, poolData);
        }
        
        // Create new UPool contract
        UPool newPool = new UPool(poolData, msg.sender, creatorFid);
        address poolAddress = address(newPool);
        
        // Add milestones to the pool
        for (uint256 i = 0; i < milestones.length; i++) {
            newPool.addMilestone(milestones[i]);
        }
        
        // Register pool in registry
        registry.registerPool{value: msg.value}(poolAddress);
        
        // Update mappings
        poolCreator[poolAddress] = msg.sender;
        creatorPools[msg.sender].push(poolAddress);
        
        if (bytes(poolData.vanityUrl).length > 0) {
            vanityUrlToPool[poolData.vanityUrl] = poolAddress;
        }
        
        // Update statistics
        totalPoolsCreated++;
        totalFeesCollected += msg.value;
        
        emit PoolCreated(
            poolAddress,
            msg.sender,
            creatorFid,
            poolData.title,
            poolData.vanityUrl,
            poolData.fundingGoal,
            block.timestamp
        );
        
        return poolAddress;
    }

    /**
     * @dev Apply template settings to pool data
     * @param templateName Name of template to apply
     * @param poolData Pool data to modify
     */
    function _applyTemplate(string memory templateName, UPool.PoolData memory poolData) internal view {
        PoolTemplate storage template = poolTemplates[templateName];
        if (!template.isActive) revert InvalidTemplate();
        
        // Apply template defaults if not already set
        if (poolData.riskStrategy == UPool.RiskStrategy.LOW) {
            poolData.riskStrategy = template.defaultRiskStrategy;
        }
        
        if (poolData.approvalMethod == UPool.ApprovalMethod.MAJORITY) {
            poolData.approvalMethod = template.defaultApprovalMethod;
            poolData.approvalThreshold = template.defaultApprovalThreshold;
        }
    }

    // ========== TEMPLATE MANAGEMENT ==========

    /**
     * @dev Add a new pool template
     * @param name Template name
     * @param description Template description
     * @param riskStrategy Default risk strategy
     * @param approvalMethod Default approval method
     * @param approvalThreshold Default approval threshold
     */
    function addPoolTemplate(
        string memory name,
        string memory description,
        UPool.RiskStrategy riskStrategy,
        UPool.ApprovalMethod approvalMethod,
        uint256 approvalThreshold
    ) external onlyOwner {
        if (poolTemplates[name].isActive) revert TemplateAlreadyExists();
        
        poolTemplates[name] = PoolTemplate({
            name: name,
            description: description,
            defaultRiskStrategy: riskStrategy,
            defaultApprovalMethod: approvalMethod,
            defaultApprovalThreshold: approvalThreshold,
            isActive: true
        });
        
        templateNames.push(name);
        
        emit PoolTemplateAdded(name, description, riskStrategy, approvalMethod, approvalThreshold);
    }

    /**
     * @dev Update pool template status
     * @param name Template name
     * @param isActive New active status
     */
    function updateTemplateStatus(string memory name, bool isActive) external onlyOwner {
        if (bytes(poolTemplates[name].name).length == 0) revert TemplateNotFound();
        
        poolTemplates[name].isActive = isActive;
        emit PoolTemplateUpdated(name, isActive);
    }

    /**
     * @dev Add default templates
     */
    // Default templates removed to reduce contract size.
    // Use addTemplate() function to add templates after deployment.

    // ========== ADMIN FUNCTIONS ==========

    /**
     * @dev Update pool creation fee
     * @param newFee New creation fee
     */
    function updatePoolCreationFee(uint256 newFee) external onlyOwner {
        uint256 oldFee = poolCreationFee;
        poolCreationFee = newFee;
        emit PoolCreationFeeUpdated(oldFee, newFee);
    }

    /**
     * @dev Update treasury address
     * @param newTreasury New treasury address
     */
    function updateTreasury(address newTreasury) external onlyOwner {
        if (newTreasury == address(0)) revert InvalidTreasuryAddress();
        address oldTreasury = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(oldTreasury, newTreasury);
    }

    /**
     * @dev Withdraw collected fees
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        if (balance == 0) return;

        (bool success, ) = treasury.call{value: balance}("");
        if (!success) revert WithdrawalFailed();

        emit FeesWithdrawn(treasury, balance);
    }

    /**
     * @dev Pause the factory
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the factory
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // ========== VIEW FUNCTIONS ==========

    /**
     * @dev Get pools created by a specific creator
     * @param creator Creator address
     * @return Array of pool addresses
     */
    function getCreatorPools(address creator) external view returns (address[] memory) {
        return creatorPools[creator];
    }

    /**
     * @dev Get pool by vanity URL
     * @param vanityUrl Vanity URL
     * @return Pool address
     */
    function getPoolByVanityUrl(string memory vanityUrl) external view returns (address) {
        return vanityUrlToPool[vanityUrl];
    }

    /**
     * @dev Get all available templates
     * @return Array of template names
     */
    function getAllTemplates() external view returns (string[] memory) {
        return templateNames;
    }

    /**
     * @dev Get template details
     * @param name Template name
     * @return Template data
     */
    function getTemplate(string memory name) external view returns (PoolTemplate memory) {
        return poolTemplates[name];
    }

    /**
     * @dev Check if vanity URL is available
     * @param vanityUrl Vanity URL to check
     * @return True if available
     */
    function isVanityUrlAvailable(string memory vanityUrl) external view returns (bool) {
        return vanityUrlToPool[vanityUrl] == address(0);
    }

    /**
     * @dev Get factory statistics
     * @return totalPools Total pools created
     * @return totalFees Total fees collected
     * @return creationFee Current creation fee
     */
    function getFactoryStats() external view returns (
        uint256 totalPools,
        uint256 totalFees,
        uint256 creationFee
    ) {
        return (totalPoolsCreated, totalFeesCollected, poolCreationFee);
    }
}