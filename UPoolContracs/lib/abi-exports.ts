// UPool Contract ABI Exports for Frontend Integration
// This file exports only the necessary ABIs and types for frontend use

import { Address } from 'viem'

// ✅ **CONTRACT ADDRESSES** - Copy after deployment
export const UPOOL_CONTRACT_ADDRESSES = {
  FACTORY: '0x72672fa9EB552e50841a4DaC3637bC328FBDAc0a' as Address,
  REGISTRY: '0xf8f067c65A73BC17d4D78FB48A774551CBc6C5EA' as Address,
  IMPLEMENTATION: '0xad859B1c980c1F14048bCee70bda19C2F2726F1F' as Address
} as const

// ✅ **ESSENTIAL ABIS** - Minimal ABIs for frontend operations
export const UPOOL_FACTORY_ABI = [
  {
    "type": "function",
    "name": "createPool",
    "inputs": [
      {
        "name": "poolData",
        "type": "tuple",
        "components": [
          { "name": "title", "type": "string" },
          { "name": "description", "type": "string" },
          { "name": "fundingGoal", "type": "uint256" },
          { "name": "currency", "type": "uint8" },
          { "name": "platformFeeRate", "type": "uint256" },
          { "name": "platformFeeRecipient", "type": "address" },
          { "name": "visibility", "type": "uint8" },
          { "name": "approvalMethod", "type": "uint8" },
          { "name": "approvalThreshold", "type": "uint256" },
          { "name": "poolName", "type": "string" },
          { "name": "vanityUrl", "type": "string" },
          { "name": "riskStrategy", "type": "uint8" }
        ]
      },
      { "name": "creatorFid", "type": "string" },
      {
        "name": "milestones", 
        "type": "tuple[]",
        "components": [
          { "name": "id", "type": "string" },
          { "name": "title", "type": "string" },
          { "name": "description", "type": "string" },
          { "name": "percentage", "type": "uint256" },
          { "name": "amount", "type": "uint256" },
          { "name": "status", "type": "uint8" },
          { "name": "submittedBy", "type": "address" },
          { "name": "proofUrl", "type": "string" },
          { "name": "proofDescription", "type": "string" },
          { "name": "votesFor", "type": "uint256" },
          { "name": "votesAgainst", "type": "uint256" },
          { "name": "submissionTime", "type": "uint256" },
          { "name": "approvalTime", "type": "uint256" }
        ]
      },
      { "name": "templateName", "type": "string" }
    ],
    "outputs": [{ "name": "poolAddress", "type": "address" }],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "getCreatorPools",
    "inputs": [{ "name": "creator", "type": "address" }],
    "outputs": [{ "name": "pools", "type": "address[]" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "poolCreationFee",
    "inputs": [],
    "outputs": [{ "name": "fee", "type": "uint256" }],
    "stateMutability": "view"
  }
] as const

export const UPOOL_REGISTRY_ABI = [
  {
    "type": "function",
    "name": "getPublicPools",
    "inputs": [
      { "name": "offset", "type": "uint256" },
      { "name": "limit", "type": "uint256" }
    ],
    "outputs": [{ "name": "pools", "type": "address[]" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getTotalPools",
    "inputs": [],
    "outputs": [{ "name": "total", "type": "uint256" }],
    "stateMutability": "view"
  }
] as const

export const UPOOL_ABI = [
  {
    "type": "function",
    "name": "poolData", 
    "inputs": [],
    "outputs": [{
      "name": "data",
      "type": "tuple",
      "components": [
        { "name": "title", "type": "string" },
        { "name": "description", "type": "string" },
        { "name": "fundingGoal", "type": "uint256" },
        { "name": "currency", "type": "uint8" },
        { "name": "platformFeeRate", "type": "uint256" },
        { "name": "platformFeeRecipient", "type": "address" },
        { "name": "visibility", "type": "uint8" },
        { "name": "approvalMethod", "type": "uint8" },
        { "name": "approvalThreshold", "type": "uint256" },
        { "name": "poolName", "type": "string" },
        { "name": "vanityUrl", "type": "string" },
        { "name": "riskStrategy", "type": "uint8" }
      ]
    }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getPoolStats",
    "inputs": [],
    "outputs": [
      { "name": "totalRaised", "type": "uint256" },
      { "name": "memberCount", "type": "uint256" },
      { "name": "milestoneCount", "type": "uint256" },
      { "name": "contributionCount", "type": "uint256" },
      { "name": "completedMilestones", "type": "uint256" },
      { "name": "fundingProgress", "type": "uint256" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "recordContribution",
    "inputs": [
      { "name": "contributor", "type": "address" },
      { "name": "amount", "type": "uint256" },
      { "name": "txHash", "type": "string" },
      { "name": "source", "type": "string" },
      { "name": "fid", "type": "string" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  }
] as const

// ✅ **ESSENTIAL TYPES** - Core types for frontend
export enum PoolStatus {
  DRAFT = 0,
  PENDING_PAYMENT = 1,
  PAYMENT_PROCESSING = 2, 
  ACTIVE = 3,
  COMPLETED = 4,
  CANCELLED = 5
}

export enum Visibility {
  PRIVATE = 0,
  LINK = 1,
  PUBLIC = 2
}

export enum ApprovalMethod {
  MAJORITY = 0,
  PERCENTAGE = 1,
  NUMBER = 2,
  CREATOR = 3
}

export enum RiskStrategy {
  LOW = 0,
  MEDIUM = 1,
  HIGH = 2
}

export enum PoolCurrency {
  ETH = 0,
  USDC = 1,
  EURC = 2
}

// Frontend pool interface (simplified)
export interface PoolData {
  title: string
  description: string
  fundingGoal: string  // ETH string for frontend
  visibility: Visibility
  approvalMethod: ApprovalMethod
  approvalThreshold: string
  poolName: string
  vanityUrl: string
  riskStrategy: RiskStrategy
}

export interface Milestone {
  id: string
  title: string
  description: string
  percentage: number  // 0-100 for frontend
  amount: string     // ETH string for frontend
}

// ✅ **NETWORK CONFIG** - Copy after deployment
export const NETWORK_CONFIG = {
  CHAIN_ID: 8453, // Base Mainnet
  CREATION_FEE: '0.001', // ETH
  EXPLORER_URL: 'https://basescan.org'
} as const