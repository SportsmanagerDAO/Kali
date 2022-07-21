const { BigNumber } = require("ethers")
const chai = require("chai")
const { expect } = require("chai")

const wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"

chai.should()

// Defaults to e18 using amount * 10^18
function getBigNumber(amount, decimals = 18) {
  return BigNumber.from(amount).mul(BigNumber.from(10).pow(decimals))
}

async function advanceTime(time) {
  await ethers.provider.send("evm_increaseTime", [time])
}

describe("SportsClubDAO", function () {
  let SportsClub // SportsClubDAO contract
  let sportsClub // SportsClubDAO contract instance
  let proposer // signerA
  let alice // signerB
  let bob // signerC

  beforeEach(async () => {
    ;[proposer, alice, bob] = await ethers.getSigners()

    // SportsClub = await ethers.getContractFactory("SportsClubDAO")
    SportsClub = await ethers.getContractFactory("KaliDAO")
    sportsClub = await SportsClub.deploy()
    await sportsClub.deployed()
    // console.log(sportsClub.address)
    // console.log("alice eth balance", await alice.getBalance())
    // console.log("bob eth balance", await bob.getBalance())
  })

  it("Should initialize with correct params", async function () {
    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      false,
      [],
      [],
      [proposer.address],
      [getBigNumber(10)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 0]
    )
    expect(await sportsClub.name()).to.equal("SPORTSCLUB")
    expect(await sportsClub.symbol()).to.equal("SPORTSCLUB")
    expect(await sportsClub.docs()).to.equal("DOCS")
    expect(await sportsClub.paused()).to.equal(false)
    expect(await sportsClub.balanceOf(proposer.address)).to.equal(getBigNumber(10))
    expect(await sportsClub.votingPeriod()).to.equal(30)
    expect(await sportsClub.quorum()).to.equal(30)
    expect(await sportsClub.supermajority()).to.equal(60)
    expect(await sportsClub.proposalVoteTypes(0)).to.equal(0)
    expect(await sportsClub.proposalVoteTypes(1)).to.equal(0)
    expect(await sportsClub.proposalVoteTypes(2)).to.equal(0)
    expect(await sportsClub.proposalVoteTypes(3)).to.equal(0)
    expect(await sportsClub.proposalVoteTypes(4)).to.equal(0)
    expect(await sportsClub.proposalVoteTypes(5)).to.equal(0)
    expect(await sportsClub.proposalVoteTypes(6)).to.equal(0)
    expect(await sportsClub.proposalVoteTypes(7)).to.equal(1)
    expect(await sportsClub.proposalVoteTypes(8)).to.equal(2)
    expect(await sportsClub.proposalVoteTypes(9)).to.equal(3)
    expect(await sportsClub.proposalVoteTypes(10)).to.equal(0)
  })
  it("Should revert if initialization gov settings exceed bounds", async function () {
    expect(await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      false,
      [],
      [],
      [proposer.address],
      [getBigNumber(10)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 0, 1]
    ).should.be.reverted)
    expect(await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      false,
      [],
      [],
      [proposer.address],
      [getBigNumber(10)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 9]
    ).should.be.reverted)
  })
  it("Should revert if initialization arrays don't match", async function () {
    expect(await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      false,
      [bob.address],
      [],
      [bob.address],
      [getBigNumber(10)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ).should.be.reverted)
    expect(await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      false,
      [],
      [],
      [bob.address, alice.address],
      [getBigNumber(10)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ).should.be.reverted)
  })
  it("Should revert if already initialized", async function () {
    expect(await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      false,
      [],
      [],
      [bob.address],
      [getBigNumber(10)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ))
    expect(await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      false,
      [],
      [],
      [bob.address],
      [getBigNumber(10)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ).should.be.reverted)
  })
  it("Should revert if voting period is initialized null or longer than year", async function () {
    expect(await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      false,
      [],
      [],
      [bob.address],
      [getBigNumber(10)],
      0,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ).should.be.reverted)
    expect(await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      false,
      [],
      [],
      [bob.address],
      [getBigNumber(10)],
      31536001,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ).should.be.reverted)
  })
  it("Should revert if quorum is initialized greater than 100", async function () {
    expect(await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      false,
      [],
      [],
      [bob.address],
      [getBigNumber(10)],
      30,
      [101, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ).should.be.reverted)
  })
  it("Should revert if supermajority is initialized less than 52 or greater than 100", async function () {
    expect(await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      false,
      [],
      [],
      [bob.address],
      [getBigNumber(10)],
      30,
      [100, 51, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ).should.be.reverted)
    expect(await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      false,
      [],
      [],
      [bob.address],
      [getBigNumber(10)],
      30,
      [100, 101, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ).should.be.reverted)
  })
  it("Should revert if proposal arrays don't match", async function () {
    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      true,
      [],
      [],
      [bob.address],
      [getBigNumber(1)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    expect(await sportsClub.propose(
      0,
      "TEST",
      [bob.address, alice.address],
      [getBigNumber(1000)],
      [0x00]
    ).should.be.reverted)
  })
  it("Should revert if period proposal is for null or longer than year", async function () {
    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      true,
      [],
      [],
      [bob.address],
      [getBigNumber(1)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    // normal
    await sportsClub.propose(
      3,
      "TEST",
      [bob.address],
      [9000],
      [0x00]
    )
    expect(await sportsClub.propose(
      3,
      "TEST",
      [bob.address],
      [0],
      [0x00]
    ).should.be.reverted)
    expect(await sportsClub.propose(
      3,
      "TEST",
      [bob.address],
      [31536001],
      [0x00]
    ).should.be.reverted)
  })
  it("Should revert if quorum proposal is for greater than 100", async function () {
    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      true,
      [],
      [],
      [bob.address],
      [getBigNumber(1)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    // normal
    await sportsClub.propose(
      4,
      "TEST",
      [bob.address],
      [20],
      [0x00]
    )
    expect(await sportsClub.propose(
      4,
      "TEST",
      [bob.address],
      [101],
      [0x00]
    ).should.be.reverted)
  })
  it("Should revert if supermajority proposal is for less than 52 or greater than 100", async function () {
    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      true,
      [],
      [],
      [bob.address],
      [getBigNumber(1)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    // normal
    await sportsClub.propose(
      5,
      "TEST",
      [bob.address],
      [60],
      [0x00]
    )
    expect(await sportsClub.propose(
      5,
      "TEST",
      [bob.address],
      [51],
      [0x00]
    ).should.be.reverted)
    expect(await sportsClub.propose(
      5,
      "TEST",
      [bob.address],
      [101],
      [0x00]
    ).should.be.reverted)
  })
  it("Should revert if type proposal has proposal type greater than 10, vote type greater than 3, or setting length isn't 2", async function () {
    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      true,
      [],
      [],
      [bob.address],
      [getBigNumber(1)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    // normal
    await sportsClub.propose(
      6,
      "TEST",
      [bob.address, alice.address],
      [0, 1],
      [0x00, 0x00]
    )
    expect(await sportsClub.propose(
      6,
      "TEST",
      [bob.address, alice.address],
      [11, 2],
      [0x00, 0x00]
    ).should.be.reverted)
    expect(await sportsClub.propose(
      6,
      "TEST",
      [bob.address, alice.address],
      [0, 5],
      [0x00, 0x00]
    ).should.be.reverted)
    expect(await sportsClub.propose(
      6,
      "TEST",
      [proposer.address, bob.address, alice.address],
      [0, 1, 0],
      [0x00, 0x00, 0x00]
    ).should.be.reverted)
  })
  it("Should allow proposer to cancel unsponsored proposal", async function () {
    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsClub.connect(alice).propose(
      0,
      "TEST",
      [alice.address],
      [getBigNumber(1000)],
      [0x00]
    )
    await sportsClub.connect(alice).cancelProposal(1)
  })
  it("Should forbid non-proposer from cancelling unsponsored proposal", async function () {
    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsClub.connect(alice).propose(
      0,
      "TEST",
      [alice.address],
      [getBigNumber(1000)],
      [0x00]
    )
    expect(await sportsClub.cancelProposal(0).should.be.reverted)
  })
  it("Should forbid proposer from cancelling sponsored proposal", async function () {
    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsClub.connect(alice).propose(
      0,
      "TEST",
      [alice.address],
      [getBigNumber(1000)],
      [0x00]
    )
    await sportsClub.sponsorProposal(1)
    expect(await sportsClub.connect(alice).cancelProposal(1).should.be.reverted)
  })
  it("Should forbid cancelling non-existent proposal", async function () {
    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsClub.connect(alice).propose(
      0,
      "TEST",
      [alice.address],
      [getBigNumber(1000)],
      [0x00]
    )
    expect(await sportsClub.connect(alice).cancelProposal(10).should.be.reverted)
  })
  it("Should allow sponsoring proposal and processing", async function () {
    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsClub.connect(alice).propose(
      0,
      "TEST",
      [alice.address],
      [getBigNumber(1000)],
      [0x00]
    )
    await sportsClub.sponsorProposal(1)
    await sportsClub.vote(1, true)
    await advanceTime(35)
    await sportsClub.processProposal(1)
    expect(await sportsClub.balanceOf(alice.address)).to.equal(getBigNumber(1000))
  })
  it("Should forbid non-member from sponsoring proposal", async function () {
    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsClub.connect(alice).propose(
      0,
      "TEST",
      [alice.address],
      [getBigNumber(1000)],
      [0x00]
    )
    expect(await sportsClub.connect(alice).sponsorProposal(0).should.be.reverted)
  })
  it("Should forbid sponsoring non-existent or processed proposal", async function () {
    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsClub.connect(alice).propose(
      0,
      "TEST",
      [alice.address],
      [getBigNumber(1000)],
      [0x00]
    )
    await sportsClub.sponsorProposal(1)
    await sportsClub.vote(1, true)
    await advanceTime(35)
    await sportsClub.processProposal(1)
    expect(await sportsClub.balanceOf(alice.address)).to.equal(getBigNumber(1000))
    expect(await sportsClub.sponsorProposal(1).should.be.reverted)
    expect(await sportsClub.sponsorProposal(100).should.be.reverted)
  })
  it("Should forbid sponsoring an already sponsored proposal", async function () {
    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsClub.connect(alice).propose(
      0,
      "TEST",
      [alice.address],
      [getBigNumber(1000)],
      [0x00]
    )
    await sportsClub.sponsorProposal(1)
    expect(await sportsClub.sponsorProposal(1).should.be.reverted)
  })
  it("Should allow self-sponsorship by a member", async function () {
    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsClub.propose(
      0,
      "TEST",
      [proposer.address],
      [getBigNumber(1000)],
      [0x00]
    )
    await sportsClub.vote(1, true)
  })
  it("Should forbid a non-member from voting on proposal", async function () {
    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsClub.propose(
      0,
      "TEST",
      [proposer.address],
      [getBigNumber(1000)],
      [0x00]
    )
    expect(await sportsClub.connect(alice).vote(1, true).should.be.reverted)
  })
  it("Should forbid a member from voting again on proposal", async function () {
    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsClub.propose(
      0,
      "TEST",
      [proposer.address],
      [getBigNumber(1000)],
      [0x00]
    )
    await sportsClub.vote(1, true)
    expect(await sportsClub.vote(1, true).should.be.reverted)
  })
  it("Should forbid voting after period ends", async function () {
    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsClub.propose(
      0,
      "TEST",
      [proposer.address],
      [getBigNumber(1000)],
      [0x00]
    )
    await advanceTime(35)
    expect(await sportsClub.vote(1, true).should.be.reverted)
  })
  it("Should process membership proposal", async function () {
    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsClub.propose(
      0,
      "TEST",
      [proposer.address],
      [getBigNumber(1000)],
      [0x00]
    )
    await sportsClub.vote(1, true)
    await advanceTime(35)
    await sportsClub.processProposal(1)
    expect(await sportsClub.balanceOf(proposer.address)).to.equal(getBigNumber(1001))
  })
  it("voteBySig should revert if the signature is invalid", async () => {
    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsClub.propose(0, "TEST", [alice.address], [0], [0x00])
    const rs = ethers.utils.formatBytes32String("rs")
    expect(
      sportsClub.voteBySig(proposer.address, 0, true, 0, rs, rs).should.be.reverted
    )
  })
  it("Should process membership proposal via voteBySig", async () => {
    const domain = {
      name: "SPORTSCLUB",
      version: "1",
      chainId: 31337,
      verifyingContract: sportsClub.address,
    }
    const types = {
      SignVote: [
        { name: "signer", type: "address" },
        { name: "proposal", type: "uint256" },
        { name: "approve", type: "bool" },
      ],
    }
    const value = {
      signer: proposer.address,
      proposal: 1,
      approve: true,
    }

    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsClub.propose(0, "TEST", [alice.address], [getBigNumber(1000)], [0x00])

    const signature = await proposer._signTypedData(domain, types, value)
    const { r, s, v } = ethers.utils.splitSignature(signature)

    await sportsClub.voteBySig(proposer.address, 1, true, v, r, s)
    await advanceTime(35)
    await sportsClub.processProposal(1)
    expect(await sportsClub.balanceOf(alice.address)).to.equal(getBigNumber(1000))
  })
  it("Should process burn (eviction) proposal", async function () {
    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsClub.propose(1, "TEST", [proposer.address], [getBigNumber(1)], [0x00])
    await sportsClub.vote(1, true)
    await advanceTime(35)
    await sportsClub.processProposal(1)
    expect(await sportsClub.balanceOf(proposer.address)).to.equal(0)
  })
  it("Should process contract call proposal - Single", async function () {
    let FixedERC20 = await ethers.getContractFactory("FixedERC20")
    let fixedERC20 = await FixedERC20.deploy("sportsClub", "sportsClub", 18, sportsClub.address, getBigNumber(100))
    await fixedERC20.deployed()
    let payload = fixedERC20.interface.encodeFunctionData("transfer", [
      alice.address,
      getBigNumber(15)
    ])
    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsClub.propose(2, "TEST", [fixedERC20.address], [0], [payload])
    await sportsClub.vote(1, true)
    await advanceTime(35)
    await sportsClub.processProposal(1)
    expect(await fixedERC20.totalSupply()).to.equal(getBigNumber(100))
    expect(await fixedERC20.balanceOf(alice.address)).to.equal(getBigNumber(15))
  })
  it("Should process contract call proposal - Multiple", async function () {
    // Send Eth to SportsClub
    proposer.sendTransaction({
      to: sportsClub.address,
      value: getBigNumber(10),
    })
    // Instantiate 1st contract
    let FixedERC20 = await ethers.getContractFactory("FixedERC20")
    let fixedERC20 = await FixedERC20.deploy(
      "sportsClub",
      "sportsClub",
      18,
      sportsClub.address,
      getBigNumber(100)
    )
    await fixedERC20.deployed()
    let payload = fixedERC20.interface.encodeFunctionData("transfer", [
      alice.address,
      getBigNumber(15),
    ])
    // Instantiate 2nd contract
    let DropETH = await ethers.getContractFactory("DropETH")
    let dropETH = await DropETH.deploy()
    await dropETH.deployed()
    let payload2 = dropETH.interface.encodeFunctionData("dropETH", [
      [alice.address, bob.address],
      "hello",
    ])
    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsClub.propose(
      2,
      "TEST",
      [fixedERC20.address, dropETH.address],
      [0, getBigNumber(4)],
      [payload, payload2]
    )
    await sportsClub.vote(1, true)
    await advanceTime(35)
    await sportsClub.processProposal(1)
    expect(await fixedERC20.totalSupply()).to.equal(getBigNumber(100))
    expect(await fixedERC20.balanceOf(alice.address)).to.equal(getBigNumber(15))
    expect(await dropETH.amount()).to.equal(getBigNumber(2))
    expect(await dropETH.recipients(1)).to.equal(bob.address)
  })
  it("Should process period proposal", async function () {
    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsClub.propose(3, "TEST", [proposer.address], [5], [0x00])
    await sportsClub.vote(1, true)
    await advanceTime(35)
    await sportsClub.processProposal(1)
    expect(await sportsClub.votingPeriod()).to.equal(5)
  })
  it("Should process quorum proposal", async function () {
    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsClub.propose(4, "TEST", [proposer.address], [100], [0x00])
    await sportsClub.vote(1, true)
    await advanceTime(35)
    await sportsClub.processProposal(1)
    expect(await sportsClub.quorum()).to.equal(100)
  })
  it("Should process supermajority proposal", async function () {
    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsClub.propose(5, "TEST", [proposer.address], [52], [0x00])
    await sportsClub.vote(1, true)
    await advanceTime(35)
    await sportsClub.processProposal(1)
    expect(await sportsClub.supermajority()).to.equal(52)
  })
  it("Should process type proposal", async function () {
    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsClub.propose(
      6,
      "TEST",
      [proposer.address, proposer.address],
      [0, 3],
      [0x00, 0x00]
    )
    await sportsClub.vote(1, true)
    await advanceTime(35)
    await sportsClub.processProposal(1)
    expect(await sportsClub.proposalVoteTypes(0)).to.equal(3)
  })
  it("Should process pause proposal", async function () {
    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsClub.propose(7, "TEST", [proposer.address], [0], [0x00])
    await sportsClub.vote(1, true)
    await advanceTime(35)
    await sportsClub.processProposal(1)
    expect(await sportsClub.paused()).to.equal(false)
  })
  it("Should process extension proposal - General", async function () {
    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsClub.propose(8, "TEST", [wethAddress], [0], [0x00])
    await sportsClub.vote(1, true)
    await advanceTime(35)
    await sportsClub.processProposal(1)
    expect(await sportsClub.extensions(wethAddress)).to.equal(false)
  })
  it("Should toggle extension proposal", async function () {
    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsClub.propose(8, "TEST", [wethAddress], [1], [0x00])
    await sportsClub.vote(1, true)
    await advanceTime(35)
    await sportsClub.processProposal(1)
    expect(await sportsClub.extensions(wethAddress)).to.equal(true)
  })
  it("Should process extension proposal - SportsClubDAOcrowdsale with ETH", async function () {
    // Instantiate SportsClubDAO
    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    // Instantiate SportsClubWhiteListManager
    let SportsClubWhitelistManager = await ethers.getContractFactory(
      "KaliWhitelistManager"
    )
    let sportsClubWhitelistManager = await SportsClubWhitelistManager.deploy()
    await sportsClubWhitelistManager.deployed()
    // Instantiate extension contract
    let SportsClubDAOcrowdsale = await ethers.getContractFactory("KaliDAOcrowdsale")
    let sportsClubDAOcrowdsale = await SportsClubDAOcrowdsale.deploy(
      sportsClubWhitelistManager.address
    )
    await sportsClubDAOcrowdsale.deployed()
    // Set up whitelist
    await sportsClubWhitelistManager.createWhitelist(
      1,
      [alice.address],
      "0x074b43252ffb4a469154df5fb7fe4ecce30953ba8b7095fe1e006185f017ad10"
    )
    // Set up payload for extension proposal
    let payload = ethers.utils.defaultAbiCoder.encode(
      ["uint256", "address", "uint8", "uint96", "uint32"],
      [
        1,
        "0x0000000000000000000000000000000000000000",
        2,
        getBigNumber(100),
        1672174799,
      ]
    )
    await sportsClub.propose(8, "TEST", [sportsClubDAOcrowdsale.address], [1], [payload])
    await sportsClub.vote(1, true)
    await advanceTime(35)
    await sportsClub.processProposal(1)
    await sportsClubDAOcrowdsale 
      .connect(alice)
      .callExtension(sportsClub.address, getBigNumber(50), {
        value: getBigNumber(50),
      })
    expect(await ethers.provider.getBalance(sportsClub.address)).to.equal(
      getBigNumber(50)
    )
    expect(await sportsClub.balanceOf(alice.address)).to.equal(getBigNumber(100))
  })
  it("Should process extension proposal - SportsClubDAOcrowdsale with ERC20", async function () {
    // Instantiate purchaseToken
    let PurchaseToken = await ethers.getContractFactory("FixedERC20")
    let purchaseToken = await PurchaseToken.deploy(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "18",
      alice.address,
      getBigNumber(1000)
    )
    await purchaseToken.deployed()
    // Instantiate SportsClubDAO
    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    // Instantiate SportsClubWhiteListManager
    let SportsClubWhitelistManager = await ethers.getContractFactory(
      "KaliWhitelistManager"
    )
    let sportsClubWhitelistManager = await SportsClubWhitelistManager.deploy()
    await sportsClubWhitelistManager.deployed()
    // Instantiate extension contract
    let SportsClubDAOcrowdsale = await ethers.getContractFactory("KaliDAOcrowdsale")
    let sportsClubDAOcrowdsale = await SportsClubDAOcrowdsale.deploy(
      sportsClubWhitelistManager.address
    )
    await sportsClubDAOcrowdsale.deployed()
    // Set up whitelist
    await sportsClubWhitelistManager.createWhitelist(
      1,
      [alice.address],
      "0x074b43252ffb4a469154df5fb7fe4ecce30953ba8b7095fe1e006185f017ad10"
    )
    // Set up payload for extension proposal
    let payload = ethers.utils.defaultAbiCoder.encode(
      ["uint256", "address", "uint8", "uint96", "uint32"],
      [1, purchaseToken.address, 2, getBigNumber(100), 1672174799]
    )
    await sportsClub.propose(8, "TEST", [sportsClubDAOcrowdsale.address], [1], [payload])
    await sportsClub.vote(1, true)
    await advanceTime(35)
    await sportsClub.processProposal(1)
    await purchaseToken
      .connect(alice)
      .approve(sportsClubDAOcrowdsale.address, getBigNumber(50))
    await sportsClubDAOcrowdsale
      .connect(alice)
      .callExtension(sportsClub.address, getBigNumber(50))
    expect(await purchaseToken.balanceOf(sportsClub.address)).to.equal(
      getBigNumber(50)
    )
    expect(await sportsClub.balanceOf(alice.address)).to.equal(getBigNumber(100))
  })
  it("Should process escape proposal", async function () {
    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsClub.propose(
      0,
      "TEST",
      [proposer.address],
      [getBigNumber(1000)],
      [0x00]
    )
    await sportsClub.vote(1, true)
    await sportsClub.propose(
      0,
      "TEST",
      [proposer.address],
      [getBigNumber(99)],
      [0x00]
    )
    await sportsClub.vote(2, false)
    await sportsClub.propose(9, "TEST", [proposer.address], [2], [0x00])
    await sportsClub.vote(3, true)
    await advanceTime(35)
    await sportsClub.processProposal(3)
    // Proposal #1 remains intact
    // console.log(await sportsClub.proposals(0))
    // Proposal #2 deleted
    // console.log(await sportsClub.proposals(1))
  })
  it("Should process docs proposal", async function () {
    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsClub.propose(10, "TEST", [], [], [])
    await sportsClub.vote(1, true)
    await advanceTime(35)
    await sportsClub.processProposal(1)
    expect(await sportsClub.docs()).to.equal("TEST")
  })
  it("Should forbid processing a non-existent proposal", async function () {
    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    expect(await sportsClub.processProposal(2).should.be.reverted)
  })
  it("Should forbid processing a proposal that was already processed", async function () {
    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsClub.propose(
      0,
      "TEST",
      [proposer.address],
      [getBigNumber(1000)],
      [0x00]
    )
    await sportsClub.vote(1, true)
    await advanceTime(35)
    await sportsClub.processProposal(1)
    expect(await sportsClub.processProposal(1).should.be.reverted)
  })
  it("Should forbid processing a proposal before voting period ends", async function () {
    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsClub.propose(
      0,
      "TEST",
      [proposer.address],
      [getBigNumber(1000)],
      [0x00]
    )
    await sportsClub.vote(1, true)
    await advanceTime(20)
    expect(await sportsClub.processProposal(1).should.be.reverted)
  })
  it("Should forbid processing a proposal before previous processes", async function () {
    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    // normal
    await sportsClub.propose(
      0,
      "TEST",
      [proposer.address],
      [getBigNumber(1000)],
      [0x00]
    )
    await sportsClub.vote(1, true)
    await advanceTime(35)
    await sportsClub.processProposal(1)
    // check case
    await sportsClub.propose(
      0,
      "TEST",
      [proposer.address],
      [getBigNumber(1000)],
      [0x00]
    )
    await sportsClub.vote(2, true)
    await sportsClub.propose(
      0,
      "TEST",
      [proposer.address],
      [getBigNumber(1000)],
      [0x00]
    )
    await sportsClub.vote(3, true)
    await advanceTime(35)
    expect(await sportsClub.processProposal(3).should.be.reverted)
    await sportsClub.processProposal(2)
    await sportsClub.processProposal(3)
  })
  it("Should forbid calling a non-whitelisted extension", async function () {
    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    expect(await sportsClub.callExtension(wethAddress, 10, 0x0).should.be.reverted)
  })
  it("Should forbid non-whitelisted extension calling DAO", async function () {
    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    expect(await sportsClub.connect(alice).callExtension(bob.address, 10, 0x0).should.be.reverted)
  })
  it("Should allow a member to transfer shares", async function () {
    let sender, receiver
    ;[sender, receiver] = await ethers.getSigners()

    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      false,
      [],
      [],
      [sender.address],
      [getBigNumber(10)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsClub.transfer(receiver.address, getBigNumber(4))
    expect(await sportsClub.balanceOf(sender.address)).to.equal(getBigNumber(6))
    expect(await sportsClub.balanceOf(receiver.address)).to.equal(getBigNumber(4))
    // console.log(await sportsClub.balanceOf(sender.address))
    // console.log(await sportsClub.balanceOf(receiver.address))
  })
  it("Should not allow a member to transfer excess shares", async function () {
    let sender, receiver
    ;[sender, receiver] = await ethers.getSigners()

    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      false,
      [],
      [],
      [sender.address],
      [getBigNumber(10)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    expect(
      await sportsClub.transfer(receiver.address, getBigNumber(11)).should.be.reverted
    )
  })
  it("Should not allow a member to transfer shares if paused", async function () {
    let sender, receiver
    ;[sender, receiver] = await ethers.getSigners()

    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      true,
      [],
      [],
      [sender.address],
      [getBigNumber(10)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    expect(
      await sportsClub.transfer(receiver.address, getBigNumber(1)).should.be.reverted
    )
  })
  it("Should allow a member to approve pull transfers", async function () {
    let sender, receiver
    ;[sender, receiver] = await ethers.getSigners()

    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      false,
      [],
      [],
      [sender.address],
      [getBigNumber(10)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsClub.approve(receiver.address, getBigNumber(4))
    expect(await sportsClub.allowance(sender.address, receiver.address)).to.equal(getBigNumber(4))
  })
  it("Should allow an approved account to pull transfer (transferFrom)", async function () {
    let sender, receiver
    ;[sender, receiver] = await ethers.getSigners()

    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      false,
      [],
      [],
      [sender.address],
      [getBigNumber(10)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsClub.approve(receiver.address, getBigNumber(4))
    expect(await sportsClub.allowance(sender.address, receiver.address)).to.equal(getBigNumber(4))
    await sportsClub.connect(receiver).transferFrom(sender.address, receiver.address, getBigNumber(4))
  })
  it("Should not allow an account to pull transfer (transferFrom) beyond approval", async function () {
    let sender, receiver
    ;[sender, receiver] = await ethers.getSigners()

    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      false,
      [],
      [],
      [sender.address],
      [getBigNumber(10)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsClub.approve(receiver.address, getBigNumber(4))
    expect(await sportsClub.allowance(sender.address, receiver.address)).to.equal(getBigNumber(4))
    expect(await sportsClub.connect(receiver).transferFrom(sender.address, receiver.address, getBigNumber(5)).should.be.reverted)
  })
  it("Should not allow an approved account to pull transfer (transferFrom) if paused", async function () {
    let sender, receiver
    ;[sender, receiver] = await ethers.getSigners()

    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      true,
      [],
      [],
      [sender.address],
      [getBigNumber(10)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsClub.approve(receiver.address, getBigNumber(4))
    expect(await sportsClub.allowance(sender.address, receiver.address)).to.equal(getBigNumber(4))
    expect(await sportsClub.connect(receiver).transferFrom(sender.address, receiver.address, getBigNumber(4)).should.be.reverted)
  })
  it("Should not allow vote tally after current timestamp", async function () {
    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      true,
      [],
      [],
      [bob.address],
      [getBigNumber(10)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    expect(
      await sportsClub.getPriorVotes(bob.address, 1941275221).should.be.reverted
    )
  })
  it("Should match current votes to undelegated balance", async function () {
    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      true,
      [],
      [],
      [bob.address],
      [getBigNumber(10)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    expect(await sportsClub.getCurrentVotes(bob.address)).to.equal(getBigNumber(10))
  })
  it("Should allow vote delegation", async function () {
    let sender, receiver
    ;[sender, receiver] = await ethers.getSigners()

    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      true,
      [],
      [],
      [sender.address],
      [getBigNumber(10)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsClub.delegate(receiver.address)
    expect(await sportsClub.getCurrentVotes(sender.address)).to.equal(0)
    expect(await sportsClub.getCurrentVotes(receiver.address)).to.equal(getBigNumber(10))
    expect(await sportsClub.balanceOf(sender.address)).to.equal(getBigNumber(10))
    expect(await sportsClub.balanceOf(receiver.address)).to.equal(0)
    await sportsClub.delegate(sender.address)
    expect(await sportsClub.getCurrentVotes(sender.address)).to.equal(getBigNumber(10))
    expect(await sportsClub.getCurrentVotes(receiver.address)).to.equal(0)
  })
  it("Should update delegated balance after transfer", async function () {
    let sender, receiver, receiver2
    ;[sender, receiver, receiver2] = await ethers.getSigners()

    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      false,
      [],
      [],
      [sender.address],
      [getBigNumber(10)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsClub.delegate(receiver.address)
    expect(await sportsClub.getCurrentVotes(sender.address)).to.equal(0)
    expect(await sportsClub.getCurrentVotes(receiver.address)).to.equal(getBigNumber(10))
    await sportsClub.transfer(receiver2.address, getBigNumber(5))
    expect(await sportsClub.getCurrentVotes(receiver2.address)).to.equal(getBigNumber(5))
    expect(await sportsClub.getCurrentVotes(sender.address)).to.equal(0)
    expect(await sportsClub.getCurrentVotes(receiver.address)).to.equal(getBigNumber(5))
    await sportsClub.delegate(sender.address)
    expect(await sportsClub.getCurrentVotes(sender.address)).to.equal(getBigNumber(5))
  })
  it("Should update delegated balance after pull transfer (transferFrom)", async function () {
    let sender, receiver, receiver2
    ;[sender, receiver, receiver2] = await ethers.getSigners()

    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      false,
      [],
      [],
      [sender.address],
      [getBigNumber(10)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsClub.delegate(receiver.address)
    expect(await sportsClub.getCurrentVotes(sender.address)).to.equal(0)
    expect(await sportsClub.getCurrentVotes(receiver.address)).to.equal(getBigNumber(10))
    await sportsClub.approve(receiver.address, getBigNumber(5))
    await sportsClub.connect(receiver).transferFrom(sender.address, receiver2.address, getBigNumber(5))
    expect(await sportsClub.getCurrentVotes(receiver2.address)).to.equal(getBigNumber(5))
    expect(await sportsClub.getCurrentVotes(sender.address)).to.equal(0)
    expect(await sportsClub.getCurrentVotes(receiver.address)).to.equal(getBigNumber(5))
    await sportsClub.delegate(sender.address)
    expect(await sportsClub.getCurrentVotes(sender.address)).to.equal(getBigNumber(5))
  })
  it("permit should work if the signature is valid", async () => {
    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    const domain = {
      name: "SPORTSCLUB",
      version: "1",
      chainId: 31337,
      verifyingContract: sportsClub.address,
    }
    const types = {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    }
    const value = {
      owner: proposer.address,
      spender: bob.address,
      value: getBigNumber(1),
      nonce: 0,
      deadline: 1941543121
    }

    const signature = await proposer._signTypedData(domain, types, value)
    const { r, s, v } = ethers.utils.splitSignature(signature)
    
    await sportsClub.permit(proposer.address, bob.address, getBigNumber(1), 1941543121, v, r, s)

    // Unpause to unblock transferFrom
    await sportsClub.propose(7, "TEST", [proposer.address], [0], [0x00])
    await sportsClub.vote(1, true)
    await advanceTime(35)
    await sportsClub.processProposal(1)
    expect(await sportsClub.paused()).to.equal(false)

    // console.log(
    //   "Proposer's balance before delegation: ",
    //   await sportsClub.balanceOf(proposer.address)
    // )
    // console.log(
    //   "Bob's balance before delegation: ",
    //   await sportsClub.balanceOf(bob.address)
    // )
    await sportsClub.connect(bob).transferFrom(proposer.address, bob.address, getBigNumber(1))
    // console.log(
    //   "Proposer's balance after delegation: ",
    //   await sportsClub.balanceOf(proposer.address)
    // )
    // console.log(
    //   "Bob's balance after delegation: ",
    //   await sportsClub.balanceOf(bob.address)
    // )
    expect(await sportsClub.balanceOf(bob.address)).to.equal(getBigNumber(1))
  })
  it("permit should revert if the signature is invalid", async () => {
    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    const rs = ethers.utils.formatBytes32String("rs")
    expect(
      sportsClub.permit(proposer.address, bob.address, getBigNumber(1), 1941525801, 0, rs, rs).should.be.reverted
    )
  })
  it("delegateBySig should work if the signature is valid", async () => {
    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    const domain = {
      name: "SPORTSCLUB",
      version: "1",
      chainId: 31337,
      verifyingContract: sportsClub.address,
    }
    const types = {
      Delegation: [
        { name: "delegatee", type: "address" },
        { name: "nonce", type: "uint256" },
        { name: "expiry", type: "uint256" },
      ],
    }
    const value = {
      delegatee: bob.address,
      nonce: 0,
      expiry: 1941543121
    }

    const signature = await proposer._signTypedData(domain, types, value)
    const { r, s, v } = ethers.utils.splitSignature(signature)

    sportsClub.delegateBySig(bob.address, 0, 1941525801, v, r, s)
  })
  it("delegateBySig should revert if the signature is invalid", async () => {
    await sportsClub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      30,
      [30, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    const rs = ethers.utils.formatBytes32String("rs")
    expect(
      sportsClub.delegateBySig(bob.address, 0, 1941525801, 0, rs, rs).should.be.reverted
    )
  })
})
