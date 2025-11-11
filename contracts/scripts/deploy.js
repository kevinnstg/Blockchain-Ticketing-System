const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying TicketRegistry contract...");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH");

  // Deploy contract
  const TicketRegistry = await hre.ethers.getContractFactory("TicketRegistry");
  const ticketRegistry = await TicketRegistry.deploy();

  await ticketRegistry.waitForDeployment();
  
  const contractAddress = await ticketRegistry.getAddress();
  console.log("✅ TicketRegistry deployed to:", contractAddress);
  
  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };
  
  fs.writeFileSync(
    './deployment-info.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("📄 Deployment info saved to deployment-info.json");
  
  // Verify initial state
  const admin = await ticketRegistry.admin();
  const stats = await ticketRegistry.getStats();
  
  console.log("\n📊 Contract Info:");
  console.log("Admin:", admin);
  console.log("Total Events:", stats[0].toString());
  console.log("Total Tickets:", stats[1].toString());
  
  console.log("\n✨ Deployment complete!");
  console.log("\n⚙️  Next steps:");
  console.log("1. Copy the contract address to your .env file:");
  console.log(`   CONTRACT_ADDRESS=${contractAddress}`);
  console.log("2. Start the backend server");
  console.log("3. Start the frontend application");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });