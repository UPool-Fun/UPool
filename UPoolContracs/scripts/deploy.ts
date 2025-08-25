import { ethers, network } from "hardhat";
import fs from "fs";
import path from "path";

interface DeploymentInfo {
  network: string;
  chainId: number;
  timestamp: string;
  contracts: Record<string, {
    address: string;
    txHash: string;
    blockNumber: number;
    args?: any[];
  }>;
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const chainId = await deployer.provider.getNetwork().then(n => Number(n.chainId));
  
  console.log("🚀 Starting deployment...");
  console.log("📍 Network:", network.name);
  console.log("🔗 Chain ID:", chainId);
  console.log("👤 Deployer:", deployer.address);
  console.log("💰 Balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");
  console.log("⏰ Timestamp:", new Date().toISOString());
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const deploymentInfo: DeploymentInfo = {
    network: network.name,
    chainId,
    timestamp: new Date().toISOString(),
    contracts: {},
  };

  // Deployment configuration
  const treasury = deployer.address; // Use deployer as treasury for testing
  const poolCreationFee = ethers.parseEther("0.001"); // 0.001 ETH
  const maxPoolsPerCreator = 50; // Increased limit for production

  console.log("⚙️ Configuration:");
  console.log("   Treasury:", treasury);
  console.log("   Pool creation fee:", ethers.formatEther(poolCreationFee), "ETH");
  console.log("   Max pools per creator:", maxPoolsPerCreator);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  try {
    // Step 1: Deploy UPoolRegistry
    console.log("📦 Step 1: Deploying UPoolRegistry...");
    const UPoolRegistry = await ethers.getContractFactory("UPoolRegistry");
    const registry = await UPoolRegistry.deploy(
      deployer.address, // initial owner
      treasury,
      poolCreationFee,
      maxPoolsPerCreator
    );
    await registry.waitForDeployment();
    
    const registryAddress = await registry.getAddress();
    const registryTx = registry.deploymentTransaction();
    
    deploymentInfo.contracts.UPoolRegistry = {
      address: registryAddress,
      txHash: registryTx?.hash || "",
      blockNumber: registryTx?.blockNumber || 0,
      args: [deployer.address, treasury, poolCreationFee.toString(), maxPoolsPerCreator],
    };

    console.log("✅ UPoolRegistry deployed to:", registryAddress);
    console.log("🧾 Transaction hash:", registryTx?.hash);

    // Step 2: Deploy UPoolYieldStrategy
    console.log("📦 Step 2: Deploying UPoolYieldStrategy...");
    const UPoolYieldStrategy = await ethers.getContractFactory("UPoolYieldStrategy");
    const yieldStrategy = await UPoolYieldStrategy.deploy(
      treasury, // treasury for yield fees
      deployer.address // initial owner
    );
    await yieldStrategy.waitForDeployment();
    
    const yieldStrategyAddress = await yieldStrategy.getAddress();
    const yieldStrategyTx = yieldStrategy.deploymentTransaction();
    
    deploymentInfo.contracts.UPoolYieldStrategy = {
      address: yieldStrategyAddress,
      txHash: yieldStrategyTx?.hash || "",
      blockNumber: yieldStrategyTx?.blockNumber || 0,
      args: [treasury, deployer.address],
    };

    console.log("✅ UPoolYieldStrategy deployed to:", yieldStrategyAddress);
    console.log("🧾 Transaction hash:", yieldStrategyTx?.hash);

    // Step 3: Deploy UPoolFactory
    console.log("📦 Step 3: Deploying UPoolFactory...");
    const UPoolFactory = await ethers.getContractFactory("UPoolFactory");
    const factory = await UPoolFactory.deploy(
      registryAddress,  // registry address
      treasury,         // treasury for fees
      poolCreationFee,  // creation fee
      deployer.address  // initial owner
    );
    await factory.waitForDeployment();
    
    const factoryAddress = await factory.getAddress();
    const factoryTx = factory.deploymentTransaction();
    
    deploymentInfo.contracts.UPoolFactory = {
      address: factoryAddress,
      txHash: factoryTx?.hash || "",
      blockNumber: factoryTx?.blockNumber || 0,
      args: [registryAddress, treasury, poolCreationFee.toString(), deployer.address],
    };

    console.log("✅ UPoolFactory deployed to:", factoryAddress);
    console.log("🧾 Transaction hash:", factoryTx?.hash);

    // Step 4: Verify deployment and show configuration
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔍 Verifying deployment...");
    
    // Verify Registry
    const registryVersion = await registry.VERSION();
    const registryOwner = await registry.owner();
    console.log("   Registry version:", registryVersion);
    console.log("   Registry owner:", registryOwner);
    
    // Verify Yield Strategy
    const yieldVersion = await yieldStrategy.VERSION();
    const strategiesCount = (await yieldStrategy.getAllStrategies()).length;
    console.log("   Yield strategy version:", yieldVersion);
    console.log("   Default strategies:", strategiesCount);
    
    // Verify Factory
    const factoryVersion = await factory.VERSION();
    const templatesCount = (await factory.getAllTemplates()).length;
    console.log("   Factory version:", factoryVersion);
    console.log("   Default templates:", templatesCount);

    // Save deployment info
    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const filename = `${network.name}-${chainId}-${Date.now()}.json`;
    const filepath = path.join(deploymentsDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));

    // Also save latest deployment
    const latestFilepath = path.join(deploymentsDir, `${network.name}-latest.json`);
    fs.writeFileSync(latestFilepath, JSON.stringify(deploymentInfo, null, 2));

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎉 Deployment completed successfully!");
    console.log("📁 Deployment info saved to:", filename);
    console.log("🔗 Contracts deployed:");
    
    Object.entries(deploymentInfo.contracts).forEach(([name, info]) => {
      console.log(`   ${name}: ${info.address}`);
    });

    // Instructions for verification
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔍 To verify contracts, run:");
    Object.entries(deploymentInfo.contracts).forEach(([name, info]) => {
      console.log(`   npx hardhat verify --network ${network.name} ${info.address}`);
    });

    // Blockscout verification (preferred)
    if (network.name.includes("base")) {
      console.log("🔍 To verify on Blockscout (recommended), run:");
      const blockscoutNetwork = network.name === "base" ? "baseBlockscout" : "baseSepoliaBlockscout";
      Object.entries(deploymentInfo.contracts).forEach(([name, info]) => {
        console.log(`   npx hardhat verify --network ${blockscoutNetwork} ${info.address}`);
      });
    }

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });