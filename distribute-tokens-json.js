import Web3 from "web3";
import Configs from "./libs/configs-loader.js";
import EstimateGasPTE from "./libs/estimate-gas-pte.js"
import { readFileSync, writeFileSync } from 'fs';

const configs = Configs();
const web3 = new Web3(new Web3.providers.HttpProvider(configs["rpc_address"]));
const contractAddress = configs["pte_contract_address"];
const abi = configs["pte_contract_abi"];
const contract = new web3.eth.Contract(abi, contractAddress);

const walletsToReceive = JSON.parse(readFileSync(configs["distribute_tokens_file_path"], 'utf-8'));

async function distributeToken(key, value) {
    try {
        const minimumValue = configs["minimum_value_to_distribute"];
        if (value < minimumValue) {
            console.warn("[DISTRIBUTION " + key + " ERROR] Ignoring because the value is too low: " + (value / 1e18) + " PTE, wallet: " + key);
            return false;
        }

        let estimatedGas = await EstimateGasPTE("transfer", [key, value]);
        if (estimatedGas == -1) {
            console.warn("[DISTRIBUTION " + key + " ERROR] Ignoring because the estimated gas is invalid, wallet: " + key);
            return false;
        };
        console.log("[DISTRIBUTION " + key + "] Estimated gas: " + estimatedGas + ", running transfer action...");

        const senderAddress = configs["wallet_address"];
        const privateKey = configs["wallet_private_key"];
        const gasLimit = parseInt(configs["max_gas_per_transaction"]);
        const baseFee = Number((await web3.eth.getBlock("pending")).baseFeePerGas);
        let maxPriorityFeePerGas;
        if (Number(configs["division_fee_gas_per_transaction"]) > 0) {
            const feeDivision = Number(configs["division_fee_gas_per_transaction"]);
            const maxGas = Number(await web3.eth.getMaxPriorityFeePerGas());

            maxPriorityFeePerGas = maxGas / feeDivision;
        }
        else maxPriorityFeePerGas = Number(await web3.eth.getMaxPriorityFeePerGas());
        let maxFeePerGas = maxPriorityFeePerGas + baseFee - 1;

        maxPriorityFeePerGas += parseInt(configs["additional_fee_gas_per_transaction"]);
        maxFeePerGas += parseInt(configs["additional_fee_gas_per_transaction"]);

        console.log("[DISTRIBUTION " + key + "] Base Fee: " + baseFee / 1e18);
        console.log("[DISTRIBUTION " + key + "] Minimum: " + maxPriorityFeePerGas / 1e18);
        console.log("[DISTRIBUTION " + key + "] Max Gas: " + maxFeePerGas / 1e18);

        if (maxFeePerGas > gasLimit) {
            console.error("[DISTRIBUTION " + key + " ERROR] Canceling transfer for: " + key + ", the gas limit has reached");
            console.error("[DISTRIBUTION " + key + " ERROR] Limit: " + gasLimit + ", Total Estimated: " + maxFeePerGas);
            return false;
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
        console.log("[DISTRIBUTION " + key + " SUCCESS] Transaction Success: " + receipt.transactionHash + ", for: " + key);

        return true;
    } catch (error) {
        console.error("[DISTRIBUTION] ERROR: cannot make the transaction, reason: ");
        console.error(error);
        return false;
    }
}

const walletsToReceiveCopy = walletsToReceive;
const quantityToIterate = Object.entries(walletsToReceive).length;
let quantityFinished = 0;
let requestsRunning = 0;
for (const [key, value] of Object.entries(walletsToReceive)) {
    // Wait a while to check if the request is still running
    while (requestsRunning >= parseInt(configs["maximum_requests_per_queue"]))
        await new Promise(resolve => setTimeout(resolve, 100));

    console.log("[DISTRIBUTION " + key + "] Distributing amount: " + value / 1e18);
    requestsRunning++;
    setTimeout(async () => {
        const result = await distributeToken(key, value);
        if (result) {
            delete walletsToReceiveCopy[key];
        }
        requestsRunning--;
        quantityFinished++;
    }, 0);
}

while (true) {
    await new Promise(resolve => setTimeout(resolve, 100));

    if (quantityFinished >= quantityToIterate) {
        console.log("[DISTRIBUTION SUCCESS] Finished, updating tokens file path...");
        writeFileSync(configs["distribute_tokens_file_path"], JSON.stringify(walletsToReceiveCopy), 'utf-8');
        break;
    }
}