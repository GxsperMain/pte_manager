import EstimateGasPTENFT from "./libs/estimate-gas-ptenft.js"
import EstimateGasPTE from "./libs/estimate-gas-pte.js"
import PTE from "./libs/pte.js"
import PTENFT from "./libs/ptenft.js"
import readline from 'readline';

const helpText = `
### Estimate Commands
- estimategas ptenft mintnft: gets the gas chance to consume in the mintNFT action from PTE NFT (Administrator Only)
- estimategas pte rewardtokens: gets the gas chance to consume in the rewardTokens action from PTE Coin
- estimategas pte cleanuprewardaddresses: gets the gas chance to consume in the cleanupRewardAddresses action from PTE Coin (Administrator Only)
- estimategas pte burncoin: gets the gas chance to consume in the burnCoin action from PTE Coin

### PTE Commands
- pte rewardtokens auto: every pte_reward_per_seconds will call the reedemTokens function in the PTE Coin
- pte rewardtokens: will call the reedemTokens function in the PTE Coin

### PTENFT Commands
- ptenft mint: generates a new NFT (Administrator Only)
`;

// Interface creation
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Terminal welcome
console.log("--PTE Manager 1.0--");

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
        // PTE NFT
        case 'ptenft mint':
            PTENFT();
            break;
        // Others
        case 'help':
            console.log(helpText);
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