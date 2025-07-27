// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title UPoolRegistry
 * @dev Registry contract for managing UPool instances and global settings
 * @notice This is a sample contract for the UPool protocol
 */
contract UPoolRegistry is Ownable, ReentrancyGuard, Pausable {
    /// @dev Version of the registry contract
    string public constant VERSION = "1.0.0";
    
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

    /// @dev Events
    event PoolRegistered(address indexed pool, address indexed creator, uint256 timestamp);
    event PoolRemoved(address indexed pool, address indexed creator, uint256 timestamp);
    event PoolCreationFeeUpdated(uint256 oldFee, uint256 newFee);
    event MaxPoolsPerCreatorUpdated(uint256 oldMax, uint256 newMax);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event FeesWithdrawn(address indexed to, uint256 amount);

    /// @dev Errors
    error InvalidPoolAddress();
    error PoolAlreadyRegistered();
    error PoolNotRegistered();
    error InsufficientFee();
    error MaxPoolsExceeded();
    error InvalidTreasuryAddress();
    error WithdrawalFailed();

    /**
     * @dev Constructor
     * @param _initialOwner Initial owner of the contract
     * @param _treasury Treasury address for fee collection
     * @param _poolCreationFee Initial pool creation fee
     * @param _maxPoolsPerCreator Maximum pools per creator
     */
    constructor(
        address _initialOwner,
        address _treasury,
        uint256 _poolCreationFee,
        uint256 _maxPoolsPerCreator
    ) Ownable(_initialOwner) {
        if (_treasury == address(0)) revert InvalidTreasuryAddress();
        
        treasury = _treasury;
        poolCreationFee = _poolCreationFee;
        maxPoolsPerCreator = _maxPoolsPerCreator;
    }

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

        emit PoolRemoved(poolAddress, msg.sender, block.timestamp);
    }

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
     * @dev Pause the contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

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
}