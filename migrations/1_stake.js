const StakeContract = artifacts.require("IFY_Stake");

module.exports = async (deployer,network,accounts) =>{
  deployer.deploy(StakeContract);
};
