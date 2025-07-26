# CLAUDE.md - UPool Development Guide

## Project Overview
UPool is a social funding app built on Base blockchain that allows friends, communities, and travelers to pool money toward shared goals. The platform uses AI-optimized Morpho Protocol lending strategies to grow pooled funds and milestone-based validation for fund release.

Built as a native Farcaster Mini App using Minikit, UPool leverages the Farcaster social graph for trust-based pool discovery, viral sharing through Frames, and seamless wallet interactions within the Farcaster ecosystem.

**Domain:** UPool.fun  
**Tagline:** Fund together. Grow together. Go further.

## Repository Structure
```
UPool/
├── UPoolApp/           # Main frontend Next.js application
├── UPoolPrototype/     # Prototype with business logic implementation
├── UPoolContracs/      # Smart contracts (empty/planned)
├── UPoolDesign/        # Design assets and documentation
├── Project_Overview.md # Comprehensive project documentation
└── README.md          # Basic project info
```

## Technology Stack

### Frontend (UPoolApp/)
- **Framework:** Next.js 15.2.4 with App Router
- **Language:** TypeScript 5
- **Social Integration:** Minikit for Farcaster Mini App experience
- **Social Features:** Farcaster SDK for social graph and Frames
- **Styling:** Tailwind CSS 3.4.17 + tailwindcss-animate
- **UI Components:** Radix UI primitives with shadcn/ui
- **State Management:** React Hook Form + Zod validation
- **Theme:** next-themes for dark/light mode
- **Icons:** Lucide React
- **Charts:** Recharts
- **Notifications:** Sonner (toast notifications)

### Business Logic (UPoolPrototype/)
- **Contains:** Core business logic implementation and prototype features
- **Purpose:** Reference implementation for UPoolApp integration
- **Structure:** Similar Next.js setup with business logic components

### Key Dependencies  
- **Wallet Integration:** Dual environment system with Privy (@privy-io/react-auth) for browser + Farcaster Quick Auth for mini app
- **Social Integration:** @farcaster/miniapp-sdk for Farcaster Mini App experience (upgraded from deprecated frame-sdk)
- **Blockchain:** Wagmi 2.16.0 + Viem for Web3 interactions on Base network
- **UI Library:** Complete Radix UI ecosystem (dialogs, forms, navigation, etc.)
- **Form Handling:** react-hook-form + @hookform/resolvers + zod
- **Styling Utils:** clsx, tailwind-merge, class-variance-authority
- **Date Handling:** date-fns, react-day-picker
- **Carousel:** embla-carousel-react
- **Mobile Detection:** Custom hook in hooks/use-mobile.tsx

## Development Commands
```bash
# Development server
npm run dev

# Build application  
npm run build

# Production server
npm run start

# Linting
npm run lint
```

## Project Structure (UPoolApp/)

### Pages & Routing
- `/` - Landing page (app/page.tsx)
- `/create` - Pool creation flow (app/create/page.tsx)
- `/explore` - Public pool discovery feed (app/explore/page.tsx)
- `/p/[poolId]/join` - Join specific pool (app/p/[poolId]/join/page.tsx)
- `/pool/[id]` - Pool detail view (app/pool/[id]/page.tsx)

### Components Architecture
- `components/ui/` - Reusable UI primitives (buttons, forms, dialogs, etc.)
- `components/` - Business logic components:
  - `providers/wallet-provider.tsx` - Unified wallet context with dual environment detection
  - `connect-menu-simple.tsx` - Environment-aware wallet connection component
  - `sdk-initializer.tsx` - Farcaster SDK initialization component
  - `farcaster-minikit.tsx` - Minikit integration for Farcaster Mini App
  - `farcaster-frames.tsx` - Interactive Frames for sharing and discovery
  - `social-graph-trust.tsx` - Farcaster social graph analysis
  - `deposit-withdraw-widget.tsx` - Financial transactions
  - `milestone-tracker.tsx` - Goal tracking
  - `voting-panel.tsx` - Governance features
  - `wallet-connection.tsx` - Web3 integration
  - `trust-badge.tsx` - Reputation display with social signals
  - `theme-provider.tsx` - Theme management

### Utility & Configuration
- `lib/utils.ts` - Shared utility functions
- `hooks/` - Custom React hooks
- `styles/globals.css` - Global styles and Tailwind imports
- `tailwind.config.ts` - Tailwind configuration
- `next.config.mjs` - Next.js configuration
- `components.json` - shadcn/ui configuration

## Core Features (Implemented/Planned)
1. **Native Farcaster Integration** - Built as Mini App with Minikit for seamless UX
2. **Interactive Frames** - Viral sharing and pool discovery through Farcaster Frames
3. **Social Graph Trust** - Enhanced trust scoring using Farcaster connections and reputation
4. **Pool Creation** - Multi-step form for setting up funding goals
5. **Milestone Tracking** - Progress visualization and validation
6. **AI-Optimized Yield** - Base Agent Kit AI optimizes Morpho Protocol lending strategies
7. **Role-based Access** - Creator, Contributor, Donor, Investor, Verifier, Moderator
8. **Trust System** - Reputation scoring combining Talent Protocol + Farcaster social graph
9. **Voting Mechanisms** - Milestone approval and governance
10. **NFT Integration** - Auction-based fundraising
11. **AI Validation** - Automated milestone proof verification

## User Roles & Permissions
- **Creator:** Pool management, milestone setting, fund unlocking
- **Contributor:** Fund deposits, voting on milestones and members
- **Donor:** Milestone-specific funding, proof review
- **Investor:** ROI-based funding with repayment expectations
- **Verifier:** Milestone completion attestation
- **Moderator:** Dispute resolution and fraud prevention

## Development Notes

### Code Style
- TypeScript strict mode enabled
- Functional components with hooks
- Tailwind CSS for styling
- shadcn/ui component system
- Form validation with Zod schemas

### State Management
- Server components by default (Next.js App Router)
- Client components marked with 'use client'
- React Hook Form for form state
- Context providers for theme and global state

### Responsive Design
- Mobile-first approach
- Custom mobile detection hook
- Responsive breakpoints via Tailwind
- Touch-friendly interactions

### Performance
- Next.js automatic code splitting
- Dynamic imports for heavy components
- Image optimization with Next.js Image
- CSS-in-JS avoided in favor of Tailwind

## Blockchain Integration
- **Network:** Base blockchain (Sepolia testnet for development)
- **Social Layer:** Native Farcaster Mini App with Quick Auth integration
- **Yield Strategy:** Base Agent Kit AI optimizes Morpho Protocol lending via Base OnchainKit (planned)
- **Smart Contracts:** Solidity-based pool management (planned)
- **Wallet Integration:** 
  - **Browser**: Privy with embedded wallets and external wallet support
  - **Farcaster**: Quick Auth with FID-based identity (farcaster:12345 format)
- **Authentication Flow:**
  - Environment detection via @farcaster/miniapp-sdk
  - Unified `useWallet()` hook across both environments
  - Seamless switching between Privy and Farcaster auth
- **Storage:** IPFS for proofs and NFT metadata (planned)
- **Viral Distribution:** Farcaster Frames for pool sharing and discovery (planned)

## Wallet Integration Implementation

### Architecture Overview
UPoolApp implements a sophisticated dual-environment wallet system that seamlessly works as both a web application and a Farcaster Mini App.

### Core Components

#### 1. WalletProvider (`components/providers/wallet-provider.tsx`)
- **Purpose**: Main context provider that detects environment and switches between authentication methods
- **Environment Detection**: Uses @farcaster/miniapp-sdk to detect Farcaster context
- **Browser Mode**: Wraps Privy provider for traditional web wallet connections
- **Farcaster Mode**: Implements Quick Auth using sdk.actions.signIn()

#### 2. ConnectMenuSimple (`components/connect-menu-simple.tsx`)
- **Purpose**: Environment-aware wallet connection UI component
- **Dynamic Rendering**: Shows different button text based on environment
- **Unified Interface**: Uses single useWallet() hook regardless of environment

#### 3. SDK Initializer (`components/sdk-initializer.tsx`)
- **Purpose**: Initializes Farcaster SDK with sdk.actions.ready()
- **Initialization**: Required for proper Farcaster Mini App functionality

### Environment Detection Logic
```typescript
// Multi-factor detection for robust environment identification
const isFarcasterFrame = !!(
  context?.client?.clientFid ||  // Original Farcaster client check
  context?.isMinApp === true ||  // Mini app specific flag
  context?.miniApp === true      // Alternative property name
)

// Verify not in regular browser to avoid false positives
const isRegularBrowser = typeof window !== 'undefined' && 
  window.parent === window && 
  !window.location.href.includes('farcaster')

// Final determination
const finalIsFarcaster = isFarcasterFrame && !isRegularBrowser
```

### Authentication Flows

#### Browser Mode (Privy)
1. User clicks "Connect Wallet" button
2. Privy login modal opens with wallet options
3. User connects via MetaMask, Coinbase Wallet, WalletConnect, etc.
4. Wallet address stored in context
5. Connected state shows truncated address

#### Farcaster Mode (Quick Auth)
1. User clicks "Connect Farcaster" button  
2. sdk.actions.signIn() triggers Farcaster Quick Auth
3. User authenticates with Farcaster identity
4. FID (Farcaster ID) stored as identifier in format: `farcaster:12345`
5. Connected state shows Farcaster identity

### Unified Hook Interface
```typescript
interface WalletContextType {
  isConnected: boolean
  address: string | undefined  // Wallet address or farcaster:FID
  connect: () => void          // Environment-specific connect function
  disconnect: () => void       // Environment-specific disconnect function
  isConnecting: boolean        // Loading state
  isFarcaster: boolean         // Environment flag
}

// Usage in components
const { connect, disconnect, isConnected, address, isFarcaster } = useWallet()
```

### Configuration Files

#### Environment Variables (.env.local)
```bash
# Privy Configuration
NEXT_PUBLIC_PRIVY_APP_ID=cmdj78523003jjo0lfaifpl8h

# Base Network Configuration
NEXT_PUBLIC_CHAIN_ID=84532  # Base Sepolia
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=197330eee747243ad7e57a45dd12aee8

# Farcaster Manifest
NEXT_PUBLIC_URL=https://codalabs.ngrok.io
```

#### Wagmi Configuration (lib/wagmi.ts)
```typescript
export const config = createConfig({
  chains: [baseSepolia], // or base for mainnet
  transports: { [baseSepolia.id]: http() },
  connectors: [
    injected({ shimDisconnect: true }),
    walletConnect({ projectId, showQrModal: true })
  ]
})
```

### Migration from Dynamic Wallet
UPoolApp was successfully migrated from Dynamic Wallet to this dual-environment system:
- **Removed**: @dynamic-labs dependencies
- **Added**: @privy-io/react-auth, @farcaster/miniapp-sdk
- **Maintained**: Seamless user experience with improved Farcaster integration
- **Enhanced**: Proper environment detection and unified wallet interface

## Morpho Protocol Integration

### Base OnchainKit APIs Used
- **Deposit Integration:** `buildDepositToMorphoTx` - Deposits pool funds to Morpho lending markets
- **Withdrawal Integration:** `buildWithdrawFromMorphoTx` - Withdraws funds for milestone payouts
- **React Hooks:**
  - `useBuildDepositToMorphoTx` - React hook for deposit transactions
  - `useBuildWithdrawFromMorphoTx` - React hook for withdrawal transactions
  - `useEarnContext` - Context for managing yield earning state

### AI Yield Optimization Flow
1. **Pool Creation:** Base Agent Kit AI analyzes available Morpho markets
2. **Strategy Selection:** AI selects optimal lending markets based on:
   - Current APY rates across Morpho markets
   - Pool timeline and liquidity requirements  
   - Risk assessment and market conditions
3. **Automated Deposits:** Funds automatically deposited via OnchainKit when contributions are made
4. **Continuous Optimization:** AI monitors and rebalances positions as market conditions change
5. **Milestone Withdrawals:** Strategic withdrawals executed via OnchainKit for milestone payouts

### Technical Implementation
```typescript
// Example integration patterns
import {
  buildDepositToMorphoTx,
  buildWithdrawFromMorphoTx,
  useBuildDepositToMorphoTx,
  useBuildWithdrawFromMorphoTx,
  useEarnContext
} from '@coinbase/onchainkit';
import { MiniKit } from '@farcaster/minikit';
import { createFrame } from '@farcaster/frames';

// Pool funds deposit to Morpho
const depositTx = buildDepositToMorphoTx({
  amount: poolContributionAmount,
  marketId: agentSelectedMarketId,
  userAddress: poolSmartWalletAddress
});

// Milestone payout withdrawal
const withdrawTx = buildWithdrawFromMorphoTx({
  amount: milestonePayoutAmount,
  marketId: currentMarketId,
  userAddress: poolSmartWalletAddress
});

// Farcaster Frame for pool sharing
const poolFrame = createFrame({
  title: poolData.name,
  description: poolData.description,
  image: poolData.coverImage,
  buttons: [
    { label: 'Join Pool', action: 'post' },
    { label: 'View Details', action: 'link' }
  ]
});

// Minikit wallet integration
const handlePoolContribution = async () => {
  const result = await MiniKit.sendTransaction({
    transaction: depositTx,
    chainId: 'base'
  });
  return result;
};
```

## Testing & Quality
- TypeScript for type safety
- ESLint configuration via Next.js
- No specific testing framework configured yet
- Manual testing through development server

## Deployment
- Optimized for Vercel deployment (Next.js default)
- Environment variables for API keys and blockchain endpoints
- Static asset optimization
- Server-side rendering support

## Future Development
1. **Advanced Farcaster Features** - Enhanced Frames, channel integrations, and cast embeddings
2. **Social Graph Analytics** - Deep analysis of Farcaster connections for trust and discovery
3. **Smart Contract Integration** - Solidity contracts for pool management
4. **AI Services** - OpenAI/Claude integration for validation
5. **Notification System** - Email, Telegram, Farcaster casts, and push notifications
6. **Analytics Dashboard** - Pool performance, user metrics, and social engagement
7. **Mobile App** - React Native or PWA implementation with Minikit support

## Farcaster Integration Patterns

### Mini App Manifest
- **Location**: `/.well-known/farcaster.json` and `/api/manifest`
- **Purpose**: Domain verification and app registration with Farcaster
- **Features**: App discovery, user app list, webhook notifications
- **Setup Guide**: See `FARCASTER_MANIFEST_SETUP.md`

### Wallet Integration Architecture
- **Dual Environment System**: Unified `useWallet()` hook for consistent interface
- **Browser Mode**: Privy (@privy-io/react-auth) for standard web wallet connections
- **Farcaster Mode**: Quick Auth via @farcaster/miniapp-sdk with FID-based identity
- **Environment Detection**: Automatic detection based on SDK context and window properties
- **Unified Context**: Single WalletProvider that switches between authentication methods seamlessly

### Farcaster Frames Development
- Create interactive Frames for pool sharing using `@farcaster/frames`
- Implement Frame actions for pool joining, voting, and milestone tracking
- Use Frame metadata for rich social previews in Farcaster feeds

### Social Graph Utilization
- Leverage Farcaster social connections for trust scoring
- Implement friend-to-friend pool recommendations
- Use follow relationships for pool discovery algorithms

### Cast Integration
- Embed pool updates and milestone achievements as Farcaster casts
- Create shareable pool cards that work within Farcaster feeds
- Implement notification systems that post to user's Farcaster accounts

## Common Patterns
- Component composition over inheritance
- Props interfaces exported from components
- Utility-first styling with Tailwind
- Server actions for data mutations
- Client components for interactivity only
- Minikit hooks for Farcaster-specific functionality
- Frame components for viral sharing mechanisms

## File Naming Conventions
- `kebab-case` for files and directories
- `PascalCase` for React components
- `camelCase` for functions and variables
- `.tsx` for React components, `.ts` for utilities

## Environment Setup
1. Node.js 18+ required
2. Package manager: npm, pnpm, or yarn supported
3. TypeScript enabled globally
4. Tailwind CSS configured with custom theme
5. PostCSS processing for CSS optimization