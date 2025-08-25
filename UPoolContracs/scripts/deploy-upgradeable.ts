import { ethers, upgrades } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";

/**
 * Deploy Upgradeable UPool Contracts for Production
 * Owner address: 0xc2564e41B7F5Cb66d2d99466450CfebcE9e8228f (as requested)
 */
async function main() {
  console.log("🚀 Starting UPool Upgradeable Contracts Deployment...");
  console.log("Network:", (await ethers.provider.getNetwork()).name);

  // Contract owner address (as specified by user)
  const OWNER_ADDRESS = "0xc2564e41B7F5Cb66d2d99466450CfebcE9e8228f";
  
  // Production configuration for Base mainnet
  const PRODUCTION_CONFIG = {
    // Treasury configuration
    treasury: OWNER_ADDRESS, // Treasury receives fees
    
    // Registry configuration
    poolCreationFee: ethers.parseEther("0.001"), // 0.001 ETH creation fee
    maxPoolsPerCreator: 50, // Maximum 50 pools per creator
    
    // Factory configuration
    factoryCreationFee: ethers.parseEther("0.001"), // Same as registry fee
  };

  console.log("📋 Deployment Configuration:");
  console.log("- Owner Address:", OWNER_ADDRESS);
  console.log("- Treasury Address:", PRODUCTION_CONFIG.treasury);
  console.log("- Pool Creation Fee:", ethers.formatEther(PRODUCTION_CONFIG.poolCreationFee), "ETH");
  console.log("- Max Pools Per Creator:", PRODUCTION_CONFIG.maxPoolsPerCreator);

  try {
    // Step 1: Deploy UPool Implementation Contract
    console.log("\n📦 Step 1: Deploying UPool Implementation...");
    const UPoolUpgradeable = await ethers.getContractFactory("UPoolUpgradeable");
    const poolImplementation = await UPoolUpgradeable.deploy();
    await poolImplementation.waitForDeployment();
    const poolImplementationAddress = await poolImplementation.getAddress();
    console.log("✅ UPool Implementation deployed to:", poolImplementationAddress);

    // Step 2: Deploy Registry Contract
    console.log("\n📦 Step 2: Deploying UPool Registry...");
    const UPoolRegistryUpgradeable = await ethers.getContractFactory("UPoolRegistryUpgradeable");
    const registry = await upgrades.deployProxy(
      UPoolRegistryUpgradeable,
      [
        OWNER_ADDRESS, // Initial owner
        PRODUCTION_CONFIG.treasury, // Treasury address
        PRODUCTION_CONFIG.poolCreationFee, // Pool creation fee
        PRODUCTION_CONFIG.maxPoolsPerCreator // Max pools per creator
      ],
      {
        kind: "uups",
        initializer: "initialize"
      }
    );
    await registry.waitForDeployment();
    const registryAddress = await registry.getAddress();
    console.log("✅ UPool Registry deployed to:", registryAddress);

    // Step 3: Deploy Factory Contract
    console.log("\n📦 Step 3: Deploying UPool Factory...");
    const UPoolFactoryUpgradeable = await ethers.getContractFactory("UPoolFactoryUpgradeable");
    const factory = await upgrades.deployProxy(
      UPoolFactoryUpgradeable,
      [
        registryAddress, // Registry contract address
        poolImplementationAddress, // Pool implementation address
        PRODUCTION_CONFIG.treasury, // Treasury address
        PRODUCTION_CONFIG.factoryCreationFee, // Factory creation fee
        OWNER_ADDRESS // Initial owner
      ],
      {
        kind: "uups",
        initializer: "initialize"
      }
    );
    await factory.waitForDeployment();
    const factoryAddress = await factory.getAddress();
    console.log("✅ UPool Factory deployed to:", factoryAddress);

    // Step 4: Verify deployment
    console.log("\n🔍 Step 4: Verifying deployment...");
    
    // Check Registry
    const registryOwner = await registry.owner();
    const registryVersion = await registry.getVersion();
    console.log("Registry Owner:", registryOwner);
    console.log("Registry Version:", registryVersion);
    
    // Check Factory
    const factoryOwner = await factory.owner();
    const factoryVersion = await factory.getVersion();
    const factoryRegistry = await factory.registry();
    const factoryImplementation = await factory.poolImplementation();
    console.log("Factory Owner:", factoryOwner);
    console.log("Factory Version:", factoryVersion);
    console.log("Factory Registry:", factoryRegistry);
    console.log("Factory Pool Implementation:", factoryImplementation);
    
    // Verify ownership
    if (registryOwner.toLowerCase() !== OWNER_ADDRESS.toLowerCase()) {
      console.error("❌ Registry owner mismatch!");
      throw new Error("Registry owner mismatch");
    }
    if (factoryOwner.toLowerCase() !== OWNER_ADDRESS.toLowerCase()) {
      console.error("❌ Factory owner mismatch!");
      throw new Error("Factory owner mismatch");
    }

    console.log("\n✅ All contracts deployed successfully!");

    // Step 5: Add default pool templates
    console.log("\n📋 Step 5: Adding default pool templates...");
    
    const templates = [
      {
        name: "community",
        description: "Community funding pools for shared goals",
        riskStrategy: 0, // LOW
        approvalMethod: 0, // MAJORITY
        approvalThreshold: 5000 // 50%
      },
      {
        name: "startup",
        description: "Startup funding pools with milestone-based releases",
        riskStrategy: 1, // MEDIUM
        approvalMethod: 1, // PERCENTAGE
        approvalThreshold: 6000 // 60%
      },
      {
        name: "travel",
        description: "Travel funding pools for group adventures",
        riskStrategy: 0, // LOW
        approvalMethod: 0, // MAJORITY
        approvalThreshold: 5000 // 50%
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

    // Final deployment summary
    console.log("\n🎉 DEPLOYMENT COMPLETE!");
    console.log("==========================================");
    console.log("📄 Contract Addresses:");
    console.log("- UPool Implementation:", poolImplementationAddress);
    console.log("- UPool Registry (Proxy):", registryAddress);
    console.log("- UPool Factory (Proxy):", factoryAddress);
    console.log("\n👤 Configuration:");
    console.log("- Owner Address:", OWNER_ADDRESS);
    console.log("- Treasury Address:", PRODUCTION_CONFIG.treasury);
    console.log("- Pool Creation Fee:", ethers.formatEther(PRODUCTION_CONFIG.poolCreationFee), "ETH");
    console.log("\n🔐 Security Features:");
    console.log("- ✅ UUPS Upgradeable Proxies");
    console.log("- ✅ OpenZeppelin Security Standards");
    console.log("- ✅ ReentrancyGuard Protection");
    console.log("- ✅ Pausable Emergency Controls");
    console.log("- ✅ Access Control (Ownable)");
    console.log("- ✅ Upgrade Authorization Protection");
    console.log("\n📝 Next Steps:");
    console.log("1. Verify contracts on explorer");
    console.log("2. Set up monitoring and alerts");
    console.log("3. Update frontend with contract addresses");
    console.log("4. Test pool creation and functionality");
    console.log("5. Configure yield strategies and integrations");

    // Save deployment info to file
    const deploymentInfo = {
      network: (await ethers.provider.getNetwork()).name,
      chainId: (await ethers.provider.getNetwork()).chainId,
      timestamp: new Date().toISOString(),
      owner: OWNER_ADDRESS,
      contracts: {
        poolImplementation: poolImplementationAddress,
        registry: registryAddress,
        factory: factoryAddress
      },
      configuration: PRODUCTION_CONFIG,
      templates: templates
    };

    const fs = require('fs');
    const deploymentPath = './deployments.json';
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`\n💾 Deployment info saved to: ${deploymentPath}`);

  } catch (error) {
    console.error("\n❌ Deployment failed:", error);
    throw error;
  }
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment error:", error);
    process.exit(1);
  });