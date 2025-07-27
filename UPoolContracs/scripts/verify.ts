import { run, network } from "hardhat";
import fs from "fs";
import path from "path";

interface ContractInfo {
  address: string;
  txHash: string;
  blockNumber: number;
  args?: any[];
}

interface DeploymentInfo {
  network: string;
  chainId: number;
  timestamp: string;
  contracts: Record<string, ContractInfo>;
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log("Usage: npx hardhat run scripts/verify.ts --network <network> -- <contract_address> [constructor_args...]");
    console.log("   or: npx hardhat run scripts/verify.ts --network <network> -- --all");
    process.exit(1);
  }

  console.log("🔍 Starting contract verification...");
  console.log("📍 Network:", network.name);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  if (args[0] === "--all") {
    // Verify all contracts from latest deployment
    const deploymentsDir = path.join(__dirname, "../deployments");
    const latestFilepath = path.join(deploymentsDir, `${network.name}-latest.json`);
    
    if (!fs.existsSync(latestFilepath)) {
      console.error("❌ No deployment file found for network:", network.name);
      console.log("💡 Deploy contracts first with: npm run deploy:<network>");
      process.exit(1);
    }

    const deploymentInfo: DeploymentInfo = JSON.parse(fs.readFileSync(latestFilepath, "utf8"));
    
    console.log("📦 Found", Object.keys(deploymentInfo.contracts).length, "contracts to verify");
    
    for (const [contractName, contractInfo] of Object.entries(deploymentInfo.contracts)) {
      try {
        console.log(`\n🔍 Verifying ${contractName} at ${contractInfo.address}...`);
        
        await run("verify:verify", {
          address: contractInfo.address,
          constructorArguments: contractInfo.args || [],
        });
        
        console.log(`✅ ${contractName} verified successfully!`);
      } catch (error: any) {
        if (error.message.includes("Already Verified")) {
          console.log(`✅ ${contractName} already verified`);
        } else {
          console.error(`❌ Failed to verify ${contractName}:`, error.message);
        }
      }
    }
  } else {
    // Verify single contract
    const contractAddress = args[0];
    const constructorArgs = args.slice(1);
    
    console.log("📍 Contract address:", contractAddress);
    console.log("🔧 Constructor args:", constructorArgs.length > 0 ? constructorArgs : "none");
    
    try {
      await run("verify:verify", {
        address: contractAddress,
        constructorArguments: constructorArgs,
      });
      
      console.log("✅ Contract verified successfully!");
    } catch (error: any) {
      if (error.message.includes("Already Verified")) {
        console.log("✅ Contract already verified");
      } else {
        console.error("❌ Verification failed:", error.message);
        process.exit(1);
      }
    }
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎉 Verification process completed!");
  
  // Show explorer links
  const explorerUrl = getExplorerUrl(network.name);
  if (explorerUrl) {
    console.log(`🌐 View contracts on ${getExplorerName(network.name)}:`);
    if (args[0] === "--all") {
      const deploymentsDir = path.join(__dirname, "../deployments");
      const latestFilepath = path.join(deploymentsDir, `${network.name}-latest.json`);
      const deploymentInfo: DeploymentInfo = JSON.parse(fs.readFileSync(latestFilepath, "utf8"));
      
      Object.entries(deploymentInfo.contracts).forEach(([name, info]) => {
        console.log(`   ${name}: ${explorerUrl}/address/${info.address}`);
      });
    } else {
      console.log(`   ${explorerUrl}/address/${args[0]}`);
    }
  }
}

function getExplorerUrl(networkName: string): string | null {
  switch (networkName) {
    case "base":
      return "https://base.blockscout.com";
    case "baseSepolia":
      return "https://base-sepolia.blockscout.com";
    case "baseBlockscout":
      return "https://base.blockscout.com";
    case "baseSepoliaBlockscout":
      return "https://base-sepolia.blockscout.com";
    default:
      return null;
  }
}

function getExplorerName(networkName: string): string {
  if (networkName.includes("Blockscout") || networkName.includes("base")) {
    return "Blockscout";
  }
  return "Explorer";
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });