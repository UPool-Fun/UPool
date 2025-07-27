import { expect } from "chai";
import { ethers } from "hardhat";
import { UPoolRegistry } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { parseEther } from "ethers";

describe("UPoolRegistry", function () {
  let registry: UPoolRegistry;
  let owner: SignerWithAddress;
  let treasury: SignerWithAddress;
  let creator: SignerWithAddress;
  let otherAccount: SignerWithAddress;

  const INITIAL_FEE = parseEther("0.01");
  const MAX_POOLS_PER_CREATOR = 10;

  beforeEach(async function () {
    [owner, treasury, creator, otherAccount] = await ethers.getSigners();

    const UPoolRegistryFactory = await ethers.getContractFactory("UPoolRegistry");
    registry = await UPoolRegistryFactory.deploy(
      owner.address,
      treasury.address,
      INITIAL_FEE,
      MAX_POOLS_PER_CREATOR
    );
    await registry.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct initial values", async function () {
      expect(await registry.owner()).to.equal(owner.address);
      expect(await registry.treasury()).to.equal(treasury.address);
      expect(await registry.poolCreationFee()).to.equal(INITIAL_FEE);
      expect(await registry.maxPoolsPerCreator()).to.equal(MAX_POOLS_PER_CREATOR);
      expect(await registry.VERSION()).to.equal("1.0.0");
    });

    it("Should revert if treasury is zero address", async function () {
      const UPoolRegistryFactory = await ethers.getContractFactory("UPoolRegistry");
      
      await expect(
        UPoolRegistryFactory.deploy(
          owner.address,
          ethers.ZeroAddress,
          INITIAL_FEE,
          MAX_POOLS_PER_CREATOR
        )
      ).to.be.revertedWithCustomError(registry, "InvalidTreasuryAddress");
    });
  });

  describe("Pool Registration", function () {
    const mockPoolAddress = "0x1234567890123456789012345678901234567890";

    it("Should register a pool with correct fee", async function () {
      await expect(
        registry.connect(creator).registerPool(mockPoolAddress, { value: INITIAL_FEE })
      )
        .to.emit(registry, "PoolRegistered")
        .withArgs(mockPoolAddress, creator.address, await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));

      expect(await registry.isValidPool(mockPoolAddress)).to.be.true;
      expect(await registry.creatorPoolCount(creator.address)).to.equal(1);
      expect(await registry.getTotalPools()).to.equal(1);
    });

    it("Should revert if fee is insufficient", async function () {
      await expect(
        registry.connect(creator).registerPool(mockPoolAddress, { value: parseEther("0.005") })
      ).to.be.revertedWithCustomError(registry, "InsufficientFee");
    });

    it("Should revert if pool address is zero", async function () {
      await expect(
        registry.connect(creator).registerPool(ethers.ZeroAddress, { value: INITIAL_FEE })
      ).to.be.revertedWithCustomError(registry, "InvalidPoolAddress");
    });

    it("Should revert if pool is already registered", async function () {
      await registry.connect(creator).registerPool(mockPoolAddress, { value: INITIAL_FEE });
      
      await expect(
        registry.connect(creator).registerPool(mockPoolAddress, { value: INITIAL_FEE })
      ).to.be.revertedWithCustomError(registry, "PoolAlreadyRegistered");
    });

    it("Should revert if creator exceeds max pools", async function () {
      // Register maximum allowed pools
      for (let i = 0; i < MAX_POOLS_PER_CREATOR; i++) {
        const poolAddress = `0x${(i + 1).toString(16).padStart(40, "0")}`;
        await registry.connect(creator).registerPool(poolAddress, { value: INITIAL_FEE });
      }

      // Try to register one more
      const extraPoolAddress = `0x${(MAX_POOLS_PER_CREATOR + 1).toString(16).padStart(40, "0")}`;
      await expect(
        registry.connect(creator).registerPool(extraPoolAddress, { value: INITIAL_FEE })
      ).to.be.revertedWithCustomError(registry, "MaxPoolsExceeded");
    });

    it("Should revert when paused", async function () {
      await registry.connect(owner).pause();
      
      await expect(
        registry.connect(creator).registerPool(mockPoolAddress, { value: INITIAL_FEE })
      ).to.be.revertedWithCustomError(registry, "EnforcedPause");
    });
  });

  describe("Pool Management", function () {
    const mockPoolAddress = "0x1234567890123456789012345678901234567890";

    beforeEach(async function () {
      await registry.connect(creator).registerPool(mockPoolAddress, { value: INITIAL_FEE });
    });

    it("Should remove a pool (owner only)", async function () {
      await expect(registry.connect(owner).removePool(mockPoolAddress))
        .to.emit(registry, "PoolRemoved")
        .withArgs(mockPoolAddress, owner.address, await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));

      expect(await registry.isValidPool(mockPoolAddress)).to.be.false;
      expect(await registry.getTotalPools()).to.equal(0);
    });

    it("Should revert remove pool if not owner", async function () {
      await expect(
        registry.connect(creator).removePool(mockPoolAddress)
      ).to.be.revertedWithCustomError(registry, "OwnableUnauthorizedAccount");
    });

    it("Should revert remove pool if pool not registered", async function () {
      const nonExistentPool = "0x9876543210987654321098765432109876543210";
      await expect(
        registry.connect(owner).removePool(nonExistentPool)
      ).to.be.revertedWithCustomError(registry, "PoolNotRegistered");
    });
  });

  describe("Configuration Updates", function () {
    it("Should update pool creation fee (owner only)", async function () {
      const newFee = parseEther("0.02");
      
      await expect(registry.connect(owner).updatePoolCreationFee(newFee))
        .to.emit(registry, "PoolCreationFeeUpdated")
        .withArgs(INITIAL_FEE, newFee);

      expect(await registry.poolCreationFee()).to.equal(newFee);
    });

    it("Should update max pools per creator (owner only)", async function () {
      const newMax = 20;
      
      await expect(registry.connect(owner).updateMaxPoolsPerCreator(newMax))
        .to.emit(registry, "MaxPoolsPerCreatorUpdated")
        .withArgs(MAX_POOLS_PER_CREATOR, newMax);

      expect(await registry.maxPoolsPerCreator()).to.equal(newMax);
    });

    it("Should update treasury (owner only)", async function () {
      await expect(registry.connect(owner).updateTreasury(otherAccount.address))
        .to.emit(registry, "TreasuryUpdated")
        .withArgs(treasury.address, otherAccount.address);

      expect(await registry.treasury()).to.equal(otherAccount.address);
    });

    it("Should revert treasury update with zero address", async function () {
      await expect(
        registry.connect(owner).updateTreasury(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(registry, "InvalidTreasuryAddress");
    });
  });

  describe("Fee Withdrawal", function () {
    beforeEach(async function () {
      // Register some pools to generate fees
      for (let i = 0; i < 3; i++) {
        const poolAddress = `0x${(i + 1).toString(16).padStart(40, "0")}`;
        await registry.connect(creator).registerPool(poolAddress, { value: INITIAL_FEE });
      }
    });

    it("Should withdraw fees to treasury", async function () {
      const initialTreasuryBalance = await ethers.provider.getBalance(treasury.address);
      const contractBalance = await ethers.provider.getBalance(await registry.getAddress());
      
      await expect(registry.connect(owner).withdrawFees())
        .to.emit(registry, "FeesWithdrawn")
        .withArgs(treasury.address, contractBalance);

      const finalTreasuryBalance = await ethers.provider.getBalance(treasury.address);
      expect(finalTreasuryBalance).to.equal(initialTreasuryBalance + contractBalance);
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      // Register multiple pools
      for (let i = 0; i < 5; i++) {
        const poolAddress = `0x${(i + 1).toString(16).padStart(40, "0")}`;
        await registry.connect(creator).registerPool(poolAddress, { value: INITIAL_FEE });
      }
    });

    it("Should return correct total pools", async function () {
      expect(await registry.getTotalPools()).to.equal(5);
    });

    it("Should return all pools", async function () {
      const allPools = await registry.getAllPools();
      expect(allPools.length).to.equal(5);
    });

    it("Should return paginated pools", async function () {
      const [pools, total] = await registry.getPoolsPaginated(1, 2);
      expect(pools.length).to.equal(2);
      expect(total).to.equal(5);
    });

    it("Should handle pagination edge cases", async function () {
      // Request beyond total
      const [pools1, total1] = await registry.getPoolsPaginated(10, 5);
      expect(pools1.length).to.equal(0);
      expect(total1).to.equal(5);

      // Request partial last page
      const [pools2, total2] = await registry.getPoolsPaginated(3, 5);
      expect(pools2.length).to.equal(2);
      expect(total2).to.equal(5);
    });
  });

  describe("Pausable Functionality", function () {
    it("Should pause and unpause", async function () {
      await registry.connect(owner).pause();
      expect(await registry.paused()).to.be.true;

      await registry.connect(owner).unpause();
      expect(await registry.paused()).to.be.false;
    });

    it("Should only allow owner to pause/unpause", async function () {
      await expect(
        registry.connect(creator).pause()
      ).to.be.revertedWithCustomError(registry, "OwnableUnauthorizedAccount");

      await expect(
        registry.connect(creator).unpause()
      ).to.be.revertedWithCustomError(registry, "OwnableUnauthorizedAccount");
    });
  });
});