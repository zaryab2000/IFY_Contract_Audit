const TokenContract = artifacts.require("Token");
const StakeContract = artifacts.require("IFY_Stake")
var BN = require("bignumber.js");

const { time } = require("@openzeppelin/test-helpers");

contract("IFY Staking Contract Test", accounts => {
  let tokenInstance = null;
  let stakeInstance = null;

  before(async () => {
    tokenInstance = await TokenContract.deployed();
    stakeInstance = await StakeContract.deployed();
  });


  //Testing the Staking Contract
  it("Owner is Correct", async () => {
    const owner = await stakeInstance.owner();
    assert.equal(owner, accounts[0], "Owner's address is wrongly assigned");
  });

    it("Initail Setup should be confirmed & Set Token address", async () => {
    const totalStaked = await stakeInstance.totalStaked();
    const totalRewards = await stakeInstance.totalClaimedRewards()
    const stakeAddress = await tokenInstance.STAKING_ADDRESS();

    await stakeInstance.setTokenAddress(tokenInstance.address);

    assert.equal(stakeAddress,stakeInstance.address,"Stake Address is right")
    assert.equal(totalStaked.toString(),"0", "Not setUp correctly");
    assert.equal(totalRewards.toString(),"0","Rewards variable not setup")
  });

  it("Transfer sufficient tokens to 3 users and Staking contract",async()=>{
  	const tokensToTransfer = new BN(50000000000000000000000)
  	const tokensToRecieve = new BN(47500000000000000000000);
  	await tokenInstance.transfer(accounts[1],tokensToTransfer);
  	await tokenInstance.transfer(accounts[2],tokensToTransfer);
  	await tokenInstance.transfer(accounts[3],tokensToTransfer);
  
  	await tokenInstance.transfer(stakeInstance.address,tokensToTransfer);
  	await tokenInstance.approve(stakeInstance.address,tokensToRecieve,{from:accounts[1]});
  	await tokenInstance.approve(stakeInstance.address,tokensToRecieve,{from:accounts[2]});
  	await tokenInstance.approve(stakeInstance.address,tokensToRecieve,{from:accounts[3]});
	
  })
  /** Stake function checkpoints:
   * Should only work if optionNumber is between 1 to 4
   * Should only work if stakedAmount is equal to 0
   * stakedAmount,stakingOpt,endingDate should be assigned correctly
   * Check the reward amount is right or incorrect
   * transfer of token from user to contract address is done prpoerly
  */
  it("Stake function should work as expected for User 1", async () => {
  	const stakeAmount = new BN(10000000000000000000000);
    const stakeBalanceBefore = await tokenInstance.balanceOf(stakeInstance.address);
    await stakeInstance.STAKE(stakeAmount,2,{from:accounts[1]});
    const stakeBalanceAfter = await tokenInstance.balanceOf(stakeInstance.address);
    const totalStaked = await stakeInstance.totalStaked()

    //Checking User's STAKER mapping
    const staker = await stakeInstance.stakers(accounts[1]);
    assert.equal(staker[0].toString(),"10000000000000000000000","Stked balance is not right")
    assert.equal(staker[3].toString(),"2","Stked optionNumber is not right")
    assert.equal(staker[5].toString(),"25","Stked reward% is not right")

    assert.equal(totalStaked.toString(),"10000000000000000000000","Total Stake is not right");
    assert.strictEqual(stakeBalanceBefore.toString(),"56750000000000000000000","Balance is Not Right")
    assert.strictEqual(stakeBalanceAfter.toString(),"66750000000000000000000","Balance is right")

  });

  it("Stake function should work as expected for User 2", async () => {
    const stakeAmount = new BN(10000000000000000000000);
    const stakeBalanceBefore = await tokenInstance.balanceOf(stakeInstance.address);
    await stakeInstance.STAKE(stakeAmount,4,{from:accounts[2]});
    const stakeBalanceAfter = await tokenInstance.balanceOf(stakeInstance.address);
    const totalStaked = await stakeInstance.totalStaked()


    //Checking User's STAKER mapping
    const staker = await stakeInstance.stakers(accounts[2]);
    assert.equal(staker[0].toString(),"10000000000000000000000","Stked balance is not right")
    assert.equal(staker[3].toString(),"4","Staked optionNumber is not right")
    assert.equal(staker[5].toString(),"245","Staked reward% is not right")

    assert.equal(totalStaked.toString(),"20000000000000000000000","Total Stake is not right");
    assert.strictEqual(stakeBalanceBefore.toString(),"66750000000000000000000","Balance is Not Right")
    assert.strictEqual(stakeBalanceAfter.toString(),"76750000000000000000000","Balance is right")

  });

   it("User should not be able to call with invalid option number", async () => {

    // try {
    // } catch (error) {
    //   const invalidOpcode = error.message.search("revert") >= 0;
    //   assert(invalidOpcode, "Expected revert, got '" + error + "' instead");
    // }
  });


  it("User should not be able to call STAKE function with already staked amount", async () => {

    // try {
    // } catch (error) {
    //   const invalidOpcode = error.message.search("revert") >= 0;
    //   assert(invalidOpcode, "Expected revert, got '" + error + "' instead");
    // }
  });
   /** PendingReward function checkpoints:
    * Shoudl return the reward
  */
  it("PendingReward function should work as expected", async () => {
    const rewardClaimed = await stakeInstance.stakers(accounts[2]);
    const reward = await stakeInstance.pendingReward(accounts[2]);
    
    assert.equal(rewardClaimed[1].toString(),"0","reward claim is not zero");
    assert.equal(reward.toString(),"24500000000000000000000","Reward is not assigned correctly")
  });
  /** ClaimReward function checkpoints:
    * Should work if pending reward > 0
    * should work after stakingEndTime is over. - done
    * Should only be called after deadline is over - done
    * Balance before should be small and after shoud be big - done
    * totalClaimed rewards should update - done
    * staker's claim reward should update - done
    * Staking contract balance should reduce- done
    * Tax should not be applicable
  */


  it("Time should increase to 30 days", async () => {
    await time.increase(time.duration.seconds(2678400));
  });
  it("ClaimReward function should work as expected for User1", async () => {
      const ownerBalanceBefore = await tokenInstance.balanceOf(accounts[0]);
      const balanceBefore = await tokenInstance.balanceOf(accounts[1]);

      await stakeInstance.ClaimReward({from:accounts[1]});
      const balanceAfter = await tokenInstance.balanceOf(accounts[1]);
      const StakeContractBalance = await tokenInstance.balanceOf(stakeInstance.address);
      
      const ownerBalanceAfter = await tokenInstance.balanceOf(accounts[0]);

      const totalClaimed = await stakeInstance.totalClaimedRewards();
      const staker = await stakeInstance.stakers(accounts[1]);

      // console.log(StakeContractBalance.toString())
      // console.log(balanceAfter.toString())

      assert.equal(ownerBalanceBefore.toString(),ownerBalanceAfter.toString(),"Owner has received some unnecessary tax")
      assert.equal(StakeContractBalance.toString(),"74250000000000000000000","Stake contract Balance before is wrong")
      assert.equal(balanceBefore.toString(),"37500000000000000000000","Balance before is wrong")
      assert.equal(balanceAfter.toString(),"40000000000000000000000","Balance after is wrong")
      assert.equal(totalClaimed.toString(),"2500000000000000000000","Total claimed rewards not correct");
      assert.equal(staker[1].toString(),"2500000000000000000000","User claimed rewards not correct");
 
  });

  /** UnStake function checkpoints:
    * Should work if stakedAmount is greater than Zero
    * should work after stakingEndTime is over
    * Total staked amount should be updated
    * Check if pendingReward exist 
    * Pending reward must be paid after execution
    * Staked amount should be updatd to ZERO
    * Transfer of function should take place properly
    * Tax should not be applicable
  */

  it("Time should increase to 180 days", async () => {
    await time.increase(time.duration.seconds(15638400));
  });

  it("Unstake function should work for USER2", async ()=>{
    const ownerBalanceBefore = await tokenInstance.balanceOf(accounts[0]);
    const balanceBefore = await tokenInstance.balanceOf(accounts[1]);
    const rewardBefore = await stakeInstance.pendingReward(accounts[2]);

    await stakeInstance.UnStake({from:accounts[2]});
    const balanceAfter = await tokenInstance.balanceOf(accounts[1]);
    const StakeContractBalance = await tokenInstance.balanceOf(stakeInstance.address);
    const ownerBalanceAfter = await tokenInstance.balanceOf(accounts[0]);

    //Checking pending reward for User2
    const rewardClaimed = await stakeInstance.stakers(accounts[2]);
    const rewardAfter = await stakeInstance.pendingReward(accounts[2]);

    //CHecking totalStaked State variable and Individual user
    const totalStaked = await stakeInstance.totalStaked()
    const staker = await stakeInstance.stakers(accounts[2]);
 
    assert.equal(rewardClaimed[1].toString(),"0","reward claim is not zero");
    assert.equal(rewardAfter.toString(),"0","Reward is not assigned correctly")
   assert.equal(rewardBefore.toString(),"24500000000000000000000","RewardBefre is correct")
    assert.equal(ownerBalanceBefore.toString(),ownerBalanceAfter.toString(),"Owner has received some unnecessary tax")
    assert.equal(StakeContractBalance.toString(),"64250000000000000000000","Stake contract Balance before is wrong")
    assert.equal(totalStaked.toString(),"10000000000000000000000","Total Stake is not right");
    assert.equal(staker[0].toString(),"0","User balance not updated to ZERO");

  })

});
