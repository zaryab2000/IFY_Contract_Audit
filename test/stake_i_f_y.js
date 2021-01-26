const TokenContract = artifacts.require("Token");
const StakeContract = artifacts.require("IFY_Stake")

const { time } = require("@openzeppelin/test-helpers");

contract("IFY Staking Contract Test", accounts => {
  let tokenInstance = null;
  let stakeInstance = null;

  before(async () => {
    tokenInstance = await TokenContract.deployed();
    stakeInstance = await PreSaleContract.deployed();
  });


  //Testing the PreSale Contract
  it("Owner is Correct", async () => {
    const owner = await stakeInstance.owner();
    assert.equal(owner, accounts[0], "Owner's address is wrongly assigned");
  });

  /** Invest function checkpoints:
   * Should only work once between StartSale and EndSale
   * Investor's balance should be added to the mapping
   * Purchase Tokens should be incremented
   * ETH is transferred to the Owner.

   ** check getTokenAmount() functionality
  */
  it("Invest function should work as expected", async () => {
    
  });


});
