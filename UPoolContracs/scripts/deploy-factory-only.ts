import { ethers, upgrades } from "hardhat";

/**
 * Deploy only the Factory contract using existing Registry
 */
async function main() {
  console.log("🚀 Deploying UPool Factory only...");
  console.log("Network:", (await ethers.provider.getNetwork()).name);

  // Use the most recent deployed addresses
  const REGISTRY_ADDRESS = "0xf8f067c65A73BC17d4D78FB48A774551CBc6C5EA";
  const POOL_IMPLEMENTATION_ADDRESS = "0xad859B1c980c1F14048bCee70bda19C2F2726F1F";
  const OWNER_ADDRESS = "0xc2564e41B7F5Cb66d2d99466450CfebcE9e8228f";
  
  const poolCreationFee = ethers.parseEther("0.001");

  try {
    console.log("📦 Deploying UPool Factory...");
    const UPoolFactoryUpgradeable = await ethers.getContractFactory("UPoolFactoryUpgradeable");
    const factory = await upgrades.deployProxy(
      UPoolFactoryUpgradeable,
      [
        REGISTRY_ADDRESS,
        POOL_IMPLEMENTATION_ADDRESS,
        OWNER_ADDRESS, // Treasury
        poolCreationFee,
        OWNER_ADDRESS // Owner
      ],
      {
        kind: "uups",
        initializer: "initialize"
      }
    );
    await factory.waitForDeployment();
    const factoryAddress = await factory.getAddress();
    console.log("✅ UPool Factory deployed to:", factoryAddress);

    // Verify ownership
    const factoryOwner = await factory.owner();
    console.log("Factory Owner:", factoryOwner);
    
    // Add default templates
    console.log("📋 Adding default pool templates...");
    const templates = [
      {
        name: "community",
        description: "Community funding pools",
        riskStrategy: 0,
        approvalMethod: 0,
        approvalThreshold: 5000
      },
      {
        name: "startup",
        description: "Startup funding pools",
        riskStrategy: 1,
        approvalMethod: 1,
        approvalThreshold: 6000
      },
      {
        name: "travel",
        description: "Travel funding pools",
        riskStrategy: 0,
        approvalMethod: 0,
        approvalThreshold: 5000
      }
    ];

    for (const template of templates) {
      try {
        await factory.addPoolTemplate(
          template.name,
          template.description,
          template.riskStrategy,
          template.approvalMethod,
          template.approvalThreshold
        );
        console.log(`✅ Added template: ${template.name}`);
      } catch (error) {
        console.log(`⚠️ Template ${template.name} may already exist`);
      }
    }

    console.log("\n🎉 DEPLOYMENT COMPLETE!");
    console.log("===========================================");
    console.log("📄 Contract Addresses:");
    console.log("- UPool Implementation:", POOL_IMPLEMENTATION_ADDRESS);
    console.log("- UPool Registry (Proxy):", REGISTRY_ADDRESS);
    console.log("- UPool Factory (Proxy):", factoryAddress);
    console.log("\n👤 Configuration:");
    console.log("- Owner Address:", OWNER_ADDRESS);
    console.log("- Pool Creation Fee: 0.001 ETH");

    // Save deployment info
    const deploymentInfo = {
      network: "base",
      chainId: 8453,
      timestamp: new Date().toISOString(),
      owner: OWNER_ADDRESS,
      contracts: {
        poolImplementation: POOL_IMPLEMENTATION_ADDRESS,
        registry: REGISTRY_ADDRESS,
        factory: factoryAddress
      }
    };

    const fs = require('fs');
    fs.writeFileSync('./deployments.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("💾 Deployment info saved to: deployments.json");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment error:", error);
    process.exit(1);
  });