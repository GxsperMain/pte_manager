import Web3 from "web3";
import Configs from "./configs-loader.js";

export default async function (action, parameters) {
    const configs = Configs();

    const web3 = new Web3(new Web3.providers.HttpProvider(configs["rpc_address"]));

    const contractAddress = configs["pte_contract_address"];
    const abi = configs["pte_contract_abi"];
    const contract = new web3.eth.Contract(abi, contractAddress);

    try {
        let gasEstimate;
        switch (action) {
            case "rewardTokens":
                gasEstimate = await contract.methods.rewardTokens().estimateGas({
                    from: configs["wallet_address"]
                });
                break;
            case "cleanupRewardAddresses":
                gasEstimate = await contract.methods.cleanupRewardAddresses().estimateGas({
                    from: configs["wallet_address"]
                });
                break;
            case "burnCoin":
                gasEstimate = await contract.methods.burnCoin(parameters[0]).estimateGas({
                    from: configs["wallet_address"]
                });
                break;
            case "transfer":
                gasEstimate = await contract.methods.transfer(parameters[0], parameters[1]).estimateGas({
                    from: configs["wallet_address"]
                });
                break;
            default: return -1;
        }

        return gasEstimate;
    } catch (error) {
        console.error("[PTE GAS] ERROR: Cannot receive gas estimation");
        console.error(error);
        return -1
    }
}