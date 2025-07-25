# UPool App 🚀

**Fund together. Grow together. Go further.**

UPool is a social funding platform that allows friends, communities, and travelers to pool money toward shared goals, earn yield through AI-optimized Morpho lending strategies on the Base blockchain, and unlock funds based on milestone validation and community voting.

## 🌟 Features

### Core Functionality
- **Pool Creation**: Create funding pools with customizable milestones and unlock rules
- **AI-Optimized Yield**: Automatic yield generation using Base Agent Kit AI to optimize Morpho Protocol lending while funds are pooled
- **Milestone-Based Release**: Funds unlock progressively as verified milestones are completed
- **Community Voting**: Democratic approval system for milestone completion and new members
- **Multi-Role System**: Support for Creators, Contributors, Donors, Investors, Verifiers, and Moderators

### Trust & Security
- **Trust Scoring**: Built-in reputation system for all participants
- **Talent Protocol Integration**: External Web3 identity verification
- **AI-Powered Validation**: Automated milestone proof verification
- **Dispute Resolution**: Community-driven conflict resolution system

### Social Features
- **TikTok-Style Discovery**: Vertical feed for exploring public pools
- **Viral Sharing**: Smart share links and QR codes for easy pool sharing
- **NFT Integration**: Auction-based fundraising with NFT rewards
- **Configurable Privacy**: Private, link-only, or public pool visibility

## 🏗️ Tech Stack

- **Framework**: Next.js 15.2.4 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4.17 + tailwindcss-animate
- **UI Components**: Radix UI primitives with shadcn/ui
- **Form Handling**: React Hook Form + Zod validation
- **State Management**: React hooks + Context API
- **Theme**: next-themes for dark/light mode support
- **Icons**: Lucide React
- **Charts**: Recharts for analytics
- **Notifications**: Sonner toast system

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm, pnpm, or yarn
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd UPool/UPoolApp

# Install dependencies
npm install
# or
pnpm install
# or
yarn install

# Start development server
npm run dev
# or
pnpm dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 📱 Application Structure

### Pages & Routes
- `/` - Landing page with hero section and features
- `/create` - Multi-step pool creation wizard
- `/explore` - Public pool discovery feed
- `/p/[poolId]/join` - Join specific pool with approval workflow
- `/pool/[id]` - Pool detail view with management interface

### Component Architecture

#### Core Components
- `components/wallet-connection.tsx` - Web3 wallet integration (MetaMask, Coinbase, WalletConnect)
- `components/deposit-withdraw-widget.tsx` - Financial transaction interface
- `components/milestone-tracker.tsx` - Progress visualization and milestone management
- `components/voting-panel.tsx` - Community governance interface
- `components/trust-badge.tsx` - User reputation display
- `components/theme-provider.tsx` - Dark/light theme management

#### UI Components (`components/ui/`)
Complete shadcn/ui component library including:
- Forms (input, textarea, select, checkbox, radio)
- Navigation (breadcrumb, menubar, navigation-menu)
- Feedback (alert, toast, dialog, popover)
- Data display (card, table, badge, avatar)
- Layout (sheet, sidebar, separator, scroll-area)

### User Roles & Permissions

| Role | Description | Capabilities |
|------|-------------|--------------|
| **Creator** | Pool initiator | Create pool, set milestones, manage unlock rules |
| **Contributor** | Fund provider | Deposit funds, vote on milestones, approve new members |
| **Donor** | Milestone sponsor | Fund specific milestones, review completion proofs |
| **Investor** | ROI seeker | Invest with expectation of returns on pool success |
| **Verifier** | Validator | Attest to milestone completion authenticity |
| **Moderator** | Dispute handler | Resolve conflicts, handle fraud reports, manage slashing |

## 🔄 User Flow

### Pool Creation Flow
1. **Setup**: Name, description, funding goal
2. **Milestones**: Define completion criteria and fund release percentages
3. **Rules**: Set voting thresholds, approval requirements, privacy settings
4. **Launch**: Deploy pool and begin fundraising

### Milestone Completion Flow
1. **Submission**: Creator uploads proof documents/images
2. **AI Analysis**: Automated validation and summarization
3. **Verification**: Community verifier reviews and attests
4. **Voting**: Contributors vote on milestone approval
5. **Release**: Funds unlock automatically upon approval

### Join Pool Flow
1. **Discovery**: Find pool via explore feed or share link
2. **Connection**: Connect Web3 wallet and verify identity
3. **Review**: Examine pool details, milestones, and trust scores
4. **Request**: Submit join request with optional deposit
5. **Approval**: Existing contributors vote on membership
6. **Participation**: Full access to voting and fund management

## 🌐 Blockchain Integration (Planned)

- **Network**: Base blockchain
- **Yield Strategy**: Base Agent Kit AI for automated Morpho Protocol optimization
- **Smart Contracts**: Solidity-based pool management and escrow
- **Wallet Support**: MetaMask, Coinbase Wallet, WalletConnect
- **Storage**: IPFS for milestone proofs and NFT metadata
- **Identity**: ENS and Talent Protocol integration

## 🎨 Design System

### Color Palette
- **Primary**: Blue to emerald gradient (`from-blue-600 to-emerald-600`)
- **Backgrounds**: Gradient from blue-50 via white to emerald-50
- **Text**: Gray-900 for headings, gray-600 for body text
- **Accents**: Blue-100 for badges, emerald-600 for success states

### Typography
- **Font**: Inter (Google Fonts)
- **Sizes**: 4xl-6xl for heroes, xl-3xl for headings, base for body
- **Weights**: Bold for headings, medium for emphasis, normal for body

### Components
- **Cards**: White/80 with backdrop blur and shadow
- **Buttons**: Gradient primary, outline secondary
- **Form Elements**: Consistent Radix UI styling
- **Loading States**: Tailwind CSS animations

## 🔧 Development Guidelines

### Code Style
- **TypeScript**: Strict mode enabled with comprehensive type safety
- **Components**: Functional components with hooks
- **Styling**: Tailwind CSS utility classes
- **Imports**: Absolute imports using `@/` prefix
- **File Naming**: kebab-case for files, PascalCase for components

### State Management
- **Server Components**: Default for static content and data fetching
- **Client Components**: Explicitly marked with `'use client'` for interactivity
- **Forms**: React Hook Form with Zod schema validation
- **Theme**: Context provider for global theme state

### Performance
- **Code Splitting**: Automatic with Next.js App Router
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Built-in Next.js analyzer
- **Caching**: Server-side rendering with appropriate cache headers

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Variables
Create `.env.local` file with:
```env
# Blockchain
NEXT_PUBLIC_BASE_RPC_URL=
NEXT_PUBLIC_CHAIN_ID=

# APIs
OPENAI_API_KEY=
TALENT_PROTOCOL_API_KEY=

# Storage
IPFS_GATEWAY_URL=
PINATA_API_KEY=
```

### Deployment Platforms
- **Recommended**: Vercel (optimized for Next.js)
- **Alternatives**: Netlify, Railway, AWS Amplify
- **Custom**: Docker containerization supported

## 🧪 Testing (Planned)

- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: Playwright for E2E scenarios
- **Smart Contract Tests**: Hardhat/Foundry test suites
- **Visual Regression**: Chromatic for component testing

## 📈 Analytics & Monitoring (Planned)

- **User Analytics**: PostHog for product insights
- **Error Tracking**: Sentry for error monitoring  
- **Performance**: Web Vitals tracking
- **Blockchain**: Alchemy webhooks for transaction monitoring

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Workflow
- **Branching**: Feature branches from `main`
- **Code Review**: All PRs require review
- **Testing**: Ensure all tests pass before merge
- **Documentation**: Update relevant docs with changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🔗 Links

- **Live App**: [UPool.fun](https://upool.fun) (coming soon)
- **Documentation**: [Project Overview](../Project_Overview.md)
- **Design System**: [UPoolDesign](../UPoolDesign/)
- **Smart Contracts**: [UPoolContracs](../UPoolContracs/)

## 📞 Support

For questions, issues, or contributions:
- **GitHub Issues**: Use for bug reports and feature requests
- **Discord**: Community support and discussion (coming soon)
- **Email**: support@upool.fun (coming soon)

---

**Built with ❤️ by the UPool team**