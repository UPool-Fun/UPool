# CLAUDE.md - UPool Development Guide

## Project Overview
UPool is a social funding app built on Base blockchain that allows friends, communities, and travelers to pool money toward shared goals. The platform uses DeFi yield strategies to grow pooled funds and milestone-based validation for fund release.

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
  - `deposit-withdraw-widget.tsx` - Financial transactions
  - `milestone-tracker.tsx` - Goal tracking
  - `voting-panel.tsx` - Governance features
  - `wallet-connection.tsx` - Web3 integration
  - `trust-badge.tsx` - Reputation display
  - `theme-provider.tsx` - Theme management

### Utility & Configuration
- `lib/utils.ts` - Shared utility functions
- `hooks/` - Custom React hooks
- `styles/globals.css` - Global styles and Tailwind imports
- `tailwind.config.ts` - Tailwind configuration
- `next.config.mjs` - Next.js configuration
- `components.json` - shadcn/ui configuration

## Core Features (Implemented/Planned)
1. **Pool Creation** - Multi-step form for setting up funding goals
2. **Milestone Tracking** - Progress visualization and validation
3. **Yield Farming** - Base blockchain DeFi integration
4. **Role-based Access** - Creator, Contributor, Donor, Investor, Verifier, Moderator
5. **Trust System** - Reputation scoring and Talent Protocol integration
6. **Voting Mechanisms** - Milestone approval and governance
7. **NFT Integration** - Auction-based fundraising
8. **AI Validation** - Automated milestone proof verification

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
- **Yield Strategy:** Base Agent Kit integration
- **Smart Contracts:** Solidity-based pool management
- **Wallet Integration:** Privy, Worldcoin ID support
- **Storage:** IPFS for proofs and NFT metadata

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
1. **Smart Contract Integration** - Solidity contracts for pool management
2. **AI Services** - OpenAI/Claude integration for validation
3. **Notification System** - Email, Telegram, and push notifications
4. **Analytics Dashboard** - Pool performance and user metrics
5. **Mobile App** - React Native or PWA implementation

## Common Patterns
- Component composition over inheritance
- Props interfaces exported from components
- Utility-first styling with Tailwind
- Server actions for data mutations
- Client components for interactivity only

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