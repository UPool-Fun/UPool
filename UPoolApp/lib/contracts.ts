// Contract addresses and integration for UPool smart contracts on Base Sepolia
export const CONTRACTS = {
  // Base Sepolia (testnet) addresses - deployed 2025-08-24
  REGISTRY: "0x4028E9175Fb81c2E820445f8620214456f956d0C",
  YIELD_STRATEGY: "0x1286e6AAcC80e2E54ef05494922c0454Bd403510",
  
  // Factory and Pool contracts pending optimization for size limits
  FACTORY: null, // TBD after optimization
  POOL_IMPLEMENTATION: null, // TBD
} as const;

// Network configuration
export const NETWORK_CONFIG = {
  chainId: 84532, // Base Sepolia
  name: "Base Sepolia",
  rpcUrl: "https://sepolia.base.org",
  blockExplorer: "https://base-sepolia.blockscout.com",
  currency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
} as const;

// Contract ABIs (simplified for frontend interaction)
export const CONTRACT_ABIS = {
  REGISTRY: [
    "function VERSION() external view returns (string memory)",
    "function owner() external view returns (address)",
    "function treasury() external view returns (address)",
    "function poolCreationFee() external view returns (uint256)",
    "function maxPoolsPerCreator() external view returns (uint256)",
    "function totalPoolsRegistered() external view returns (uint256)",
    "function getPoolsByCreator(address creator) external view returns (address[] memory)",
    "function isPoolRegistered(address pool) external view returns (bool)",
    "event PoolRegistered(address indexed pool, address indexed creator, string indexed poolName, uint256 timestamp)",
  ],
  YIELD_STRATEGY: [
    "function VERSION() external view returns (string memory)",
    "function treasury() external view returns (address)",
    "function getAllStrategies() external view returns (tuple(string name, uint8 strategyType, uint8[] protocols, uint256 expectedAPY, uint256 managementFee, uint256 performanceFee)[] memory)",
    "function getOptimalStrategy(uint8 riskLevel, uint256 amount, uint256 duration) external view returns (string memory)",
    "event StrategyAdded(string indexed name, uint8 strategyType, uint256 expectedAPY)",
  ],
} as const;

// Contract interaction utilities
export class ContractService {
  private static instance: ContractService;
  
  public static getInstance(): ContractService {
    if (!ContractService.instance) {
      ContractService.instance = new ContractService();
    }
    return ContractService.instance;
  }

  /**
   * Get registry contract information
   */
  async getRegistryInfo(provider: any) {
    try {
      const contract = new provider.Contract(CONTRACTS.REGISTRY, CONTRACT_ABIS.REGISTRY, provider);
      
      const [version, owner, treasury, fee, maxPools, totalPools] = await Promise.all([
        contract.VERSION(),
        contract.owner(),
        contract.treasury(),
        contract.poolCreationFee(),
        contract.maxPoolsPerCreator(),
        contract.totalPoolsRegistered(),
      ]);

      return {
        version,
        owner,
        treasury,
        poolCreationFee: fee.toString(),
        maxPoolsPerCreator: maxPools.toString(),
        totalPoolsRegistered: totalPools.toString(),
        contractAddress: CONTRACTS.REGISTRY,
      };
    } catch (error) {
      console.error("Failed to fetch registry info:", error);
      throw error;
    }
  }

  /**
   * Get yield strategy information
   */
  async getYieldStrategyInfo(provider: any) {
    try {
      const contract = new provider.Contract(CONTRACTS.YIELD_STRATEGY, CONTRACT_ABIS.YIELD_STRATEGY, provider);
      
      const [version, treasury, strategies] = await Promise.all([
        contract.VERSION(),
        contract.treasury(),
        contract.getAllStrategies(),
      ]);

      return {
        version,
        treasury,
        availableStrategies: strategies.length,
        strategies: strategies.map((strategy: any) => ({
          name: strategy.name,
          strategyType: strategy.strategyType,
          protocols: strategy.protocols,
          expectedAPY: strategy.expectedAPY.toString(),
          managementFee: strategy.managementFee.toString(),
          performanceFee: strategy.performanceFee.toString(),
        })),
        contractAddress: CONTRACTS.YIELD_STRATEGY,
      };
    } catch (error) {
      console.error("Failed to fetch yield strategy info:", error);
      throw error;
    }
  }

  /**
   * Get optimal strategy for pool parameters
   */
  async getOptimalStrategy(provider: any, riskLevel: number, amount: string, durationDays: number) {
    try {
      const contract = new provider.Contract(CONTRACTS.YIELD_STRATEGY, CONTRACT_ABIS.YIELD_STRATEGY, provider);
      const duration = durationDays * 24 * 60 * 60; // Convert days to seconds
      
      const strategy = await contract.getOptimalStrategy(riskLevel, amount, duration);
      return strategy;
    } catch (error) {
      console.error("Failed to get optimal strategy:", error);
      throw error;
    }
  }

  /**
   * Check if pool creation is available
   */
  async canCreatePool(provider: any, creator: string) {
    try {
      const contract = new provider.Contract(CONTRACTS.REGISTRY, CONTRACT_ABIS.REGISTRY, provider);
      const pools = await contract.getPoolsByCreator(creator);
      const maxPools = await contract.maxPoolsPerCreator();
      
      return {
        canCreate: pools.length < maxPools,
        currentPools: pools.length,
        maxPools: maxPools.toString(),
      };
    } catch (error) {
      console.error("Failed to check pool creation availability:", error);
      throw error;
    }
  }

  /**
   * Get current network status
   */
  async getNetworkStatus(provider: any) {
    try {
      const [blockNumber, chainId] = await Promise.all([
        provider.getBlockNumber(),
        provider.getNetwork().then((n: any) => n.chainId),
      ]);

      const isCorrectNetwork = Number(chainId) === NETWORK_CONFIG.chainId;

      return {
        blockNumber,
        chainId: Number(chainId),
        isCorrectNetwork,
        expectedChainId: NETWORK_CONFIG.chainId,
        networkName: isCorrectNetwork ? NETWORK_CONFIG.name : "Unknown Network",
      };
    } catch (error) {
      console.error("Failed to get network status:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const contractService = ContractService.getInstance();

// Utility functions for formatting
export const formatUtils = {
  formatEth: (wei: string) => {
    try {
      return (Number(wei) / 1e18).toFixed(6);
    } catch {
      return "0.000000";
    }
  },
  
  formatPercent: (basisPoints: string) => {
    try {
      return (Number(basisPoints) / 100).toFixed(2);
    } catch {
      return "0.00";
    }
  },
  
  formatAPY: (basisPoints: string) => {
    try {
      return (Number(basisPoints) / 100).toFixed(2);
    } catch {
      return "0.00";
    }
  },
};

// Contract deployment information for reference
export const DEPLOYMENT_INFO = {
  deployedAt: "2025-08-24T21:29:00Z",
  network: "Base Sepolia",
  chainId: 84532,
  deployer: "0x9b0bdEfA0bb258f8D193Befa76565500EC7eeEf1",
  blockExplorer: "https://base-sepolia.blockscout.com",
  contracts: {
    UPoolRegistry: {
      address: CONTRACTS.REGISTRY,
      verified: true,
      explorerUrl: `https://base-sepolia.blockscout.com/address/${CONTRACTS.REGISTRY}#code`,
      size: "3.2 KB",
      features: ["Pool registration", "Creator limits", "Fee management"],
    },
    UPoolYieldStrategy: {
      address: CONTRACTS.YIELD_STRATEGY,
      verified: true,
      explorerUrl: `https://base-sepolia.blockscout.com/address/${CONTRACTS.YIELD_STRATEGY}#code`,
      size: "9.9 KB",
      features: ["Yield optimization", "Strategy management", "Risk assessment"],
    },
  },
} as const;