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
- **Social Integration:** @farcaster/minikit + @farcaster/core for native Farcaster experience
- **Frames:** @farcaster/frames for interactive sharing and discovery
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

## Blockchain Integration (Planned)
- **Network:** Base blockchain
- **Social Layer:** Native Farcaster Mini App via Minikit integration
- **Yield Strategy:** Base Agent Kit AI optimizes Morpho Protocol lending via Base OnchainKit
- **Smart Contracts:** Solidity-based pool management
- **Wallet Integration:** Minikit (Farcaster), Privy, Worldcoin ID support
- **Storage:** IPFS for proofs and NFT metadata
- **Viral Distribution:** Farcaster Frames for pool sharing and discovery

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

### Minikit Integration
- Use `@farcaster/minikit` for wallet interactions within Farcaster clients
- Implement seamless transaction signing without leaving the Farcaster app
- Handle Minikit context and user authentication state

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