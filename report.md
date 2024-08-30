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


- **Ineffective slippage protection allows sandwich attacks in `buybackTokenByV2()` function**

  The `buybackTokenByV2()` function in the `SingelTokenBuybackUpgradeable` contract is meant to facilitate token buybacks using a DEX router. It calculates the expected output based on current market conditions and a user-defined slippage tolerance. However, the current implementation of slippage protection is flawed and leaves users exposed to sandwich attacks. The function computes the minimum output amount (`amountOutQuote`) within the same transaction as the swap execution. An attacker can manipulate the liquidity pool state right before the transaction, influencing the calculation. As a result, users could receive significantly fewer tokens than expected because the slippage is based on a potentially manipulated quote rather than an absolute minimum output amount.

For example, if Alice initiates a buyback with 1% slippage and expects 1000 tokens, an attacker can front-run her transaction, alter the price, and reduce the expected outcome to 800 tokens. The contract then applies the slippage to this new quote, leading Alice to receive fewer tokens than anticipated.

To mitigate this, users should specify a minimum output amount directly rather than a percentage-based slippage. Additionally, an off-chain quoting mechanism could be implemented so users can determine an appropriate minimum output based on current market conditions. These steps would help protect users from sandwich attacks and unexpected slippage.

The discussion around the robustness of the price calculation mechanism generated differing opinions. Some argue that since the quoted price is historically averaged, manipulating it is costly and impractical, thereby making the described attack unlikely. Others believe that even with historical averaging, certain attacks remain feasible, emphasizing the need for off-chain slippage calculations to ensure user protection.


  **Link**: [Issue #17](https://github.com/hats-finance/Fenix--0x9d7765a7ebd5b6322a30797a44a5428531970d3d/issues/17)

## Medium severity issues


- **Issue with VoterUpgradeableV1_2.sol Allowing Users to Retain Balances in Both Bribes**

  When `setInternalBribeFor` or `setExternalBribeFor` functions in `VoterUpgradeableV1_2.sol` are called, users who have previously voted will retain their balances in the old briber and have them added to the new briber as well. This occurs due to the implementation of `BribeUpgradeable::withdraw`, which doesn't properly handle the balance transfer when the bribe contract is reset. As a result, if an administrator changes a pool's briber, users can recast their votes, leading to them holding balances in both the old and new bribe contracts. This can be mitigated by ensuring that user votes are reallocated to the new bribe contract when changes are made. The issue is acknowledged as valid and significant.


  **Link**: [Issue #4](https://github.com/hats-finance/Fenix--0x9d7765a7ebd5b6322a30797a44a5428531970d3d/issues/4)


- **Users May Lose Rewards Voting for Deactivated Gauges Without Revert Notification**

  The problem lies in the governance voting mechanism where `VOTE_DELAY` can be set to its maximum limit. Users may unknowingly vote for gauges that have been killed by governance, and the current checks within the `vote` function fail to revert these votes. As a result, users believe their transactions are successful, but they end up losing rewards for the current epoch due to the vote delay check consistently failing. This oversight allows transactions to proceed without reverting, setting `lastVoted` to the current epoch’s timestamp, which can cause users to miss out on rewards if they vote for deactivated gauges. The attack scenario outlines steps where a user votes, gauges are killed, and subsequent votes don't yield rewards due to the delay.


  **Link**: [Issue #62](https://github.com/hats-finance/Fenix--0x9d7765a7ebd5b6322a30797a44a5428531970d3d/issues/62)

## Low severity issues


- **Double Increase in `permanentTotalSupply` when `_deposit_for` is Called**

  When functions like `_deposit_for`, `lockPermanent`, `unlockPermanent`, `onAttachToManagedNFT`, and `onDettachFromManagedNFT` are called, the variable `permanentTotalSupply` is updated. If the deposit is boosted, `permanentTotalSupply` could be mistakenly increased twice. Removing the second check of `old_locked.isPermanentLocked` can fix this.


  **Link**: [Issue #1](https://github.com/hats-finance/Fenix--0x9d7765a7ebd5b6322a30797a44a5428531970d3d/issues/1)


- **Event Emission Issue When Using Indexed Keyword for String Variables**

  When using the `indexed` keyword for reference type variables like strings in the `BaseManagedNFTStrategyUpgradeable` contract, the event returns a hash rather than the actual string. This can cause issues for front-end applications and backend listeners as they will receive an obscure 32-byte hash instead of the expected string value. It is proposed to modify the event definition to exclude the `indexed` keyword for the string variable.


  **Link**: [Issue #15](https://github.com/hats-finance/Fenix--0x9d7765a7ebd5b6322a30797a44a5428531970d3d/issues/15)


- **Contract Fails to Emit Events for Team Role Setter Functions**

  When changing the `team` address and functions callable by the `team` role, the contract does not emit events. Emitting events is crucial for transparency and allows off-chain tools to register changes, ensuring users can evaluate the impact on the protocol's trustworthiness and profitability. Recommend emitting events in the specified functions.


  **Link**: [Issue #24](https://github.com/hats-finance/Fenix--0x9d7765a7ebd5b6322a30797a44a5428531970d3d/issues/24)


- **Missing Check in Reset Function May Permit Voting Manipulation During Last Hour**

  The reset function, meant for abstaining from votes, lacks a crucial check present in the general vote() function. This omission could lead to manipulation in the voting process, especially with tokens holding significant voting power. Although low, the potential for exploitation exists as it may skew voting results significantly.


  **Link**: [Issue #27](https://github.com/hats-finance/Fenix--0x9d7765a7ebd5b6322a30797a44a5428531970d3d/issues/27)


- **Use SafeERC20Upgradeable and IERC20Upgradeable for upgrade safety in contract**

  The implementation of `CompoundVeFNXManagedNFTStrategyUpgradeable.sol` uses non-upgradeable OpenZeppelin contracts `SafeERC20` and `IERC20`, which can cause issues during contract upgrades due to delegatecall dependencies. It's recommended to switch to `SafeERC20Upgradeable` and `IERC20Upgradeable` from the @openzeppelin/contracts-upgradeable repository to ensure upgrade safety.


  **Link**: [Issue #31](https://github.com/hats-finance/Fenix--0x9d7765a7ebd5b6322a30797a44a5428531970d3d/issues/31)


- **Incorrect Event Emission in `_setExternalBribes` Function Misleads Observers on Blockchain**

  The `_setExternalBribes` function incorrectly logs events, using `internal_bribes[_gauge]` instead of `external_bribes[_gauge]`. This misconfiguration can mislead observers about external bribe addresses, affecting blockchain transparency and trust. The issue can be resolved by changing the event emission to correctly use `external_bribes[_gauge]`.


  **Link**: [Issue #40](https://github.com/hats-finance/Fenix--0x9d7765a7ebd5b6322a30797a44a5428531970d3d/issues/40)


- **Dust Rewards Accumulation Issue Due to Rounding in Rewards Calculation Per Epoch**

  Rewards are calculated based on a token's proportion of total supply, leading to small remainders left in the contract each epoch, often referred to as "dust." Over time, this unclaimed reward can accumulate, especially as the total supply increases. A suggested change involves reallocating these remainders to subsequent epochs to ensure fair distribution.


  **Link**: [Issue #46](https://github.com/hats-finance/Fenix--0x9d7765a7ebd5b6322a30797a44a5428531970d3d/issues/46)


- **Precision Loss in Reward Calculations in SingleTokenVirtualRewarderUpgradeable.sol Affecting Small Balances**

  The reward calculation for users in the `SingleTokenVirtualRewarderUpgradeable.sol` contract suffers from precision loss due to integer division. This can result in zero rewards for users with smaller balances relative to the total supply, especially as the number of participating users increases. Introducing a scaling factor can maintain precision and ensure fair reward distribution.


  **Link**: [Issue #58](https://github.com/hats-finance/Fenix--0x9d7765a7ebd5b6322a30797a44a5428531970d3d/issues/58)



## Conclusion

The Hats Audit Competition for Fenix on Hats.finance demonstrates a decentralized, results-driven approach to securing web3 projects through collective expertise. Over 12 days, 64 submissions were evaluated, culminating in a $17,000 payout among 12 participants. The audit scope included various smart contracts within Fenix's ecosystem. Key findings reveal significant vulnerabilities, such as a flawed slippage protection in the `buybackTokenByV2()` function, exposing users to sandwich attacks. Medium-severity issues include improper balance transfers in `VoterUpgradeableV1_2.sol`, potentially causing users to lose rewards or retain balances in old bribe contracts. Low-severity issues range from improper event emissions and double incrementing `permanentTotalSupply` to precision loss in reward calculations. The competition effectively identified and recommended fixes for these issues, reinforcing Hats Finance’s commitment to enhancing decentralized security in the web3 space.

## Disclaimer


This report does not assert that the audited contracts are completely secure. Continuous review and comprehensive testing are advised before deploying critical smart contracts.


The Fenix  audit competition illustrates the collaborative effort in identifying and rectifying potential vulnerabilities, enhancing the overall security and functionality of the platform.


Hats.finance does not provide any guarantee or warranty regarding the security of this project. Smart contract software should be used at the sole risk and responsibility of users.

