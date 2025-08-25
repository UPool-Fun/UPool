import { ethers, upgrades } from "hardhat";

/**
 * Upgrade UPool Contracts Script
 * Only the owner (0xc2564e41B7F5Cb66d2d99466450CfebcE9e8228f) can perform upgrades
 */
async function main() {
  console.log("🔄 Starting UPool Contract Upgrades...");
  console.log("Network:", (await ethers.provider.getNetwork()).name);

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  console.log("Deployer balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  // Expected owner address
  const EXPECTED_OWNER = "0xc2564e41B7F5Cb66d2d99466450CfebcE9e8228f";
  
  // Verify deployer is the expected owner
  if (deployer.address.toLowerCase() !== EXPECTED_OWNER.toLowerCase()) {
    console.error("❌ Unauthorized: Only the owner can perform upgrades");
    console.error("Expected owner:", EXPECTED_OWNER);
    console.error("Current deployer:", deployer.address);
    process.exit(1);
  }

  // Load deployment addresses (these should be updated with actual deployed addresses)
  const DEPLOYMENT_ADDRESSES = {
    // Update these with your actual deployed proxy addresses
    registry: "0x...", // Replace with actual Registry proxy address
    factory: "0x...",  // Replace with actual Factory proxy address
    
    // These would be loaded from deployments.json or environment variables
    // registry: process.env.REGISTRY_ADDRESS,
    // factory: process.env.FACTORY_ADDRESS,
  };

  try {
    // Step 1: Upgrade Registry Contract
    if (DEPLOYMENT_ADDRESSES.registry && DEPLOYMENT_ADDRESSES.registry !== "0x...") {
      console.log("\n📦 Step 1: Upgrading UPool Registry...");
      console.log("Current Registry Address:", DEPLOYMENT_ADDRESSES.registry);
      
      const UPoolRegistryUpgradeableV2 = await ethers.getContractFactory("UPoolRegistryUpgradeable");
      
      // Upgrade the proxy to new implementation
      const upgradedRegistry = await upgrades.upgradeProxy(
        DEPLOYMENT_ADDRESSES.registry,
        UPoolRegistryUpgradeableV2
      );
      
      await upgradedRegistry.waitForDeployment();
      console.log("✅ Registry upgraded successfully");
      console.log("New Registry Version:", await upgradedRegistry.getVersion());
    } else {
      console.log("⏭️  Skipping Registry upgrade (no address provided)");
    }

    // Step 2: Upgrade Factory Contract  
    if (DEPLOYMENT_ADDRESSES.factory && DEPLOYMENT_ADDRESSES.factory !== "0x...") {
      console.log("\n📦 Step 2: Upgrading UPool Factory...");
      console.log("Current Factory Address:", DEPLOYMENT_ADDRESSES.factory);
      
      const UPoolFactoryUpgradeableV2 = await ethers.getContractFactory("UPoolFactoryUpgradeable");
      
      // Upgrade the proxy to new implementation
      const upgradedFactory = await upgrades.upgradeProxy(
        DEPLOYMENT_ADDRESSES.factory,
        UPoolFactoryUpgradeableV2
      );
      
      await upgradedFactory.waitForDeployment();
      console.log("✅ Factory upgraded successfully");
      console.log("New Factory Version:", await upgradedFactory.getVersion());
    } else {
      console.log("⏭️  Skipping Factory upgrade (no address provided)");
    }

    // Step 3: Deploy new Pool Implementation (if needed)
    console.log("\n📦 Step 3: Deploying new UPool Implementation...");
    const UPoolUpgradeableV2 = await ethers.getContractFactory("UPoolUpgradeable");
    const newPoolImplementation = await UPoolUpgradeableV2.deploy();
    await newPoolImplementation.waitForDeployment();
    const newPoolImplementationAddress = await newPoolImplementation.getAddress();
    console.log("✅ New Pool Implementation deployed to:", newPoolImplementationAddress);

    // Step 4: Update Factory to use new implementation
    if (DEPLOYMENT_ADDRESSES.factory && DEPLOYMENT_ADDRESSES.factory !== "0x...") {
      console.log("\n📦 Step 4: Updating Factory Implementation...");
      const factoryContract = await ethers.getContractAt("UPoolFactoryUpgradeable", DEPLOYMENT_ADDRESSES.factory);
      
      const tx = await factoryContract.updatePoolImplementation(newPoolImplementationAddress);
      await tx.wait();
      
      console.log("✅ Factory updated to use new Pool implementation");
      console.log("New Implementation Address:", await factoryContract.poolImplementation());
    }

    console.log("\n✅ All upgrades completed successfully!");
    
    // Save upgrade info
    const upgradeInfo = {
      network: (await ethers.provider.getNetwork()).name,
      chainId: (await ethers.provider.getNetwork()).chainId,
      timestamp: new Date().toISOString(),
      upgrader: deployer.address,
      upgrades: {
        registry: DEPLOYMENT_ADDRESSES.registry,
        factory: DEPLOYMENT_ADDRESSES.factory,
        newPoolImplementation: newPoolImplementationAddress
      }
    };

    const fs = require('fs');
    const upgradesPath = './upgrades.json';
    let existingUpgrades = [];
    try {
      existingUpgrades = JSON.parse(fs.readFileSync(upgradesPath, 'utf8'));
    } catch (error) {
      // File doesn't exist, start fresh
    }
    existingUpgrades.push(upgradeInfo);
    fs.writeFileSync(upgradesPath, JSON.stringify(existingUpgrades, null, 2));
    console.log(`💾 Upgrade info saved to: ${upgradesPath}`);

  } catch (error) {
    console.error("\n❌ Upgrade failed:", error);
    throw error;
  }
}

// Execute upgrade
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Upgrade error:", error);
    process.exit(1);
  });