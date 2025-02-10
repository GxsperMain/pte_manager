import EstimateGasPTENFT from "./libs/estimate-gas-ptenft.js"
import EstimateGasPTE from "./libs/estimate-gas-pte.js"
import PTE from "./libs/pte.js"
import readline from 'readline';

// Interface creation
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Terminal welcome
console.log("--PTE Manager 0.1--");

// Command proccess
async function processInput(input) {
    const command = input.toLowerCase();

    switch (command) {
        // Estimate Gas PTE NFT
        case 'estimategas ptenft mintnft':
            console.log("Gas: " + await EstimateGasPTENFT("mintNFT"));
            break;
        // Estimate Gas PTE
        case 'estimategas pte rewardtokens':
            console.log("Gas: " + await EstimateGasPTE("rewardTokens"));
            break;
        case 'estimategas pte cleanuprewardaddresses':
            console.log("Gas: " + await EstimateGasPTE("cleanupRewardAddresses"));
            break;
        case 'estimategas pte burncoin':
            console.log("Gas: " + await EstimateGasPTE("burnCoin", [100]));
            break;
        // PTE
        case 'pte rewardtokens auto':
            PTE(true);
            break;
        case 'pte rewardtokens':
            PTE(false);
            break;
        case 'exit':
            rl.close();
            return;
        default:
            console.log(`Unkown command: ${command}, type help to view the command list`);
    }

    askForInput();
}

function askForInput() { rl.question("", processInput); }
askForInput();

rl.on("close", () => {
    console.log("Goodbye.");
    process.exit(0);
});