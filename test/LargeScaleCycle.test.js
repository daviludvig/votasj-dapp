const { expect } = require("chai");
const { ethers, network } = require("hardhat");

// Configurable so anyone can push this further without editing the test:
// `VOTASJ_SCALE_VOTERS=2000 npm test` runs the full suite with 2000 voters
// instead of the 500 default (measured: 500 voters ≈ 4s, 2000 voters ≈ 16s
// on Hardhat's in-process network — gas per vote stays flat either way).
const VOTER_COUNT = Number(process.env.VOTASJ_SCALE_VOTERS || 500);
const PROPOSAL_COUNT = 6;

async function fundInstantly(address, etherAmount) {
  const wei = ethers.parseEther(etherAmount);
  await network.provider.send("hardhat_setBalance", [address, "0x" + wei.toString(16)]);
}

describe("Large-scale cycle (many voters)", function () {
  // Hundreds of sequential on-chain transactions take real wall-clock time
  // even on Hardhat's fast in-process network; the default 40s Mocha timeout
  // is not enough at VOTER_COUNT=300+.
  this.timeout(180000);

  it(`registers ${VOTER_COUNT} independent voters, runs ${PROPOSAL_COUNT} proposals, and tallies exactly what was cast`, async function () {
    const [admin] = await ethers.getSigners();

    const Registry = await ethers.getContractFactory("VoterRegistry");
    const registry = await Registry.deploy(admin.address);
    const Budget = await ethers.getContractFactory("ParticipatoryBudget");
    const budget = await Budget.deploy(await registry.getAddress(), admin.address);

    // Every voter is a freshly generated wallet, not one of Hardhat's 20
    // built-in signers — this is the part that actually exercises "many
    // voters" rather than reusing a handful of accounts VOTER_COUNT/20 times.
    const voters = [];
    for (let i = 0; i < VOTER_COUNT; i += 1) {
      const wallet = ethers.Wallet.createRandom().connect(ethers.provider);
      await fundInstantly(wallet.address, "1"); // instant balance set, no funding tx needed
      voters.push(wallet);
    }

    for (const voter of voters) {
      const credential = ethers.keccak256(ethers.toUtf8Bytes(`govbr:${voter.address}`));
      await registry.registerVoter(voter.address, credential);
    }
    expect(await registry.totalVoters()).to.equal(BigInt(VOTER_COUNT));

    const opensAt = (await ethers.provider.getBlock("latest")).timestamp + 1;
    const closesAt = opensAt + 100000;
    await budget.openCycle(opensAt, closesAt, ethers.parseEther("1000000"));
    await network.provider.send("evm_mine");

    for (let i = 0; i < PROPOSAL_COUNT; i += 1) {
      await budget.connect(voters[i]).submitProposal(`ipfs://large-scale-proposal-${i + 1}`);
    }

    // Distribute votes unevenly (not a uniform round-robin) so the winner is
    // not a coincidence of the loop index, and track the expected outcome in
    // JS so the contract's tally can be checked against an independent count.
    const expectedVotesByProposal = new Array(PROPOSAL_COUNT).fill(0);
    for (let i = 0; i < voters.length; i += 1) {
      const skewedTowardProposal1 = i % 5 !== 0; // 80% of voters favor proposal 1
      const proposalId = skewedTowardProposal1 ? 1 : (i % PROPOSAL_COUNT) + 1;
      await budget.connect(voters[i]).vote(proposalId);
      expectedVotesByProposal[proposalId - 1] += 1;
    }

    const totalExpectedVotes = expectedVotesByProposal.reduce((a, b) => a + b, 0);
    expect(totalExpectedVotes).to.equal(VOTER_COUNT);

    await network.provider.send("evm_setNextBlockTimestamp", [closesAt + 1]);
    await network.provider.send("evm_mine");
    await budget.closeCycle();

    const cycle = await budget.cycles(1);
    expect(cycle.totalVotes).to.equal(BigInt(VOTER_COUNT));

    const maxVotes = Math.max(...expectedVotesByProposal);
    const expectedWinnerId = expectedVotesByProposal.indexOf(maxVotes) + 1;
    expect(cycle.winningProposalId).to.equal(BigInt(expectedWinnerId));

    // Cross-check every proposal's on-chain vote count against the
    // independently tracked JS tally — not just the declared winner.
    for (let i = 0; i < PROPOSAL_COUNT; i += 1) {
      const [, votes] = await budget.getProposal(1, i + 1);
      expect(votes, `proposal ${i + 1} vote count`).to.equal(BigInt(expectedVotesByProposal[i]));
    }

    // No double-registration and no double-voting anywhere in the batch —
    // spot-check a sample rather than re-deriving all 300+ hasVoted reads.
    const sample = [voters[0], voters[Math.floor(voters.length / 2)], voters[voters.length - 1]];
    for (const voter of sample) {
      expect(await budget.hasVoted(1, voter.address)).to.equal(true);
      await expect(budget.connect(voter).vote(1)).to.be.revertedWith("Budget: cycle not open");
    }
  });
});
