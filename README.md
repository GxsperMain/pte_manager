# PTE Manager
A utility tool for managing play to earn token and nft

To use this utility you need to install nodejs in your machine, after that clone this repository and open the terminal inside the repository.
Type ``npm install`` to install the necessary dependencies, and use ``node init.js`` to start the utility, don't forget to check the ``configs.txt``

### Configurations
- pte_nft_contract_address: the address for the PTENFT contract
- pte_nft_contract_abi: you can get the abi in the PTENFT contract on polygon
- pte_contract_address: the address for the PTE contract
- pte_contract_abi: you can get the abi in the PTE contract on polygon
- pte_reward_per_seconds: how much seconds to retry the rewardTokens function when you initialize the ``pte rewardtokens auto``
- rpc_address: the rpc connection that will handle your requests to the block chain
- wallet_address: your wallet address, used for gas estimation
- wallet_private_key: your PRIVATE KEY from your wallet, used for transactions, very secret be careful and do not share
- max_gas_per_transaction: the max gas limit for transactions
- additional_fee_gas_per_transaction: additional gas per transaction for speed up the transactions

### Estimate Commands
- estimategas ptenft mintnft: gets the gas chance to consume in the mintNFT action from PTE NFT (Administrator Only)
- estimategas pte rewardtokens: gets the gas chance to consume in the rewardTokens action from PTE Coin
- estimategas pte cleanuprewardaddresses: gets the gas chance to consume in the cleanupRewardAddresses action from PTE Coin (Administrator Only)
- estimategas pte burncoin: gets the gas chance to consume in the burnCoin action from PTE Coin

### PTE Commands
- pte rewardtokens auto: every ``pte_reward_per_seconds`` will call the reedemTokens function in the PTE Coin, type again to disable, or close the application
- pte rewardtokens: will call the reedemTokens function in the PTE Coin

### PTENFT Commands
- ptenft mint: generates a new NFT (Administrator Only)