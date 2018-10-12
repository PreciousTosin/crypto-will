import React from "react";
import ReactDOM from "react-dom";
// import "./index.css";
import App from "./App";
// import registerServiceWorker from "./registerServiceWorker";
import { DrizzleProvider } from "drizzle-react";

// Import contract
import Deployer from "../build/contracts/Deployer.json";
import TutorialToken from "../build/contracts/TutorialToken.json";
// import WillWallet from "../build/contracts/WillWallet.json";

const options = {
  web3: {
  //   block: false,
    fallback: {
      type: "ws",
      url: "ws://127.0.0.1:8545"
    }
  },
  contracts: [
    Deployer,
    TutorialToken,
    // WillWallet
  ],
  // events: {}
};

const root = document.createElement("div");
root.setAttribute('id', 'root');
document.body.appendChild(root);

ReactDOM.render(
  <DrizzleProvider options={options}>
    <App />
  </DrizzleProvider>,
  document.getElementById("root")
);
// registerServiceWorker();