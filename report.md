# **Fenix  Audit Competition on Hats.finance** 


## Introduction to Hats.finance


Hats.finance builds autonomous security infrastructure for integration with major DeFi protocols to secure users' assets. 
It aims to be the decentralized choice for Web3 security, offering proactive security mechanisms like decentralized audit competitions and bug bounties. 
The protocol facilitates audit competitions to quickly secure smart contracts by having auditors compete, thereby reducing auditing costs and accelerating submissions. 
This aligns with their mission of fostering a robust, secure, and scalable Web3 ecosystem through decentralized security solutions​.

## About Hats Audit Competition


Hats Audit Competitions offer a unique and decentralized approach to enhancing the security of web3 projects. Leveraging the large collective expertise of hundreds of skilled auditors, these competitions foster a proactive bug hunting environment to fortify projects before their launch. Unlike traditional security assessments, Hats Audit Competitions operate on a time-based and results-driven model, ensuring that only successful auditors are rewarded for their contributions. This pay-for-results ethos not only allocates budgets more efficiently by paying exclusively for identified vulnerabilities but also retains funds if no issues are discovered. With a streamlined evaluation process, Hats prioritizes quality over quantity by rewarding the first submitter of a vulnerability, thus eliminating duplicate efforts and attracting top talent in web3 auditing. The process embodies Hats Finance's commitment to reducing fees, maintaining project control, and promoting high-quality security assessments, setting a new standard for decentralized security in the web3 space​​.

## Fenix  Overview

Unified Trading and Liquidity Marketplace on Blast. Algebra CLAMM trading engine with ve3 tokenomics.

## Competition Details


- Type: A public audit competition hosted by Fenix 
- Duration: 12 days
- Maximum Reward: $17,000
- Submissions: 64
- Total Payout: $17,000 distributed among 12 participants.

## Scope of Audit

contracts/nest/libraries/VirtualRewarderCheckpoints.sol
contracts/nest/BaseManagedNFTStrategyUpgradeable.sol
contracts/nest/CompoundVeFNXManagedNFTStrategyFactoryUpgradeable.sol
contracts/nest/CompoundVeFNXManagedNFTStrategyUpgradeable.sol
contracts/nest/ManagedNFTManagerUpgradeable.sol
contracts/nest/RouterV2PathProviderUpgradeable.sol
contracts/nest/SingelTokenBuybackUpgradeable.sol
contracts/nest/SingelTokenVirtualRewarderUpgradeable.sol


## High severity issues


- **Buyback function vulnerability in SingelTokenBuybackUpgradeable contract exposes users to sandwich attacks**

  The `buybackTokenByV2()` function within the `SingelTokenBuybackUpgradeable` contract, which facilitates token buybacks using a DEX router, is compromised in its current form. The function calculates the minimum expected output (`amountOutQuote`) and applies slippage tolerance based on the market conditions at the time of the transaction. However, this method fails to protect users from sandwich attacks due to two key vulnerabilities.

Firstly, the calculation of `amountOutQuote` is based on the present state of the liquidity pool, which can be easily manipulated by attackers just before the transaction is executed. This allows attackers to manipulate prices by initiating front-running attacks. Secondly, the slippage is applied as a percentage of the dynamically calculated `amountOutQuote`, rather than an absolute minimum output amount that the user provides.

In practice, this means an attacker can front-run and back-run a transaction, manipulating prices such that the user's transaction ends up being far less favorable than anticipated. The example given describes how an attacker can profit by degrading the expected output for users, like Alice, through strategically timed large swaps.

The suggested solution to mitigate this risk involves requiring the users to specify a minimum output amount directly, as opposed to relying on a percentage-based slippage. Furthermore, implementing an off-chain quoting mechanism would allow users to ascertain the minimum acceptable output before executing the transaction, thus offering better protection against sandwich attacks and unexpected slippage. 

Contrary views suggest the slippage mechanism relies on historical price rather than current pool state, thus making immediate manipulation costly and less feasible. However, it’s pointed out that such measures are inadequate since sophisticated manipulation strategies and timing can still allow exploits. Ultimately, ensuring slippage calculations off-chain is recommended to provide robust safeguards for users.


  **Link**: [Issue #17](https://github.com/hats-finance/Fenix--0x9d7765a7ebd5b6322a30797a44a5428531970d3d/issues/17)

## Medium severity issues


- **Issue with User Balances Retained in Old and New Bribe Contracts**

  When `setInternalBribeFor` or `setExternalBribeFor` in `VoterUpgradeableV1_2.sol` are called, users who have previously voted retain their balances in the old bribe contract while also adding them to the new bribe contract. This occurs because the `BribeUpgradeable::withdraw` implementation does not reset the balances correctly when new bribe contracts are set. In an attack scenario, users can vote again after an admin changes the pool's briber, allowing them to keep their balance in the old briber and add it to the new one. This issue can be mitigated by reallocating user votes to the new bribe contract during the setup of new internal or external bribes, though there is still a potential for error if updates occur in the middle of an epoch.


  **Link**: [Issue #4](https://github.com/hats-finance/Fenix--0x9d7765a7ebd5b6322a30797a44a5428531970d3d/issues/4)


- **Users Lose Rewards Due to Voting for Deactivated Gauges Without Reverts**

  When setting the `VOTE_DELAY` in a voting contract, there's a check to ensure the delay is within the allowed maximum. The `VOTE_DELAY` can be up to one week. During the voting process, if users vote for gauges that have been deactivated by governance, there's no immediate error or revert, setting `lastVoted` to the current epoch start. Subsequent `_voteDelay` checks will then fail, causing users to lose rewards for the current epoch. This issue arises because the contract does not revert transactions when voting for deactivated gauges. In the described attack scenario, users unknowingly vote for killed gauges and fail `_voteDelay` checks, missing out on rewards.


  **Link**: [Issue #62](https://github.com/hats-finance/Fenix--0x9d7765a7ebd5b6322a30797a44a5428531970d3d/issues/62)

## Low severity issues


- **Duplicate Update of `permanentTotalSupply` in `_deposit_for` Boost Condition**

  When `_deposit_for`, `lockPermanent`, `unlockPermanent`, `onAttachToManagedNFT`, and `onDettachFromManagedNFT` are called, `permanentTotalSupply` is updated. In `_deposit_for`, if `old_locked.isPermanentLocked` is true, it’s checked twice, potentially doubling `permanentTotalSupply`. Removing the second check resolves this issue.


  **Link**: [Issue #1](https://github.com/hats-finance/Fenix--0x9d7765a7ebd5b6322a30797a44a5428531970d3d/issues/1)


- **Using `indexed` Keyword for Strings in Solidity Emits Only Hashes, Not Values**

  Using the `indexed` keyword for reference type variables like dynamic arrays or strings returns their hash, not the actual value. In the `BaseManagedNFTStrategyUpgradeable` contract, this causes the `SetName` event to emit a meaningless 32-byte hash instead of the intended string, potentially causing data loss in DApps.


  **Link**: [Issue #15](https://github.com/hats-finance/Fenix--0x9d7765a7ebd5b6322a30797a44a5428531970d3d/issues/15)


- **Missing Event Emissions in Setter Functions for Team Role in Contract**

  The contract fails to emit events when changing the `team` address and other related functions. This lack of events prevents off-chain tools from capturing changes, affecting user trust and transparency. Users might exit the protocol, reducing liquidity and harming the protocol's reputation. Emitting events is recommended for transparency.


  **Link**: [Issue #24](https://github.com/hats-finance/Fenix--0x9d7765a7ebd5b6322a30797a44a5428531970d3d/issues/24)


- **Missing Vote Window Check in Reset Function Could Allow Vote Manipulation**

  One hour before the end of a voting period, general users are blocked from voting to ensure consistent tallying. However, this restriction is missing for the `reset()` function, potentially allowing manipulation with large-weight tokens. This oversight could impact voting results, though the risk is deemed low.


  **Link**: [Issue #27](https://github.com/hats-finance/Fenix--0x9d7765a7ebd5b6322a30797a44a5428531970d3d/issues/27)


- **Current implementation risks when upgrading due to non-upgradeable OpenZeppelin contracts**

  The current `CompoundVeFNXManagedNFTStrategyUpgradeable.sol` contract uses non-upgradeable OpenZeppelin `SafeERC20` and `IERC20` libraries, creating potential issues during upgrades due to `delegatecall` dependencies in Address.sol. Switching to `SafeERC20Upgradeable` and `IERC20Upgradeable` from the OpenZeppelin upgradeable repository is recommended for upgrade safety.


  **Link**: [Issue #31](https://github.com/hats-finance/Fenix--0x9d7765a7ebd5b6322a30797a44a5428531970d3d/issues/31)


- **Incorrect Event Logging in `_setExternalBribes` Function Can Mislead Observers**

  The `_setExternalBribes` function incorrectly emits the `SetBribeFor` event, using `internal_bribes[_gauge]` instead of `external_bribes[_gauge]`, potentially misleading blockchain observers about external bribe addresses. Correcting this requires changing the event emission to use `external_bribes[_gauge]`. This change ensures accurate logging and maintains trust and transparency in blockchain operations.


  **Link**: [Issue #40](https://github.com/hats-finance/Fenix--0x9d7765a7ebd5b6322a30797a44a5428531970d3d/issues/40)


- **Lost Dust Rewards Each Epoch in Rewards Calculation Logic**

  The rewards calculation mechanism results in small leftover amounts ("dust rewards") being left in the contract after each epoch because rewards are determined based on the proportion of a token's supply. These remainder amounts should either be added to the next epoch or distributed evenly to prevent losses. The smaller the user’s balance and rewards, the higher the chance of these dust rewards being lost. This issue does not lead to significant loss in practice but accumulates over time.


  **Link**: [Issue #46](https://github.com/hats-finance/Fenix--0x9d7765a7ebd5b6322a30797a44a5428531970d3d/issues/46)


- **Reward Calculation Function Suffers from Precision Loss Due to Integer Division**

  Rounding errors in reward calculations occur when the denominator exceeds the numerator, leading to zero rewards for some users in an epoch. This impacts users with smaller balances, resulting in no fractional rewards. Introducing a scaling factor for calculations can mitigate this by maintaining precision and ensuring fair reward distribution.


  **Link**: [Issue #58](https://github.com/hats-finance/Fenix--0x9d7765a7ebd5b6322a30797a44a5428531970d3d/issues/58)



## Conclusion

The Fenix audit competition on Hats.finance successfully demonstrated the platform's ability to leverage decentralized, competitive auditing to enhance the security of Web3 projects. By utilizing a decentralized model, Hats.finance attracted numerous skilled auditors who identified critical vulnerabilities within Fenix's smart contracts, distributing a total reward of $17,000 among 12 participants for their findings. The primary high-severity issue focused on a vulnerability in the `buybackTokenByV2()` function of the `SingelTokenBuybackUpgradeable` contract, which exposed users to sandwich attacks. Medium severity issues included retaining user balances in old and new bribe contracts and the loss of rewards caused by voting for deactivated gauges without immediate reverts. Several low-severity issues were addressed as well, ranging from redundant updates and incorrect event logging to reward calculation precisions. The detailed findings highlight the efficient vulnerability identification and cost-effective nature of audit competitions, reinforcing Hats.finance’s commitment to improving decentralized security for Web3 ecosystems.

## Disclaimer


This report does not assert that the audited contracts are completely secure. Continuous review and comprehensive testing are advised before deploying critical smart contracts.


The Fenix  audit competition illustrates the collaborative effort in identifying and rectifying potential vulnerabilities, enhancing the overall security and functionality of the platform.


Hats.finance does not provide any guarantee or warranty regarding the security of this project. Smart contract software should be used at the sole risk and responsibility of users.

