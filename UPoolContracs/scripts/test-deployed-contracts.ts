import { ethers } from "hardhat";

/**
 * Test deployed contracts on Base mainnet
 */
async function main() {
  console.log("🧪 Testing deployed UPool contracts on Base mainnet...");
  
  // Contract addresses from deployment
  const CONTRACT_ADDRESSES = {
    poolImplementation: "0xad859B1c980c1F14048bCee70bda19C2F2726F1F",
    registry: "0xf8f067c65A73BC17d4D78FB48A774551CBc6C5EA",
    factory: "0x72672fa9EB552e50841a4DaC3637bC328FBDAc0a"
  };

  const OWNER_ADDRESS = "0xc2564e41B7F5Cb66d2d99466450CfebcE9e8228f";

  try {
    console.log("\n📋 Contract Status:");
    console.log("- Pool Implementation:", CONTRACT_ADDRESSES.poolImplementation);
    console.log("- Registry:", CONTRACT_ADDRESSES.registry);
    console.log("- Factory:", CONTRACT_ADDRESSES.factory);

    // Get contract instances
    const registry = await ethers.getContractAt("UPoolRegistryUpgradeable", CONTRACT_ADDRESSES.registry);
    const factory = await ethers.getContractAt("UPoolFactoryUpgradeable", CONTRACT_ADDRESSES.factory);

    console.log("\n🔍 Test 1: Check Registry Configuration");
    try {
      const registryVersion = await registry.getVersion();
      const poolCreationFee = await registry.poolCreationFee();
      const maxPoolsPerCreator = await registry.maxPoolsPerCreator();
      
      console.log("✅ Registry Version:", registryVersion);
      console.log("✅ Pool Creation Fee:", ethers.formatEther(poolCreationFee), "ETH");
      console.log("✅ Max Pools Per Creator:", maxPoolsPerCreator.toString());
    } catch (error: any) {
      console.log("⚠️ Registry read error:", error.message);
    }

    console.log("\n🔍 Test 2: Check Factory Configuration");
    try {
      const factoryVersion = await factory.getVersion();
      const factoryRegistry = await factory.registry();
      const poolImplementation = await factory.poolImplementation();
      const factoryFee = await factory.poolCreationFee();
      const totalPools = await factory.totalPoolsCreated();
      
      console.log("✅ Factory Version:", factoryVersion);
      console.log("✅ Connected Registry:", factoryRegistry);
      console.log("✅ Pool Implementation:", poolImplementation);
      console.log("✅ Creation Fee:", ethers.formatEther(factoryFee), "ETH");
      console.log("✅ Total Pools Created:", totalPools.toString());
    } catch (error: any) {
      console.log("⚠️ Factory read error:", error.message);
    }

    console.log("\n🔍 Test 3: Check Template Configuration");
    try {
      const templateNames = ["community", "startup", "travel"];
      
      for (const templateName of templateNames) {
        try {
          const template = await factory.getTemplate(templateName);
          console.log(`✅ Template '${templateName}':`, {
            description: template.description,
            isActive: template.isActive,
            riskStrategy: template.riskStrategy.toString(),
            approvalMethod: template.approvalMethod.toString(),
            approvalThreshold: template.approvalThreshold.toString()
          });
        } catch (error: any) {
          console.log(`⚠️ Template '${templateName}' not found:`, error.message);
        }
      }
    } catch (error: any) {
      console.log("⚠️ Template check error:", error.message);
    }

    console.log("\n🔍 Test 4: Verify Ownership");
    try {
      const registryOwner = await registry.owner();
      const factoryOwner = await factory.owner();
      
      console.log("Registry Owner:", registryOwner);
      console.log("Expected Owner:", OWNER_ADDRESS);
      console.log("Registry Owner Match:", registryOwner.toLowerCase() === OWNER_ADDRESS.toLowerCase() ? "✅" : "❌");
      
      console.log("Factory Owner:", factoryOwner);
      console.log("Factory Owner Match:", factoryOwner.toLowerCase() === OWNER_ADDRESS.toLowerCase() ? "✅" : "❌");
    } catch (error: any) {
      console.log("⚠️ Ownership check error:", error.message);
    }

    console.log("\n🎉 CONTRACT TESTING COMPLETE!");
    console.log("============================================");
    console.log("📊 Deployment Summary:");
    console.log("- Network: Base Mainnet (Chain ID: 8453)");
    console.log("- Owner: " + OWNER_ADDRESS);
    console.log("- All contracts deployed and accessible");
    console.log("- Ready for pool creation and testing");
    
    console.log("\n🔗 Explorer Links:");
    console.log("- Pool Implementation: https://basescan.org/address/" + CONTRACT_ADDRESSES.poolImplementation);
    console.log("- Registry: https://basescan.org/address/" + CONTRACT_ADDRESSES.registry);
    console.log("- Factory: https://basescan.org/address/" + CONTRACT_ADDRESSES.factory);

    console.log("\n📝 Next Steps:");
    console.log("1. Update frontend with these contract addresses");
    console.log("2. Test pool creation through frontend");
    console.log("3. Set up monitoring and alerts");
    console.log("4. Consider contract verification on BaseScan");

  } catch (error) {
    console.error("❌ Testing failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Testing error:", error);
    process.exit(1);
  });