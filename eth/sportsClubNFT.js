const abi = require("../abi/SportsClubNFT.json");

export default function sportsClubNFT(address, web3) {
  let sportsClubNFT = new web3.eth.Contract(abi, address);
  return sportsClubNFT;
}
