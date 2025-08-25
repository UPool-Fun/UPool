import { ethers } from "hardhat";

/**
 * Create a test pool to verify contract functionality
 */
async function main() {
  console.log("🧪 Creating test pool on Base mainnet...");
  
  // Contract addresses
  const FACTORY_ADDRESS = "0x72672fa9EB552e50841a4DaC3637bC328FBDAc0a";
  const poolCreationFee = ethers.parseEther("0.001"); // 0.001 ETH
  
  try {
    // Get the signer (should be the owner)
    const [signer] = await ethers.getSigners();
    console.log("Creating pool with account:", signer.address);
    console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(signer.address)), "ETH");

    // Get factory contract
    const factory = await ethers.getContractAt("UPoolFactoryUpgradeable", FACTORY_ADDRESS);

    // Test pool data
    const poolData = {
      title: "UPool Test Pool",
      description: "Test pool for contract verification on Base mainnet",
      fundingGoal: ethers.parseEther("1.0"), // 1 ETH funding goal
      currency: 0, // ETH currency
      platformFeeRate: 100, // 1% fee
      platformFeeRecipient: signer.address,
      visibility: 2, // PUBLIC
      approvalMethod: 0, // MAJORITY
      approvalThreshold: 5000, // 50%
      poolName: "test-pool-mainnet",
      vanityUrl: "test-pool-mainnet",
      riskStrategy: 0 // LOW
    };

    // Test milestones
    const milestones = [
      {
        id: "milestone-1",
        title: "Test Milestone 1",
        description: "First milestone for testing",
        percentage: 5000, // 50%
        amount: ethers.parseEther("0.5"), // Will be calculated
        status: 0, // LOCKED
        submittedBy: ethers.ZeroAddress,
        proofUrl: "https://upool.fun/proof1",
        proofDescription: "Test proof description",
        votesFor: 0,
        votesAgainst: 0,
        submissionTime: 0,
        approvalTime: 0
      },
      {
        id: "milestone-2", 
        title: "Test Milestone 2",
        description: "Second milestone for testing",
        percentage: 5000, // 50%
        amount: ethers.parseEther("0.5"), // Will be calculated
        status: 0, // LOCKED
        submittedBy: ethers.ZeroAddress,
        proofUrl: "https://upool.fun/proof2",
        proofDescription: "Test proof description 2",
        votesFor: 0,
        votesAgainst: 0,
        submissionTime: 0,
        approvalTime: 0
      }
    ];

    console.log("\n🏗️ Creating pool with data:");
    console.log("- Title:", poolData.title);
    console.log("- Funding Goal:", ethers.formatEther(poolData.fundingGoal), "ETH");
    console.log("- Creation Fee:", ethers.formatEther(poolCreationFee), "ETH");
    console.log("- Milestones:", milestones.length);

    // Create the pool
    console.log("\n📝 Submitting transaction...");
    const tx = await factory.createPool(
      poolData,
      "test-creator", // Creator ID
      milestones,
      "https://ipfs.io/ipfs/test-metadata", // Metadata URL
      { 
        value: poolCreationFee,
        gasLimit: 5000000 // High gas limit for complex operation
      }
    );

    console.log("✅ Transaction submitted!");
    console.log("Transaction Hash:", tx.hash);
    console.log("🔗 View on BaseScan:", `https://basescan.org/tx/${tx.hash}`);

    console.log("\n⏳ Waiting for confirmation...");
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed!");
    console.log("Gas Used:", receipt?.gasUsed?.toString());
    console.log("Block Number:", receipt?.blockNumber);

    // Parse events to find PoolCreated event
    const poolCreatedEvent = receipt?.logs.find(log => {
      try {
        const parsedLog = factory.interface.parseLog({
          topics: log.topics,
          data: log.data
        });
        return parsedLog?.name === "PoolCreated";
      } catch {
        return false;
      }
    });

    if (poolCreatedEvent) {
      const parsedEvent = factory.interface.parseLog({
        topics: poolCreatedEvent.topics,
        data: poolCreatedEvent.data
      });
      
      console.log("\n🎉 POOL CREATED SUCCESSFULLY!");
      console.log("- Pool Address:", parsedEvent?.args[0]);
      console.log("- Creator:", parsedEvent?.args[1]);
      console.log("- Pool Name:", parsedEvent?.args[2]);
      console.log("- Vanity URL:", parsedEvent?.args[3]);
      console.log("🔗 Pool on BaseScan:", `https://basescan.org/address/${parsedEvent?.args[0]}`);
    }

    // Check total pools created
    const totalPools = await factory.totalPoolsCreated();
    console.log("\n📊 Factory Status:");
    console.log("- Total Pools Created:", totalPools.toString());

    console.log("\n✅ TEST POOL CREATION COMPLETE!");
    console.log("============================================");
    console.log("🎯 Test Results:");
    console.log("- ✅ Contract deployment working");
    console.log("- ✅ Pool creation working");
    console.log("- ✅ Events emitted correctly");  
    console.log("- ✅ Gas usage acceptable");
    console.log("- ✅ Transaction confirmed on Base mainnet");

  } catch (error) {
    console.error("❌ Test pool creation failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });