# UPool Upgradeable Smart Contracts

## Overview

This repository contains the upgradeable smart contracts for the UPool protocol, built using OpenZeppelin's upgrade patterns and security standards. The contracts follow the UUPS (Universal Upgradeable Proxy Standard) pattern for upgradeability.

## 🏗️ Architecture

### Core Contracts

1. **UPoolUpgradeable.sol** - Main pool contract (implementation)
   - Individual pool management with milestones, voting, and contributions
   - UUPS upgradeable proxy pattern
   - Complete pool lifecycle management

2. **UPoolFactoryUpgradeable.sol** - Pool factory contract
   - Creates new UPool instances using proxy pattern
   - Template management and pool creation fees
   - UUPS upgradeable proxy

3. **UPoolRegistryUpgradeable.sol** - Pool registry contract
   - Global pool registration and management
   - Pool categorization and verification
   - UUPS upgradeable proxy

## 🔐 Security Features

### OpenZeppelin Standards
- ✅ **UUPS Upgradeable Proxies** - Secure upgrade mechanism
- ✅ **Access Control (Ownable)** - Owner-based permissions
- ✅ **ReentrancyGuard** - Protection against reentrancy attacks
- ✅ **Pausable** - Emergency pause functionality
- ✅ **Initializable** - Secure proxy initialization
- ✅ **Storage Gaps** - Future upgrade compatibility

### Security Measures
- **Upgrade Authorization**: Only owner can authorize upgrades
- **Initialization Protection**: Prevents initialization attacks
- **Storage Layout Protection**: Storage gaps prevent conflicts
- **Access Control**: Multi-level permission system
- **Emergency Controls**: Pausable functions for crisis management

## 📋 Prerequisites

- Node.js >= 16
- Hardhat
- OpenZeppelin Contracts
- OpenZeppelin Hardhat Upgrades

## 🚀 Installation

1. **Install Dependencies**
```bash
npm install
```

2. **Compile Contracts**
```bash
npm run compile
```

3. **Run Tests**
```bash
npm test
```

## 🌐 Deployment

### Owner Configuration
**CRITICAL**: All contracts are deployed with owner address: `0xc2564e41B7F5Cb66d2d99466450CfebcE9e8228f`

This address must:
- Have sufficient ETH for deployment gas fees
- Be accessible for contract management
- Be secure for production operations

### Environment Setup

Create `.env` file:
```env
# Deployment
PRIVATE_KEY=0x1234567890123456789012345678901234567890123456789012345678901234
BASE_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# Verification
BASESCAN_API_KEY=your-basescan-api-key

# Configuration
OWNER_ADDRESS=0xc2564e41B7F5Cb66d2d99466450CfebcE9e8228f
TREASURY_ADDRESS=0xc2564e41B7F5Cb66d2d99466450CfebcE9e8228f
```

### Deployment Commands

#### Testnet Deployment (Base Sepolia)
```bash
npm run deploy:upgradeable:base-sepolia
```

#### Mainnet Deployment (Base)
```bash
npm run deploy:upgradeable:base
```

### Deployment Process

The deployment script will:

1. **Deploy Pool Implementation** - UPoolUpgradeable implementation contract
2. **Deploy Registry Proxy** - UPoolRegistryUpgradeable with proxy
3. **Deploy Factory Proxy** - UPoolFactoryUpgradeable with proxy
4. **Configure Templates** - Add default pool templates
5. **Verify Ownership** - Ensure correct owner assignment
6. **Save Deployment Info** - Create deployments.json file

### Deployment Configuration

**Production Settings (Base Mainnet)**:
- Pool Creation Fee: 0.001 ETH
- Max Pools Per Creator: 50
- Owner: 0xc2564e41B7F5Cb66d2d99466450CfebcE9e8228f
- Treasury: 0xc2564e41B7F5Cb66d2d99466450CfebcE9e8228f

## 🔄 Upgrades

### Upgrade Commands
```bash
# Testnet
npm run upgrade:base-sepolia

# Mainnet  
npm run upgrade:base
```

### Upgrade Process

1. **Authorization Check** - Verify deployer is contract owner
2. **Deploy New Implementations** - Deploy updated contract code
3. **Upgrade Proxies** - Point proxies to new implementations
4. **Verify Functionality** - Test upgraded contracts
5. **Save Upgrade Info** - Record upgrade details

### Upgrade Safety

- Only the owner can perform upgrades
- Storage layout compatibility is enforced
- State is preserved across upgrades
- Rollback capability through proxy pattern

## 🧪 Testing

### Run Test Suite
```bash
npm test
```

### Test Coverage
```bash
npm run coverage
```

### Gas Analysis
```bash
npm run test:gas
```

### Test Categories

- **Deployment Tests** - Contract deployment and initialization
- **Upgradeability Tests** - Proxy upgrade functionality
- **Security Tests** - Access control and emergency functions
- **Business Logic Tests** - Pool creation, milestones, voting
- **Integration Tests** - Cross-contract interactions

## 📊 Contract Verification

### Verify on Block Explorers
```bash
# Base Sepolia
npm run verify:base-sepolia

# Base Mainnet
npm run verify:base
```

### Verification Process
1. Contract source code verification
2. Constructor argument verification
3. Proxy pattern verification
4. Implementation linking verification

## 🔧 Management Operations

### Template Management
```solidity
// Add new pool template
factory.addPoolTemplate(
    "startup", 
    "Startup funding pools", 
    1,    // MEDIUM risk
    1,    // PERCENTAGE approval
    6000  // 60% threshold
);

// Update template status
factory.updateTemplateStatus("startup", false);
```

### Fee Management
```solidity
// Update creation fees
factory.updatePoolCreationFee(ethers.parseEther("0.002"));
registry.updatePoolCreationFee(ethers.parseEther("0.002"));

// Withdraw collected fees
factory.withdrawFees();
registry.withdrawFees();
```

### Emergency Controls
```solidity
// Pause contracts
factory.emergencyPause();
registry.emergencyPause();

// Unpause contracts
factory.unpause();
registry.unpause();
```

## 📁 File Structure

```
contracts/
├── UPoolUpgradeable.sol              # Main pool contract
├── UPoolFactoryUpgradeable.sol       # Pool factory
├── UPoolRegistryUpgradeable.sol      # Pool registry
├── UPool.sol                         # Legacy non-upgradeable
├── UPoolFactory.sol                  # Legacy factory
└── UPoolRegistry.sol                 # Legacy registry

scripts/
├── deploy-upgradeable.ts             # Upgradeable deployment
├── upgrade-contracts.ts              # Contract upgrade script
├── deploy.ts                         # Legacy deployment
└── verify.ts                         # Contract verification

test/
├── UPoolUpgradeable.test.ts          # Upgradeable contract tests
├── UPool.test.ts                     # Legacy tests
└── UPoolRegistry.test.ts             # Registry tests
```

## 🚨 Important Notes

### Owner Address Requirements
- **MUST** be: `0xc2564e41B7F5Cb66d2d99466450CfebcE9e8228f`
- **MUST** have sufficient ETH for:
  - Contract deployment gas
  - Pool creation fees for testing
  - Transaction fees for management operations

### Security Considerations
- Always test on testnet first
- Verify contract addresses after deployment
- Monitor contract events for unusual activity
- Keep private keys secure
- Use hardware wallets for production
- Implement monitoring and alerting

### Upgrade Considerations
- Test upgrades on testnet first
- Verify storage layout compatibility
- Check for breaking changes
- Coordinate with frontend team
- Notify users of upcoming changes

## 📝 Contract Addresses

### Base Mainnet (Production) ✅ **DEPLOYED**
```javascript
const CONTRACT_ADDRESSES = {
  POOL_IMPLEMENTATION: "0xad859B1c980c1F14048bCee70bda19C2F2726F1F", // Deployed ✅
  REGISTRY_PROXY: "0xf8f067c65A73BC17d4D78FB48A774551CBc6C5EA",      // Deployed ✅  
  FACTORY_PROXY: "0x72672fa9EB552e50841a4DaC3637bC328FBDAc0a",       // Deployed ✅
};
```

**🔗 BaseScan Explorer Links:**
- [Pool Implementation](https://basescan.org/address/0xad859B1c980c1F14048bCee70bda19C2F2726F1F) 
- [Registry Proxy](https://basescan.org/address/0xf8f067c65A73BC17d4D78FB48A774551CBc6C5EA)
- [Factory Proxy](https://basescan.org/address/0x72672fa9EB552e50841a4DaC3637bC328FBDAc0a)

**📊 Deployment Configuration:**
- Owner: `0xc2564e41B7F5Cb66d2d99466450CfebcE9e8228f` ✅
- Network: Base Mainnet (Chain ID: 8453)
- Pool Creation Fee: 0.001 ETH
- Max Pools Per Creator: 50
- Registry Version: 2.0.0
- Factory Version: 2.0.0

### Base Sepolia (Testnet)
```javascript
const CONTRACT_ADDRESSES = {
  POOL_IMPLEMENTATION: "0x...", // Use for testnet deployment
  REGISTRY_PROXY: "0x...",      // Use for testnet deployment  
  FACTORY_PROXY: "0x...",       // Use for testnet deployment
};
```

## 🤝 Support

For questions or issues:
- Email: security@upool.fun
- GitHub Issues: Create issue with detailed description
- Documentation: Check inline code comments

## ⚖️ License

MIT License - see LICENSE file for details.