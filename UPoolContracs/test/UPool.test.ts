import { expect } from "chai";
import { ethers } from "hardhat";
import { UPool, UPoolFactory, UPoolRegistry, UPoolYieldStrategy } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("UPool Contract System", function () {
  let registry: UPoolRegistry;
  let yieldStrategy: UPoolYieldStrategy;
  let factory: UPoolFactory;
  let pool: UPool;
  
  let deployer: SignerWithAddress;
  let creator: SignerWithAddress;
  let member1: SignerWithAddress;
  let member2: SignerWithAddress;
  let treasury: SignerWithAddress;

  const poolCreationFee = ethers.parseEther("0.001");
  const maxPoolsPerCreator = 10;
  const fundingGoal = ethers.parseEther("10"); // 10 ETH

  beforeEach(async function () {
    [deployer, creator, member1, member2, treasury] = await ethers.getSigners();

    // Deploy Registry
    const UPoolRegistry = await ethers.getContractFactory("UPoolRegistry");
    registry = await UPoolRegistry.deploy(
      deployer.address,
      treasury.address,
      poolCreationFee,
      maxPoolsPerCreator
    );

    // Deploy Yield Strategy
    const UPoolYieldStrategy = await ethers.getContractFactory("UPoolYieldStrategy");
    yieldStrategy = await UPoolYieldStrategy.deploy(
      treasury.address,
      deployer.address
    );

    // Deploy Factory
    const UPoolFactory = await ethers.getContractFactory("UPoolFactory");
    factory = await UPoolFactory.deploy(
      await registry.getAddress(),
      treasury.address,
      poolCreationFee,
      deployer.address
    );
  });

  describe("UPool Creation via Factory", function () {
    let poolData: any;
    let milestones: any[];

    beforeEach(async function () {
      poolData = {
        title: "Test Pool",
        description: "A test pool for unit testing",
        fundingGoal: fundingGoal,
        visibility: 2, // PUBLIC
        approvalMethod: 0, // MAJORITY
        approvalThreshold: 5000, // 50%
        poolName: "testpool",
        vanityUrl: "test-pool",
        riskStrategy: 0 // LOW
      };

      milestones = [
        {
          id: "milestone1",
          title: "First Milestone",
          description: "Complete the first phase",
          percentage: 4000, // 40%
          amount: 0, // Will be calculated
          status: 0, // LOCKED
          submittedBy: ethers.ZeroAddress,
          proofUrl: "",
          proofDescription: "",
          votesFor: 0,
          votesAgainst: 0,
          submissionTime: 0,
          approvalTime: 0
        },
        {
          id: "milestone2", 
          title: "Second Milestone",
          description: "Complete the second phase",
          percentage: 6000, // 60%
          amount: 0,
          status: 0,
          submittedBy: ethers.ZeroAddress,
          proofUrl: "",
          proofDescription: "",
          votesFor: 0,
          votesAgainst: 0,
          submissionTime: 0,
          approvalTime: 0
        }
      ];
    });

    it("Should create a pool successfully", async function () {
      const tx = await factory.connect(creator).createPool(
        poolData,
        "creator123", // creatorFid
        milestones,
        "", // no template
        { value: poolCreationFee }
      );

      await expect(tx)
        .to.emit(factory, "PoolCreated")
        .withArgs(
          await tx.then(t => t.wait().then(r => r!.logs[0])), // pool address
          creator.address,
          "creator123",
          poolData.title,
          poolData.vanityUrl,
          poolData.fundingGoal,
          await ethers.provider.getBlock("latest").then(b => b!.timestamp)
        );

      // Get created pool address
      const creatorPools = await factory.getCreatorPools(creator.address);
      expect(creatorPools.length).to.equal(1);

      const poolAddress = creatorPools[0];
      pool = await ethers.getContractAt("UPool", poolAddress);

      // Verify pool configuration
      const storedPoolData = await pool.poolData();
      expect(storedPoolData.title).to.equal(poolData.title);
      expect(storedPoolData.fundingGoal).to.equal(poolData.fundingGoal);
      expect(storedPoolData.vanityUrl).to.equal(poolData.vanityUrl);

      // Verify creator is set correctly
      expect(await pool.creator()).to.equal(creator.address);
      expect(await pool.creatorFid()).to.equal("creator123");

      // Verify milestones were added
      const allMilestones = await pool.getAllMilestones();
      expect(allMilestones.length).to.equal(2);
      expect(allMilestones[0].id).to.equal("milestone1");
      expect(allMilestones[1].id).to.equal("milestone2");
    });

    it("Should reject creation with insufficient fee", async function () {
      await expect(
        factory.connect(creator).createPool(
          poolData,
          "creator123",
          milestones,
          "",
          { value: ethers.parseEther("0.0005") } // Too low
        )
      ).to.be.revertedWithCustomError(factory, "InsufficientCreationFee");
    });

    it("Should reject duplicate vanity URLs", async function () {
      // Create first pool
      await factory.connect(creator).createPool(
        poolData,
        "creator123",
        milestones,
        "",
        { value: poolCreationFee }
      );

      // Try to create second pool with same vanity URL
      await expect(
        factory.connect(member1).createPool(
          poolData,
          "member123",
          milestones,
          "",
          { value: poolCreationFee }
        )
      ).to.be.revertedWithCustomError(factory, "VanityUrlTaken");
    });
  });

  describe("Pool Contributions", function () {
    beforeEach(async function () {
      // Create a pool first
      const poolData = {
        title: "Test Pool",
        description: "A test pool for contributions",
        fundingGoal: fundingGoal,
        visibility: 2, // PUBLIC
        approvalMethod: 0, // MAJORITY
        approvalThreshold: 5000, // 50%
        poolName: "testpool",
        vanityUrl: "contrib-test",
        riskStrategy: 0 // LOW
      };

      const milestones = [{
        id: "milestone1",
        title: "Test Milestone", 
        description: "Test milestone",
        percentage: 10000, // 100%
        amount: 0,
        status: 0,
        submittedBy: ethers.ZeroAddress,
        proofUrl: "",
        proofDescription: "",
        votesFor: 0,
        votesAgainst: 0,
        submissionTime: 0,
        approvalTime: 0
      }];

      await factory.connect(creator).createPool(
        poolData,
        "creator123",
        milestones,
        "",
        { value: poolCreationFee }
      );

      const creatorPools = await factory.getCreatorPools(creator.address);
      pool = await ethers.getContractAt("UPool", creatorPools[0]);
    });

    it("Should record contributions correctly", async function () {
      const contributionAmount = ethers.parseEther("2");
      
      await expect(
        pool.connect(deployer).recordContribution(
          member1.address,
          contributionAmount,
          "0x123abc...",
          "web",
          "member123"
        )
      ).to.emit(pool, "ContributionMade")
        .withArgs(
          member1.address,
          contributionAmount,
          "0x123abc...",
          "web",
          await ethers.provider.getBlock("latest").then(b => b!.timestamp)
        );

      // Check pool statistics
      const stats = await pool.getPoolStats();
      expect(stats._totalRaised).to.equal(contributionAmount);
      expect(stats._memberCount).to.equal(2); // Creator + member1
      expect(stats._contributionCount).to.equal(1);

      // Check member was added
      const member = await pool.getMember(member1.address);
      expect(member.memberAddress).to.equal(member1.address);
      expect(member.contributed).to.equal(contributionAmount);
      expect(member.fid).to.equal("member123");
    });

    it("Should update voting weights after contributions", async function () {
      const contribution1 = ethers.parseEther("3");
      const contribution2 = ethers.parseEther("7");

      // First contribution
      await pool.connect(deployer).recordContribution(
        member1.address,
        contribution1,
        "0x123...",
        "web",
        "member1"
      );

      // Second contribution  
      await pool.connect(deployer).recordContribution(
        member2.address,
        contribution2,
        "0x456...",
        "web", 
        "member2"
      );

      // Check voting weights (should be proportional to contributions)
      const member1Data = await pool.getMember(member1.address);
      const member2Data = await pool.getMember(member2.address);

      // member1: 3 ETH out of 10 ETH = 3000 basis points (30%)
      // member2: 7 ETH out of 10 ETH = 7000 basis points (70%)
      expect(member1Data.votingWeight).to.equal(3000);
      expect(member2Data.votingWeight).to.equal(7000);
    });
  });

  describe("Milestone Management", function () {
    beforeEach(async function () {
      // Create pool and add contributions
      const poolData = {
        title: "Milestone Test Pool",
        description: "Testing milestone functionality",
        fundingGoal: fundingGoal,
        visibility: 2,
        approvalMethod: 0, // MAJORITY
        approvalThreshold: 5000,
        poolName: "milestonepool",
        vanityUrl: "milestone-test",
        riskStrategy: 0
      };

      const milestones = [{
        id: "test-milestone",
        title: "Test Milestone",
        description: "A milestone for testing",
        percentage: 10000, // 100%
        amount: 0,
        status: 0, // LOCKED
        submittedBy: ethers.ZeroAddress,
        proofUrl: "",
        proofDescription: "",
        votesFor: 0,
        votesAgainst: 0,
        submissionTime: 0,
        approvalTime: 0
      }];

      await factory.connect(creator).createPool(
        poolData,
        "creator123",
        milestones,
        "",
        { value: poolCreationFee }
      );

      const creatorPools = await factory.getCreatorPools(creator.address);
      pool = await ethers.getContractAt("UPool", creatorPools[0]);

      // Add contributions and activate pool
      await pool.connect(deployer).recordContribution(
        member1.address,
        ethers.parseEther("5"),
        "0x123...",
        "web",
        "member1"
      );

      await pool.connect(deployer).recordContribution(
        member2.address,
        ethers.parseEther("5"),
        "0x456...",
        "web",
        "member2"
      );

      // Activate pool
      await pool.connect(deployer).updatePoolStatus(3); // ACTIVE
    });

    it("Should submit milestone proof", async function () {
      const proofUrl = "ipfs://QmTestHash";
      const proofDescription = "Proof of milestone completion";

      await expect(
        pool.connect(creator).submitMilestoneProof(
          "test-milestone",
          proofUrl,
          proofDescription
        )
      ).to.emit(pool, "MilestoneProofSubmitted")
        .withArgs(
          "test-milestone",
          creator.address,
          proofUrl,
          proofDescription,
          await ethers.provider.getBlock("latest").then(b => b!.timestamp)
        );

      // Verify milestone status changed
      const milestone = await pool.getMilestone("test-milestone");
      expect(milestone.status).to.equal(1); // PENDING_VOTE
      expect(milestone.proofUrl).to.equal(proofUrl);
      expect(milestone.proofDescription).to.equal(proofDescription);
    });

    it("Should handle voting on milestones", async function () {
      // Submit proof first
      await pool.connect(creator).submitMilestoneProof(
        "test-milestone",
        "ipfs://proof",
        "Completed milestone"
      );

      // member1 votes in favor
      await expect(
        pool.connect(member1).voteOnMilestone("test-milestone", true)
      ).to.emit(pool, "MilestoneVoted")
        .withArgs(
          "test-milestone",
          member1.address,
          true,
          5000, // 50% voting weight
          await ethers.provider.getBlock("latest").then(b => b!.timestamp)
        );

      // member2 votes in favor (should trigger approval)
      await expect(
        pool.connect(member2).voteOnMilestone("test-milestone", true)
      ).to.emit(pool, "MilestoneApproved");

      // Verify milestone is approved
      const milestone = await pool.getMilestone("test-milestone");
      expect(milestone.status).to.equal(2); // APPROVED
    });

    it("Should prevent double voting", async function () {
      await pool.connect(creator).submitMilestoneProof(
        "test-milestone",
        "ipfs://proof",
        "Completed"
      );

      // First vote
      await pool.connect(member1).voteOnMilestone("test-milestone", true);

      // Second vote should fail
      await expect(
        pool.connect(member1).voteOnMilestone("test-milestone", false)
      ).to.be.revertedWithCustomError(pool, "AlreadyVoted");
    });
  });

  describe("Pool Templates", function () {
    it("Should have default templates", async function () {
      const templates = await factory.getAllTemplates();
      expect(templates.length).to.be.greaterThan(0);

      const travelTemplate = await factory.getTemplate("travel");
      expect(travelTemplate.name).to.equal("travel");
      expect(travelTemplate.isActive).to.be.true;
    });

    it("Should create pool with template", async function () {
      const poolData = {
        title: "Travel Pool",
        description: "Group travel to Japan",
        fundingGoal: fundingGoal,
        visibility: 2,
        approvalMethod: 0, // Will be overridden by template
        approvalThreshold: 0, // Will be overridden by template
        poolName: "travel-japan",
        vanityUrl: "japan-trip",
        riskStrategy: 0 // Will be overridden by template
      };

      await factory.connect(creator).createPool(
        poolData,
        "creator123",
        [], // No milestones
        "travel", // Use travel template
        { value: poolCreationFee }
      );

      const creatorPools = await factory.getCreatorPools(creator.address);
      const pool = await ethers.getContractAt("UPool", creatorPools[0]);

      const storedPoolData = await pool.poolData();
      // Template should apply MAJORITY approval method
      expect(storedPoolData.approvalMethod).to.equal(0); // MAJORITY
    });
  });

  describe("Access Control", function () {
    beforeEach(async function () {
      const poolData = {
        title: "Access Control Test",
        description: "Testing access controls",
        fundingGoal: fundingGoal,
        visibility: 0, // PRIVATE
        approvalMethod: 3, // CREATOR
        approvalThreshold: 1,
        poolName: "accesstest",
        vanityUrl: "access-control",
        riskStrategy: 0
      };

      await factory.connect(creator).createPool(
        poolData,
        "creator123",
        [],
        "",
        { value: poolCreationFee }
      );

      const creatorPools = await factory.getCreatorPools(creator.address);
      pool = await ethers.getContractAt("UPool", creatorPools[0]);
    });

    it("Should restrict milestone proof submission to creator", async function () {
      // Add a milestone first
      const milestone = {
        id: "creator-only",
        title: "Creator Only Milestone",
        description: "Only creator can submit proof",
        percentage: 10000,
        amount: 0,
        status: 0,
        submittedBy: ethers.ZeroAddress,
        proofUrl: "",
        proofDescription: "",
        votesFor: 0,
        votesAgainst: 0,
        submissionTime: 0,
        approvalTime: 0
      };

      await pool.connect(creator).addMilestone(milestone);

      // Activate pool
      await pool.connect(deployer).updatePoolStatus(3); // ACTIVE

      // Non-creator should not be able to submit proof
      await expect(
        pool.connect(member1).submitMilestoneProof(
          "creator-only",
          "ipfs://fake",
          "Fake proof"
        )
      ).to.be.revertedWithCustomError(pool, "OnlyCreator");

      // Creator should be able to submit proof
      await expect(
        pool.connect(creator).submitMilestoneProof(
          "creator-only", 
          "ipfs://real",
          "Real proof"
        )
      ).not.to.be.reverted;
    });
  });
});