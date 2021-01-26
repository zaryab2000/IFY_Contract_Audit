const TokenContract = artifacts.require("Token");
const PreSaleContract = artifacts.require("PreSale");

module.exports = async (deployer,network,accounts) =>{
  deployer.deploy(PreSaleContract,TokenContract.address);
};
