import Web3 from "web3";
import EstimateGasPTE from "./estimate-gas-pte.js"
import Configs from "./configs-loader.js";
const configs = Configs();

var intervalId;

async function redeemTokens() {
    try {
        console.log("-------------");
        console.log("[PTE] Checking gas...");
        let estimatedGas = await EstimateGasPTE("rewardTokens");
        if (estimatedGas == -1) return;

        console.log("[PTE] Estimated gas: " + estimatedGas + ", running rewardTokens action...");

        const web3 = new Web3(new Web3.providers.HttpProvider(configs["rpc_address"]));
        const contractAddress = configs["pte_contract_address"];
        const abi = configs["pte_contract_abi"];
        const contract = new web3.eth.Contract(abi, contractAddress);

        const senderAddress = configs["wallet_address"];
        const privateKey = configs["wallet_private_key"];
        const gasLimit = parseInt(configs["max_gas_per_transaction"]);
        const baseFee = await web3.eth.getGasPrice();
        const maxPriorityFeePerGas = web3.utils.toWei(configs["fee_gas_per_transaction"], "gwei");
        const maxFeePerGas = (BigInt(baseFee) + BigInt(maxPriorityFeePerGas)).toString();

        console.log("[PTE] Fee: " + maxFeePerGas);
        console.log("[PTE] Gas Limit: " + gasLimit);

        const tx = {
            from: senderAddress,
            to: contractAddress,
            gas: gasLimit,
            maxFeePerGas: maxFeePerGas,
            maxPriorityFeePerGas: maxPriorityFeePerGas,
            data: contract.methods.rewardTokens().encodeABI()
        };

        const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log("[PTE] Transaction Success: " + receipt.transactionHash);
    } catch (error) {
        console.log("[PTE] ERROR: cannot make the transcation, reason: ");
        console.log(error);
    }
}

export default async function (auto) {
    if (auto) {
        if (intervalId != undefined) {
            clearInterval(intervalId);
            intervalId = undefined;
            console.log("[PTE] Disabled...");
            return;
        }

        console.log("[PTE] Is running every: " + configs["pte_reward_per_seconds"] + " second");
        intervalId = setInterval(() => redeemTokens(), parseInt(configs["pte_reward_per_seconds"]) * 1000);
    } else {

    }
}