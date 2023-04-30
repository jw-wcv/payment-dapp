const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const daiAddress = "0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa"; // Replace with the DAI contract address on Goerli
  const usdcAddress = "0x621d78f2EF2fd937BFca696CabaF9A779F59B3Ed"; // Replace with the USDC contract address on Goerli
  const usdtAddress = "0x3c92d5e5ac5f5e5d5c75e467e97ca65ce9d9d104"; // Replace with the USDT contract address on Goerli

  const Splitter = await hre.ethers.getContractFactory("Splitter");
  const splitter = await Splitter.deploy(daiAddress, usdcAddress, usdtAddress);

  await splitter.deployed();

  console.log("Splitter deployed to:", splitter.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
