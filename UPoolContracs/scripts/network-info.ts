import { ethers, network } from "hardhat";

async function main() {
  console.log("🌐 Network Information");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  const provider = ethers.provider;
  const networkInfo = await provider.getNetwork();
  
  console.log("📍 Network Name:", network.name);
  console.log("🔗 Chain ID:", Number(networkInfo.chainId));
  console.log("💰 Native Currency:", networkInfo.name === "base" || networkInfo.name === "baseSepolia" ? "ETH" : "ETH");
  
  // Get block information
  const latestBlock = await provider.getBlock("latest");
  console.log("🧱 Latest Block:", latestBlock?.number);
  console.log("⏰ Block Timestamp:", latestBlock?.timestamp ? new Date(latestBlock.timestamp * 1000).toISOString() : "Unknown");
  
  // Get gas price
  const gasPrice = await provider.getFeeData();
  console.log("⛽ Gas Price:", gasPrice.gasPrice ? ethers.formatUnits(gasPrice.gasPrice, "gwei") + " gwei" : "Unknown");
  
  if (gasPrice.maxFeePerGas) {
    console.log("⛽ Max Fee Per Gas:", ethers.formatUnits(gasPrice.maxFeePerGas, "gwei"), "gwei");
  }
  
  if (gasPrice.maxPriorityFeePerGas) {
    console.log("⛽ Max Priority Fee:", ethers.formatUnits(gasPrice.maxPriorityFeePerGas, "gwei"), "gwei");
  }

  // Show explorer URLs
  console.log("\n🔍 Block Explorers:");
  switch (network.name) {
    case "base":
      console.log("   Blockscout: https://base.blockscout.com");
      console.log("   Basescan: https://basescan.org");
      break;
    case "baseSepolia":
      console.log("   Blockscout: https://base-sepolia.blockscout.com");
      console.log("   Basescan: https://sepolia.basescan.org");
      break;
    case "baseBlockscout":
      console.log("   Blockscout: https://base.blockscout.com");
      break;
    case "baseSepoliaBlockscout":
      console.log("   Blockscout: https://base-sepolia.blockscout.com");
      break;
    default:
      console.log("   Unknown network");
  }

  // Show useful links
  console.log("\n🔗 Useful Links:");
  if (network.name.includes("base")) {
    console.log("   Base Docs: https://docs.base.org");
    console.log("   Base Bridge: https://bridge.base.org");
    if (network.name.includes("Sepolia")) {
      console.log("   Sepolia Faucet: https://www.alchemy.com/faucets/base-sepolia");
    }
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });