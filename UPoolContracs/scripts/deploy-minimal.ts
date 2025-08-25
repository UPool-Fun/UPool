import { ethers, network } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const chainId = await deployer.provider.getNetwork().then(n => Number(n.chainId));
  
  console.log("🚀 Minimal UPool Deployment");
  console.log("📍 Network:", network.name);
  console.log("🔗 Chain ID:", chainId);
  console.log("👤 Deployer:", deployer.address);
  console.log("💰 Balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // Deployment configuration
  const treasury = deployer.address;
  const poolCreationFee = ethers.parseEther("0.001");
  const maxPoolsPerCreator = 50;

  console.log("⚙️ Configuration:");
  console.log("   Treasury:", treasury);
  console.log("   Pool creation fee:", ethers.formatEther(poolCreationFee), "ETH");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  try {
    // Deploy only contracts that fit size limits
    
    // Step 1: Deploy UPoolRegistry (3.2KB - fits)
    console.log("📦 Step 1: Deploying UPoolRegistry...");
    const UPoolRegistry = await ethers.getContractFactory("UPoolRegistry");
    const registry = await UPoolRegistry.deploy(
      deployer.address,
      treasury,
      poolCreationFee,
      maxPoolsPerCreator
    );
    await registry.waitForDeployment();
    
    const registryAddress = await registry.getAddress();
    console.log("✅ UPoolRegistry deployed to:", registryAddress);

    // Step 2: Deploy UPoolYieldStrategy (9.9KB - fits)
    console.log("📦 Step 2: Deploying UPoolYieldStrategy...");
    const UPoolYieldStrategy = await ethers.getContractFactory("UPoolYieldStrategy");
    const yieldStrategy = await UPoolYieldStrategy.deploy(
      treasury,
      deployer.address
    );
    await yieldStrategy.waitForDeployment();
    
    const yieldStrategyAddress = await yieldStrategy.getAddress();
    console.log("✅ UPoolYieldStrategy deployed to:", yieldStrategyAddress);

    // Note: UPoolFactory and UPool are skipped due to size limits
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("⚠️  UPoolFactory (25.9KB) exceeds 24KB limit - requires optimization");
    console.log("⚠️  UPool (14.6KB) is deployable but depends on Factory");
    console.log("✅ Successfully deployed core infrastructure contracts");
    
    console.log("📝 Deployed Contracts:");
    console.log(`   UPoolRegistry: ${registryAddress}`);
    console.log(`   UPoolYieldStrategy: ${yieldStrategyAddress}`);
    
    console.log("🔍 Verification Commands:");
    console.log(`   npx hardhat verify --network ${network.name} ${registryAddress}`);
    console.log(`   npx hardhat verify --network ${network.name} ${yieldStrategyAddress}`);

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