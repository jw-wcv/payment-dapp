const fs = require("fs");
const ethers = require("ethers");

async function main() {
  // Read the secrets.json file
  const data = fs.readFileSync("secrets.json");
  const secrets = JSON.parse(data);

  // Get the mnemonic from the secrets.json file
  const mnemonic = secrets.mnemonic2;

  // Use the mnemonic to derive the first account's private key
  const walletPath = ethers.utils.defaultPath;
  const walletMnemonic = new ethers.Wallet.fromMnemonic(mnemonic, walletPath);

  console.log("Private key:", walletMnemonic.privateKey);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
