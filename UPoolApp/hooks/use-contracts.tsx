"use client";

import { useState, useEffect } from 'react';
import { useConfig } from 'wagmi';
import { getPublicClient } from '@wagmi/core';
import { contractService, CONTRACTS, NETWORK_CONFIG, formatUtils } from '@/lib/contracts';

// Types for contract data
export interface RegistryInfo {
  version: string;
  owner: string;
  treasury: string;
  poolCreationFee: string;
  maxPoolsPerCreator: string;
  totalPoolsRegistered: string;
  contractAddress: string;
}

export interface YieldStrategyInfo {
  version: string;
  treasury: string;
  availableStrategies: number;
  strategies: Array<{
    name: string;
    strategyType: number;
    protocols: number[];
    expectedAPY: string;
    managementFee: string;
    performanceFee: string;
  }>;
  contractAddress: string;
}

export interface NetworkStatus {
  blockNumber: number;
  chainId: number;
  isCorrectNetwork: boolean;
  expectedChainId: number;
  networkName: string;
}

export interface PoolCreationStatus {
  canCreate: boolean;
  currentPools: number;
  maxPools: string;
}

// Main hook for contract interactions
export function useContracts() {
  const config = useConfig();
  const [registryInfo, setRegistryInfo] = useState<RegistryInfo | null>(null);
  const [yieldStrategyInfo, setYieldStrategyInfo] = useState<YieldStrategyInfo | null>(null);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize contract data
  useEffect(() => {
    let mounted = true;

    async function loadContractData() {
      try {
        setLoading(true);
        setError(null);

        // Get public client for read operations
        const publicClient = getPublicClient(config);
        
        if (!publicClient) {
          throw new Error("Public client not available");
        }

        // Fetch all contract information in parallel
        const [registry, yieldStrategy, network] = await Promise.all([
          contractService.getRegistryInfo(publicClient),
          contractService.getYieldStrategyInfo(publicClient),
          contractService.getNetworkStatus(publicClient),
        ]);

        if (mounted) {
          setRegistryInfo(registry);
          setYieldStrategyInfo(yieldStrategy);
          setNetworkStatus(network);
        }
      } catch (err) {
        console.error("Failed to load contract data:", err);
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load contract data");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadContractData();

    return () => {
      mounted = false;
    };
  }, [config]);

  // Get pool creation status for specific creator
  const checkPoolCreationStatus = async (creator: string): Promise<PoolCreationStatus | null> => {
    try {
      const publicClient = getPublicClient(config);
      if (!publicClient) return null;
      
      return await contractService.canCreatePool(publicClient, creator);
    } catch (err) {
      console.error("Failed to check pool creation status:", err);
      return null;
    }
  };

  // Get optimal yield strategy
  const getOptimalStrategy = async (
    riskLevel: number,
    amount: string,
    durationDays: number
  ): Promise<string | null> => {
    try {
      const publicClient = getPublicClient(config);
      if (!publicClient) return null;
      
      return await contractService.getOptimalStrategy(publicClient, riskLevel, amount, durationDays);
    } catch (err) {
      console.error("Failed to get optimal strategy:", err);
      return null;
    }
  };

  // Refresh contract data
  const refresh = async () => {
    setLoading(true);
    const publicClient = getPublicClient(config);
    
    if (!publicClient) {
      setError("Public client not available");
      setLoading(false);
      return;
    }

    try {
      const [registry, yieldStrategy, network] = await Promise.all([
        contractService.getRegistryInfo(publicClient),
        contractService.getYieldStrategyInfo(publicClient),
        contractService.getNetworkStatus(publicClient),
      ]);

      setRegistryInfo(registry);
      setYieldStrategyInfo(yieldStrategy);
      setNetworkStatus(network);
      setError(null);
    } catch (err) {
      console.error("Failed to refresh contract data:", err);
      setError(err instanceof Error ? err.message : "Failed to refresh contract data");
    } finally {
      setLoading(false);
    }
  };

  // Format helper functions
  const formatters = {
    poolCreationFee: registryInfo ? formatUtils.formatEth(registryInfo.poolCreationFee) : "0.000000",
    strategies: yieldStrategyInfo?.strategies.map(s => ({
      ...s,
      expectedAPY: formatUtils.formatAPY(s.expectedAPY),
      managementFee: formatUtils.formatPercent(s.managementFee),
      performanceFee: formatUtils.formatPercent(s.performanceFee),
    })) || [],
  };

  return {
    // Data
    registryInfo,
    yieldStrategyInfo,
    networkStatus,
    
    // State
    loading,
    error,
    
    // Computed values
    isCorrectNetwork: networkStatus?.isCorrectNetwork ?? false,
    contractsDeployed: !!(registryInfo && yieldStrategyInfo),
    poolCreationFee: formatters.poolCreationFee,
    formattedStrategies: formatters.strategies,
    
    // Actions
    checkPoolCreationStatus,
    getOptimalStrategy,
    refresh,
    
    // Constants
    contracts: CONTRACTS,
    networkConfig: NETWORK_CONFIG,
  };
}

// Hook for checking if contracts are ready
export function useContractsReady() {
  const { contractsDeployed, isCorrectNetwork, loading, error } = useContracts();
  
  return {
    isReady: contractsDeployed && isCorrectNetwork && !loading && !error,
    contractsDeployed,
    isCorrectNetwork,
    loading,
    error,
  };
}

// Hook for registry-specific data
export function useRegistry() {
  const { registryInfo, loading, error, refresh, networkStatus } = useContracts();
  
  return {
    info: registryInfo,
    loading,
    error,
    refresh,
    isCorrectNetwork: networkStatus?.isCorrectNetwork ?? false,
    poolCreationFee: registryInfo ? formatUtils.formatEth(registryInfo.poolCreationFee) : "0.000000",
    totalPools: registryInfo?.totalPoolsRegistered || "0",
    maxPoolsPerCreator: registryInfo?.maxPoolsPerCreator || "0",
  };
}

// Hook for yield strategy data
export function useYieldStrategy() {
  const { yieldStrategyInfo, loading, error, refresh, networkStatus, getOptimalStrategy } = useContracts();
  
  return {
    info: yieldStrategyInfo,
    loading,
    error,
    refresh,
    isCorrectNetwork: networkStatus?.isCorrectNetwork ?? false,
    strategiesCount: yieldStrategyInfo?.availableStrategies || 0,
    strategies: yieldStrategyInfo?.strategies.map(s => ({
      ...s,
      expectedAPY: formatUtils.formatAPY(s.expectedAPY),
      managementFee: formatUtils.formatPercent(s.managementFee),
      performanceFee: formatUtils.formatPercent(s.performanceFee),
    })) || [],
    getOptimalStrategy,
  };
}