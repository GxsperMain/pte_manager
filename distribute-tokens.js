import Web3 from "web3";
import Configs from "./libs/configs-loader.js";
import EstimateGasPTE from "./libs/estimate-gas-pte.js"
import { readFileSync } from 'fs';

const configs = Configs();
const web3 = new Web3(new Web3.providers.HttpProvider(configs["rpc_address"]));
const contractAddress = configs["pte_contract_address"];
const abi = configs["pte_contract_abi"];
const contract = new web3.eth.Contract(abi, contractAddress);

const walletsToReceive = JSON.parse(readFileSync(configs["distribute_tokens_file_path"], 'utf-8'));

for (const [key, value] of Object.entries(walletsToReceive)) {
    try {
        const minimumValue = configs["minimum_value_to_distribute"];
        if (value < minimumValue) {
            console.warn("Ignoring because the value is too low: " + value + ", wallet: " + key);
            continue;
        }

        console.log("[DISTRIBUTION] Distributing to: " + key);
        let estimatedGas = await EstimateGasPTE("transfer", [key, value]);
        if (estimatedGas == -1) {
            console.warn("Ignoring because the estimated gas is invalid, wallet: " + key);
            continue;
        };
        console.log("[DISTRIBUTION] Estimated gas: " + estimatedGas + ", running transfer action...");

        const senderAddress = configs["wallet_address"];
        const privateKey = configs["wallet_private_key"];
        const gasLimit = parseInt(configs["max_gas_per_transaction"]);
        const baseFee = Number((await web3.eth.getBlock("pending")).baseFeePerGas);
        let maxPriorityFeePerGas = Number(await web3.eth.getMaxPriorityFeePerGas());
        let maxFeePerGas = maxPriorityFeePerGas + baseFee - 1;

        maxPriorityFeePerGas += parseInt(configs["additional_fee_gas_per_transaction"]);
        maxFeePerGas += parseInt(configs["additional_fee_gas_per_transaction"]);

        console.log("[DISTRIBUTION] Base Fee: " + baseFee);
        console.log("[DISTRIBUTION] Minimum: " + maxPriorityFeePerGas);
        console.log("[DISTRIBUTION] Max Gas: " + maxFeePerGas);

        if (maxFeePerGas > gasLimit) {
            console.error("[DISTRIBUTION] Canceling transfer for: " + key + ", the gas limit has reached");
            console.error("[DISTRIBUTION] Limit: " + gasLimit + ", Total Estimated: " + maxFeePerGas);
            continue;
        }

        const tx = {
            from: senderAddress,
            to: contractAddress,
            gas: estimatedGas,
            maxFeePerGas: maxFeePerGas,
            maxPriorityFeePerGas: maxPriorityFeePerGas,
            data: contract.methods.transfer(key, value).encodeABI()
        };

        const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log("[DISTRIBUTION] Transaction Success: " + receipt.transactionHash);
    } catch (_) {
        console.error("[DISTRIBUTION] ERROR: cannot make the transaction, reason: ");
        console.error(error);
    }
}