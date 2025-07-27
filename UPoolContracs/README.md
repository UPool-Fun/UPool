# UPool Smart Contracts

Enterprise-grade smart contracts for the UPool social funding platform, deployed on Base and Base Sepolia networks with comprehensive testing and verification tools.

## 🏗️ Architecture

UPool contracts implement a decentralized social funding protocol with the following key components:

- **UPoolRegistry**: Global registry for pool management and configuration
- **UPool**: Individual funding pool contracts (coming soon)
- **UPoolFactory**: Factory pattern for pool deployment (coming soon)
- **Integration**: Morpho Protocol yield optimization (coming soon)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm, pnpm, or yarn
- Git

### Installation

```bash
# Clone and navigate to contracts directory
cd UPoolContracs

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Basic Usage

```bash
# Compile contracts
npm run compile

# Run tests
npm run test

# Run tests with gas reporting
npm run test:gas

# Check contract sizes
npm run size

# Start local Hardhat node
npm run node
```

## 🌐 Network Configuration

### Supported Networks

| Network | Chain ID | RPC URL | Explorer |
|---------|----------|---------|----------|
| **Base Mainnet** | 8453 | https://mainnet.base.org | [Blockscout](https://base.blockscout.com) |
| **Base Sepolia** | 84532 | https://sepolia.base.org | [Blockscout](https://base-sepolia.blockscout.com) |
| **Local Hardhat** | 31337 | http://127.0.0.1:8545 | - |

### Environment Variables

Create a `.env` file with the following configuration:

```bash
# Network RPC URLs
BASE_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# Deployment private key (DO NOT COMMIT REAL KEYS)
PRIVATE_KEY=your_private_key_here

# API keys for contract verification
BASESCAN_API_KEY=your_basescan_api_key_here

# Optional: Gas reporting
REPORT_GAS=true
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key_here
```

## 📦 Deployment

### Deploy to Base Sepolia (Testnet)

```bash
# Deploy contracts
npm run deploy:base-sepolia

# Verify on Blockscout (recommended)
npm run verify:blockscout-sepolia

# Or verify on Basescan
npm run verify:base-sepolia
```

### Deploy to Base Mainnet

```bash
# Deploy contracts
npm run deploy:base

# Verify on Blockscout (recommended)
npm run verify:blockscout

# Or verify on Basescan
npm run verify:base
```

### Local Development

```bash
# Start local node
npm run node

# In another terminal, deploy locally
npm run deploy:local
```

## 🔍 Contract Verification

### Using Blockscout (Recommended)

Blockscout is the preferred block explorer for Base networks and doesn't require API keys:

```bash
# Verify all contracts from latest deployment
npm run verify:blockscout-sepolia  # For testnet
npm run verify:blockscout          # For mainnet

# Verify specific contract
npx hardhat verify --network baseSepoliaBlockscout <CONTRACT_ADDRESS> [constructor_args...]
```

### Using Basescan

```bash
# Verify all contracts
npm run verify:base-sepolia  # For testnet
npm run verify:base          # For mainnet

# Verify specific contract
npx hardhat verify --network baseSepolia <CONTRACT_ADDRESS> [constructor_args...]
```

### Verification Scripts

The project includes automated verification scripts:

```bash
# Verify all contracts from latest deployment
npx hardhat run scripts/verify.ts --network baseSepolia -- --all

# Verify specific contract
npx hardhat run scripts/verify.ts --network baseSepolia -- <CONTRACT_ADDRESS> [args...]
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests with gas reporting
npm run test:gas

# Run specific test file
npx hardhat test test/UPoolRegistry.test.ts

# Run tests with coverage
npm run coverage
```

### Test Structure

```
test/
├── UPoolRegistry.test.ts      # Registry contract tests
├── fixtures/                  # Test fixtures and helpers
└── utils/                     # Testing utilities
```

### Gas Optimization

Monitor gas usage with built-in reporting:

```bash
# Enable gas reporting
export REPORT_GAS=true
npm run test

# Check contract sizes
npm run size
```

## 🛠️ Development Tools

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run compile` | Compile all contracts |
| `npm run test` | Run test suite |
| `npm run test:gas` | Run tests with gas reporting |
| `npm run coverage` | Generate test coverage report |
| `npm run clean` | Clean compilation artifacts |
| `npm run size` | Check contract sizes |
| `npm run lint` | Check code formatting |
| `npm run lint:fix` | Fix code formatting |

### Network Information

Get detailed network information:

```bash
npx hardhat run scripts/network-info.ts --network baseSepolia
```

### Custom Tasks

```bash
# Get network info
npx hardhat network-info --network baseSepolia

# Verify all contracts
npx hardhat run scripts/verify.ts --network baseSepolia -- --all
```

## 📁 Project Structure

```
UPoolContracs/
├── contracts/                 # Solidity contracts
│   └── UPoolRegistry.sol     # Sample registry contract
├── scripts/                   # Deployment and utility scripts
│   ├── deploy.ts             # Main deployment script
│   ├── verify.ts             # Contract verification
│   └── network-info.ts       # Network information
├── test/                      # Test files
│   └── UPoolRegistry.test.ts # Registry tests
├── deployments/               # Deployment artifacts (auto-generated)
├── hardhat.config.ts         # Hardhat configuration
├── tsconfig.json             # TypeScript configuration
├── .prettierrc               # Code formatting rules
├── .env.example              # Environment variables template
└── README.md                 # This file
```

## 🔒 Security

### Best Practices

- ✅ **OpenZeppelin**: Using audited OpenZeppelin contracts
- ✅ **ReentrancyGuard**: Protection against reentrancy attacks
- ✅ **Pausable**: Emergency pause functionality
- ✅ **Access Control**: Proper role-based permissions
- ✅ **Input Validation**: Comprehensive parameter validation
- ✅ **Gas Optimization**: Efficient contract design

### Audit Status

- **Internal Review**: ✅ Completed
- **External Audit**: 🔄 Pending
- **Bug Bounty**: 📋 Planned

## 🤝 Contributing

### Development Workflow

1. **Setup Environment**:
   ```bash
   npm install
   cp .env.example .env
   # Configure your .env file
   ```

2. **Write Tests**: Always write tests for new functionality

3. **Run Quality Checks**:
   ```bash
   npm run compile
   npm run test
   npm run lint
   npm run size
   ```

4. **Deploy & Verify**:
   ```bash
   npm run deploy:base-sepolia
   npm run verify:blockscout-sepolia
   ```

### Code Style

- **Solidity**: Follow [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- **TypeScript**: Configured with Prettier and strict TypeScript
- **Testing**: Comprehensive test coverage with Hardhat

## 📚 Resources

### Documentation

- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Base Network Docs](https://docs.base.org)
- [Blockscout API](https://docs.blockscout.com)

### Base Network

- **Base Mainnet**: [Explorer](https://base.blockscout.com) | [Bridge](https://bridge.base.org)
- **Base Sepolia**: [Explorer](https://base-sepolia.blockscout.com) | [Faucet](https://www.alchemy.com/faucets/base-sepolia)

### Tools

- **Blockscout**: Primary block explorer (no API key required)
- **Basescan**: Alternative explorer (requires API key)
- **Hardhat**: Development environment
- **OpenZeppelin**: Security-audited contracts

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🆘 Support

For questions, issues, or contributions:

- 📧 **Email**: [Contact form](https://upool.fun/support)
- 🐛 **Issues**: [GitHub Issues](https://github.com/UPool-Fun/UPool/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/UPool-Fun/UPool/discussions)

---

**Built with ❤️ for the UPool community on Base blockchain**