import Web3 from "web3";
import EstimateGasPTENFT from "./estimate-gas-ptenft.js"
import Configs from "./configs-loader.js";
const configs = Configs();

export default async function () {
    try {
        console.log("-------------");
        console.log("[PTE NFT] Generating gas...");
        let estimatedGas = await EstimateGasPTENFT("mintNFT");
        if (estimatedGas == -1) return;

        console.log("[PTE NFT] Estimated gas: " + estimatedGas + ", running mintNFT action...");

        const web3 = new Web3(new Web3.providers.HttpProvider(configs["rpc_address"]));
        const contractAddress = configs["pte_nft_contract_address"];
        const abi = configs["pte_nft_contract_abi"];
        const contract = new web3.eth.Contract(abi, contractAddress);

        const senderAddress = configs["wallet_address"];
        const privateKey = configs["wallet_private_key"];
        const gasLimit = parseInt(configs["max_gas_per_transaction"]);
        const baseFee = Number((await web3.eth.getBlock("pending")).baseFeePerGas);
        let maxPriorityFeePerGas = Number(await web3.eth.getMaxPriorityFeePerGas());
        let maxFeePerGas = maxPriorityFeePerGas + baseFee - 1;

        maxPriorityFeePerGas += parseInt(configs["additional_fee_gas_per_transaction"]);
        maxFeePerGas += parseInt(configs["additional_fee_gas_per_transaction"]);

        console.log("[PTE NFT] Base Fee: " + baseFee);
        console.log("[PTE NFT] Minimum: " + maxPriorityFeePerGas);
        console.log("[PTE NFT] Max Gas: " + maxFeePerGas);

        if (maxFeePerGas > gasLimit) {
            console.error("[PTE NFT] Canceling transaction, the gas limit has reached");
            console.error("[PTE NFT] Limit: " + gasLimit + ", Total Estimated: " + maxFeePerGas);
            return;
        }

        const tx = {
            from: senderAddress,
            to: contractAddress,
            gas: estimatedGas,
            maxFeePerGas: maxFeePerGas,
            maxPriorityFeePerGas: maxPriorityFeePerGas,
            data: contract.methods.mintNFT().encodeABI()
        };

        const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log("[PTE NFT] Transaction Success: " + receipt.transactionHash);
    } catch (error) {
        console.log("[PTE NFT] ERROR: cannot make the transcation, reason: ");
        console.log(error);
    }
}