import { ethers, upgrades } from "hardhat";

/**
 * Deploy UPool Contracts to Base Sepolia - Simple deployment with automatic gas handling
 */
async function main() {
  console.log("🚀 Deploying UPool Contracts to Base Sepolia...");
  
  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name, "Chain ID:", network.chainId.toString());
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  
  if (balance < ethers.parseEther("0.01")) {
    throw new Error("Insufficient balance for deployment. Need at least 0.01 ETH");
  }

  const OWNER_ADDRESS = "0xc2564e41B7F5Cb66d2d99466450CfebcE9e8228f";
  
  try {
    // Step 1: Deploy UPool Implementation
    console.log("\n📦 Step 1: Deploying UPool Implementation...");
    const UPoolUpgradeable = await ethers.getContractFactory("UPoolUpgradeable");
    
    // Get current gas price and increase by 20%
    const gasPrice = await ethers.provider.getFeeData();
    const adjustedGasPrice = gasPrice.gasPrice ? gasPrice.gasPrice * 120n / 100n : undefined;
    
    console.log("Gas price:", gasPrice.gasPrice ? ethers.formatUnits(gasPrice.gasPrice, "gwei") : "auto", "gwei");
    
    const poolImplementation = await UPoolUpgradeable.deploy({
      gasPrice: adjustedGasPrice,
      gasLimit: 5000000
    });
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
        initializer: "initialize",
        txOverrides: {
          gasPrice: adjustedGasPrice,
          gasLimit: 3000000
        }
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
        initializer: "initialize",
        txOverrides: {
          gasPrice: adjustedGasPrice,
          gasLimit: 3000000
        }
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
    console.log("Expected Owner:", OWNER_ADDRESS);
    
    if (registryOwner.toLowerCase() === OWNER_ADDRESS.toLowerCase() &&
        factoryOwner.toLowerCase() === OWNER_ADDRESS.toLowerCase()) {
      console.log("✅ Ownership verification passed");
    } else {
      throw new Error("Ownership verification failed");
    }

    // Save deployment addresses
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
      gasUsed: {
        implementation: "~5M gas",
        registry: "~3M gas", 
        factory: "~3M gas"
      }
    };

    console.log("\n🎉 DEPLOYMENT COMPLETE!");
    console.log("==========================================");
    console.log("📄 Contract Addresses for Base Sepolia:");
    console.log("- UPool Implementation:", poolImplementationAddress);
    console.log("- UPool Registry (Proxy):", registryAddress);
    console.log("- UPool Factory (Proxy):", factoryAddress);
    console.log("\n📝 Update these addresses in UPoolApp contract service:");
    console.log(`'base-sepolia': '${poolImplementationAddress}' // Implementation`);
    console.log(`'base-sepolia': '${registryAddress}' // Registry`);  
    console.log(`'base-sepolia': '${factoryAddress}' // Factory`);

    // Save to file
    const fs = require('fs');
    fs.writeFileSync('./sepolia-deployment.json', JSON.stringify(deployment, null, 2));
    console.log("\n💾 Deployment saved to sepolia-deployment.json");

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