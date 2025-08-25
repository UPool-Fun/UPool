// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title UPoolRegistryUpgradeable
 * @dev Upgradeable registry contract for managing UPool instances and global settings
 * @notice This is the registry contract for the UPool protocol with upgradeability
 * @custom:security-contact security@upool.fun
 * @custom:oz-upgrades-from UPoolRegistryUpgradeable
 */
contract UPoolRegistryUpgradeable is 
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

    /// @dev Version of the registry contract
    string public constant VERSION = "2.0.0";
    
    /// @dev Minimum pool creation fee in wei
    uint256 public poolCreationFee;
    
    /// @dev Maximum number of pools per creator
    uint256 public maxPoolsPerCreator;
    
    /// @dev Treasury address for collecting fees
    address public treasury;

    /// @dev Mapping of pool addresses to their status
    mapping(address => bool) public isValidPool;
    
    /// @dev Mapping of creator to their pool count
    mapping(address => uint256) public creatorPoolCount;
    
    /// @dev Array of all registered pools
    address[] public allPools;

    /// @dev Pool categories for better organization
    mapping(address => string) public poolCategories; // pool => category
    mapping(string => address[]) public poolsByCategory; // category => pools[]

    /// @dev Pool verification status
    mapping(address => bool) public isVerifiedPool;
    mapping(address => string) public verificationDetails; // pool => verification info

    /// @dev Storage gap for future upgrades - CRITICAL for upgradeable contracts
    uint256[50] private __gap;

    /// @dev Events
    event PoolRegistered(address indexed pool, address indexed creator, uint256 timestamp);
    event PoolRemoved(address indexed pool, address indexed creator, uint256 timestamp);
    event PoolCreationFeeUpdated(uint256 oldFee, uint256 newFee);
    event MaxPoolsPerCreatorUpdated(uint256 oldMax, uint256 newMax);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event FeesWithdrawn(address indexed to, uint256 amount);
    event PoolCategorized(address indexed pool, string category);
    event PoolVerified(address indexed pool, bool verified, string details);
    event RegistryUpgraded(address indexed newImplementation, uint256 timestamp);

    /// @dev Errors
    error InvalidPoolAddress();
    error PoolAlreadyRegistered();
    error PoolNotRegistered();
    error InsufficientFee();
    error MaxPoolsExceeded();
    error InvalidTreasuryAddress();
    error WithdrawalFailed();
    error UnauthorizedUpgrade();
    error InvalidCategory();

    // ========== INITIALIZER ==========

    /**
     * @dev Initialize the upgradeable registry contract
     * @param _initialOwner Initial owner of the contract (must be 0xc2564e41B7F5Cb66d2d99466450CfebcE9e8228f)
     * @param _treasury Treasury address for fee collection
     * @param _poolCreationFee Initial pool creation fee
     * @param _maxPoolsPerCreator Maximum pools per creator
     */
    function initialize(
        address _initialOwner,
        address _treasury,
        uint256 _poolCreationFee,
        uint256 _maxPoolsPerCreator
    ) public initializer {
        // Enforce specific owner address as requested
        require(_initialOwner == 0xc2564e41B7F5Cb66d2d99466450CfebcE9e8228f, "Invalid owner address");
        
        if (_treasury == address(0)) revert InvalidTreasuryAddress();
        
        __Ownable_init(_initialOwner);
        __ReentrancyGuard_init();
        __Pausable_init();
        __UUPSUpgradeable_init();
        
        treasury = _treasury;
        poolCreationFee = _poolCreationFee;
        maxPoolsPerCreator = _maxPoolsPerCreator;
    }

    // ========== UPGRADE AUTHORIZATION ==========

    /**
     * @dev Authorize upgrade (only owner can upgrade)
     * @param newImplementation Address of new implementation
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {
        emit RegistryUpgraded(newImplementation, block.timestamp);
    }

    // ========== POOL REGISTRATION ==========

    /**
     * @dev Register a new pool
     * @param poolAddress Address of the pool to register
     */
    function registerPool(address poolAddress) external payable nonReentrant whenNotPaused {
        if (poolAddress == address(0)) revert InvalidPoolAddress();
        if (isValidPool[poolAddress]) revert PoolAlreadyRegistered();
        if (msg.value < poolCreationFee) revert InsufficientFee();
        if (creatorPoolCount[msg.sender] >= maxPoolsPerCreator) revert MaxPoolsExceeded();

        isValidPool[poolAddress] = true;
        creatorPoolCount[msg.sender]++;
        allPools.push(poolAddress);

        emit PoolRegistered(poolAddress, msg.sender, block.timestamp);
    }

    /**
     * @dev Remove a pool from registry (only owner)
     * @param poolAddress Address of the pool to remove
     */
    function removePool(address poolAddress) external onlyOwner {
        if (!isValidPool[poolAddress]) revert PoolNotRegistered();

        isValidPool[poolAddress] = false;

        // Remove from allPools array
        for (uint256 i = 0; i < allPools.length; i++) {
            if (allPools[i] == poolAddress) {
                allPools[i] = allPools[allPools.length - 1];
                allPools.pop();
                break;
            }
        }

        // Remove from category if exists
        string memory category = poolCategories[poolAddress];
        if (bytes(category).length > 0) {
            _removeFromCategory(poolAddress, category);
            delete poolCategories[poolAddress];
        }

        // Remove verification
        if (isVerifiedPool[poolAddress]) {
            isVerifiedPool[poolAddress] = false;
            delete verificationDetails[poolAddress];
        }

        emit PoolRemoved(poolAddress, msg.sender, block.timestamp);
    }

    /**
     * @dev Categorize a pool (only owner)
     * @param poolAddress Address of the pool
     * @param category Category name
     */
    function categorizePool(address poolAddress, string memory category) external onlyOwner {
        if (!isValidPool[poolAddress]) revert PoolNotRegistered();
        if (bytes(category).length == 0) revert InvalidCategory();

        // Remove from old category if exists
        string memory oldCategory = poolCategories[poolAddress];
        if (bytes(oldCategory).length > 0) {
            _removeFromCategory(poolAddress, oldCategory);
        }

        // Add to new category
        poolCategories[poolAddress] = category;
        poolsByCategory[category].push(poolAddress);

        emit PoolCategorized(poolAddress, category);
    }

    /**
     * @dev Verify a pool (only owner)
     * @param poolAddress Address of the pool
     * @param verified Verification status
     * @param details Verification details
     */
    function verifyPool(address poolAddress, bool verified, string memory details) external onlyOwner {
        if (!isValidPool[poolAddress]) revert PoolNotRegistered();

        isVerifiedPool[poolAddress] = verified;
        verificationDetails[poolAddress] = details;

        emit PoolVerified(poolAddress, verified, details);
    }

    /**
     * @dev Internal function to remove pool from category
     * @param poolAddress Pool address
     * @param category Category name
     */
    function _removeFromCategory(address poolAddress, string memory category) internal {
        address[] storage categoryPools = poolsByCategory[category];
        for (uint256 i = 0; i < categoryPools.length; i++) {
            if (categoryPools[i] == poolAddress) {
                categoryPools[i] = categoryPools[categoryPools.length - 1];
                categoryPools.pop();
                break;
            }
        }
    }

    // ========== ADMIN FUNCTIONS ==========

    /**
     * @dev Update pool creation fee (only owner)
     * @param newFee New pool creation fee
     */
    function updatePoolCreationFee(uint256 newFee) external onlyOwner {
        uint256 oldFee = poolCreationFee;
        poolCreationFee = newFee;
        emit PoolCreationFeeUpdated(oldFee, newFee);
    }

    /**
     * @dev Update maximum pools per creator (only owner)
     * @param newMax New maximum pools per creator
     */
    function updateMaxPoolsPerCreator(uint256 newMax) external onlyOwner {
        uint256 oldMax = maxPoolsPerCreator;
        maxPoolsPerCreator = newMax;
        emit MaxPoolsPerCreatorUpdated(oldMax, newMax);
    }

    /**
     * @dev Update treasury address (only owner)
     * @param newTreasury New treasury address
     */
    function updateTreasury(address newTreasury) external onlyOwner {
        if (newTreasury == address(0)) revert InvalidTreasuryAddress();
        address oldTreasury = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(oldTreasury, newTreasury);
    }

    /**
     * @dev Withdraw collected fees to treasury (only owner)
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        if (balance == 0) return;

        (bool success, ) = treasury.call{value: balance}("");
        if (!success) revert WithdrawalFailed();

        emit FeesWithdrawn(treasury, balance);
    }

    /**
     * @dev Emergency pause function (only owner)
     */
    function emergencyPause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause function (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // ========== VIEW FUNCTIONS ==========

    /**
     * @dev Get total number of registered pools
     * @return Total number of pools
     */
    function getTotalPools() external view returns (uint256) {
        return allPools.length;
    }

    /**
     * @dev Get all registered pools
     * @return Array of all pool addresses
     */
    function getAllPools() external view returns (address[] memory) {
        return allPools;
    }

    /**
     * @dev Get pools by category
     * @param category Category name
     * @return Array of pool addresses in category
     */
    function getPoolsByCategory(string memory category) external view returns (address[] memory) {
        return poolsByCategory[category];
    }

    /**
     * @dev Get verified pools only
     * @return Array of verified pool addresses
     */
    function getVerifiedPools() external view returns (address[] memory) {
        uint256 verifiedCount = 0;
        
        // Count verified pools
        for (uint256 i = 0; i < allPools.length; i++) {
            if (isVerifiedPool[allPools[i]]) {
                verifiedCount++;
            }
        }
        
        // Create array of verified pools
        address[] memory verifiedPools = new address[](verifiedCount);
        uint256 index = 0;
        for (uint256 i = 0; i < allPools.length; i++) {
            if (isVerifiedPool[allPools[i]]) {
                verifiedPools[index] = allPools[i];
                index++;
            }
        }
        
        return verifiedPools;
    }

    /**
     * @dev Get pools with pagination
     * @param offset Starting index
     * @param limit Number of pools to return
     * @return pools Array of pool addresses
     * @return total Total number of pools
     */
    function getPoolsPaginated(uint256 offset, uint256 limit) 
        external 
        view 
        returns (address[] memory pools, uint256 total) 
    {
        total = allPools.length;
        
        if (offset >= total) {
            return (new address[](0), total);
        }

        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }

        pools = new address[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            pools[i - offset] = allPools[i];
        }
    }

    /**
     * @dev Get pool information
     * @param poolAddress Pool address
     * @return isValid Whether pool is registered
     * @return isVerified Whether pool is verified
     * @return category Pool category
     * @return verificationInfo Verification details
     */
    function getPoolInfo(address poolAddress) external view returns (
        bool isValid,
        bool isVerified,
        string memory category,
        string memory verificationInfo
    ) {
        isValid = isValidPool[poolAddress];
        isVerified = isVerifiedPool[poolAddress];
        category = poolCategories[poolAddress];
        verificationInfo = verificationDetails[poolAddress];
    }

    /**
     * @dev Get current contract version
     * @return Current version string
     */
    function getVersion() external pure returns (string memory) {
        return VERSION;
    }
}