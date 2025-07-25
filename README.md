# UPool - Social Funding Platform 🌊

**Fund together. Grow together. Go further.**

UPool is a revolutionary social funding platform built on the Base blockchain that enables friends, communities, and travelers to pool money toward shared goals, earn yield through DeFi strategies, and unlock funds based on milestone validation and community voting.

Built as a native Farcaster Mini App using Minikit, UPool leverages the Farcaster social graph for trust-based pool discovery, viral sharing through Frames, and seamless wallet interactions within the Farcaster ecosystem.

---

## 🌟 Vision

UPool transforms how communities fund their dreams by combining:
- **Native Social Integration** - Built directly into the Farcaster ecosystem for seamless social experiences
- **Social Trust** - Reputation-based interactions enhanced by Farcaster social graph analysis
- **Smart Finance** - Automated yield generation on pooled funds via Morpho Protocol
- **Milestone Accountability** - Progressive fund release based on verified achievements
- **Democratic Governance** - Community-driven decision making with weighted voting
- **Viral Distribution** - Interactive Farcaster Frames for pool sharing and discovery

---

## 🏗️ System Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        UA[UPoolApp - Next.js]
        UP[UPoolPrototype - Business Logic]
    end
    
    subgraph "Backend Services"
        API[API Gateway - Node.js]
        AI[AI Services - OpenAI/Claude]
        NOTIF[Notification Service]
        IPFS[IPFS Storage]
    end
    
    subgraph "Blockchain Layer"
        BASE[Base Network]
        SC[Smart Contracts]
        AAVE[Yield Protocols]
        AGENT[Base Agent Kit - AI Yield Optimizer]
        MORPHO[Morpho Protocol]
    end
    
    subgraph "External Services"
        MINIKIT[Minikit Integration]
        FARCASTER[Farcaster SDK + Frames]
        TALENT[Talent Protocol]
        ENS[ENS Identity]
        WALLET[Wallet Providers]
    end
    
    UA --> API
    UP --> API
    API --> AI
    API --> NOTIF
    API --> IPFS
    API --> SC
    SC --> BASE
    SC --> AGENT
    AGENT --> MORPHO
    API --> TALENT
    UA --> MINIKIT
    UA --> FARCASTER
    UA --> WALLET
    UA --> ENS
```

### Component Architecture

```mermaid
graph TD
    subgraph "UPool Ecosystem"
        subgraph "UPoolApp - Frontend"
            LANDING[Landing Page]
            CREATE[Pool Creation]
            EXPLORE[Pool Discovery]
            POOL[Pool Management]
            PROFILE[User Profile]
        end
        
        subgraph "UPoolPrototype - Logic"
            BUSINESS[Business Logic]
            VALIDATION[Validation Rules]
            WORKFLOWS[User Workflows]
        end
        
        subgraph "UPoolContracs - Blockchain"
            POOL_CONTRACT[Pool Contract]
            MILESTONE_CONTRACT[Milestone Contract]
            YIELD_CONTRACT[Yield Management]
            GOVERNANCE_CONTRACT[Governance Contract]
        end
        
        subgraph "UPoolDesign - Assets"
            DESIGN[Design System]
            ASSETS[Visual Assets]
            BRANDING[Brand Guidelines]
        end
    end
    
    LANDING --> CREATE
    CREATE --> POOL
    EXPLORE --> POOL
    POOL --> PROFILE
    
    CREATE --> BUSINESS
    POOL --> VALIDATION
    PROFILE --> WORKFLOWS
    
    BUSINESS --> POOL_CONTRACT
    VALIDATION --> MILESTONE_CONTRACT
    WORKFLOWS --> GOVERNANCE_CONTRACT
    POOL_CONTRACT --> YIELD_CONTRACT
```

### Data Flow Architecture

```mermaid
graph LR
    subgraph "User Interface"
        UI[React Components]
        FORMS[Form Handlers]
        STATE[State Management]
    end
    
    subgraph "API Layer"
        REST[REST Endpoints]
        GRAPHQL[GraphQL Resolvers]
        WS[WebSocket Events]
    end
    
    subgraph "Business Logic"
        POOL_LOGIC[Pool Management]
        MILESTONE_LOGIC[Milestone Validation]
        VOTING_LOGIC[Voting System]
        YIELD_LOGIC[Yield Calculation]
    end
    
    subgraph "Data Persistence"
        BLOCKCHAIN[Blockchain State]
        IPFS_DATA[IPFS Documents]
        CACHE[Redis Cache]
    end
    
    UI --> FORMS
    FORMS --> STATE
    STATE --> REST
    REST --> GRAPHQL
    GRAPHQL --> WS
    
    REST --> POOL_LOGIC
    GRAPHQL --> MILESTONE_LOGIC
    WS --> VOTING_LOGIC
    POOL_LOGIC --> YIELD_LOGIC
    
    POOL_LOGIC --> BLOCKCHAIN
    MILESTONE_LOGIC --> IPFS_DATA
    VOTING_LOGIC --> CACHE
    YIELD_LOGIC --> BLOCKCHAIN
```

---

## 👥 User Roles & Sequential Diagrams

### Creator Role - Pool Creation & Management

```mermaid
sequenceDiagram
    participant C as Creator
    participant UI as Frontend
    participant API as Backend API
    participant SC as Smart Contract
    participant IPFS as IPFS Storage
    participant AI as AI Service
    participant KYC as KYC/Identity
    participant TALENT as Talent Protocol
    
    Note over C,TALENT: Phase 1: Pool Creation Process
    C->>KYC: Complete identity verification
    KYC->>TALENT: Verify Web3 reputation
    TALENT-->>C: Return trust score
    C->>UI: Access pool creation wizard
    
    UI->>C: Basic info form (name, description, category)
    C->>UI: Define financial goals & milestones
    UI->>C: Configure governance & visibility
    C->>UI: Set yield strategy & vanity URL
    
    UI->>API: Submit complete pool configuration
    API->>IPFS: Store metadata & milestone details
    IPFS-->>API: Return content hashes
    API->>SC: Deploy pool smart contract
    SC-->>API: Return contract address & wallet
    API->>UI: Generate share links & QR codes
    UI-->>C: Pool created - show management dashboard
    
    Note over C,TALENT: Phase 2: Pool Management Operations
    C->>UI: Review join requests
    UI->>SC: Approve/reject members
    C->>UI: Upload milestone proof documents
    UI->>IPFS: Store proof materials
    UI->>AI: Request proof analysis
    AI-->>UI: Return validation summary
    UI->>SC: Submit milestone for community vote
    SC->>API: Trigger contributor notifications
    API-->>C: Show voting progress & results
```

### Contributor Role - Funding & Voting

```mermaid
sequenceDiagram
    participant Con as Contributor
    participant UI as Frontend
    participant API as Backend API
    participant SC as Smart Contract
    participant MORPHO as Morpho Protocol
    participant AGENT as Base Agent Kit AI
    participant NOTIF as Notifications
    participant AI as AI Analysis
    
    Note over Con,AI: Phase 1: Discovery & Evaluation
    Con->>UI: Browse discovery feed
    UI->>API: Fetch pools with filters
    API-->>UI: Return curated pool list
    Con->>UI: Select pool for review
    UI->>API: Fetch detailed pool data
    API->>SC: Get milestone structure & history
    SC-->>API: Return pool performance data
    API-->>UI: Show comprehensive pool analysis
    Con->>UI: Conduct due diligence review
    
    Note over Con,AI: Phase 2: Joining & Contributing
    Con->>UI: Submit join request
    UI->>SC: Check approval requirements
    SC->>NOTIF: Notify existing contributors
    NOTIF->>Con: Approval granted notification
    Con->>UI: Configure contribution amount
    UI->>SC: Execute fund contribution
    SC->>AGENT: Deploy to yield farming
    AGENT->>MORPHO: Optimize strategy
        MORPHO-->>SC: Confirm yield strategy active
    SC-->>UI: Issue membership tokens
    UI-->>Con: Setup notifications & preferences
    
    Note over Con,AI: Phase 3: Active Participation
    NOTIF->>Con: Milestone submitted for vote
    Con->>UI: Access voting interface
    UI->>API: Fetch proof materials
    API->>AI: Get analysis summary
    AI-->>UI: Return validation insights
    Con->>UI: Review verifier attestations
    Con->>UI: Cast weighted vote with comments
    UI->>SC: Record vote on blockchain
    SC->>SC: Calculate vote threshold
    alt Milestone approved
        SC->>AGENT: Withdraw payout funds
        SC->>API: Execute fund release
        SC->>NOTIF: Notify milestone completion
    else More votes needed
        SC-->>UI: Update voting progress
    end
    
    Con->>UI: Monitor yield accumulation
    UI->>SC: Check personal yield balance
    Con->>UI: Withdraw available yield
    SC->>AGENT: Process yield withdrawal
    YIELD-->>Con: Transfer yield to wallet
```

### Donor Role - Milestone Sponsorship

```mermaid
sequenceDiagram
    participant D as Donor
    participant UI as Frontend
    participant API as Backend API
    participant SC as Smart Contract
    participant IPFS as IPFS Storage
    
    Note over D,IPFS: Discover & Fund Milestone
    D->>UI: Browse public pools
    UI->>API: Fetch pool list
    API-->>UI: Return filtered pools
    D->>UI: Select pool & milestone
    UI->>API: Get milestone details
    API->>IPFS: Fetch milestone metadata
    IPFS-->>API: Return milestone info
    API-->>UI: Display milestone details
    
    D->>UI: Choose funding amount
    UI->>SC: Execute milestone funding
    SC->>SC: Lock funds for milestone
    SC-->>UI: Funding confirmed
    UI-->>D: Show funding receipt
    
    Note over D,IPFS: Milestone Completion Review
    UI->>D: Milestone submitted for review
    D->>UI: Review proof materials
    UI->>API: Fetch proof analysis
    API-->>UI: Return AI validation
    D->>UI: Approve/reject milestone
    UI->>SC: Record donor feedback
    SC-->>UI: Feedback recorded
```

### Investor Role - ROI-Based Funding

```mermaid
sequenceDiagram
    participant I as Investor
    participant UI as Frontend
    participant API as Backend API
    participant SC as Smart Contract
    participant ANALYTICS as Analytics
    participant MORPHO as Morpho Protocol
    participant AGENT as Base Agent Kit AI
    participant KYC as Accreditation
    
    Note over I,KYC: Phase 1: Investment Analysis
    I->>KYC: Complete accredited investor verification
    KYC-->>I: Confirm accreditation status
    I->>UI: Access investor dashboard
    UI->>ANALYTICS: Request market analysis
    ANALYTICS->>API: Fetch historical performance data
    API-->>ANALYTICS: Return pool success rates
    ANALYTICS-->>UI: Generate ROI projections
    
    I->>UI: Filter pools by category & performance
    UI->>API: Fetch detailed pool metrics
    API->>SC: Get creator track record
    SC-->>API: Return milestone completion history
    I->>UI: Conduct comprehensive due diligence
    UI->>ANALYTICS: Calculate risk-adjusted returns
    ANALYTICS-->>UI: Present investment recommendation
    
    Note over I,KYC: Phase 2: Investment Execution
    I->>UI: Structure investment terms
    UI->>SC: Create investment smart contract
    SC->>SC: Set milestone-based release triggers
    I->>UI: Deploy capital to pool
    UI->>SC: Lock investment funds in escrow
    SC->>AGENT: Optimize yield farming strategy
    AGENT->>MORPHO: Optimize strategy
        MORPHO-->>SC: Confirm capital deployment
    SC-->>UI: Generate investment tracking dashboard
    
    Note over I,KYC: Phase 3: Portfolio Management
    I->>UI: Monitor portfolio performance
    UI->>SC: Fetch real-time pool progress
    SC->>ANALYTICS: Calculate current ROI
    ANALYTICS-->>UI: Update performance metrics
    I->>UI: Participate in strategic votes
    UI->>SC: Cast investor votes on major decisions
    
    SC->>SC: Pool reaches success milestones
    SC->>AGENT: Execute ROI distribution
    YIELD->>SC: Calculate total returns
    SC->>SC: Distribute investor payments
    SC->>UI: Notify ROI distribution complete
    UI-->>I: Show realized returns & reinvestment options
```

### Verifier Role - Milestone Validation

```mermaid
sequenceDiagram
    participant V as Verifier
    participant UI as Frontend
    participant API as Backend API
    participant AI as AI Service
    participant IPFS as IPFS Storage
    participant SC as Smart Contract
    participant EXTERNAL as External Sources
    
    Note over V,EXTERNAL: Phase 1: Qualification & Assignment
    V->>API: Complete verifier application
    API->>SC: Record verifier credentials
    SC-->>API: Issue verifier certification
    API->>V: Assign based on expertise matching
    V->>UI: Review milestone requirements
    UI->>IPFS: Fetch all proof materials
    IPFS-->>UI: Return documents & metadata
    
    Note over V,EXTERNAL: Phase 2: Verification Process
    UI->>AI: Request preliminary analysis
    AI-->>UI: Return automated validation summary
    V->>UI: Conduct detailed evidence review
    UI->>EXTERNAL: Cross-reference external data
    EXTERNAL-->>UI: Return verification data
    V->>UI: Identify discrepancies or concerns
    
    V->>EXTERNAL: Contact third parties for confirmation
    EXTERNAL-->>V: Provide verification responses
    V->>UI: Document investigation findings
    UI->>IPFS: Store verification evidence
    
    Note over V,EXTERNAL: Phase 3: Attestation & Reporting
    V->>UI: Prepare comprehensive verification report
    UI->>API: Submit verification decision
    API->>SC: Record attestation on blockchain
    SC->>SC: Update milestone verification status
    SC->>API: Trigger community notification
    API-->>UI: Notify contributors of verification
    
    V->>UI: Respond to community questions
    UI->>API: Provide additional clarifications
    API->>SC: Update verification details
    SC-->>V: Complete verification cycle
```

### Moderator Role - Dispute Resolution

```mermaid
sequenceDiagram
    participant M as Moderator
    participant UI as Frontend
    participant API as Backend API
    participant SC as Smart Contract
    participant IPFS as IPFS Storage
    participant NOTIF as Notifications
    participant AI as AI Detection
    participant COMMUNITY as Community
    
    Note over M,COMMUNITY: Phase 1: Dispute Intake & Triage
    AI->>API: Flag suspicious activity pattern
    COMMUNITY->>API: Submit dispute report
    API->>M: Priority alert based on severity
    M->>UI: Access dispute triage dashboard
    UI->>API: Fetch case details & classification
    API->>IPFS: Retrieve all relevant evidence
    IPFS-->>UI: Return documentation & communications
    M->>UI: Assess urgency & assign resources
    
    Note over M,COMMUNITY: Phase 2: Investigation Process
    M->>UI: Begin comprehensive evidence review
    UI->>SC: Fetch transaction history
    SC-->>UI: Return blockchain interaction data
    M->>NOTIF: Contact all involved parties
    NOTIF->>COMMUNITY: Request statements & evidence
    COMMUNITY-->>NOTIF: Provide responses & documentation
    
    M->>UI: Conduct stakeholder interviews
    UI->>API: Document investigation timeline
    API->>IPFS: Store investigation materials
    M->>UI: Analyze patterns & precedents
    
    Note over M,COMMUNITY: Phase 3: Resolution & Implementation
    M->>UI: Formulate resolution decision
    UI->>API: Consult moderator consensus
    API-->>UI: Return peer review feedback
    M->>UI: Finalize resolution plan
    
    UI->>SC: Execute resolution smart contract
    alt Fund redistribution required
        SC->>SC: Redistribute locked funds
        SC->>NOTIF: Notify fund recipients
    else Reputation penalty applied
        SC->>SC: Update user trust scores
        SC->>NOTIF: Notify penalized users
    else Account restrictions imposed
        SC->>SC: Implement usage limitations
        SC->>NOTIF: Inform restricted users
    else Educational resolution
        SC->>SC: Mark case resolved
        SC->>NOTIF: Share learning outcomes
    end
    
    M->>COMMUNITY: Publish resolution summary
    COMMUNITY-->>M: Provide feedback on decision
    M->>API: Update moderation precedents
    API->>AI: Improve detection algorithms
```

---

## 🔄 Core System Flows

### End-to-End Pool Lifecycle

```mermaid
sequenceDiagram
    participant Creator
    participant Contributors
    participant Verifiers
    participant SmartContract as Smart Contract
    participant YieldProtocol as Yield Protocol
    participant AI
    
    Note over Creator,AI: Pool Creation & Funding
    Creator->>SmartContract: Create pool with milestones
    SmartContract-->>Creator: Pool deployed
    
    Contributors->>SmartContract: Join pool & contribute funds
    SmartContract->>YieldProtocol: Deposit funds for yield
    YieldProtocol-->>SmartContract: Funds earning yield
    
    Note over Creator,AI: Milestone Execution
    Creator->>SmartContract: Submit milestone proof
    SmartContract->>AI: Analyze proof validity
    AI-->>SmartContract: Return validation score
    
    SmartContract->>Verifiers: Request verification
    Verifiers->>SmartContract: Submit verification
    
    SmartContract->>Contributors: Request milestone vote
    Contributors->>SmartContract: Cast votes
    
    alt Milestone Approved
        SmartContract->>YieldProtocol: Withdraw funds for payout
        YieldProtocol-->>SmartContract: Return funds + yield
        SmartContract->>Creator: Release milestone funds
        SmartContract->>Contributors: Distribute yield share
    else Milestone Rejected
        SmartContract->>SmartContract: Keep funds locked
        SmartContract->>Contributors: Notify rejection
    end
    
    Note over Creator,AI: Pool Completion
    SmartContract->>SmartContract: All milestones completed
    SmartContract->>YieldProtocol: Withdraw remaining funds
    YieldProtocol-->>SmartContract: Return final funds + yield
    SmartContract->>Contributors: Distribute remaining yield
    SmartContract->>SmartContract: Mark pool as completed
```

### Comprehensive Role Interaction Flow

```mermaid
graph TB
    subgraph "Creator Ecosystem"
        CREATOR[👤 Creator]
        CREATE_POOL[🏊 Create Pool]
        SETUP_MILESTONES[🎯 Setup Milestones]
        MANAGE_MEMBERS[👥 Manage Members]  
        UPLOAD_PROOF[📋 Upload Proof]
        FUND_MGMT[💰 Fund Management]
        
        CREATOR --> CREATE_POOL
        CREATE_POOL --> SETUP_MILESTONES
        SETUP_MILESTONES --> MANAGE_MEMBERS
        MANAGE_MEMBERS --> UPLOAD_PROOF
        UPLOAD_PROOF --> FUND_MGMT
    end
    
    subgraph "Contributor Ecosystem"
        CONTRIBUTOR[🤝 Contributor]
        DISCOVERY[🔍 Pool Discovery]
        DUE_DILIGENCE[📊 Due Diligence]
        JOIN_CONTRIBUTE[💵 Join & Contribute]
        MILESTONE_VOTE[🗳️ Milestone Voting]
        MEMBER_APPROVAL[✅ Member Approval]
        YIELD_MGMT[📈 Yield Management]
        
        CONTRIBUTOR --> DISCOVERY
        DISCOVERY --> DUE_DILIGENCE
        DUE_DILIGENCE --> JOIN_CONTRIBUTE
        JOIN_CONTRIBUTE --> MILESTONE_VOTE
        MILESTONE_VOTE --> MEMBER_APPROVAL
        MEMBER_APPROVAL --> YIELD_MGMT
    end
    
    subgraph "Donor Ecosystem"
        DONOR[💝 Donor]
        EXPLORE_POOLS[🌐 Explore Pools]
        MILESTONE_ANALYSIS[📋 Milestone Analysis]
        SPONSOR_MILESTONE[🎁 Sponsor Milestone]
        MONITOR_PROGRESS[👁️ Monitor Progress]
        IMPACT_REVIEW[📈 Impact Assessment]
        
        DONOR --> EXPLORE_POOLS
        EXPLORE_POOLS --> MILESTONE_ANALYSIS
        MILESTONE_ANALYSIS --> SPONSOR_MILESTONE
        SPONSOR_MILESTONE --> MONITOR_PROGRESS
        MONITOR_PROGRESS --> IMPACT_REVIEW
    end
    
    subgraph "Investor Ecosystem"
        INVESTOR[📈 Investor]
        MARKET_RESEARCH[📊 Market Research]
        INVESTMENT_ANALYSIS[🔬 Investment Analysis]
        PORTFOLIO_MGMT[📋 Portfolio Management]
        ROI_OPTIMIZATION[💎 ROI Optimization]
        
        INVESTOR --> MARKET_RESEARCH
        MARKET_RESEARCH --> INVESTMENT_ANALYSIS
        INVESTMENT_ANALYSIS --> PORTFOLIO_MGMT
        PORTFOLIO_MGMT --> ROI_OPTIMIZATION
    end
    
    subgraph "Verifier Ecosystem"
        VERIFIER[✅ Verifier]
        QUALIFICATION[🎓 Qualification]
        CASE_ASSIGNMENT[📝 Case Assignment]
        EVIDENCE_ANALYSIS[🔍 Evidence Analysis]
        VERIFICATION_REPORT[📄 Verification Report]
        COMMUNITY_SUPPORT[🤝 Community Support]
        
        VERIFIER --> QUALIFICATION
        QUALIFICATION --> CASE_ASSIGNMENT
        CASE_ASSIGNMENT --> EVIDENCE_ANALYSIS
        EVIDENCE_ANALYSIS --> VERIFICATION_REPORT
        VERIFICATION_REPORT --> COMMUNITY_SUPPORT
    end
    
    subgraph "Moderator Ecosystem"
        MODERATOR[⚖️ Moderator]
        DISPUTE_TRIAGE[🚨 Dispute Triage]
        INVESTIGATION[🔍 Investigation]
        RESOLUTION[⚖️ Resolution]
        SYSTEM_IMPROVEMENT[⚡ System Improvement]
        
        MODERATOR --> DISPUTE_TRIAGE
        DISPUTE_TRIAGE --> INVESTIGATION
        INVESTIGATION --> RESOLUTION
        RESOLUTION --> SYSTEM_IMPROVEMENT
    end
    
    subgraph "Cross-Role Integration Points"
        YIELD_GENERATION[💹 Yield Generation]
        AI_VALIDATION[🤖 AI Validation]
        SMART_CONTRACTS[📜 Smart Contracts]
        TRUST_SCORING[🏆 Trust Scoring]
        NOTIFICATIONS[🔔 Notifications]
    end
    
    %% Cross-role connections
    MANAGE_MEMBERS -.-> JOIN_CONTRIBUTE
    UPLOAD_PROOF -.-> EVIDENCE_ANALYSIS
    MILESTONE_VOTE -.-> VERIFICATION_REPORT
    SPONSOR_MILESTONE -.-> SETUP_MILESTONES
    INVESTMENT_ANALYSIS -.-> PORTFOLIO_MGMT
    RESOLUTION -.-> FUND_MGMT
    
    %% System integration connections
    JOIN_CONTRIBUTE --> YIELD_GENERATION
    FUND_MGMT --> YIELD_GENERATION
    UPLOAD_PROOF --> AI_VALIDATION
    EVIDENCE_ANALYSIS --> AI_VALIDATION
    MILESTONE_VOTE --> SMART_CONTRACTS
    VERIFICATION_REPORT --> SMART_CONTRACTS
    COMMUNITY_SUPPORT --> TRUST_SCORING
    RESOLUTION --> TRUST_SCORING
    SYSTEM_IMPROVEMENT --> NOTIFICATIONS
```

---

## 📁 Repository Structure

```
UPool/
├── 📱 UPoolApp/              # Main Next.js frontend application
│   ├── app/                  # Next.js 13+ app router pages
│   ├── components/           # React components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions
│   └── styles/              # Global styles and Tailwind CSS
│
├── 🧪 UPoolPrototype/        # Business logic prototype & reference
│   ├── app/                 # Prototype pages with business logic
│   ├── components/          # Business logic components
│   └── lib/                 # Core business logic utilities
│
├── 📜 UPoolContracs/         # Smart contracts (Solidity)
│   ├── contracts/           # Smart contract source files
│   ├── scripts/             # Deployment scripts
│   ├── test/               # Contract test suites
│   └── artifacts/          # Compiled contract artifacts
│
├── 🎨 UPoolDesign/           # Design system & assets
│   ├── components/          # Design system components
│   ├── tokens/             # Design tokens (colors, fonts, spacing)
│   ├── assets/             # Images, icons, illustrations
│   └── guidelines/         # Brand and usage guidelines
│
├── 📋 Project_Overview.md    # Comprehensive project documentation
├── 📋 CLAUDE.md             # AI assistant development guide
└── 📋 README.md             # This file - project overview
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Git
- Web3 wallet (MetaMask recommended)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd UPool
   ```

2. **Set up the frontend application**
   ```bash
   cd UPoolApp
   npm install
   npm run dev
   ```

3. **Access the application**
   Open [http://localhost:3000](http://localhost:3000)

4. **Explore the prototype** (optional)
   ```bash
   cd ../UPoolPrototype
   npm install
   npm run dev
   ```

---

## 🎯 Key Features

### 🏊 Pool Management
- **Smart Pool Creation**: Multi-step wizard with AI-assisted milestone suggestions
- **Vanity URLs**: Custom memorable links (e.g., upool.fun/p/eurotrip2025)
- **Progressive Fund Release**: Milestone-based unlocking with weighted community voting
- **Flexible Governance**: Configurable approval thresholds and voting mechanisms
- **AI-Optimized Yield Generation**: Base Agent Kit AI optimizes Morpho Protocol lending strategies

### 🤝 Social & Trust Features  
- **Native Farcaster Integration**: Built-in Mini App experience with seamless wallet interactions
- **Social Graph Analysis**: Trust scoring enhanced by Farcaster follows and social connections
- **Viral Sharing**: Interactive Farcaster Frames for pool discovery and joining
- **Multi-Layered Trust Scoring**: Combines behavior, completion history, and Farcaster social graph
- **Social Login Integration**: Minikit (Farcaster), Privy, and Worldcoin ID
- **Talent Protocol Integration**: Web3 identity verification and reputation import
- **Democratic Governance**: Weighted voting based on contribution and trust scores
- **Community-Driven Moderation**: Dispute resolution with AI assistance

### 🔐 Security & Verification
- **Multi-Signature Security**: Enhanced protection for large transactions
- **Professional Verifier Network**: Expert validation for milestone completion
- **AI-Powered Fraud Detection**: Automated risk assessment and anomaly detection
- **Comprehensive KYC/AML**: Tiered verification based on role and transaction volume
- **Blockchain Immutability**: All critical actions recorded on Base network

### 💰 Advanced Financial Features
- **Multi-Role Funding**: Support for Contributors, Donors, and Investors with different ROI models
- **Yield Distribution**: Automated sharing of DeFi returns among stakeholders
- **Milestone-Specific Sponsorship**: Donors can fund individual milestones
- **ROI Tracking**: Comprehensive analytics for investor returns and performance
- **Emergency Fund Protection**: Dispute resolution mechanisms with fund recovery

### 🤖 AI & Automation
- **Document Analysis**: Automated validation of milestone proof materials
- **Content Generation**: AI-assisted pool descriptions and milestone suggestions
- **Risk Assessment**: Intelligent evaluation of pool completion probability
- **Personalized Discovery**: AI-powered recommendations based on user interests and history
- **Automated Moderation**: Proactive detection of policy violations and suspicious activity

### 🌐 Discovery & Engagement
- **Native Farcaster Experience**: Mini App built directly into Farcaster clients
- **Interactive Frames**: Rich pool previews and joining directly in Farcaster feeds
- **TikTok-Style Feed**: Vertical scrolling discovery with engaging pool previews
- **Social Graph Discovery**: Pool recommendations based on Farcaster connections
- **Viral Sharing Mechanics**: Farcaster Frames, QR codes, smart links, and cast embedding
- **Category-Based Discovery**: Advanced filtering by pool type, location, and success rate
- **Real-Time Notifications**: Multi-channel alerts including Farcaster casts
- **Community Building**: Channel-based pool communities within Farcaster ecosystem

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: React hooks + Context API

### Blockchain  
- **Network**: Base (Ethereum L2)
- **Contracts**: Solidity smart contracts
- **Yield**: Base Agent Kit AI + Morpho Protocol + Base OnchainKit
- **Social Layer**: Minikit + Farcaster SDK for native social integration
- **Storage**: IPFS for documents and metadata

### Backend Services
- **API**: Node.js with Express/Fastify
- **AI**: OpenAI GPT-4 + Claude for validation
- **Database**: PostgreSQL + Redis cache
- **Notifications**: Email, SMS, push notifications

---

## 🏗️ Development Workflow

### Getting Started
1. Review [Project_Overview.md](./Project_Overview.md) for detailed specifications
2. Check [CLAUDE.md](./CLAUDE.md) for AI assistant development guide
3. Explore [UPoolApp/README.md](./UPoolApp/README.md) for frontend setup
4. Reference [UPoolPrototype/](./UPoolPrototype/) for business logic examples

### Development Process
1. **Planning**: Create issues and discuss features
2. **Development**: Work in feature branches
3. **Testing**: Ensure all tests pass
4. **Review**: Code review and approval process
5. **Deployment**: Automated CI/CD pipeline

---

## 📈 Roadmap

### Phase 1: MVP Foundation (Q1-Q2 2025)
**Core Platform Establishment**
- [x] Project architecture and comprehensive documentation
- [x] Frontend application foundation with Next.js and TypeScript
- [x] Complete UI component library with shadcn/ui
- [x] Detailed role definitions and workflow processes
- [ ] Minikit integration for Farcaster Mini App experience
- [ ] Basic Farcaster Frames for pool sharing and discovery
- [ ] Smart contract development and deployment
- [ ] Basic pool creation with milestone system
- [ ] Farcaster + wallet integration and social login
- [ ] AI-optimized Morpho lending implementation with Base Agent Kit
- [ ] Basic voting and approval mechanisms

**Target Metrics**: 100 beta users, 10 active pools, $50K TVL

### Phase 2: Enhanced Platform (Q3-Q4 2025)
**AI Integration & Advanced Social Features**
- [ ] Advanced Farcaster Frames with voting and milestone tracking
- [ ] Deep Farcaster social graph analysis for enhanced trust scoring
- [ ] Channel-based pool communities within Farcaster ecosystem
- [ ] Professional verifier network and certification system
- [ ] AI-powered milestone validation and fraud detection
- [ ] Comprehensive trust scoring with Talent Protocol + Farcaster integration
- [ ] Enhanced TikTok-style discovery feed with social graph recommendations
- [ ] ROI tracking dashboard for investors
- [ ] NFT marketplace and auction integration
- [ ] Multi-channel notification system including Farcaster casts
- [ ] Advanced pool analytics and reporting with social metrics

**Target Metrics**: 1,000 active users, 100 active pools, $500K TVL

### Phase 3: Governance & Scaling (Q1-Q2 2026)
**Decentralization & Community Growth**
- [ ] $UPOOL governance token launch and distribution
- [ ] DAO-based moderation and dispute resolution
- [ ] Staking mechanisms with yield boosting rewards
- [ ] Advanced penalty and slashing systems
- [ ] Cross-chain expansion (Ethereum, Polygon, Arbitrum)
- [ ] Mobile native applications (iOS/Android)
- [ ] Enterprise features and partnership program
- [ ] Advanced AI prediction and recommendation systems

**Target Metrics**: 10,000 active users, 1,000 active pools, $5M TVL

### Phase 4: Global Expansion (Q3-Q4 2026)
**Mass Adoption & Innovation**
- [ ] Global compliance and regulatory framework implementation
- [ ] Fiat on/off ramps and traditional banking integration
- [ ] Institutional investor features and accreditation systems
- [ ] Social media platform integrations (Twitter, Discord, Telegram)
- [ ] Corporate team funding and innovation management tools
- [ ] Educational content platform and certification programs
- [ ] Community-driven feature development and governance
- [ ] International expansion with localized support

**Target Metrics**: 100,000 active users, 10,000 active pools, $50M TVL

---

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use conventional commit messages
- Ensure all tests pass
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🔗 Links & Resources

- **Website**: [UPool.fun](https://upool.fun) (coming soon)
- **Documentation**: [Project Overview](./Project_Overview.md)
- **Frontend App**: [UPoolApp](./UPoolApp/)
- **Prototype**: [UPoolPrototype](./UPoolPrototype/)
- **Design System**: [UPoolDesign](./UPoolDesign/)
- **Smart Contracts**: [UPoolContracs](./UPoolContracs/)

---

## 📞 Support & Community

- **GitHub Issues**: Bug reports and feature requests
- **Discord**: Community discussion (coming soon)
- **Twitter**: [@UPoolFun](https://twitter.com/UPoolFun) (coming soon)
- **Email**: hello@upool.fun (coming soon)

---

**Built with ❤️ by the UPool community**

*Making collaborative funding accessible, transparent, and rewarding for everyone.*