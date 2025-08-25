// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./UPool.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title UPoolYieldStrategy
 * @dev Contract for managing yield strategies and DeFi integrations for UPool
 * @notice Handles Morpho Protocol integration and yield optimization
 */
contract UPoolYieldStrategy is Ownable, ReentrancyGuard, Pausable {
    /// @dev Version of the yield strategy contract
    string public constant VERSION = "1.0.0";

    // ========== ENUMS ==========

    /// @dev Yield strategy types
    enum StrategyType {
        CONSERVATIVE,    // Low risk, stable yields
        BALANCED,        // Medium risk, balanced returns
        AGGRESSIVE       // High risk, high potential returns
    }

    /// @dev Yield protocol types
    enum ProtocolType {
        MORPHO,          // Morpho Protocol
        AAVE,            // Aave Protocol  
        COMPOUND,        // Compound Protocol
        YEARN           // Yearn Vaults
    }

    /// @dev Strategy status
    enum StrategyStatus {
        INACTIVE,
        ACTIVE,
        PAUSED,
        DEPRECATED
    }

    // ========== STRUCTS ==========

    /// @dev Yield strategy configuration
    struct YieldStrategy {
        string name;                    // Strategy name
        string description;             // Strategy description
        StrategyType strategyType;      // Risk level
        ProtocolType[] protocols;       // Supported protocols
        uint256 minDeposit;            // Minimum deposit amount
        uint256 maxDeposit;            // Maximum deposit amount
        uint256 expectedAPY;           // Expected annual percentage yield (basis points)
        uint256 managementFee;         // Management fee (basis points)
        uint256 performanceFee;        // Performance fee (basis points)
        StrategyStatus status;         // Current status
        uint256 totalDeposits;         // Total deposits in strategy
        uint256 totalYield;            // Total yield generated
        uint256 createdAt;             // Creation timestamp
        uint256 updatedAt;             // Last update timestamp
    }

    /// @dev Pool yield allocation
    struct PoolAllocation {
        address poolAddress;           // UPool address
        uint256 allocatedAmount;       // Amount allocated to strategy
        uint256 yieldEarned;          // Total yield earned
        uint256 lastYieldUpdate;      // Last yield distribution timestamp
        bool isActive;                // Allocation status
    }

    /// @dev Yield distribution record
    struct YieldDistribution {
        address poolAddress;           // Pool that received yield
        uint256 amount;                // Yield amount distributed
        uint256 timestamp;             // Distribution timestamp
        string strategyName;           // Strategy that generated yield
    }

    // ========== STATE VARIABLES ==========

    /// @dev Available yield strategies
    mapping(string => YieldStrategy) public strategies;
    string[] public strategyNames;

    /// @dev Pool allocations by strategy
    mapping(string => mapping(address => PoolAllocation)) public allocations; // strategy => pool => allocation
    mapping(address => string[]) public poolStrategies; // pool => strategies[]

    /// @dev Yield distribution history
    YieldDistribution[] public yieldDistributions;
    mapping(address => uint256) public poolTotalYield; // pool => total yield earned

    /// @dev Strategy performance tracking
    mapping(string => uint256) public strategyPerformance; // strategy => total yield generated
    mapping(string => uint256) public strategyTVL; // strategy => total value locked

    /// @dev Protocol interfaces (to be implemented)
    mapping(ProtocolType => address) public protocolAddresses;

    /// @dev Treasury for fees
    address public treasury;

    /// @dev Global settings
    uint256 public maxStrategiesPerPool = 5;
    uint256 public minAllocationAmount = 0.01 ether;
    uint256 public yieldDistributionInterval = 1 days;

    // ========== EVENTS ==========

    event StrategyCreated(
        string indexed strategyName,
        StrategyType strategyType,
        uint256 expectedAPY,
        uint256 timestamp
    );

    event StrategyUpdated(
        string indexed strategyName,
        StrategyStatus status,
        uint256 timestamp
    );

    event PoolAllocated(
        address indexed poolAddress,
        string indexed strategyName,
        uint256 amount,
        uint256 timestamp
    );

    event AllocationRebalanced(
        address indexed poolAddress,
        string indexed strategyName,
        uint256 oldAmount,
        uint256 newAmount,
        uint256 timestamp
    );

    event YieldDistributed(
        address indexed poolAddress,
        string indexed strategyName,
        uint256 yieldAmount,
        uint256 timestamp
    );

    event StrategyDeposit(
        string indexed strategyName,
        ProtocolType protocol,
        uint256 amount,
        uint256 timestamp
    );

    event StrategyWithdraw(
        string indexed strategyName,
        ProtocolType protocol,
        uint256 amount,
        uint256 timestamp
    );

    event ProtocolAddressUpdated(
        ProtocolType indexed protocolType,
        address indexed oldAddress,
        address indexed newAddress
    );

    // ========== ERRORS ==========

    error StrategyNotFound();
    error StrategyInactive();
    error InsufficientAllocation();
    error MaxStrategiesExceeded();
    error InvalidProtocolAddress();
    error AllocationNotFound();
    error YieldDistributionFailed();
    error UnauthorizedPool();

    // ========== MODIFIERS ==========

    modifier onlyActiveStrategy(string memory strategyName) {
        if (strategies[strategyName].status != StrategyStatus.ACTIVE) {
            revert StrategyInactive();
        }
        _;
    }

    modifier validStrategy(string memory strategyName) {
        if (bytes(strategies[strategyName].name).length == 0) {
            revert StrategyNotFound();
        }
        _;
    }

    // ========== CONSTRUCTOR ==========

    /**
     * @dev Constructor
     * @param _treasury Treasury address for fee collection
     * @param _initialOwner Initial owner of the contract
     */
    constructor(address _treasury, address _initialOwner) Ownable(_initialOwner) {
        treasury = _treasury;
        
        // Initialize default strategies
        _initializeDefaultStrategies();
    }

    // ========== STRATEGY MANAGEMENT ==========

    /**
     * @dev Create a new yield strategy
     * @param strategy Strategy configuration
     */
    function createStrategy(YieldStrategy memory strategy) external onlyOwner {
        if (bytes(strategies[strategy.name].name).length != 0) {
            revert("Strategy already exists");
        }

        strategy.createdAt = block.timestamp;
        strategy.updatedAt = block.timestamp;
        strategy.status = StrategyStatus.ACTIVE;

        strategies[strategy.name] = strategy;
        strategyNames.push(strategy.name);

        emit StrategyCreated(
            strategy.name,
            strategy.strategyType,
            strategy.expectedAPY,
            block.timestamp
        );
    }

    /**
     * @dev Update strategy status
     * @param strategyName Strategy name
     * @param newStatus New status
     */
    function updateStrategyStatus(
        string memory strategyName,
        StrategyStatus newStatus
    ) external onlyOwner validStrategy(strategyName) {
        strategies[strategyName].status = newStatus;
        strategies[strategyName].updatedAt = block.timestamp;

        emit StrategyUpdated(strategyName, newStatus, block.timestamp);
    }

    /**
     * @dev Initialize default yield strategies
     */
    function _initializeDefaultStrategies() internal {
        // Conservative Strategy
        ProtocolType[] memory conservativeProtocols = new ProtocolType[](1);
        conservativeProtocols[0] = ProtocolType.MORPHO;

        strategies["conservative"] = YieldStrategy({
            name: "conservative",
            description: "Low-risk strategy using stable protocols",
            strategyType: StrategyType.CONSERVATIVE,
            protocols: conservativeProtocols,
            minDeposit: 0.01 ether,
            maxDeposit: 1000 ether,
            expectedAPY: 300, // 3% APY
            managementFee: 50, // 0.5%
            performanceFee: 1000, // 10%
            status: StrategyStatus.ACTIVE,
            totalDeposits: 0,
            totalYield: 0,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });
        strategyNames.push("conservative");

        // Balanced Strategy
        ProtocolType[] memory balancedProtocols = new ProtocolType[](2);
        balancedProtocols[0] = ProtocolType.MORPHO;
        balancedProtocols[1] = ProtocolType.AAVE;

        strategies["balanced"] = YieldStrategy({
            name: "balanced",
            description: "Medium-risk strategy with diversified protocols",
            strategyType: StrategyType.BALANCED,
            protocols: balancedProtocols,
            minDeposit: 0.1 ether,
            maxDeposit: 500 ether,
            expectedAPY: 600, // 6% APY
            managementFee: 75, // 0.75%
            performanceFee: 1500, // 15%
            status: StrategyStatus.ACTIVE,
            totalDeposits: 0,
            totalYield: 0,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });
        strategyNames.push("balanced");

        // Aggressive Strategy
        ProtocolType[] memory aggressiveProtocols = new ProtocolType[](3);
        aggressiveProtocols[0] = ProtocolType.MORPHO;
        aggressiveProtocols[1] = ProtocolType.COMPOUND;
        aggressiveProtocols[2] = ProtocolType.YEARN;

        strategies["aggressive"] = YieldStrategy({
            name: "aggressive",
            description: "High-risk, high-reward strategy",
            strategyType: StrategyType.AGGRESSIVE,
            protocols: aggressiveProtocols,
            minDeposit: 0.5 ether,
            maxDeposit: 100 ether,
            expectedAPY: 1200, // 12% APY
            managementFee: 100, // 1%
            performanceFee: 2000, // 20%
            status: StrategyStatus.ACTIVE,
            totalDeposits: 0,
            totalYield: 0,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });
        strategyNames.push("aggressive");
    }

    // ========== ALLOCATION MANAGEMENT ==========

    /**
     * @dev Allocate pool funds to a yield strategy
     * @param poolAddress Pool address
     * @param strategyName Strategy name
     * @param amount Amount to allocate
     */
    function allocateToStrategy(
        address poolAddress,
        string memory strategyName,
        uint256 amount
    ) external onlyActiveStrategy(strategyName) nonReentrant {
        // Verify caller is authorized (pool contract or owner)
        if (msg.sender != poolAddress && msg.sender != owner()) {
            revert UnauthorizedPool();
        }

        if (amount < minAllocationAmount) {
            revert InsufficientAllocation();
        }

        // Check max strategies limit
        if (poolStrategies[poolAddress].length >= maxStrategiesPerPool) {
            revert MaxStrategiesExceeded();
        }

        YieldStrategy storage strategy = strategies[strategyName];
        
        // Check strategy limits
        if (amount < strategy.minDeposit || amount > strategy.maxDeposit) {
            revert InsufficientAllocation();
        }

        // Create or update allocation
        PoolAllocation storage allocation = allocations[strategyName][poolAddress];
        
        if (!allocation.isActive) {
            // New allocation
            allocation.poolAddress = poolAddress;
            allocation.isActive = true;
            poolStrategies[poolAddress].push(strategyName);
        }

        allocation.allocatedAmount += amount;
        allocation.lastYieldUpdate = block.timestamp;

        // Update strategy totals
        strategy.totalDeposits += amount;
        strategyTVL[strategyName] += amount;

        emit PoolAllocated(poolAddress, strategyName, amount, block.timestamp);

        // Execute deposit to underlying protocol
        _depositToProtocol(strategyName, amount);
    }

    /**
     * @dev Rebalance pool allocation
     * @param poolAddress Pool address
     * @param strategyName Strategy name
     * @param newAmount New allocation amount
     */
    function rebalanceAllocation(
        address poolAddress,
        string memory strategyName,
        uint256 newAmount
    ) external onlyActiveStrategy(strategyName) nonReentrant {
        if (msg.sender != poolAddress && msg.sender != owner()) {
            revert UnauthorizedPool();
        }

        PoolAllocation storage allocation = allocations[strategyName][poolAddress];
        if (!allocation.isActive) {
            revert AllocationNotFound();
        }

        uint256 oldAmount = allocation.allocatedAmount;
        allocation.allocatedAmount = newAmount;

        YieldStrategy storage strategy = strategies[strategyName];
        
        if (newAmount > oldAmount) {
            // Increase allocation
            uint256 increaseAmount = newAmount - oldAmount;
            strategy.totalDeposits += increaseAmount;
            strategyTVL[strategyName] += increaseAmount;
            _depositToProtocol(strategyName, increaseAmount);
        } else {
            // Decrease allocation
            uint256 decreaseAmount = oldAmount - newAmount;
            strategy.totalDeposits -= decreaseAmount;
            strategyTVL[strategyName] -= decreaseAmount;
            _withdrawFromProtocol(strategyName, decreaseAmount);
        }

        emit AllocationRebalanced(
            poolAddress,
            strategyName,
            oldAmount,
            newAmount,
            block.timestamp
        );
    }

    // ========== YIELD DISTRIBUTION ==========

    /**
     * @dev Distribute yield to pools
     * @param strategyName Strategy name
     * @param totalYieldEarned Total yield earned by strategy
     */
    function distributeYield(
        string memory strategyName,
        uint256 totalYieldEarned
    ) external onlyOwner validStrategy(strategyName) {
        YieldStrategy storage strategy = strategies[strategyName];
        
        if (strategy.totalDeposits == 0) return;

        // Calculate management and performance fees
        uint256 managementFee = (totalYieldEarned * strategy.managementFee) / 10000;
        uint256 performanceFee = (totalYieldEarned * strategy.performanceFee) / 10000;
        uint256 netYield = totalYieldEarned - managementFee - performanceFee;

        // Distribute yield proportionally to pool allocations
        for (uint256 i = 0; i < strategyNames.length; i++) {
            if (keccak256(bytes(strategyNames[i])) != keccak256(bytes(strategyName))) {
                continue;
            }

            // Get all pools with allocations to this strategy
            // Note: In production, we'd need a more efficient way to iterate through allocations
            // For now, this is a simplified implementation
        }

        // Update strategy performance
        strategy.totalYield += netYield;
        strategyPerformance[strategyName] += netYield;

        // Transfer fees to treasury
        if (managementFee + performanceFee > 0) {
            payable(treasury).transfer(managementFee + performanceFee);
        }
    }

    /**
     * @dev Internal function to deposit to protocol
     * @param strategyName Strategy name
     * @param amount Amount to deposit
     */
    function _depositToProtocol(string memory strategyName, uint256 amount) internal {
        YieldStrategy storage strategy = strategies[strategyName];
        
        // For now, emit event. In production, integrate with actual protocols
        emit StrategyDeposit(strategyName, strategy.protocols[0], amount, block.timestamp);
        
        // TODO: Implement actual protocol integrations
        // Example for Morpho:
        // IMorpho(protocolAddresses[ProtocolType.MORPHO]).deposit(amount);
    }

    /**
     * @dev Internal function to withdraw from protocol
     * @param strategyName Strategy name
     * @param amount Amount to withdraw
     */
    function _withdrawFromProtocol(string memory strategyName, uint256 amount) internal {
        YieldStrategy storage strategy = strategies[strategyName];
        
        // For now, emit event. In production, integrate with actual protocols
        emit StrategyWithdraw(strategyName, strategy.protocols[0], amount, block.timestamp);
        
        // TODO: Implement actual protocol integrations
    }

    // ========== ADMIN FUNCTIONS ==========

    /**
     * @dev Set protocol address
     * @param protocolType Protocol type
     * @param protocolAddress Protocol contract address
     */
    function setProtocolAddress(
        ProtocolType protocolType,
        address protocolAddress
    ) external onlyOwner {
        if (protocolAddress == address(0)) {
            revert InvalidProtocolAddress();
        }

        address oldAddress = protocolAddresses[protocolType];
        protocolAddresses[protocolType] = protocolAddress;

        emit ProtocolAddressUpdated(protocolType, oldAddress, protocolAddress);
    }

    /**
     * @dev Update global settings
     * @param _maxStrategiesPerPool Maximum strategies per pool
     * @param _minAllocationAmount Minimum allocation amount
     * @param _yieldDistributionInterval Yield distribution interval
     */
    function updateGlobalSettings(
        uint256 _maxStrategiesPerPool,
        uint256 _minAllocationAmount,
        uint256 _yieldDistributionInterval
    ) external onlyOwner {
        maxStrategiesPerPool = _maxStrategiesPerPool;
        minAllocationAmount = _minAllocationAmount;
        yieldDistributionInterval = _yieldDistributionInterval;
    }

    // ========== VIEW FUNCTIONS ==========

    /**
     * @dev Get all available strategies
     * @return Array of strategy names
     */
    function getAllStrategies() external view returns (string[] memory) {
        return strategyNames;
    }

    /**
     * @dev Get strategy by name
     * @param strategyName Strategy name
     * @return Strategy data
     */
    function getStrategy(string memory strategyName) 
        external 
        view 
        validStrategy(strategyName) 
        returns (YieldStrategy memory) 
    {
        return strategies[strategyName];
    }

    /**
     * @dev Get pool's strategies
     * @param poolAddress Pool address
     * @return Array of strategy names
     */
    function getPoolStrategies(address poolAddress) external view returns (string[] memory) {
        return poolStrategies[poolAddress];
    }

    /**
     * @dev Get pool allocation for strategy
     * @param poolAddress Pool address
     * @param strategyName Strategy name
     * @return Allocation data
     */
    function getPoolAllocation(address poolAddress, string memory strategyName) 
        external 
        view 
        returns (PoolAllocation memory) 
    {
        return allocations[strategyName][poolAddress];
    }

    /**
     * @dev Get total yield earned by pool
     * @param poolAddress Pool address
     * @return Total yield earned
     */
    function getPoolTotalYield(address poolAddress) external view returns (uint256) {
        return poolTotalYield[poolAddress];
    }
}