import React, { useState, useEffect } from "react";
import Web3 from "web3";

import {
  Container,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
} from '@material-ui/core';

const Splitter = () => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [accounts, setAccounts] = useState(null);
  const [abi, setAbi] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        const abi = [
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "dai",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "usdc",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "usdt",
                "type": "address"
              }
            ],
            "stateMutability": "nonpayable",
            "type": "constructor"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "depositor",
                "type": "address"
              }
            ],
            "name": "claimEth",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "depositor",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "token",
                "type": "address"
              }
            ],
            "name": "claimToken",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "address[]",
                "name": "recipients",
                "type": "address[]"
              },
              {
                "internalType": "uint256[]",
                "name": "percentages",
                "type": "uint256[]"
              },
              {
                "internalType": "uint256",
                "name": "releaseInterval",
                "type": "uint256"
              }
            ],
            "name": "depositEth",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "token",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
              },
              {
                "internalType": "address[]",
                "name": "recipients",
                "type": "address[]"
              },
              {
                "internalType": "uint256[]",
                "name": "percentages",
                "type": "uint256[]"
              },
              {
                "internalType": "uint256",
                "name": "releaseInterval",
                "type": "uint256"
              }
            ],
            "name": "depositToken",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
              }
            ],
            "name": "withdrawEth",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "token",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
              }
            ],
            "name": "withdrawToken",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          }
        ];
        const contract = new web3.eth.Contract(
          abi,
          "0x594781354C1B97a6C615A9E556b1Cf10D34001bc"
        );
        try {
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const accounts = await web3.eth.getAccounts();
          setWeb3(web3);
          setAbi(abi);
          setContract(contract);
          setAccounts(accounts);
        } catch (error) {
          console.error("User denied account access");
        }
      } else {
        console.error("No web3 provider detected");
      }
    };
    initialize();
  }, []);


  const connectWallet = async () => {
    try {
      // Check if Web3 is injected by a wallet
      if (window.ethereum) {
        // Connect the user's wallet to the Goerli testnet
        await window.ethereum.request({ method: 'eth_chainId', params: ['0x5'] });
        // Create a new Web3 instance using the user's wallet provider
        const web3 = new Web3(window.ethereum);
        // Get the user's selected account
        const accounts = await web3.eth.getAccounts();
        const selectedAccount = accounts[0];
        // Return the Web3 instance and the selected account
        return { web3, selectedAccount };
      } else {
        // If no wallet is detected, throw an error
        throw new Error('No wallet found');
      }
    } catch (error) {
      console.log(error);
      // Handle errors here
    }
  };


  const deposit = async () => {
    console.log("calling deposit function");
    const token = document.getElementById("token").value;
    const amount = document.getElementById("amount").value;
    const releaseInterval = document.getElementById("releaseInterval").value;
    const recipients = document
      .getElementById("recipients")
      .value.split(",")
      .map((address) => address.trim());
    const percentages = document
      .getElementById("percentages")
      .value.split(",")
      .map((percent) => parseInt(percent.trim()));

    if (token === "eth") {
      const weiAmount = web3.utils.toWei(amount, "ether");
      const tx = {
        from: accounts[0],
        to: "0x594781354C1B97a6C615A9E556b1Cf10D34001bc",
        value: weiAmount,
        data: contract.methods
          .depositEth(recipients, percentages, releaseInterval)
          .encodeABI(),
      };

      try {
        const receipt = await web3.eth.sendTransaction(tx);
        console.log("Transaction successful", receipt);
      } catch (error) {
        console.error("Transaction failed", error);
      }
    } else {
      const tokenAddress =
        token === "dai"
          ? "0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa"
          : token === "usdc"
          ? "0x621d78f2EF2fd937BFca696CabaF9A779F59B3Ed"
          : "0x3c92d5e5ac5f5e5d5c75e467e97ca65ce9d9d104";
          const ERC20_ABI = [
            {
                "constant": true,
                "inputs": [],
                "name": "totalSupply",
                "outputs": [{"name": "", "type": "uint256"}],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [{"name": "owner", "type": "address"}],
                "name": "balanceOf",
                "outputs": [{"name": "", "type": "uint256"}],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [
                {"name": "spender", "type": "address"},
                {"name": "value", "type": "uint256"}
                ],
                "name": "approve",
                "outputs": [{"name": "", "type": "bool"}],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [
                {"name": "owner", "type": "address"},
                {"name": "spender", "type": "address"}
                ],
                "name": "allowance",
                "outputs": [{"name": "", "type": "uint256"}],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [
                {"name": "to", "type": "address"},
                {"name": "value", "type": "uint256"}
                ],
                "name": "transfer",
                "outputs": [{"name": "", "type": "bool"}],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [
                {"name": "from", "type": "address"},
                {"name": "to", "type": "address"},
                {"name": "value", "type": "uint256"}
                ],
                "name": "transferFrom",
                "outputs": [{"name": "", "type": "bool"}],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
            }
            ];

      const tokenContract = new web3.eth.Contract(ERC20_ABI, tokenAddress);
      const tokenAmount = web3.utils.toWei(amount, "ether");
    
      try {
        await tokenContract.methods
          .approve("0x594781354C1B97a6C615A9E556b1Cf10D34001bc", tokenAmount)
          .send({ from: accounts[0] });
        await contract.methods
          .depositToken(tokenAddress, tokenAmount, recipients, percentages, releaseInterval)
          .send({ from: accounts[0] });
        console.log("Transaction successful");
      } catch (error) {
        console.error("Transaction failed", error);
      }
    }
};

const claim = async () => {
  const token = document.getElementById("token").value;
  console.log(accounts);

  if (token === "eth") {
    try {
      await contract.methods.claimEth().send({ from: accounts[0] });
      console.log("Claim successful");
    } catch (error) {
      console.error("Claim failed", error);
    }
  } else {
    const tokenAddress =
      token === "dai"
        ? "0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa"
        : token === "usdc"
        ? "0x621d78f2EF2fd937BFca696CabaF9A779F59B3Ed"
        : "0x3c92d5e5ac5f5e5d5c75e467e97ca65ce9d9d104";
    try {
      await contract.methods.claimToken(tokenAddress).send({ from: accounts[0] });
      console.log("Claim successful");
    } catch (error) {
      console.error("Claim failed", error);
    }
  }
};

const withdraw = async () => {
  const token = document.getElementById("token").value;
  const amount = document.getElementById("amount").value;

  if (token === "eth") {
    const weiAmount = web3.utils.toWei(amount, "ether");
    try {
      await contract.methods.withdrawEth(weiAmount).send({ from: accounts[0] });
      console.log("Withdraw successful");
    } catch (error) {
      console.error("Withdraw failed", error);
    }
  } else {
    const tokenAddress =
      token === "dai"
        ? "0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa"
        : token === "usdc"
        ? "0x621d78f2EF2fd937BFca696CabaF9A779F59B3Ed"
        : "0x3c92d5e5ac5f5e5d5c75e467e97ca65ce9d9d104";
    const tokenAmount = web3.utils.toWei(amount, "ether");
    try {
      await contract.methods.withdrawToken(tokenAddress, tokenAmount).send({ from: accounts[0] });
      console.log("Withdraw successful");
    } catch (error) {
      console.error("Withdraw failed", error);
    }
  }
};


const getBalance = async () => {
  const token = document.getElementById("token").value;
  const tokenAddress =
    token === "eth"
      ? null
      : token === "dai"
      ? "0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa"
      : token === "usdc"
      ? "0x621d78f2EF2fd937BFca696CabaF9A779F59B3Ed"
      : "0x3c92d5e5ac5f5e5d5c75e467e97ca65ce9d9d104";
  const balance = tokenAddress
    ? await new web3.eth.Contract(abi, tokenAddress).methods
        .balanceOf(accounts[0])
        .call()
    : await web3.eth.getBalance(accounts[0]);
  const decimals = token === "eth" ? 18 : await new web3.eth.Contract(abi, tokenAddress).methods.decimals().call();
  const formattedBalance = token === "eth" ? web3.utils.fromWei(balance, "ether") : (balance / 10 ** decimals).toFixed(2);
  document.getElementById("balance").innerHTML = formattedBalance;
};


const getDepositEvents = async () => {
  const events = await contract.getPastEvents("Deposit", { fromBlock: 0 });
  const eventsList = events
    .map((event) => {
      const { returnValues: { _from, _amount, _token } } = event;
      const token = _token === "0x0000000000000000000000000000000000000000" ? "eth" : _token;
      const formattedAmount = token === "eth" ? web3.utils.fromWei(_amount, "ether") : _amount;
      return `<li>${_from} deposited ${formattedAmount} ${token}</li>`;
    })
    .join("");
  document.getElementById("eventsList").innerHTML = eventsList;
};


const getReleaseEvents = async () => {
  const events = await contract.getPastEvents("Release", { fromBlock: 0 });
  const eventsList = events
    .map((event) => {
      const { returnValues: { _to, _amount, _token } } = event;
      const token = _token === "0x0000000000000000000000000000000000000000" ? "eth" : _token;
      const formattedAmount = token === "eth" ? web3.utils.fromWei(_amount, "ether") : _amount;
      return `<li>${_to} received ${formattedAmount} ${token}</li>`;
    })
    .join("");
  document.getElementById("eventsList").innerHTML = eventsList;
};

const getContractBalance = async () => {
  const balance = await web3.eth.getBalance(contract.options.address);
  const formattedBalance = web3.utils.fromWei(balance, "ether");
  console.log("Contract balance: ", formattedBalance);
  document.getElementById("contract-balance").innerHTML = formattedBalance;
};

return (
  <> 
      <Container maxWidth="sm">
      <Typography variant="h3" gutterBottom>
        Splitter DApp
      </Typography>
      <Button variant="contained" color="primary" onClick={connectWallet} fullWidth>
          Connect Wallet
        </Button>
      <Typography variant="h5" gutterBottom>
        Deposit
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormControl variant="outlined" fullWidth>
            <InputLabel htmlFor="token">Token</InputLabel>
            <Select native label="Token" inputProps={{ id: 'token' }}>
              <option value="eth">ETH</option>
              <option value="dai">DAI</option>
              <option value="usdc">USDC</option>
              <option value="usdt">USDT</option>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="amount"
            label="Amount"
            type="number"
            variant="outlined"
            fullWidth
            inputProps={{ step: 0.01 }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="recipients"
            label="Recipients (comma separated)"
            variant="outlined"
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="percentages"
            label="Percentages (comma separated)"
            variant="outlined"
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="releaseInterval"
            label="Release Interval (seconds)"
            type="number"
            variant="outlined"
            fullWidth
            inputProps={{ step: 1 }}
          />
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" onClick={deposit} color="primary" fullWidth>
            Deposit
          </Button>
        </Grid>
      </Grid>
      <Typography variant="h5" gutterBottom>
        Claim
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormControl variant="outlined" fullWidth>
            <InputLabel htmlFor="token">Token</InputLabel>
            <Select native label="Token" inputProps={{ id: 'token' }}>
              <option value="eth">ETH</option>
              <option value="dai">DAI</option>
              <option value="usdc">USDC</option>
              <option value="usdt">USDT</option>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Button onClick={claim} variant="contained" color="primary" fullWidth>
            Claim
          </Button>
        </Grid>
      </Grid>
      <Typography variant="h5" gutterBottom>
        Withdraw
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormControl variant="outlined" fullWidth>
            <InputLabel htmlFor="token">Token</InputLabel>
            <Select native label="Token" inputProps={{ id: 'token' }}>
              <option value="eth">ETH</option>
              <option value="dai">DAI</option>
              <option value="usdc">USDC</option>
              <option value="usdt">USDT</option>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="amount"
            label="Amount"
            type="number"
            variant="outlined"
            fullWidth
            inputProps={{ step: 0.01 }}
          />
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" onClick={withdraw} color="primary" fullWidth>
            Withdraw
          </Button>
        </Grid>
      </Grid>
      <Typography variant="h5" gutterBottom>
        Balance
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormControl variant="outlined" fullWidth>
            <InputLabel htmlFor="token">Token</InputLabel>
            <Select native label="Token" inputProps={{ id: 'token' }}>
              <option value="eth">ETH</option>
              <option value="dai">DAI</option>
              <option value="usdc">USDC</option>
              <option value="usdt">USDT</option>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" color="primary" fullWidth>
            Get Balance
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1" gutterBottom>
            Your balance: <span id="balance"></span>
          </Typography>
        </Grid>
      </Grid>
      <Typography variant="h5" gutterBottom>
        Events
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Button variant="contained" color="primary" fullWidth onClick={getDepositEvents}>
            Get Deposit Events
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" color="primary" fullWidth onClick={getReleaseEvents}>
            Get Release Events
          </Button>
        </Grid>
      </Grid>
      <Typography variant="h5" gutterBottom>
        Contract Balance
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Button variant="contained" color="primary" fullWidth onClick={getContractBalance}>
            Get Contract Balance
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1" gutterBottom>
            Contract balance: <span id="contract-balance"></span>
          </Typography>
        </Grid>
      </Grid>
    </Container>
  </>
);
};
export default Splitter;
