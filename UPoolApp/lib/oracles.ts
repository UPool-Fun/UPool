// Oracle integration for Base chain price feeds
import { ethers } from 'ethers';

// Base chain oracle contracts
export const ORACLE_CONTRACTS = {
  // Pyth Network
  PYTH_SEPOLIA: "0xA2aa501b19aff244D90cc15a4Cf739D2725B5729",
  PYTH_MAINNET: "0x8250f4aF4B972684F7b336503E2D6dFeDeB1487a",
  
  // API3 Data Feed Proxies on Base (official addresses from API3 Market)
  API3_ETH_USD_BASE: process.env.NEXT_PUBLIC_API3_ETH_USD_BASE || "0x5b0cf2b36a65a6BB085D501B971e4c102B9Cd473", // ETH/USD proxy
  API3_USDC_USD_BASE: process.env.NEXT_PUBLIC_API3_USDC_USD_BASE || "0xD3C586Eec1C6C3eC41D276a23944dea080eDCf7f", // USDC/USD proxy
  API3_EUR_USD_BASE: process.env.NEXT_PUBLIC_API3_EUR_USD_BASE || "0x806AE35c5351854a6b1e94a0022bC29796B447DB", // EURC/USD proxy from API3
  
  // Price feed IDs (Pyth format)
  PRICE_FEEDS: {
    ETH_USD: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace", // ETH/USD
    USDC_USD: "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a", // USDC/USD
    EUR_USD: "0xa995d00bb36a63cef7fd2c287dc105fc8f3d93779f062f09551b0af3e81ec30b", // EUR/USD for EURC
  },
} as const;

// Supported pool currencies
export type PoolCurrency = 'USDC' | 'EURC' | 'ETH';

// Currency configuration
export const CURRENCY_CONFIG = {
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    address: {
      // Base Mainnet USDC
      base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      // Base Sepolia USDC (mock/testnet)
      baseSepolia: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    },
    priceFeed: ORACLE_CONTRACTS.PRICE_FEEDS.USDC_USD,
    icon: "💵",
  },
  EURC: {
    symbol: 'EURC',
    name: 'Euro Coin',
    decimals: 6,
    address: {
      // Base Mainnet EURC
      base: "0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42",
      // Base Sepolia EURC (mock/testnet)  
      baseSepolia: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    },
    priceFeed: ORACLE_CONTRACTS.PRICE_FEEDS.EUR_USD,
    icon: "🇪🇺",
  },
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    address: {
      base: "0x0000000000000000000000000000000000000000", // Native ETH
      baseSepolia: "0x0000000000000000000000000000000000000000",
    },
    priceFeed: ORACLE_CONTRACTS.PRICE_FEEDS.ETH_USD,
    icon: "⚡",
  },
} as const;

// Pyth oracle ABI (simplified for price reading)
export const PYTH_ABI = [
  "function getPrice(bytes32 id) external view returns (int64 price, uint64 conf, int32 expo, uint256 publishTime)",
  "function getPriceUnsafe(bytes32 id) external view returns (int64 price, uint64 conf, int32 expo, uint256 publishTime)",
  "function getUpdateFee(bytes[] calldata updateData) external view returns (uint feeAmount)",
  "function updatePriceFeeds(bytes[] calldata updateData) external payable",
] as const;

// API3 Data Feed Reader ABI
export const API3_ABI = [
  "function read() external view returns (int224 value, uint32 timestamp)",
] as const;

// Price data interface
export interface PriceData {
  price: string;
  confidence: string;
  expo: number;
  publishTime: number;
  formattedPrice: string;
}

// Currency conversion result
export interface ConversionResult {
  fromAmount: string;
  toAmount: string;
  fromCurrency: PoolCurrency;
  toCurrency: PoolCurrency;
  exchangeRate: string;
  lastUpdated: number;
  confidence: string;
}

export class OracleService {
  private provider: any;
  private chainId: number;
  
  constructor(provider: any, chainId: number) {
    this.provider = provider;
    this.chainId = chainId;
  }

  /**
   * Get oracle contract address for current network
   */
  private getOracleAddress(): string {
    if (this.chainId === 8453) { // Base Mainnet
      return ORACLE_CONTRACTS.PYTH_MAINNET;
    } else if (this.chainId === 84532) { // Base Sepolia
      return ORACLE_CONTRACTS.PYTH_SEPOLIA;
    } else {
      throw new Error(`Unsupported chain ID: ${this.chainId}`);
    }
  }

  /**
   * Get API3 oracle address for currency
   */
  private getAPI3Address(currency: PoolCurrency): string | null {
    if (this.chainId !== 8453) return null; // API3 only on mainnet for now
    
    switch (currency) {
      case 'ETH':
        return ORACLE_CONTRACTS.API3_ETH_USD_BASE;
      case 'USDC':
        return ORACLE_CONTRACTS.API3_USDC_USD_BASE;
      case 'EURC':
        return ORACLE_CONTRACTS.API3_EUR_USD_BASE;
      default:
        return null;
    }
  }

  /**
   * Get price from API3 oracle
   */
  private async getPriceFromAPI3(currency: PoolCurrency): Promise<PriceData> {
    const api3Address = this.getAPI3Address(currency);
    if (!api3Address || api3Address === "0x") {
      throw new Error(`API3 oracle not available for ${currency}`);
    }

    try {
      const contract = new ethers.Contract(api3Address, API3_ABI, this.provider);
      const result = await contract.read();
      
      const [value, timestamp] = result;
      
      // API3 returns value with 18 decimals, timestamp in seconds
      const formattedPrice = (Number(value) / 1e18).toFixed(2);
      
      return {
        price: value.toString(),
        confidence: "1000000", // API3 doesn't provide confidence, use high confidence
        expo: -18,
        publishTime: Number(timestamp),
        formattedPrice,
      };
    } catch (error) {
      console.error(`Failed to get API3 price for ${currency}:`, error);
      throw error;
    }
  }

  /**
   * Get price from Pyth oracle
   */
  private async getPriceFromPyth(currency: PoolCurrency): Promise<PriceData> {
    try {
      const oracleAddress = this.getOracleAddress();
      const contract = new ethers.Contract(oracleAddress, PYTH_ABI, this.provider);
      const config = CURRENCY_CONFIG[currency];
      
      const result = await contract.getPriceUnsafe(config.priceFeed);
      
      const [price, confidence, expo, publishTime] = result;
      
      // Convert to human-readable format
      const formattedPrice = (Number(price) * Math.pow(10, expo)).toFixed(2);
      
      return {
        price: price.toString(),
        confidence: confidence.toString(),
        expo,
        publishTime: Number(publishTime),
        formattedPrice,
      };
    } catch (error) {
      console.error(`Failed to get Pyth price for ${currency}:`, error);
      throw error;
    }
  }

  /**
   * Get price with fallback from API3 to Pyth
   */
  async getPrice(currency: PoolCurrency): Promise<PriceData> {
    // Try API3 first (more reliable on Base mainnet)
    if (this.chainId === 8453) {
      try {
        return await this.getPriceFromAPI3(currency);
      } catch (error) {
        console.log(`API3 failed for ${currency}, trying Pyth...`);
      }
    }
    
    // Fallback to Pyth
    return await this.getPriceFromPyth(currency);
  }

  /**
   * Convert amount between currencies
   */
  async convertCurrency(
    fromAmount: string,
    fromCurrency: PoolCurrency,
    toCurrency: PoolCurrency
  ): Promise<ConversionResult> {
    if (fromCurrency === toCurrency) {
      return {
        fromAmount,
        toAmount: fromAmount,
        fromCurrency,
        toCurrency,
        exchangeRate: "1.0",
        lastUpdated: Date.now(),
        confidence: "100",
      };
    }

    try {
      // Get prices for both currencies (in USD)
      const [fromPrice, toPrice] = await Promise.all([
        this.getPrice(fromCurrency),
        this.getPrice(toCurrency),
      ]);

      // Calculate exchange rate
      const fromPriceNum = parseFloat(fromPrice.formattedPrice);
      const toPriceNum = parseFloat(toPrice.formattedPrice);
      const exchangeRate = fromPriceNum / toPriceNum;

      // Convert amount
      const fromAmountNum = parseFloat(fromAmount);
      const toAmountNum = fromAmountNum * exchangeRate;

      return {
        fromAmount,
        toAmount: toAmountNum.toFixed(6),
        fromCurrency,
        toCurrency,
        exchangeRate: exchangeRate.toFixed(6),
        lastUpdated: Math.min(fromPrice.publishTime, toPrice.publishTime) * 1000,
        confidence: Math.min(
          parseFloat(fromPrice.confidence),
          parseFloat(toPrice.confidence)
        ).toString(),
      };
    } catch (error) {
      console.error('Currency conversion failed:', error);
      throw error;
    }
  }

  /**
   * Get ETH amount needed to fund a pool in USDC/EURC
   */
  async getEthAmountForPool(targetAmount: string, targetCurrency: PoolCurrency): Promise<ConversionResult> {
    if (targetCurrency === 'ETH') {
      return {
        fromAmount: targetAmount,
        toAmount: targetAmount,
        fromCurrency: 'ETH',
        toCurrency: 'ETH',
        exchangeRate: "1.0",
        lastUpdated: Date.now(),
        confidence: "100",
      };
    }

    return await this.convertCurrency(targetAmount, targetCurrency, 'ETH');
  }

  /**
   * Get all current prices
   */
  async getAllPrices(): Promise<Record<PoolCurrency, PriceData>> {
    try {
      const [ethPrice, usdcPrice, eurcPrice] = await Promise.all([
        this.getPrice('ETH'),
        this.getPrice('USDC'),
        this.getPrice('EURC'),
      ]);

      return {
        ETH: ethPrice,
        USDC: usdcPrice,
        EURC: eurcPrice,
      };
    } catch (error) {
      console.error('Failed to get all prices:', error);
      throw error;
    }
  }

  /**
   * Check if oracle data is fresh (within last 5 minutes)
   */
  isPriceDataFresh(publishTime: number): boolean {
    const now = Math.floor(Date.now() / 1000);
    const maxAge = 5 * 60; // 5 minutes
    return (now - publishTime) <= maxAge;
  }

  /**
   * Get currency info for pool creation
   */
  getCurrencyInfo(currency: PoolCurrency) {
    return CURRENCY_CONFIG[currency];
  }

  /**
   * Get supported currencies
   */
  getSupportedCurrencies(): PoolCurrency[] {
    return Object.keys(CURRENCY_CONFIG) as PoolCurrency[];
  }
}

// Utility functions
export const formatCurrency = (amount: string, currency: PoolCurrency): string => {
  const config = CURRENCY_CONFIG[currency];
  const num = parseFloat(amount);
  
  if (currency === 'ETH') {
    return `${num.toFixed(4)} ETH`;
  } else {
    return `${config.icon} ${num.toFixed(2)}`;
  }
};

export const formatPrice = (price: string, currency: PoolCurrency): string => {
  const num = parseFloat(price);
  return `$${num.toFixed(2)} USD`;
};

// Mock oracle service for development/testing
export class MockOracleService extends OracleService {
  private mockPrices = {
    ETH: { formattedPrice: "3200.00", confidence: "1.0", publishTime: Math.floor(Date.now() / 1000) },
    USDC: { formattedPrice: "1.00", confidence: "0.01", publishTime: Math.floor(Date.now() / 1000) },
    EURC: { formattedPrice: "0.92", confidence: "0.01", publishTime: Math.floor(Date.now() / 1000) },
  };

  async getPrice(currency: PoolCurrency): Promise<PriceData> {
    const mockPrice = this.mockPrices[currency];
    return {
      price: (parseFloat(mockPrice.formattedPrice) * 1e8).toString(),
      confidence: (parseFloat(mockPrice.confidence) * 1e8).toString(),
      expo: -8,
      publishTime: mockPrice.publishTime,
      formattedPrice: mockPrice.formattedPrice,
    };
  }
}