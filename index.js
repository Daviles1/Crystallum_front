//Imports des fonctions ethers ainsi que l'adresse et l'ABI du contrat

import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constants.js";

//Permet de connecter les boutons aux fonctions appelées
const connectButton = document.getElementById("connectButton");
const retrieveButton = document.getElementById("retrieveButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balanceButton");
const bottlesButton = document.getElementById("bottlesButton");

connectButton.onclick = connect;
retrieveButton.onclick = retrieve;
fundButton.onclick = fundContract;
balanceButton.onclick = getBalance;
bottlesButton.onclick = setBottles;

//Fonction permettant de se connecter à Metamask (wallet)
async function connect() {
  if (typeof window.ethereum !== "undefined") {
    try {
      await ethereum.request({ method: "eth_requestAccounts" });
    } catch (error) {
      console.log(error);
    }
    connectButton.innerHTML = "Connected";
    const accounts = await ethereum.request({ method: "eth_accounts" });
    console.log(accounts);
  } else {
    //Si l'utilisateur ne possède pas Metamask (disparaitra plus tard, car on créera un wallet pour l'utilisateur)
    connectButton.innerHTML = "Please install MetaMask";
  }
}

//Fonction permettant de retirer de l'Ether en fonction du nombre de bouteilles placées dans la machine
async function retrieve() {
  console.log(`Withdrawing...`);
  if (typeof window.ethereum !== "undefined") {
    //Se connecte à la blockchain
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    //Récupère le wallet de l'utilisateur
    const signer = provider.getSigner();
    //Définit le contrat
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      //Appelle la fonction "retrieve" du contrat qui permet de retirer de l'Ether
      const transactionResponse = await contract.retrieve();
      await listenForTransactionMine(transactionResponse, provider);
    } catch (error) {
      console.log(error);
    }
  } else {
    retrieveButton.innerHTML = "Please install MetaMask";
  }
}

//Fonction permettant d'ajouter des fonds dans le contrat
async function fundContract() {
  //Permet de récupérer le montant voulu par l'utilisateur pour ajouter des fonds
  const ethAmount = document.getElementById("ethAmount").value;
  console.log(`Funding with ${ethAmount} Ether...`);
  if (typeof window.ethereum !== "undefined") {
    //Se connecte à la blockchain
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    //Récupère le wallet de l'utilisateur
    const signer = provider.getSigner();
    //Définit le contrat
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      //Appelle la fonction "funcContract" du contrat qui permet de rajouter des fonds dans le contrat
      const transactionResponse = await contract.fundContract({
        value: ethers.utils.parseEther(ethAmount),
      });
      await listenForTransactionMine(transactionResponse, provider);
    } catch (error) {
      console.log(error);
    }
  } else {
    fundButton.innerHTML = "Please install MetaMask";
  }
}

//Fonction permettant à l'utilisateur de savoir l'Ether récupéré grâce aux bouteilles
async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    //Se connecte à la blockchain
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    //Récupère le wallet de l'utilisateur
    const signer = provider.getSigner();
    //Définit le contrat
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      //Appelle la fonction "getBalance" du contrat qui récupère le montant du wallet de l'utilisateur en fonction des bouteilles placées
      const balance = await contract.getBalance(signer.getAddress());
      console.log(ethers.utils.formatEther(balance));
    } catch (error) {
      console.log(error);
    }
  } else {
    balanceButton.innerHTML = "Please install MetaMask";
  }
}

//Fonction permettant de déterminer le nombre de bouteilles placeés dans la machine pour un utilisateur
async function setBottles() {
  //Récupère le nombre de bouteilles placées
  const numberOfBottles = document.getElementById("bottles").value;
  console.log(`You put ${numberOfBottles} bottles...`);
  if (typeof window.ethereum !== "undefined") {
    //Se connecte à la blockchain
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    //Récupère le wallet de l'utilisateur
    const signer = provider.getSigner();
    //Définit le contrat
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      //Appelle la fonction "setBottles" du contrat
      await contract.setBottles(numberOfBottles);
    } catch (error) {
      console.log(error);
    }
  } else {
    balanceButton.innerHTML = "Please install MetaMask";
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}`);
  return new Promise((resolve, reject) => {
    try {
      provider.once(transactionResponse.hash, (transactionReceipt) => {
        console.log(
          `Completed with ${transactionReceipt.confirmations} confirmations. `
        );
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
}
