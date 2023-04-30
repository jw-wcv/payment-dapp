const fs = require("fs");
const { ethers } = require("ethers");

// Read mnemonic from secrets.json
const rawData = fs.readFileSync(__dirname + "/../secrets.json");
const { mnemonic, mnemonic2 } = JSON.parse(rawData);

async function checkBalance() {
  // Connect to Goerli network
  const provider = new ethers.providers.InfuraProvider(
    "goerli",
    "53a27ca14c74480ab16acf9d9aa4f2da"
  );

  // Derive the first account associated with the mnemonic
  const wallet = ethers.Wallet.fromMnemonic(mnemonic);
  const account = wallet.connect(provider);

  // Check the balance of the account
  const balance = await account.getBalance();
  console.log(`Balance of ${account.address}: ${ethers.utils.formatEther(balance)} ETH`);
}

checkBalance().catch((error) => {
  console.error(error);
  process.exit(1);
});
