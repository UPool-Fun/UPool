import { ethers, upgrades } from "hardhat";

async function main() {
  console.log("🚀 Auto UPool Deployment to Base Sepolia...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  const OWNER_ADDRESS = "0xc2564e41B7F5Cb66d2d99466450CfebcE9e8228f";

  try {
    // Step 1: Deploy UPool Implementation (let Hardhat manage nonce automatically)
    console.log("\n📦 Step 1: Deploying UPool Implementation...");
    const UPoolUpgradeable = await ethers.getContractFactory("UPoolUpgradeable");
    const poolImplementation = await UPoolUpgradeable.deploy();
    await poolImplementation.waitForDeployment();
    const poolImplementationAddress = await poolImplementation.getAddress();
    console.log("✅ UPool Implementation deployed to:", poolImplementationAddress);

    // Step 2: Deploy Registry
    console.log("\n📦 Step 2: Deploying UPool Registry...");
    const UPoolRegistryUpgradeable = await ethers.getContractFactory("UPoolRegistryUpgradeable");
    
    const registry = await upgrades.deployProxy(
      UPoolRegistryUpgradeable,
      [
        OWNER_ADDRESS,
        OWNER_ADDRESS, // treasury
        ethers.parseEther("0.001"), // creation fee
        50 // max pools per creator
      ],
      {
        kind: "uups",
        initializer: "initialize"
      }
    );
    await registry.waitForDeployment();
    const registryAddress = await registry.getAddress();
    console.log("✅ UPool Registry deployed to:", registryAddress);

    // Step 3: Deploy Factory
    console.log("\n📦 Step 3: Deploying UPool Factory...");
    const UPoolFactoryUpgradeable = await ethers.getContractFactory("UPoolFactoryUpgradeable");
    
    const factory = await upgrades.deployProxy(
      UPoolFactoryUpgradeable,
      [
        registryAddress,
        poolImplementationAddress,
        OWNER_ADDRESS, // treasury
        ethers.parseEther("0.001"), // creation fee
        OWNER_ADDRESS // owner
      ],
      {
        kind: "uups",
        initializer: "initialize"
      }
    );
    await factory.waitForDeployment();
    const factoryAddress = await factory.getAddress();
    console.log("✅ UPool Factory deployed to:", factoryAddress);

    // Verification
    console.log("\n🔍 Verifying deployment...");
    const registryOwner = await registry.owner();
    const factoryOwner = await factory.owner();
    
    console.log("Registry Owner:", registryOwner);
    console.log("Factory Owner:", factoryOwner);
    
    if (registryOwner.toLowerCase() === OWNER_ADDRESS.toLowerCase() &&
        factoryOwner.toLowerCase() === OWNER_ADDRESS.toLowerCase()) {
      console.log("✅ Ownership verification passed");
    } else {
      throw new Error("Ownership verification failed");
    }

    console.log("\n🎉 DEPLOYMENT COMPLETE!");
    console.log("==========================================");
    console.log("📄 Base Sepolia Contract Addresses:");
    console.log("- UPool Implementation:", poolImplementationAddress);
    console.log("- UPool Registry (Proxy):", registryAddress);
    console.log("- UPool Factory (Proxy):", factoryAddress);
    
    console.log("\n📝 Update UPoolApp contract-service.ts:");
    console.log("Replace the Base Sepolia addresses with:");
    console.log("UPOOL_IMPLEMENTATION: {");
    console.log(`  'base-sepolia': '${poolImplementationAddress}' as Address`);
    console.log("}");
    console.log("UPOOL_REGISTRY: {");
    console.log(`  'base-sepolia': '${registryAddress}' as Address`);
    console.log("}");
    console.log("UPOOL_FACTORY: {");
    console.log(`  'base-sepolia': '${factoryAddress}' as Address`);
    console.log("}");

    // Save deployment
    const deployment = {
      network: "base-sepolia",
      chainId: 84532,
      timestamp: new Date().toISOString(),
      contracts: {
        poolImplementation: poolImplementationAddress,
        registry: registryAddress,
        factory: factoryAddress
      },
      owner: OWNER_ADDRESS,
      deploymentSuccess: true
    };

    const fs = require('fs');
    fs.writeFileSync('./deployment-base-sepolia.json', JSON.stringify(deployment, null, 2));
    console.log("\n💾 Deployment saved to deployment-base-sepolia.json");
    console.log("\n📋 Next Steps:");
    console.log("1. Update UPoolApp contract addresses");
    console.log("2. Test pool creation and discovery");
    console.log("3. Verify contracts on BaseScan (optional)");

    return deployment;

  } catch (error) {
    console.error("\n❌ Deployment failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });