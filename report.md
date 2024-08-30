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


- **Slippage Mechanism in buybackTokenByV2() Vulnerable to Sandwich Attacks**

  The function `buybackTokenByV2()` in the `SingelTokenBuybackUpgradeable` contract is designed to perform token buybacks using a DEX router and calculates the expected output amount based on current market conditions with user-specified slippage tolerance. However, the current implementation of slippage protection is flawed, making it vulnerable to sandwich attacks. The function calculates the minimum output amount (`amountOutQuote`) during the same transaction as the swap execution, which allows two major flaws: 

1. The calculation is based on the current state of the liquidity pool, which can be manipulated by an attacker just before the transaction is executed.
2. Slippage is applied as a percentage of this potentially manipulated quote rather than an absolute minimum output amount provided by the user.

An example attack scenario involves an attacker front-running a buyback transaction, impacting the price, and causing the user to receive far fewer tokens than expected even with applied slippage protection. The user expects 1000 tokens but ends up with only 800 due to manipulation. 

To mitigate this issue, it is recommended to require users to provide a minimum output amount instead of a percentage-based slippage, update the interface and any calling contracts accordingly, and consider implementing a separate off-chain quoting mechanism. These changes ensure users have full control over acceptable slippage and protection from sandwich attacks and unexpected price movements.

Further discussion revealed that the measures taken to prevent this attack might be adequate as the price fetching mechanism relies on average price rather than spot price, making manipulation difficult and costly. However, another perspective suggests the implementation is still vulnerable to a form of sandwich attack by exploiting the historical average price mechanism, underscoring the need for robust slippage calculation methods.


  **Link**: [Issue #17](https://github.com/hats-finance/Fenix--0x9d7765a7ebd5b6322a30797a44a5428531970d3d/issues/17)

## Medium severity issues


- **Issue with Users Retaining Balances from Old and New Bribe Contracts in Voting System**

  When `setInternalBribeFor` or `setExternalBribeFor` in `VoterUpgradeableV1_2.sol` are called, users who have previously voted will retain their balances in the old briber while also adding them to the new briber. This flaw arises from the implementation of the `BribeUpgradeable::withdraw` function, which does not account for balances in old bribe contracts upon resetting. 

In an attack scenario, when an admin changes a pool’s briber, users can recast their votes with `VoterUpgradeableV1_2::vote`, triggering `VoterUpgradeableV1_2::reset`, which withdraws from the new briber contract. However, since the new bribe has zero balances, old balances remain unaffected, leading to double-counting. 

To address this, transitions should ensure user votes are reallocated to the new bribe contract. Mitigation involves updating bribes correctly within specific windows when no active user votes exist.


  **Link**: [Issue #4](https://github.com/hats-finance/Fenix--0x9d7765a7ebd5b6322a30797a44a5428531970d3d/issues/4)


- **Voting for Killed Gauges Results in Loss of Rewards Due to Vote Delay**

  The current voting system has a vulnerability where users might unintentionally vote for deactivated or "killed" Gauges. This issue arises because there is no check within the `_vote` function to prevent votes on inactive Gauges, allowing the transaction to proceed without any errors. As a result, the system records the user's vote and sets the `lastVoted` timestamp. During the following `_voteDelay` check, however, the transaction will inevitably revert, causing users to miss out on rewards for the current epoch. The scenario described includes a user voting for promising Gauges, only to have their votes rendered ineffective after the Gauges are killed by Governance, leading to a loss of potential rewards.


  **Link**: [Issue #62](https://github.com/hats-finance/Fenix--0x9d7765a7ebd5b6322a30797a44a5428531970d3d/issues/62)

## Low severity issues


- **Issue with `permanentTotalSupply` Being Incremented Twice in `_deposit_for` Function**

  The variable `permanentTotalSupply` may be inadvertently increased twice in the `_deposit_for` function if the deposit is boosted, due to a repeated condition check on `old_locked.isPermanentLocked`. This requires removing the second check to prevent the issue.


  **Link**: [Issue #1](https://github.com/hats-finance/Fenix--0x9d7765a7ebd5b6322a30797a44a5428531970d3d/issues/1)


- **Indexed Event Emits Hash Instead of String in BaseManagedNFTStrategyUpgradeable Contract**

  When using the `indexed` keyword for reference type variables like dynamic arrays or strings, the emitted event returns a meaningless 32-byte hash instead of the actual data. This affects the `SetName` event in the `BaseManagedNFTStrategyUpgradeable` contract, hindering proper notifications and potentially causing data loss in the DApp. Modifying the event definition to remove `indexed` is suggested.


  **Link**: [Issue #15](https://github.com/hats-finance/Fenix--0x9d7765a7ebd5b6322a30797a44a5428531970d3d/issues/15)


- **Contract Setter Functions Lack Event Emission Affecting Transparency and User Trust**

  When changing the `team` address and other setter functions callable by the `team` role, the contract doesn't emit events. This lack of events can undermine transparency, affect user trust, and negatively impact protocol liquidity and reputation. It is recommended to emit events in the mentioned functions to enhance trust and track changes.


  **Link**: [Issue #24](https://github.com/hats-finance/Fenix--0x9d7765a7ebd5b6322a30797a44a5428531970d3d/issues/24)


- **Reset function missing end-of-voting window check may impact vote tallying accuracy**

  An hour before the end of a voting period, users are prevented from voting to ensure accurate vote tallying. The `vote()` function enforces this rule, but the `reset()` function does not, potentially skewing results for high-weight tokens. An amendment is suggested to include this check in the `reset()` function.


  **Link**: [Issue #27](https://github.com/hats-finance/Fenix--0x9d7765a7ebd5b6322a30797a44a5428531970d3d/issues/27)


- **Use Upgradeable Versions of SafeERC20 and IERC20 for Contract Safety**

  The implementation of `CompoundVeFNXManagedNFTStrategyUpgradeable.sol` currently uses non-upgradeable OpenZeppelin contracts `SafeERC20` and `IERC20`, posing potential issues during upgrades. To ensure safer upgrades, it is recommended to replace these with `SafeERC20Upgradeable` and `IERC20Upgradeable` from the @openzeppelin/contracts-upgradeable repository.


  **Link**: [Issue #31](https://github.com/hats-finance/Fenix--0x9d7765a7ebd5b6322a30797a44a5428531970d3d/issues/31)


- **Incorrect Event Emission in `_setExternalBribes` May Mislead Blockchain Observers**

  A logging issue in the `_setExternalBribes` function results in the `SetBribeFor` event emitting incorrect data. This can mislead blockchain observers about external bribes, affecting trust and transparency. Correcting the event emission to use `external_bribes[_gauge]` instead of `internal_bribes[_gauge]` resolves this issue.


  **Link**: [Issue #40](https://github.com/hats-finance/Fenix--0x9d7765a7ebd5b6322a30797a44a5428531970d3d/issues/40)


- **Dust Rewards Lost in Epoch Calculation Due to Remainder Handling**

  Reward calculations result in leftover amounts less than the supply, which remain in the contract and are not distributed. While the precise loss per epoch may be small, these amounts accumulate, leading to significant losses over time. A proposed solution involves adding the leftover rewards to subsequent epochs to ensure proper distribution among stakers.


  **Link**: [Issue #46](https://github.com/hats-finance/Fenix--0x9d7765a7ebd5b6322a30797a44a5428531970d3d/issues/46)


- **Reward Calculation Precision Loss in SingleTokenVirtualRewarderUpgradeable.sol Due to Integer Division**

  A rounding error occurs during reward calculations when the total supply greatly exceeds individual balances, leading to zero rewards for some users. This issue, exacerbated by integer division, results in smaller stakes receiving no rewards. Introducing a scaling factor (e.g., 1e18) for precision could mitigate this.


  **Link**: [Issue #58](https://github.com/hats-finance/Fenix--0x9d7765a7ebd5b6322a30797a44a5428531970d3d/issues/58)



## Conclusion

**Conclusion**

The audit report for the Fenix Audit Competition on Hats.finance reveals critical insights into the security mechanisms of the involved smart contracts. Hats.finance, known for its decentralized security infrastructure, leverages audit competitions to enhance Web3 security efficiently and effectively. In the competition hosted by Fenix, which lasted 12 days and offered a maximum reward of $17,000, 64 submissions were made, with payouts distributed among 12 participants.

A high-severity issue was identified in the `SingelTokenBuybackUpgradeable` contract's `buybackTokenByV2()` function, which is vulnerable to sandwich attacks due to flawed slippage mechanisms. Recommendations were made to mitigate this by requiring a minimum output amount specified by users.

Medium-severity issues included flaws in the voting system and bribe contract transitions, with suggestions for enhancing functionality and security. Low-severity issues addressed multiple concerns such as event emissions, transparency, contract safety during upgrades, and rounding errors in reward calculations. Overall, while the audit identified areas needing improvement, the decentralized audit approach by Hats.finance showcases a robust method to secure Web3 protocols effectively.

## Disclaimer


This report does not assert that the audited contracts are completely secure. Continuous review and comprehensive testing are advised before deploying critical smart contracts.


The Fenix  audit competition illustrates the collaborative effort in identifying and rectifying potential vulnerabilities, enhancing the overall security and functionality of the platform.


Hats.finance does not provide any guarantee or warranty regarding the security of this project. Smart contract software should be used at the sole risk and responsibility of users.

