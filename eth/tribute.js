const abi = require("../abi/SportsClubDAOtribute.json");

export function tributeInstance(address, web3) {
  let tributeInstance = new web3.eth.Contract(abi, address);
  return tributeInstance;
}
