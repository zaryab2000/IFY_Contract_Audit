const TokenContract = artifacts.require("Token");
const StakeContract = artifacts.require("IFY_Stake");

const { time } = require("@openzeppelin/test-helpers");

contract("TokenSale Contract", accounts => {
  let tokenInstance = null;
  let stakeInstance = null;

  before(async () => {
    tokenInstance = await TokenContract.deployed();
    stakeInstance = await StakeContract.deployed();
  });

  //Testing the SWAN Token Contract
  it("Owner is Correct", async () => {
    const owner = await tokenInstance.owner();
    assert.equal(owner, accounts[0], "Owner's address is wrongly assigned");
  });

  it("Name of the token should be Infinity Yeild", async () => {
    console.log(tokenInstance.address)
    const name = await tokenInstance.name();
    assert.equal(name, "Infinity Yeild", "Name is wrongly assigned");
  });
 /** Transfer function checkpoints:
   * Approves address with correct token amount
  */

  it("Transfer of Tokens working as expected",async ()=>{

  })


  /** Transfer function checkpoints:
   * Tax deduction should only be if neither sender nor recieve is Stake address.  
   * Should deduct tax = 5
   * 10% of deduction should go to owner balance - Check owner balance
   * Remaining tax amount should go to Stake address -> Check Stake contract balance
   * Remaing token balance should go to reciever
   * 
  */

  it("Transfer of Tokens working as expected",async ()=>{

  })

  /** Transfer function checkpoints:
   * Should only work with allowance conditions satisfied.
   * Tax deduction should only be if neither sender nor recieve is Stake address.  
   * Should deduct tax = 5
   * 10% of deduction should go to owner balance -> Check owner balance
   * Remaining tax amount should go to Stake address -> Check Stake contract balance
   * Remaing token balance should go to reciever
   * 
  */

  it("TransferFrom of Tokens working as expected",async ()=>{

  })

  it("onePercent should calculate accurately",async ()=>{

  })
  
});
