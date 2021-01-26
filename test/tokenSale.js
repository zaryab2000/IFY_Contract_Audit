const TokenContract = artifacts.require("Token");
const StakeContract = artifacts.require("IFY_Stake");

var BN = require("bignumber.js");

const { time } = require("@openzeppelin/test-helpers");

contract("TokenSale Contract", accounts => {
  let tokenInstance = null;
  let stakeInstance = null;

  before(async () => {
    tokenInstance = await TokenContract.deployed();
    stakeInstance = await StakeContract.deployed();
  });

  //Testing the SWAN Token Contract
  it("Owner and Staking Address is Correct", async () => {
    const owner = await tokenInstance.owner();
    const stakingAddress = await tokenInstance.STAKING_ADDRESS();
    assert.equal(stakingAddress,stakeInstance.address,"Stake Address is incorrect")
    assert.equal(owner, accounts[0], "Owner's address is wrongly assigned");
  });

  it("Name of the token should be Infinity Yeild", async () => {
    console.log(tokenInstance.address)
    const name = await tokenInstance.name();
    assert.equal(name, "Infinity Yeild", "Name is wrongly assigned");
  });
  /** Transfer function checkpoints:
   * Tax deduction should only be if neither sender nor recieve is Stake address.  
   * Should deduct tax = 5
   * 10% of deduction should go to owner balance - Check owner balance
   * Remaining tax amount should go to Stake address -> Check Stake contract balance
   * Remaing token balance should go to reciever
   * 
  */



  //Non staking address to Non Staking address
   it("Transfer tokens to normal user should work as expected",async()=>{
    const tokensToTransfer = new BN(50000000000000000000000)
    const tokensToRecieve = new BN(47500000000000000000000);

    const balanceBefore = await tokenInstance.balanceOf(accounts[1]);
    await tokenInstance.transfer(accounts[1],tokensToTransfer);
    const balanceAfter = await tokenInstance.balanceOf(accounts[1]);
    const balanceOfOwner = await tokenInstance.balanceOf(accounts[0]);
    const balanceOfStaking = await tokenInstance.balanceOf(stakeInstance.address)

    assert.equal(balanceBefore.toString(),"0","Before Balance not right");
    assert.equal(balanceAfter.toString(),"47500000000000000000000","BalanceAfter is not right");
    assert.equal(balanceOfStaking.toString(),"2250000000000000000000","Staking balance is not right")
  })
   //Owner gets 250
   //Stake gets 2250
  //Owner to Staking Address
    it("Transfer tokens to STAKING ADDRESS should work as expected",async()=>{
    const tokensToTransfer = new BN(50000000000000000000000)
    const tokensToRecieve = new BN(50000000000000000000000);

    const balanceOfOwnerBefore = await tokenInstance.balanceOf(accounts[0]);
    const balanceBefore = await tokenInstance.balanceOf(stakeInstance.address);
    await tokenInstance.transfer(stakeInstance.address,tokensToTransfer);
    const balanceAfter = await tokenInstance.balanceOf(stakeInstance.address);
    const balanceOfOwnerAfter = await tokenInstance.balanceOf(accounts[0]);

    assert.equal(balanceBefore.toString(),"2250000000000000000000","Before Balance not right");
    assert.equal(balanceAfter.toString(),"52250000000000000000000","BalanceAfter is not right");
  })


  // * Transfer function checkpoints:
  //  * Should only work with allowance conditions satisfied.
  //  * Tax deduction should only be if neither sender nor recieve is Stake address.  
  //  * Should deduct tax = 5
  //  * 10% of deduction should go to owner balance -> Check owner balance
  //  * Remaining tax amount should go to Stake address -> Check Stake contract balance
  //  * Remaing token balance should go to reciever
  //  * 
  

  // it("TransferFrom of Tokens working as expected",async ()=>{

  // })

  // it("onePercent should calculate accurately",async ()=>{

  // })
  
});
