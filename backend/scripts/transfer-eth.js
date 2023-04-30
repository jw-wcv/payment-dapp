const fs = require("fs");
const ethers = require("ethers");

async function transferEth() {
  // Read the mnemonics and projectId from the secrets.json file
  const secrets = JSON.parse(fs.readFileSync("secrets.json"));

  // Create wallet instances using the mnemonic phrases
  const wallet1 = ethers.Wallet.fromMnemonic(secrets.mnemonic);
  const wallet2 = ethers.Wallet.fromMnemonic(secrets.mnemonic2);

  // Connect the wallets to a provider (e.g., local or Infura)
  const infuraProvider = new ethers.providers.InfuraProvider("goerli", secrets.projectId);
  const wallet1Connected = wallet1.connect(infuraProvider);
  const wallet2Connected = wallet2.connect(infuraProvider);

  // Calculate the amount to transfer in wei (0.05 ETH)
  const amountToTransfer = ethers.utils.parseEther("0.05");

  // Get the current gas price and set a higher value if needed
  const gasPrice = await infuraProvider.getGasPrice();
  console.log('gasPrice: ' + gasPrice);
  const newGasPrice = gasPrice.mul(2); // You can try doubling the gas price
  console.log('newGasPrice: ' + newGasPrice);

  // Estimate the gas limit for the transaction
  const gasLimit = await wallet1Connected.estimateGas({
    to: wallet2Connected.address,
    value: amountToTransfer,
  });
  console.log('gasLimit: ' + gasLimit);

  // Get the chainId
  const chainId = await infuraProvider.getNetwork().then((network) => network.chainId);
  console.log('chainId: ' + chainId);

  // Get the current nonce for wallet1
  const nonce = await wallet1Connected.getTransactionCount('pending');

  // Create and sign the transaction
  const tx = {
    to: wallet2Connected.address,
    value: amountToTransfer,
    gasPrice: newGasPrice,
    gasLimit: gasLimit,
    chainId: chainId,
    nonce: nonce,
  };
  const signedTx = await wallet1Connected.signTransaction(tx);

  // Send the transaction and wait for the receipt
  const txResponse = await infuraProvider.sendTransaction(signedTx);
  console.log(`Transaction sent! Hash: ${txResponse.hash}`);
  const receipt = await txResponse.wait();
  console.log(`Transaction confirmed! Hash: ${receipt.transactionHash}`);
}

transferEth()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
