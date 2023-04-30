require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
const { projectId, mnemonic } = require("./secrets.json");

module.exports = {
  solidity: "0.8.7",
  networks: {
    hardhat: {},
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${projectId}`,
      accounts: {
        mnemonic: mnemonic,
      },
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${projectId}`,
      accounts: {
        mnemonic: mnemonic,
      },
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${projectId}`,
      accounts: {
        mnemonic: mnemonic,
      },
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${projectId}`,
      accounts: {
        mnemonic: mnemonic,
      },
    },
  },
};
