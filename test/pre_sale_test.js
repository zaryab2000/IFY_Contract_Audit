const TokenContract = artifacts.require("Token");
const PreSaleContract = artifacts.require("PreSale")

const { time } = require("@openzeppelin/test-helpers");

contract("PreSale Contract", accounts => {
  let tokenInstance = null;
  let preSaleInstance = null;

  before(async () => {
    tokenInstance = await TokenContract.deployed();
    preSaleInstance = await PreSaleContract.deployed();
  });


  //Testing the PreSale Contract
  it("Owner is Correct", async () => {
    const owner = await preSaleInstance.owner();
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

 /** ClaimTokens function checkpoints:
   * Should only work after ClaimDate is over
   * Should Not  work if Investor has invested 0 amount
   * Function should transfer right amount of tokens to the Investor
   * Investor mapping balance should be updated
  */
  it("ClaimTokens function should work as expected", async () => {
    
  });

/** getUnSoldTokens function checkpoints:
   * Should only work after endSale is over
   * Should only be called by the Owner
   * Right amount of tokens should be transferred
  */
  it("getUnSoldTokens function should work as expected", async () => {
    
  });

});
