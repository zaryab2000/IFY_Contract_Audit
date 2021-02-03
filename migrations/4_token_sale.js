const TokenContract = artifacts.require("Token");
const StakeContract = artifacts.require("IFY_Stake");
const PreSaleContract = artifacts.require("PreSale");

module.exports = async (deployer,network,accounts) =>{
  deployer.deploy(TokenContract,StakeContract.address,PreSaleContract.address);
};
