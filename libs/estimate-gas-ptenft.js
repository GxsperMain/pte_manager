import Web3 from "web3";
import Configs from "./configs-loader.js";

export default async function (action) {
    const configs = Configs();

    const web3 = new Web3(new Web3.providers.HttpProvider(configs["rpc_address"]));

    const contractAddress = configs["pte_nft_contract_address"];
    const abi = configs["pte_nft_contract_abi"];
    const contract = new web3.eth.Contract(abi, contractAddress);

    try {
        let gasEstimate;
        switch (action) {
            case "mintNFT":
                gasEstimate = await contract.methods.mintNFT().estimateGas({
                    from: configs["wallet_address"]
                });
                break;
            default: return -1;
        }

        return gasEstimate;
    } catch (error) {
        console.error("[PTENFT GAS] ERROR: Cannot receive gas estimation, reason: ");
        console.error(error);
        return -1
    }
}