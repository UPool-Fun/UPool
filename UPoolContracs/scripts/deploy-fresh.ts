import { ethers, upgrades } from "hardhat";

async function main() {
  console.log("🚀 Fresh UPool Deployment to Base Sepolia...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Get current nonce to ensure fresh transactions
  const currentNonce = await ethers.provider.getTransactionCount(deployer.address);
  console.log("Current nonce:", currentNonce);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  const OWNER_ADDRESS = "0xc2564e41B7F5Cb66d2d99466450CfebcE9e8228f";
  
  // Get fresh gas data
  const feeData = await ethers.provider.getFeeData();
  console.log("Current gas price:", ethers.formatUnits(feeData.gasPrice || 0n, "gwei"), "gwei");
  
  // Use higher gas price to avoid underpriced errors
  const gasPrice = (feeData.gasPrice || 1000000000n) * 150n / 100n; // 50% higher
  console.log("Using gas price:", ethers.formatUnits(gasPrice, "gwei"), "gwei");

  try {
    // Step 1: Deploy UPool Implementation with explicit nonce
    console.log("\n📦 Step 1: Deploying UPool Implementation...");
    const UPoolUpgradeable = await ethers.getContractFactory("UPoolUpgradeable");
    
    const poolImplementation = await UPoolUpgradeable.deploy({
      nonce: currentNonce,
      gasPrice: gasPrice,
      gasLimit: 6000000
    });
    
    console.log("Implementation deployment tx:", poolImplementation.deploymentTransaction()?.hash);
    await poolImplementation.waitForDeployment();
    const poolImplementationAddress = await poolImplementation.getAddress();
    console.log("✅ UPool Implementation deployed to:", poolImplementationAddress);

    // Wait a bit between deployments
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Step 2: Deploy Registry with next nonce
    console.log("\n📦 Step 2: Deploying UPool Registry...");
    const UPoolRegistryUpgradeable = await ethers.getContractFactory("UPoolRegistryUpgradeable");
    
    const registry = await upgrades.deployProxy(
      UPoolRegistryUpgradeable,
      [
        OWNER_ADDRESS,
        OWNER_ADDRESS,
        ethers.parseEther("0.001"),
        50
      ],
      {
        kind: "uups",
        initializer: "initialize",
        txOverrides: {
          nonce: currentNonce + 1,
          gasPrice: gasPrice,
          gasLimit: 4000000
        }
      }
    );
    
    console.log("Registry deployment in progress...");
    await registry.waitForDeployment();
    const registryAddress = await registry.getAddress();
    console.log("✅ UPool Registry deployed to:", registryAddress);

    // Wait between deployments
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Step 3: Deploy Factory with next nonce  
    console.log("\n📦 Step 3: Deploying UPool Factory...");
    const UPoolFactoryUpgradeable = await ethers.getContractFactory("UPoolFactoryUpgradeable");
    
    const factory = await upgrades.deployProxy(
      UPoolFactoryUpgradeable,
      [
        registryAddress,
        poolImplementationAddress,
        OWNER_ADDRESS,
        ethers.parseEther("0.001"),
        OWNER_ADDRESS
      ],
      {
        kind: "uups", 
        initializer: "initialize",
        txOverrides: {
          nonce: currentNonce + 2,
          gasPrice: gasPrice,
          gasLimit: 4000000
        }
      }
    );
    
    console.log("Factory deployment in progress...");
    await factory.waitForDeployment();
    const factoryAddress = await factory.getAddress();
    console.log("✅ UPool Factory deployed to:", factoryAddress);

    // Verify deployment
    console.log("\n🔍 Verifying deployment...");
    const registryOwner = await registry.owner();
    const factoryOwner = await factory.owner();
    
    console.log("Registry Owner:", registryOwner);
    console.log("Factory Owner:", factoryOwner);
    console.log("Expected Owner:", OWNER_ADDRESS);
    
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
    
    console.log("\n📝 Copy these addresses to UPoolApp:");
    console.log("CONTRACT_ADDRESSES = {");
    console.log(`  UPOOL_IMPLEMENTATION: { 'base-sepolia': '${poolImplementationAddress}' },`);
    console.log(`  UPOOL_REGISTRY: { 'base-sepolia': '${registryAddress}' },`);
    console.log(`  UPOOL_FACTORY: { 'base-sepolia': '${factoryAddress}' }`);
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
      gasPrice: ethers.formatUnits(gasPrice, "gwei") + " gwei"
    };

    const fs = require('fs');
    fs.writeFileSync('./base-sepolia-deployment.json', JSON.stringify(deployment, null, 2));
    console.log("\n💾 Deployment saved to base-sepolia-deployment.json");

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