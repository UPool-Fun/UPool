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

  try {
    // Example: Deploy a sample contract (replace with actual UPool contracts)
    console.log("📦 Deploying UPoolRegistry...");
    const UPoolRegistry = await ethers.getContractFactory("UPoolRegistry");
    const registry = await UPoolRegistry.deploy();
    await registry.waitForDeployment();
    
    const registryAddress = await registry.getAddress();
    const registryTx = registry.deploymentTransaction();
    
    deploymentInfo.contracts.UPoolRegistry = {
      address: registryAddress,
      txHash: registryTx?.hash || "",
      blockNumber: registryTx?.blockNumber || 0,
      args: [],
    };

    console.log("✅ UPoolRegistry deployed to:", registryAddress);
    console.log("🧾 Transaction hash:", registryTx?.hash);
    console.log("🧱 Block number:", registryTx?.blockNumber);

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