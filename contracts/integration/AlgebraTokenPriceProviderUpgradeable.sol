// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {IAlgebraPool} from "@cryptoalgebra/integral-core/contracts/interfaces/IAlgebraPool.sol";
import {IPriceProvider} from "./interfaces/IPriceProvider.sol";
import {OracleLibrary} from "@cryptoalgebra/integral-plugin/contracts/libraries/integration/OracleLibrary.sol";
import {ModeSfsSetup} from "./ModeSfsSetup.sol";

/**
 * @title AlgebraTokenPriceProviderUpgradeable-UNSAFE
 * @notice This contract provides the price of the Token in USD by querying an Algebra-based pool.
 *
 * It is marked as UNSAFE because it allows price manipulation through the referenced pool. Users should
 * be aware that the price returned by `getUsdToTokenPrice` can be influenced by actions within the Algebra pool,
 * potentially leading to inaccurate or manipulated price data.
 *
 * IMPORTANT: The contract is intended for use in places where manipulating the price in the pool is more expensive
 * than the profit generated. And also where price manipulation is not profitable.
 *
 * @dev Provides price data for the Token in USD, utilizing an Algebra-based pool for price calculation.
 * Inherits from `ModeSfsSetup` for integration with Mode. Designed to be upgradeable using OpenZeppelin's upgradeable contracts framework.
 */
contract AlgebraTokenPriceProviderUpgradeable is IPriceProvider, Initializable, ModeSfsSetup {
    // errors
    error PoolIsLocked();
    error UnsafeCast();

    /**
     * @dev Return the value of one USD in the smallest unit based on the USD token's decimals.
     */
    uint256 public ONE_USD;

    /**
     * @dev Return address of the Token.
     */
    address public TOKEN;

    /**
     * @dev Return address of the USD token
     */
    address public USD;

    /**
     * @dev Return address of the Algebra pool used for price calculation.
     */
    address public pool;

    /**
     * @dev Initializes the contract by disabling the initializer of the inherited upgradeable contract.
     */
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initializes the price provider with the addresses of the Mode SFS, Algebra pool, Token, and USD token.
     * @dev Stores the necessary addresses for later use and sets ONE_USD based on the USD token's decimals.
     * @param modeSfs_ Address of the Mode SFS contract.
     * @param sfsAssignTokenId_ The token ID for SFS assignment.
     * @param pool_ Address of the Algebra pool used for price calculations.
     * @param TOKEN_ Address of the Token.
     * @param USD_ Address of the USD token.
     */
    function initialize(address modeSfs_, uint256 sfsAssignTokenId_, address pool_, address TOKEN_, address USD_) external initializer {
        __ModeSfsSetup__init(modeSfs_, sfsAssignTokenId_);

        _checkAddressZero(pool_);
        _checkAddressZero(TOKEN_);
        _checkAddressZero(USD_);

        pool = pool_;
        TOKEN = TOKEN_;
        USD = USD_;

        ONE_USD = 10 ** IERC20Metadata(USD_).decimals();
    }

    /**
     * @notice Retrieves the current price of 1 USD in Token tokens, according to the specified Algebra pool.
     * @dev Queries the current tick from the Algebra pool to calculate the price. The price can be manipulated through actions within the pool, so it should be used with caution.
     * @return Price of 1 USD in Token tokens.
     */
    function getUsdToTokenPrice() external view override returns (uint256) {
        return OracleLibrary.getQuoteAtTick(currentTick(), _toUint128(ONE_USD), USD, TOKEN);
    }

    /**
     * @dev Retrieves the current tick from the Algebra pool.
     * @return The current tick of the pool.
     */
    function currentTick() public view returns (int24) {
        (, int24 tick, , , , bool unlocked) = IAlgebraPool(pool).globalState();
        if (unlocked) {
            return tick;
        }
        revert PoolIsLocked();
    }

    /**
     * @dev Converts a uint256 to a uint128, ensuring there is no overflow.
     * @param y The uint256 to convert.
     * @return z The converted uint128.
     */
    function _toUint128(uint256 y) internal pure returns (uint128 z) {
        z = uint128(y);
        if (z != y) {
            revert UnsafeCast();
        }
    }

    /**
     * @dev Checked provided address on zero value, throw AddressZero error in case when addr_ is zero
     *
     * @param addr_ The address which will checked on zero
     */
    function _checkAddressZero(address addr_) internal pure {
        if (addr_ == address(0)) {
            revert AddressZero();
        }
    }

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[50] private __gap;
}
