const abi = require("../abi/SportsClubDAOfactory.json");

export function factoryInstance(address, web3) {
  let factoryInstance = new web3.eth.Contract(abi, address);
  return factoryInstance;
}
