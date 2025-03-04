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
        const baseFee = Number((await web3.eth.getBlock("pending")).baseFeePerGas);
        let maxPriorityFeePerGas = Number(await web3.eth.getMaxPriorityFeePerGas());
        let maxFeePerGas = maxPriorityFeePerGas + baseFee - 1;

        maxPriorityFeePerGas += parseInt(configs["additional_fee_gas_per_transaction"]);
        maxFeePerGas += parseInt(configs["additional_fee_gas_per_transaction"]);

        console.log("[PTE] Base Fee: " + baseFee);
        console.log("[PTE] Minimum: " + maxPriorityFeePerGas);
        console.log("[PTE] Max Gas: " + maxFeePerGas);

        if (maxFeePerGas > gasLimit) {
            console.error("[PTE] Canceling transaction, the gas limit has reached");
            console.error("[PTE] Limit: " + gasLimit + ", Total Estimated: " + maxFeePerGas);
            return;
        }

        const tx = {
            from: senderAddress,
            to: contractAddress,
            gas: estimatedGas,
            maxFeePerGas: maxFeePerGas,
            maxPriorityFeePerGas: maxPriorityFeePerGas,
            data: contract.methods.rewardTokens().encodeABI()
        };

        const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log("[PTE] Transaction Success: " + receipt.transactionHash);
    } catch (error) {
        console.error("[PTE] ERROR: cannot make the transaction, reason: ");
        console.error(error);
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
        redeemTokens();
    }
}