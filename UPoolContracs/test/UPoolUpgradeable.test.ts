import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { UPoolUpgradeable, UPoolFactoryUpgradeable, UPoolRegistryUpgradeable } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("UPool Upgradeable Contracts", function () {
  let owner: HardhatEthersSigner;
  let creator: HardhatEthersSigner;
  let contributor: HardhatEthersSigner;
  let treasury: HardhatEthersSigner;
  let others: HardhatEthersSigner[];

  let poolImplementation: UPoolUpgradeable;
  let registry: UPoolRegistryUpgradeable;
  let factory: UPoolFactoryUpgradeable;

  const OWNER_ADDRESS = "0xc2564e41B7F5Cb66d2d99466450CfebcE9e8228f";
  const poolCreationFee = ethers.parseEther("0.001");
  const maxPoolsPerCreator = 50;

  beforeEach(async function () {
    [owner, creator, contributor, treasury, ...others] = await ethers.getSigners();

    // Deploy Pool Implementation
    const UPoolUpgradeable = await ethers.getContractFactory("UPoolUpgradeable");
    poolImplementation = await UPoolUpgradeable.deploy();
    await poolImplementation.waitForDeployment();

    // Deploy Registry
    const UPoolRegistryUpgradeable = await ethers.getContractFactory("UPoolRegistryUpgradeable");
    registry = await upgrades.deployProxy(
      UPoolRegistryUpgradeable,
      [owner.address, treasury.address, poolCreationFee, maxPoolsPerCreator],
      { kind: "uups", initializer: "initialize" }
    ) as any;
    await registry.waitForDeployment();

    // Deploy Factory
    const UPoolFactoryUpgradeable = await ethers.getContractFactory("UPoolFactoryUpgradeable");
    factory = await upgrades.deployProxy(
      UPoolFactoryUpgradeable,
      [
        await registry.getAddress(),
        await poolImplementation.getAddress(),
        treasury.address,
        poolCreationFee,
        owner.address
      ],
      { kind: "uups", initializer: "initialize" }
    ) as any;
    await factory.waitForDeployment();
  });

  describe("Deployment and Initialization", function () {
    it("Should deploy all contracts successfully", async function () {
      expect(await poolImplementation.getAddress()).to.be.properAddress;
      expect(await registry.getAddress()).to.be.properAddress;
      expect(await factory.getAddress()).to.be.properAddress;
    });

    it("Should set correct initial values for registry", async function () {
      expect(await registry.owner()).to.equal(owner.address);
      expect(await registry.treasury()).to.equal(treasury.address);
      expect(await registry.poolCreationFee()).to.equal(poolCreationFee);
      expect(await registry.maxPoolsPerCreator()).to.equal(maxPoolsPerCreator);
      expect(await registry.getVersion()).to.equal("2.0.0");
    });

    it("Should set correct initial values for factory", async function () {
      expect(await factory.owner()).to.equal(owner.address);
      expect(await factory.treasury()).to.equal(treasury.address);
      expect(await factory.poolCreationFee()).to.equal(poolCreationFee);
      expect(await factory.registry()).to.equal(await registry.getAddress());
      expect(await factory.poolImplementation()).to.equal(await poolImplementation.getAddress());
      expect(await factory.getVersion()).to.equal("2.0.0");
    });
  });

  describe("Pool Creation via Factory", function () {
    it("Should create a new pool successfully", async function () {
      const poolData = {
        title: "Test Pool",
        description: "A test funding pool",
        fundingGoal: ethers.parseEther("10"),
        currency: 1, // USDC
        platformFeeRate: 100, // 1%
        platformFeeRecipient: treasury.address,
        visibility: 0, // PRIVATE
        approvalMethod: 0, // MAJORITY
        approvalThreshold: 5000, // 50%
        poolName: "test-pool",
        vanityUrl: "test-pool",
        riskStrategy: 0 // LOW
      };

      const milestones = [
        {
          id: "milestone-1",
          title: "First Milestone",
          description: "Complete initial phase",
          percentage: 5000, // 50%
          amount: 0, // Will be calculated
          status: 0, // LOCKED
          submittedBy: ethers.ZeroAddress,
          proofUrl: "",
          proofDescription: "",
          votesFor: 0,
          votesAgainst: 0,
          submissionTime: 0,
          approvalTime: 0
        }
      ];

      const tx = await factory.connect(creator).createPool(
        poolData,
        "creator123",
        milestones,
        "",
        { value: poolCreationFee }
      );

      const receipt = await tx.wait();
      const poolCreatedEvent = receipt?.logs.find(
        log => log.topics[0] === ethers.id("PoolCreated(address,address,string,string,string,uint256,uint256)")
      );

      expect(poolCreatedEvent).to.not.be.undefined;
      expect(await factory.totalPoolsCreated()).to.equal(1);
    });

    it("Should revert if insufficient fee provided", async function () {
      const poolData = {
        title: "Test Pool",
        description: "A test funding pool",
        fundingGoal: ethers.parseEther("10"),
        currency: 1,
        platformFeeRate: 100,
        platformFeeRecipient: treasury.address,
        visibility: 0,
        approvalMethod: 0,
        approvalThreshold: 5000,
        poolName: "test-pool",
        vanityUrl: "test-pool-2",
        riskStrategy: 0
      };

      await expect(
        factory.connect(creator).createPool(poolData, "creator123", [], "", {
          value: ethers.parseEther("0.0005") // Insufficient fee
        })
      ).to.be.revertedWithCustomError(factory, "InsufficientCreationFee");
    });
  });

  describe("Upgradeability", function () {
    it("Should upgrade registry successfully", async function () {
      const initialVersion = await registry.getVersion();
      expect(initialVersion).to.equal("2.0.0");

      // Deploy new implementation
      const UPoolRegistryUpgradeableV2 = await ethers.getContractFactory("UPoolRegistryUpgradeable");
      const upgradedRegistry = await upgrades.upgradeProxy(
        await registry.getAddress(),
        UPoolRegistryUpgradeableV2
      );

      // Version should remain the same (this is just for testing)
      expect(await upgradedRegistry.getVersion()).to.equal("2.0.0");
      
      // Verify state is preserved
      expect(await upgradedRegistry.owner()).to.equal(owner.address);
      expect(await upgradedRegistry.treasury()).to.equal(treasury.address);
    });

    it("Should upgrade factory successfully", async function () {
      const initialVersion = await factory.getVersion();
      expect(initialVersion).to.equal("2.0.0");

      // Deploy new implementation
      const UPoolFactoryUpgradeableV2 = await ethers.getContractFactory("UPoolFactoryUpgradeable");
      const upgradedFactory = await upgrades.upgradeProxy(
        await factory.getAddress(),
        UPoolFactoryUpgradeableV2
      );

      // Version should remain the same (this is just for testing)
      expect(await upgradedFactory.getVersion()).to.equal("2.0.0");
      
      // Verify state is preserved
      expect(await upgradedFactory.owner()).to.equal(owner.address);
      expect(await upgradedFactory.treasury()).to.equal(treasury.address);
    });

    it("Should prevent unauthorized upgrades", async function () {
      const UPoolRegistryUpgradeableV2 = await ethers.getContractFactory("UPoolRegistryUpgradeable");
      
      // Try to upgrade with non-owner account
      await expect(
        upgrades.upgradeProxy(await registry.getAddress(), UPoolRegistryUpgradeableV2.connect(creator))
      ).to.be.reverted; // Should fail due to ownership check
    });
  });

  describe("Pool Template Management", function () {
    it("Should add pool templates successfully", async function () {
      await factory.addPoolTemplate(
        "community",
        "Community funding pools",
        0, // LOW risk
        0, // MAJORITY approval
        5000 // 50% threshold
      );

      const template = await factory.getTemplate("community");
      expect(template.name).to.equal("community");
      expect(template.description).to.equal("Community funding pools");
      expect(template.isActive).to.be.true;
    });

    it("Should update template status", async function () {
      await factory.addPoolTemplate("test", "Test template", 0, 0, 5000);
      
      await factory.updateTemplateStatus("test", false);
      
      const template = await factory.getTemplate("test");
      expect(template.isActive).to.be.false;
    });
  });

  describe("Emergency Controls", function () {
    it("Should pause and unpause registry", async function () {
      await registry.emergencyPause();
      expect(await registry.paused()).to.be.true;

      // Should revert when paused
      await expect(
        registry.registerPool(others[0].address, { value: poolCreationFee })
      ).to.be.revertedWith("Pausable: paused");

      await registry.unpause();
      expect(await registry.paused()).to.be.false;
    });

    it("Should pause and unpause factory", async function () {
      await factory.emergencyPause();
      expect(await factory.paused()).to.be.true;

      const poolData = {
        title: "Test Pool",
        description: "A test funding pool",
        fundingGoal: ethers.parseEther("10"),
        currency: 1,
        platformFeeRate: 100,
        platformFeeRecipient: treasury.address,
        visibility: 0,
        approvalMethod: 0,
        approvalThreshold: 5000,
        poolName: "test-pool",
        vanityUrl: "test-pool-paused",
        riskStrategy: 0
      };

      // Should revert when paused
      await expect(
        factory.connect(creator).createPool(poolData, "creator123", [], "", {
          value: poolCreationFee
        })
      ).to.be.revertedWith("Pausable: paused");

      await factory.unpause();
      expect(await factory.paused()).to.be.false;
    });
  });

  describe("Fee Management", function () {
    it("Should collect and withdraw fees", async function () {
      const initialTreasuryBalance = await ethers.provider.getBalance(treasury.address);

      // Create a pool to generate fees
      const poolData = {
        title: "Fee Test Pool",
        description: "Testing fee collection",
        fundingGoal: ethers.parseEther("10"),
        currency: 1,
        platformFeeRate: 100,
        platformFeeRecipient: treasury.address,
        visibility: 0,
        approvalMethod: 0,
        approvalThreshold: 5000,
        poolName: "fee-test-pool",
        vanityUrl: "fee-test-pool",
        riskStrategy: 0
      };

      await factory.connect(creator).createPool(poolData, "creator123", [], "", {
        value: poolCreationFee
      });

      // Check factory balance
      const factoryBalance = await ethers.provider.getBalance(await factory.getAddress());
      expect(factoryBalance).to.equal(poolCreationFee);

      // Withdraw fees
      await factory.withdrawFees();

      // Check treasury received the fees
      const finalTreasuryBalance = await ethers.provider.getBalance(treasury.address);
      expect(finalTreasuryBalance).to.be.gt(initialTreasuryBalance);
    });

    it("Should update creation fee", async function () {
      const newFee = ethers.parseEther("0.002");
      
      await factory.updatePoolCreationFee(newFee);
      expect(await factory.poolCreationFee()).to.equal(newFee);

      await registry.updatePoolCreationFee(newFee);
      expect(await registry.poolCreationFee()).to.equal(newFee);
    });
  });

  describe("Access Control", function () {
    it("Should restrict admin functions to owner", async function () {
      // Non-owner should not be able to update fees
      await expect(
        factory.connect(creator).updatePoolCreationFee(ethers.parseEther("0.002"))
      ).to.be.revertedWithCustomError(factory, "OwnableUnauthorizedAccount");

      await expect(
        registry.connect(creator).updatePoolCreationFee(ethers.parseEther("0.002"))
      ).to.be.revertedWithCustomError(registry, "OwnableUnauthorizedAccount");
    });

    it("Should transfer ownership", async function () {
      await factory.transferOwnership(others[0].address);
      expect(await factory.owner()).to.equal(others[0].address);

      // New owner should be able to call admin functions
      await factory.connect(others[0]).updatePoolCreationFee(ethers.parseEther("0.002"));
      expect(await factory.poolCreationFee()).to.equal(ethers.parseEther("0.002"));
    });
  });
});