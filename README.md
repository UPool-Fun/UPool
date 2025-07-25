# UPool - Social Funding Platform 🌊

**Fund together. Grow together. Go further.**

UPool is a revolutionary social funding platform built on the Base blockchain that enables friends, communities, and travelers to pool money toward shared goals, earn yield through DeFi strategies, and unlock funds based on milestone validation and community voting.

---

## 🌟 Vision

UPool transforms how communities fund their dreams by combining:
- **Social Trust** - Reputation-based interactions between real people
- **Smart Finance** - Automated yield generation on pooled funds
- **Milestone Accountability** - Progressive fund release based on verified achievements
- **Democratic Governance** - Community-driven decision making

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
        AGENT[Base Agent Kit]
    end
    
    subgraph "External Services"
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
    SC --> AAVE
    SC --> AGENT
    API --> TALENT
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
    
    Note over C,AI: Pool Creation Flow
    C->>UI: Navigate to Create Pool
    UI->>C: Display creation form
    C->>UI: Fill pool details & milestones
    UI->>API: Submit pool data
    API->>IPFS: Store pool metadata
    IPFS-->>API: Return IPFS hash
    API->>SC: Deploy pool contract
    SC-->>API: Return contract address
    API-->>UI: Pool created successfully
    UI-->>C: Show pool dashboard
    
    Note over C,AI: Milestone Submission Flow
    C->>UI: Upload milestone proof
    UI->>IPFS: Store proof documents
    IPFS-->>UI: Return proof hash
    UI->>API: Submit milestone claim
    API->>AI: Analyze proof validity
    AI-->>API: Return analysis results
    API->>SC: Submit milestone for voting
    SC-->>API: Milestone submitted
    API-->>UI: Notify contributors
    UI-->>C: Show submission status
```

### Contributor Role - Funding & Voting

```mermaid
sequenceDiagram
    participant Con as Contributor
    participant UI as Frontend
    participant API as Backend API
    participant SC as Smart Contract
    participant YIELD as Yield Protocol
    participant NOTIF as Notifications
    
    Note over Con,NOTIF: Join Pool & Contribute
    Con->>UI: Connect wallet
    UI->>SC: Check wallet balance
    SC-->>UI: Return balance
    Con->>UI: Enter contribution amount
    UI->>SC: Execute contribution
    SC->>YIELD: Deposit to yield strategy
    YIELD-->>SC: Confirm deposit
    SC-->>UI: Contribution successful
    UI-->>Con: Show pool membership
    
    Note over Con,NOTIF: Milestone Voting
    NOTIF->>Con: New milestone to vote on
    Con->>UI: Review milestone proof
    UI->>API: Fetch proof details
    API-->>UI: Return proof & AI analysis
    Con->>UI: Cast vote (approve/reject)
    UI->>SC: Submit vote
    SC->>SC: Check voting threshold
    alt Threshold reached
        SC->>SC: Execute milestone payout
        SC->>NOTIF: Notify all members
    else Still collecting votes
        SC-->>UI: Vote recorded
    end
    UI-->>Con: Show voting result
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
    participant YIELD as Yield Protocol
    
    Note over I,YIELD: Investment Analysis
    I->>UI: Browse investment opportunities
    UI->>API: Get pools with ROI potential
    API->>ANALYTICS: Calculate ROI projections
    ANALYTICS-->>API: Return risk/reward analysis
    API-->>UI: Display investment metrics
    
    I->>UI: Select investment amount & terms
    UI->>SC: Create investment agreement
    SC->>SC: Lock investment funds
    SC->>YIELD: Deploy to yield strategy
    SC-->>UI: Investment confirmed
    UI-->>I: Show investment dashboard
    
    Note over I,YIELD: ROI Distribution
    SC->>SC: Pool completes successfully
    SC->>YIELD: Withdraw total yield
    YIELD-->>SC: Return principal + yield
    SC->>SC: Calculate investor ROI
    SC->>SC: Distribute ROI payments
    SC->>UI: Notify ROI distribution
    UI-->>I: Show ROI received
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
    
    Note over V,SC: Verification Assignment
    API->>V: Notify new milestone for verification
    V->>UI: Access verification dashboard
    UI->>API: Get pending verifications
    API-->>UI: Return verification queue
    V->>UI: Select milestone to verify
    
    UI->>IPFS: Fetch proof documents
    IPFS-->>UI: Return proof files
    UI->>AI: Get AI analysis summary
    AI-->>UI: Return validation insights
    UI-->>V: Display proof & analysis
    
    Note over V,SC: Verification Process
    V->>UI: Review all evidence
    V->>UI: Add verification notes
    V->>UI: Submit verification decision
    UI->>API: Process verification
    API->>SC: Record verification on-chain
    SC->>SC: Update milestone status
    SC-->>API: Verification recorded
    API-->>UI: Update verification status
    UI-->>V: Show verification complete
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
    
    Note over M,NOTIF: Dispute Investigation
    API->>M: Dispute reported in pool
    M->>UI: Access moderation panel
    UI->>API: Get dispute details
    API->>IPFS: Fetch dispute evidence
    IPFS-->>API: Return evidence files
    API-->>UI: Display dispute case
    
    M->>UI: Review all evidence
    M->>UI: Contact involved parties
    UI->>NOTIF: Send communication requests
    NOTIF-->>UI: Responses received
    
    Note over M,NOTIF: Dispute Resolution
    M->>UI: Make resolution decision
    UI->>API: Submit resolution
    API->>SC: Execute resolution actions
    
    alt Funds need redistribution
        SC->>SC: Redistribute locked funds
        SC->>NOTIF: Notify affected parties
    else User needs penalty
        SC->>SC: Apply reputation penalty
        SC->>NOTIF: Notify penalized user
    else No action needed
        SC->>SC: Mark dispute resolved
    end
    
    SC-->>API: Resolution executed
    API-->>UI: Update case status
    UI-->>M: Show resolution complete
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

### Multi-Role Interaction Flow

```mermaid
graph TD
    subgraph "Pool Ecosystem"
        Creator[Creator] --> CreatePool[Create Pool]
        CreatePool --> SetMilestones[Set Milestones]
        SetMilestones --> InviteMembers[Invite Members]
        
        Contributor[Contributor] --> JoinPool[Join Pool]
        JoinPool --> ContributeFunds[Contribute Funds]
        ContributeFunds --> VoteOnMilestones[Vote on Milestones]
        
        Donor[Donor] --> DiscoverPool[Discover Pool]
        DiscoverPool --> SponsorMilestone[Sponsor Milestone]
        SponsorMilestone --> ReviewProgress[Review Progress]
        
        Investor[Investor] --> AnalyzeROI[Analyze ROI]
        AnalyzeROI --> InvestFunds[Invest Funds]
        InvestFunds --> MonitorReturns[Monitor Returns]
        
        Verifier[Verifier] --> ReceiveRequest[Receive Verification Request]
        ReceiveRequest --> ValidateProof[Validate Proof]
        ValidateProof --> SubmitVerification[Submit Verification]
        
        Moderator[Moderator] --> HandleDispute[Handle Dispute]
        HandleDispute --> InvestigateCase[Investigate Case]
        InvestigateCase --> ResolveDispute[Resolve Dispute]
    end
    
    subgraph "System Integration Points"
        InviteMembers --> JoinPool
        ContributeFunds --> YieldGeneration[Yield Generation]
        VoteOnMilestones --> ValidateProof
        SubmitVerification --> VoteOnMilestones
        SponsorMilestone --> SetMilestones
        InvestFunds --> YieldGeneration
        MonitorReturns --> YieldGeneration
        ResolveDispute --> ContributeFunds
        ResolveDispute --> VoteOnMilestones
    end
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
- **Create Pools**: Multi-step wizard for setting up funding goals
- **Milestone System**: Progressive fund release based on achievements
- **Role-Based Access**: Different permissions for each user type
- **Yield Generation**: Automated DeFi strategies on pooled funds

### 🤝 Social Features  
- **Trust Scoring**: Reputation system for reliable interactions
- **Community Voting**: Democratic decision-making process
- **Viral Sharing**: Smart links and QR codes for easy sharing
- **Discovery Feed**: TikTok-style exploration of public pools

### 🔐 Security & Trust
- **Blockchain Security**: Base network smart contracts
- **Identity Verification**: ENS and Talent Protocol integration  
- **AI Validation**: Automated proof verification system
- **Dispute Resolution**: Community-driven conflict resolution

### 💰 Financial Features
- **Multi-Asset Support**: Various cryptocurrency and token support
- **Yield Optimization**: Base Agent Kit for maximum returns
- **Flexible Funding**: Multiple ways to contribute (donate, invest, contribute)
- **Transparent Accounting**: On-chain fund tracking and distribution

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
- **Yield**: Base Agent Kit + DeFi protocols
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

### Phase 1: MVP (Current)
- [x] Project architecture and setup
- [x] Frontend application foundation
- [x] Core UI components and design system
- [ ] Smart contract development
- [ ] Basic pool creation and management
- [ ] Wallet integration

### Phase 2: Core Features
- [ ] Milestone system implementation
- [ ] Yield farming integration
- [ ] Voting mechanisms
- [ ] AI validation system
- [ ] Trust scoring

### Phase 3: Advanced Features
- [ ] NFT integration
- [ ] Advanced analytics
- [ ] Mobile application
- [ ] Governance token ($UPOOL)
- [ ] DAO structure

### Phase 4: Scale & Optimize
- [ ] Multi-chain support
- [ ] Enterprise features
- [ ] Advanced AI features
- [ ] Institutional partnerships

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