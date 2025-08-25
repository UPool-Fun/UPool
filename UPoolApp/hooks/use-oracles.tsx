"use client";

import { useState, useEffect, useCallback } from 'react';
import { useConfig } from 'wagmi';
import { getPublicClient } from '@wagmi/core';
import { 
  OracleService, 
  MockOracleService, 
  PoolCurrency, 
  PriceData, 
  ConversionResult,
  formatCurrency,
  formatPrice,
  CURRENCY_CONFIG 
} from '@/lib/oracles';

// Platform fee configuration
export const PLATFORM_CONFIG = {
  FEE_PERCENTAGE: 0.1, // 0.1% platform fee
  FEE_RECIPIENT: process.env.NEXT_PUBLIC_PLATFORM_FEE_RECIPIENT || "0x742d35Cc6634C0532925a3b8D43b3f15e9f28ed8",
  PRIVATE_KEY: process.env.NEXT_PUBLIC_PLATFORM_PRIVATE_KEY, // For transaction fees
} as const;

interface OracleState {
  prices: Record<PoolCurrency, PriceData | null>;
  loading: boolean;
  error: string | null;
  lastUpdated: number;
}

interface PoolCreationData {
  targetAmount: string;
  currency: PoolCurrency;
  ethRequired: string;
  platformFee: string;
  totalEthRequired: string;
  exchangeRate: string;
  isDataFresh: boolean;
}

// Main hook for oracle functionality
export function useOracles() {
  const config = useConfig();
  const [state, setState] = useState<OracleState>({
    prices: { ETH: null, USDC: null, EURC: null },
    loading: false,
    error: null,
    lastUpdated: 0,
  });

  // Get oracle service instance
  const getOracleService = useCallback(async () => {
    const publicClient = getPublicClient(config);
    if (!publicClient) {
      throw new Error("Public client not available");
    }

    const network = await publicClient.getChainId();
    
    // Use mock service in development or if real oracle fails
    if (process.env.NODE_ENV === 'development') {
      return new MockOracleService(publicClient, network);
    }
    
    return new OracleService(publicClient, network);
  }, [config]);

  // Fetch all prices
  const fetchPrices = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const oracleService = await getOracleService();
      const prices = await oracleService.getAllPrices();
      
      setState(prev => ({
        ...prev,
        prices,
        loading: false,
        lastUpdated: Date.now(),
      }));
    } catch (error) {
      console.error('Failed to fetch prices:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch prices',
      }));
    }
  }, [getOracleService]);

  // Auto-refresh prices every 30 seconds
  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  // Get conversion rate between currencies
  const getConversion = useCallback(async (
    fromAmount: string,
    fromCurrency: PoolCurrency,
    toCurrency: PoolCurrency
  ): Promise<ConversionResult | null> => {
    try {
      const oracleService = await getOracleService();
      return await oracleService.convertCurrency(fromAmount, fromCurrency, toCurrency);
    } catch (error) {
      console.error('Conversion failed:', error);
      return null;
    }
  }, [getOracleService]);

  return {
    ...state,
    fetchPrices,
    getConversion,
    formatCurrency,
    formatPrice,
    supportedCurrencies: Object.keys(CURRENCY_CONFIG) as PoolCurrency[],
  };
}

// Hook for pool creation with oracle integration
export function usePoolCreation() {
  const { prices, getConversion, loading: oracleLoading } = useOracles();
  const [poolData, setPoolData] = useState<PoolCreationData | null>(null);
  const [calculating, setCalculating] = useState(false);

  // Calculate pool creation requirements
  const calculatePoolRequirements = useCallback(async (
    targetAmount: string,
    currency: PoolCurrency
  ): Promise<PoolCreationData | null> => {
    if (!targetAmount || parseFloat(targetAmount) <= 0) {
      return null;
    }

    setCalculating(true);
    
    try {
      let ethRequired = targetAmount;
      let exchangeRate = "1.0";
      
      // Convert to ETH if not already ETH
      if (currency !== 'ETH') {
        const conversion = await getConversion(targetAmount, currency, 'ETH');
        if (!conversion) {
          throw new Error('Failed to get conversion rate');
        }
        ethRequired = conversion.toAmount;
        exchangeRate = conversion.exchangeRate;
      }

      // Calculate platform fee (0.1% of target amount in ETH)
      const platformFeeAmount = (parseFloat(ethRequired) * PLATFORM_CONFIG.FEE_PERCENTAGE / 100).toString();
      const totalEthRequired = (parseFloat(ethRequired) + parseFloat(platformFeeAmount)).toString();

      // Check if price data is fresh
      const currencyPrice = prices[currency];
      const isDataFresh = currencyPrice ? 
        (Date.now() / 1000 - currencyPrice.publishTime) < 300 : // 5 minutes
        false;

      const result: PoolCreationData = {
        targetAmount,
        currency,
        ethRequired,
        platformFee: platformFeeAmount,
        totalEthRequired,
        exchangeRate,
        isDataFresh,
      };

      setPoolData(result);
      return result;
    } catch (error) {
      console.error('Failed to calculate pool requirements:', error);
      return null;
    } finally {
      setCalculating(false);
    }
  }, [getConversion, prices]);

  return {
    poolData,
    calculating: calculating || oracleLoading,
    calculatePoolRequirements,
    platformFeePercentage: PLATFORM_CONFIG.FEE_PERCENTAGE,
    feeRecipient: PLATFORM_CONFIG.FEE_RECIPIENT,
  };
}

// Hook for currency selection and info
export function useCurrencyInfo() {
  const { prices, supportedCurrencies } = useOracles();

  const getCurrencyOptions = useCallback(() => {
    return supportedCurrencies.map(currency => {
      const config = CURRENCY_CONFIG[currency];
      const price = prices[currency];
      
      return {
        value: currency,
        label: `${config.icon} ${config.name} (${config.symbol})`,
        symbol: config.symbol,
        name: config.name,
        icon: config.icon,
        decimals: config.decimals,
        currentPrice: price ? formatPrice(price.formattedPrice, currency) : 'Loading...',
        priceData: price,
      };
    });
  }, [supportedCurrencies, prices]);

  return {
    currencyOptions: getCurrencyOptions(),
    getCurrencyConfig: (currency: PoolCurrency) => CURRENCY_CONFIG[currency],
    prices,
  };
}

// Hook for platform fee management
export function usePlatformFees() {
  const config = useConfig();

  // Get platform wallet for fee collection
  const getPlatformWallet = useCallback(() => {
    if (!PLATFORM_CONFIG.PRIVATE_KEY) {
      throw new Error('Platform private key not configured');
    }
    
    // In production, this would use a secure key management system
    // For development, we'll use environment variables
    return {
      address: PLATFORM_CONFIG.FEE_RECIPIENT,
      privateKey: PLATFORM_CONFIG.PRIVATE_KEY,
    };
  }, []);

  // Calculate platform fee for amount
  const calculateFee = useCallback((amount: string): string => {
    const amountNum = parseFloat(amount);
    const fee = (amountNum * PLATFORM_CONFIG.FEE_PERCENTAGE / 100);
    return fee.toString();
  }, []);

  // Prepare fee transaction
  const prepareFeeTransaction = useCallback(async (poolAmount: string) => {
    const fee = calculateFee(poolAmount);
    const platformWallet = getPlatformWallet();
    
    return {
      to: platformWallet.address,
      value: fee,
      data: "0x", // Simple ETH transfer
    };
  }, [calculateFee, getPlatformWallet]);

  return {
    feePercentage: PLATFORM_CONFIG.FEE_PERCENTAGE,
    feeRecipient: PLATFORM_CONFIG.FEE_RECIPIENT,
    calculateFee,
    prepareFeeTransaction,
    hasPlatformKey: !!PLATFORM_CONFIG.PRIVATE_KEY,
  };
}

// Utility hook for real-time price display
export function usePriceDisplay(currency: PoolCurrency) {
  const { prices } = useOracles();
  const price = prices[currency];

  return {
    price: price?.formattedPrice || '0.00',
    formattedPrice: price ? formatPrice(price.formattedPrice, currency) : 'Loading...',
    isLoading: !price,
    isFresh: price ? (Date.now() / 1000 - price.publishTime) < 300 : false,
    lastUpdated: price?.publishTime ? new Date(price.publishTime * 1000) : null,
    confidence: price?.confidence || '0',
  };
}