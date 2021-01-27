const TokenContract = artifacts.require("Token");
const StakeContract = artifacts.require("IFY_Stake")
const PreSaleContract = artifacts.require("PreSale")

const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
var BN = require("bignumber.js");
const { time } = require("@openzeppelin/test-helpers");
// 000000000000000000
contract("PreSale Contract", accounts => {
  let tokenInstance = null;
  let stakeInstance = null;
  let preSaleInstance = null;

  before(async () => {
    tokenInstance = await TokenContract.deployed();
    preSaleInstance = await PreSaleContract.deployed();
    stakeInstance = await StakeContract.deployed();

  });


  //Testing the PreSale Contract
  it("Owner and token address is Correct", async () => {
    const owner = await preSaleInstance.owner();
    const tokenAddress = await preSaleInstance.tokenAddress()
    const time = await preSaleInstance.getTime()
    console.log(time.toString())
    assert.equal(tokenAddress,tokenInstance.address,"Token address is not right")
    assert.equal(owner, accounts[0], "Owner's address is wrongly assigned");
  });

   it("Transferring IFY tokens to Presale Contract", async () => {
    const preSaleTokenSupply = new BN(1500000000000000000000);
    await tokenInstance.transfer(preSaleInstance.address,preSaleTokenSupply);
    const balanceOfContract = await tokenInstance.balanceOf(preSaleInstance.address);
    console.log(balanceOfContract.toString())
  });


  // });
  /** Invest function checkpoints:
   * Should only work once between StartSale and EndSale -done
   * Investor's balance should be added to the mapping -done
   * Investor should be able to invest more than once -done // NEEDS TO BE UPDATED
   * Purchase Tokens should be incremented -done
   * ETH is transferred to the Owner. -done

   ** check getTokenAmount() functionality for within 3 days -done
   ** check getTokenAmount() functionality for after 3 days -done
  */

  // Before 3rd Day of sale
  it("Time should increase to 2 days", async () => {
    await time.increase(time.duration.seconds(172800));
  });

  it("Invest function should work as expected for User 1 within 3 DAYS", async () => {
      const investAmount = new BN(5000000000000000000);
      const ownerBalanceBefore = await web3.eth.getBalance(accounts[0]);
      await preSaleInstance.Invest({from:accounts[1],value:investAmount})

      const investment = await preSaleInstance.investor(accounts[1]);
      const totalPurchase = await preSaleInstance.purchasedTokens();
      const ownerBalanceAfter = await web3.eth.getBalance(accounts[0]);

      assert.isAbove(parseInt(ownerBalanceAfter.toString()),parseInt(ownerBalanceBefore.toString()),"Owner balance didn't increase")
      assert.equal(investment.toString(),"500000000000000000000","Investor mapping didn't update")
      assert.equal(totalPurchase.toString(),"500000000000000000000","Total purchase is not correctly")
  });

  it("Invest function should work as expected for User 1 within 3 DAYS", async () => {
      const investAmount = new BN(1000000000000000000);
      const ownerBalanceBefore = await web3.eth.getBalance(accounts[0]);
      await preSaleInstance.Invest({from:accounts[1],value:investAmount})

      const investment = await preSaleInstance.investor(accounts[1]);
      const totalPurchase = await preSaleInstance.purchasedTokens();
      const ownerBalanceAfter = await web3.eth.getBalance(accounts[0]);

      assert.isAbove(parseInt(ownerBalanceAfter.toString()),parseInt(ownerBalanceBefore.toString()),"Owner balance didn't increase")
      assert.equal(investment.toString(),"600000000000000000000","Investor mapping didn't update")
      assert.equal(totalPurchase.toString(),"600000000000000000000","Total purchase is not correctly")
  });

  // After 3rd day of sale
  it("Time should increase to 4 days", async () => {
    await time.increase(time.duration.seconds(345600));
  });

  it("Invest function should work as expected for User2 after 3rd DAY", async () => {
      const investAmount = new BN(5000000000000000000);
      const ownerBalanceBefore = await web3.eth.getBalance(accounts[0]);
      await preSaleInstance.Invest({from:accounts[2],value:investAmount})

      const investment = await preSaleInstance.investor(accounts[2]);
      const totalPurchase = await preSaleInstance.purchasedTokens();
      const ownerBalanceAfter = await web3.eth.getBalance(accounts[0]);

      assert.isAbove(parseInt(ownerBalanceAfter.toString()),parseInt(ownerBalanceBefore.toString()),"Owner balance didn't increase")
      assert.equal(investment.toString(),"400000000000000000000","Investor mapping didn't update")
      assert.equal(totalPurchase.toString(),"1000000000000000000000","Total purchase is not correctly")
  });

  // Trying to Claim befrore ClaimDATE

  it("User should not be able to Claim before ClaimDate", async () => {
    try{
      await preSaleInstance.ClaimTokens({from:accounts[2]})
    } catch (error) {
      const invalidOpcode = error.message.search("revert") >= 0;
      console.log(error.message)
      assert(invalidOpcode, "Expected revert, got '" + error + "' instead");
    }
  });

  // // After endSale

  it("Time should increase to 8 days", async () => {
    await time.increase(time.duration.seconds(691200));
  });


   it("User should not be able to call Invest after endSale", async () => {
      const investAmount = new BN(5000000000000000000);

    try{
      await preSaleInstance.Invest({from:accounts[3],value:investAmount})
    } catch (error) {
      const invalidOpcode = error.message.search("revert") >= 0;
      console.log(error.message)
      assert(invalidOpcode, "Expected revert, got '" + error + "' instead");
    }
  });
 /** ClaimTokens function checkpoints:
   * Should only work after ClaimDate is over -done
   * Should Not  work if Investor has invested 0 amount -done
   * Function should transfer right amount of tokens to the Investor -done
   * Check if tax is paid to OWNER and Staking Contract. - Yes tax is applicable
   * Investor mapping balance should be updated -done
  */
  it("ClaimTokens function should work as expected for User 1", async () => {
      console.log("USER 1 Claim------------------------")
      const userBalanceBefore = await tokenInstance.balanceOf(accounts[1]);
      const stakeBalnceBefore = await tokenInstance.balanceOf(stakeInstance.address);
      const ownerBalanceBefore = await tokenInstance.balanceOf(accounts[0]);
      const preSaleBalanceBefore = await tokenInstance.balanceOf(preSaleInstance.address);

      console.log(`UserBalanceBefore-${userBalanceBefore.toString()}`)
      console.log(`OwnerBalanceBefore-${ownerBalanceBefore.toString()}`)
      console.log(`StakeBalanceBefore-${stakeBalnceBefore.toString()}`)
      console.log(`PreSaleBalanceBefore-${preSaleBalanceBefore.toString()}`)

      //Calling the ClaimTokens function
      await preSaleInstance.ClaimTokens({from:accounts[1]})
      const userRemains = await preSaleInstance.investor(accounts[1]);

      const userBalanceAfter = await tokenInstance.balanceOf(accounts[1]);
      const stakeBalanceAfter = await tokenInstance.balanceOf(stakeInstance.address);
      const ownerBalanceAfter = await tokenInstance.balanceOf(accounts[0]);
      const preSaleBalanceAfter = await tokenInstance.balanceOf(preSaleInstance.address);

      console.log(`UserBalanceAfter-${userBalanceAfter.toString()}`)
      console.log(`OwnerBalanceAfter-${ownerBalanceAfter.toString()}`)
      console.log(`StakeBalanceAfter-${stakeBalanceAfter.toString()}`)
      console.log(`PresaleAfter-${preSaleBalanceAfter.toString()}`)

      assert.isAbove(parseInt(preSaleBalanceBefore.toString()),parseInt(preSaleBalanceAfter.toString()),"Presale balance not deducted")
      assert.equal(userRemains.toString(),"0","User still has claimable tokens");
  });

  it("ClaimTokens function should work as expected for User 2", async () => {
           console.log("USER 2 Claim------------------------")

      const userBalanceBefore = await tokenInstance.balanceOf(accounts[2]);
      const stakeBalnceBefore = await tokenInstance.balanceOf(stakeInstance.address);
      const ownerBalanceBefore = await tokenInstance.balanceOf(accounts[0]);
      const preSaleBalanceBefore = await tokenInstance.balanceOf(preSaleInstance.address);

      console.log(`UserBalanceBefore-${userBalanceBefore.toString()}`)
      console.log(`OwnerBalanceBefore-${ownerBalanceBefore.toString()}`)
      console.log(`StakeBalanceBefore-${stakeBalnceBefore.toString()}`)
      console.log(`PreSaleBalanceBefore-${preSaleBalanceBefore.toString()}`)

      //Calling the ClaimTokens function
      await preSaleInstance.ClaimTokens({from:accounts[2]})
      const userRemains = await preSaleInstance.investor(accounts[2]);

      const userBalanceAfter = await tokenInstance.balanceOf(accounts[2]);
      const stakeBalanceAfter = await tokenInstance.balanceOf(stakeInstance.address);
      const ownerBalanceAfter = await tokenInstance.balanceOf(accounts[0]);
      const preSaleBalanceAfter = await tokenInstance.balanceOf(preSaleInstance.address);

      console.log(`UserBalanceAfter-${userBalanceAfter.toString()}`)
      console.log(`OwnerBalanceAfter-${ownerBalanceAfter.toString()}`)
      console.log(`StakeBalanceAfter-${stakeBalanceAfter.toString()}`)
      console.log(`PresaleAfter-${preSaleBalanceAfter.toString()}`)

      assert.isAbove(parseInt(preSaleBalanceBefore.toString()),parseInt(preSaleBalanceAfter.toString()),"Presale balance not deducted")
      assert.equal(userRemains.toString(),"0","User still has claimable tokens");
  });

  it("User should not be able to Claim TWICE", async () => {
    try{
      await preSaleInstance.ClaimTokens({from:accounts[2]})
    } catch (error) {
      const invalidOpcode = error.message.search("revert") >= 0;
      console.log(error.message)
      assert(invalidOpcode, "Expected revert, got '" + error + "' instead");
    }
  });
 /** getUnSoldTokens function checkpoints:
   * Should only work after endSale is over
   * Should only be called by the Owner
   * Right amount of tokens should be transferred
  */
  it("getUnSoldTokens function should work as expected", async () => {
      const ownerBalanceBefore = await tokenInstance.balanceOf(accounts[0]);
      const preSaleBalanceBefore = await tokenInstance.balanceOf(preSaleInstance.address);
      console.log(`ownerBalanceBefore-${ownerBalanceBefore.toString()}`)
      console.log(`PreSaleBalanceBefore-${preSaleBalanceBefore.toString()}`)


      await preSaleInstance.getUnSoldTokens()

      const preSaleBalanceAfter = await tokenInstance.balanceOf(preSaleInstance.address);
      const ownerBalanceAfter = await tokenInstance.balanceOf(accounts[0]);

      console.log(`OwnerBalanceAfter-${ownerBalanceAfter.toString()}`)
      console.log(`PresaleAfter-${preSaleBalanceAfter.toString()}`)

  });

});


      // const time = await preSaleInstance.getTime()
      // console.log(time.toString())
      // const timeStart = await preSaleInstance.startSale()
      // const timeEnd = await preSaleInstance.endSale()
      // const timeClaim = await preSaleInstance.claimDate()
      // console.log(`Time Start${timeStart.toString()}`)
      // console.log(`Time End${timeEnd.toString()}`)
      // console.log(`Time Claim${timeClaim.toString()}`)

