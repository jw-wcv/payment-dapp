const { ethers } = require("ethers");

function generateMnemonic() {
  const mnemonic = ethers.utils.entropyToMnemonic(ethers.utils.randomBytes(16));
  console.log("Generated Mnemonic:", mnemonic);
}

generateMnemonic();
