const fs = require("fs");
const ethers = require("ethers");

async function transferNFT() {
  // Read the mnemonics and projectId from the secrets.json file
  const secrets = JSON.parse(fs.readFileSync("secrets.json"));

  // Create wallet instances using the mnemonic phrases
  const wallet1 = ethers.Wallet.fromMnemonic(secrets.mnemonic);
  const wallet2 = ethers.Wallet.fromMnemonic(secrets.mnemonic2);

  // Connect the wallets to a provider (e.g., local or Infura)
  const infuraProvider = new ethers.providers.InfuraProvider("goerli", secrets.projectId);
  const wallet1Connected = wallet1.connect(infuraProvider);
  const wallet2Connected = wallet2.connect(infuraProvider);

  // Create a contract instance for the NFT collection
  const nftCollectionAddress = "0xb0E928b9684321cC7E279971f1a289eBD22eBb22";
  const nftCollectionABI = ["function transferFrom(address from, address to, uint256 tokenId) public"];
  const nftCollection = new ethers.Contract(nftCollectionAddress, nftCollectionABI, wallet1Connected);

  // Set the token ID to transfer
  const tokenId = 1;

  // Transfer the NFT from wallet1 to wallet2
  const tx = await nftCollection.transferFrom(wallet1Connected.address, wallet2Connected.address, tokenId);
  console.log(`Transaction sent! Hash: ${tx.hash}`);
  const receipt = await tx.wait();
  console.log(`Transaction confirmed! Hash: ${receipt.transactionHash}`);
}

transferNFT()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
