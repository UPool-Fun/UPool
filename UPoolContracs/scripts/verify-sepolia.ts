import { run } from "hardhat";

/**
 * Verify UPool contracts on Base Sepolia Basescan
 */
async function main() {
  console.log("🔍 Verifying UPool contracts on Base Sepolia...");
  
  // Contract addresses from deployment
  const ADDRESSES = {
    poolImplementation: "0x4894cc56cCEb7d3196F45eaa51c08E6EB46B408E",
    registry: "0xcFE4F99826276ed6fD51bb94bfbc36bc83bEDaDA", 
    factory: "0xB38FFb94A76D8c0C5D99B103DBe6c7aBe717bb7d"
  };
  
  const OWNER_ADDRESS = "0xc2564e41B7F5Cb66d2d99466450CfebcE9e8228f";

  try {
    // Verify UPool Implementation
    console.log("\n📄 Step 1: Verifying UPool Implementation...");
    try {
      await run("verify:verify", {
        address: ADDRESSES.poolImplementation,
        contract: "contracts/UPoolUpgradeable.sol:UPoolUpgradeable"
      });
      console.log("✅ UPool Implementation verified");
    } catch (error) {
      console.log("⚠️ UPool Implementation verification failed:", error.message);
    }

    // Verify Registry (this is a proxy, so we verify the implementation)
    console.log("\n📄 Step 2: Verifying UPool Registry...");
    try {
      await run("verify:verify", {
        address: ADDRESSES.registry,
        constructorArguments: [
          OWNER_ADDRESS,
          OWNER_ADDRESS,
          "1000000000000000", // 0.001 ETH in wei
          50
        ],
        contract: "contracts/UPoolRegistryUpgradeable.sol:UPoolRegistryUpgradeable"
      });
      console.log("✅ UPool Registry verified");
    } catch (error) {
      console.log("⚠️ UPool Registry verification failed:", error.message);
    }

    // Verify Factory (this is also a proxy)
    console.log("\n📄 Step 3: Verifying UPool Factory...");
    try {
      await run("verify:verify", {
        address: ADDRESSES.factory,
        constructorArguments: [
          ADDRESSES.registry,
          ADDRESSES.poolImplementation,
          OWNER_ADDRESS,
          "1000000000000000", // 0.001 ETH in wei
          OWNER_ADDRESS
        ],
        contract: "contracts/UPoolFactoryUpgradeable.sol:UPoolFactoryUpgradeable"
      });
      console.log("✅ UPool Factory verified");
    } catch (error) {
      console.log("⚠️ UPool Factory verification failed:", error.message);
    }

    console.log("\n🎉 Verification process completed!");
    console.log("📄 Verified contracts on Base Sepolia:");
    console.log(`- UPool Implementation: https://sepolia.basescan.org/address/${ADDRESSES.poolImplementation}`);
    console.log(`- UPool Registry: https://sepolia.basescan.org/address/${ADDRESSES.registry}`);
    console.log(`- UPool Factory: https://sepolia.basescan.org/address/${ADDRESSES.factory}`);
    
    console.log("\n📍 Alternative explorers (Blockscout):");
    console.log(`- Implementation: https://base-sepolia.blockscout.com/address/${ADDRESSES.poolImplementation}`);
    console.log(`- Registry: https://base-sepolia.blockscout.com/address/${ADDRESSES.registry}`);
    console.log(`- Factory: https://base-sepolia.blockscout.com/address/${ADDRESSES.factory}`);

  } catch (error) {
    console.error("❌ Verification failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });