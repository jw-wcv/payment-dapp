const connectButton = document.getElementById("connectButton");

const initialize = async () => {
    // Check if Web3 has been injected by the browser (MetaMask)
    console.log("In init");
    if (typeof window.ethereum !== "undefined") {
      // Initialize Web3 object
      window.web3 = new Web3(window.ethereum);
  
      try {
        // Request account access if needed
        await window.ethereum.enable();
  
        // Check the network ID
        const networkId = await window.web3.eth.net.getId();
        if (networkId !== 5) {
          console.error("Please switch to the Goerli test network");
          return;
        }
  
        console.log("Connected to wallet:", window.web3.eth.defaultAccount);
      } catch (error) {
        console.error("User denied account access");
      }
    } else {
      console.error("No web3 provider detected");
    }
  };
  

connectButton.addEventListener("click", async () => {
  await initialize();
});
