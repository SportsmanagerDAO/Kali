const abi = require("../abi/SportsClubDAOredemption.json");

export function redemptionInstance(address, web3) {
  let redemptionInstance = new web3.eth.Contract(abi, address);
  return redemptionInstance;
}
