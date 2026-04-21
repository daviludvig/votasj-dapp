const { expect } = require("chai");
const { ethers } = require("hardhat");

const hash = (label) => ethers.keccak256(ethers.toUtf8Bytes(label));

async function now() {
  return (await ethers.provider.getBlock("latest")).timestamp;
}

async function setNextTs(ts) {
  await ethers.provider.send("evm_setNextBlockTimestamp", [ts]);
}

async function advanceTo(ts) {
  await setNextTs(ts);
  await ethers.provider.send("evm_mine", []);
}

describe("ParticipatoryBudget", function () {
  async function deploy() {
    const [admin, alice, bob, carol, dave] = await ethers.getSigners();

    const Registry = await ethers.getContractFactory("VoterRegistry");
    const registry = await Registry.deploy(admin.address);

    const Budget = await ethers.getContractFactory("ParticipatoryBudget");
    const budget = await Budget.deploy(await registry.getAddress(), admin.address);

    for (const voter of [alice, bob, carol]) {
      await registry.registerVoter(voter.address, hash(`govbr:${voter.address}`));
    }

    return { registry, budget, admin, alice, bob, carol, dave };
  }

  describe("constructor", function () {
    it("rejects the zero registry address", async function () {
      const [admin] = await ethers.getSigners();
      const Budget = await ethers.getContractFactory("ParticipatoryBudget");
      await expect(Budget.deploy(ethers.ZeroAddress, admin.address)).to.be.revertedWith(
        "Budget: registry is zero"
      );
    });

    it("rejects the zero admin address", async function () {
      const [, alice] = await ethers.getSigners();
      const Registry = await ethers.getContractFactory("VoterRegistry");
      const registry = await Registry.deploy(alice.address);
      const Budget = await ethers.getContractFactory("ParticipatoryBudget");
      await expect(
        Budget.deploy(await registry.getAddress(), ethers.ZeroAddress)
      ).to.be.revertedWith("Budget: admin is zero");
    });
  });

  describe("openCycle", function () {
    it("opens the first cycle and emits an event", async function () {
      const { budget } = await deploy();
      const t = await now();
      await expect(budget.openCycle(t + 10, t + 3600, ethers.parseEther("100")))
        .to.emit(budget, "CycleOpened")
        .withArgs(1n, t + 10, t + 3600, ethers.parseEther("100"));

      expect(await budget.currentCycleId()).to.equal(1n);
      const cycle = await budget.cycles(1);
      expect(cycle.status).to.equal(1n); // Open
    });

    it("rejects a non-admin caller", async function () {
      const { budget, alice } = await deploy();
      const t = await now();
      await expect(
        budget.connect(alice).openCycle(t + 10, t + 3600, 0)
      ).to.be.revertedWith("Budget: not admin");
    });

    it("rejects opensAt >= closesAt", async function () {
      const { budget } = await deploy();
      const t = await now();
      await expect(budget.openCycle(t + 100, t + 100, 0)).to.be.revertedWith(
        "Budget: invalid window"
      );
      await expect(budget.openCycle(t + 200, t + 100, 0)).to.be.revertedWith(
        "Budget: invalid window"
      );
    });

    it("rejects closesAt in the past", async function () {
      const { budget } = await deploy();
      const t = await now();
      await expect(budget.openCycle(t - 100, t - 10, 0)).to.be.revertedWith(
        "Budget: closes in past"
      );
    });

    it("rejects a second cycle while one is open", async function () {
      const { budget } = await deploy();
      const t = await now();
      await budget.openCycle(t + 10, t + 3600, 0);
      await expect(budget.openCycle(t + 10, t + 7200, 0)).to.be.revertedWith(
        "Budget: cycle still active"
      );
    });

    it("allows opening a second cycle after the previous one closes", async function () {
      const { budget } = await deploy();
      const t = await now();
      await budget.openCycle(t + 10, t + 100, 0);
      await advanceTo(t + 101);
      await budget.closeCycle();

      const t2 = await now();
      await expect(budget.openCycle(t2 + 10, t2 + 3600, 0)).not.to.be.reverted;
      expect(await budget.currentCycleId()).to.equal(2n);
    });
  });

  describe("submitProposal", function () {
    async function openedCycle() {
      const fixture = await deploy();
      const t = await now();
      await fixture.budget.openCycle(t + 1, t + 3600, 0);
      await advanceTo(t + 2);
      return fixture;
    }

    it("registers a proposal and emits an event", async function () {
      const { budget, alice } = await openedCycle();
      await expect(budget.connect(alice).submitProposal("ipfs://QmPraca"))
        .to.emit(budget, "ProposalSubmitted")
        .withArgs(1n, 1n, alice.address, "ipfs://QmPraca");

      const [cid, votes, submitter] = await budget.getProposal(1, 1);
      expect(cid).to.equal("ipfs://QmPraca");
      expect(votes).to.equal(0n);
      expect(submitter).to.equal(alice.address);
    });

    it("rejects submission by an unregistered address", async function () {
      const { budget, dave } = await openedCycle();
      await expect(budget.connect(dave).submitProposal("ipfs://X")).to.be.revertedWith(
        "Budget: submitter not registered"
      );
    });

    it("rejects an empty CID", async function () {
      const { budget, alice } = await openedCycle();
      await expect(budget.connect(alice).submitProposal("")).to.be.revertedWith(
        "Budget: empty cid"
      );
    });

    it("rejects submission when no cycle has ever been opened", async function () {
      const fixture = await deploy();
      await expect(fixture.budget.connect(fixture.alice).submitProposal("ipfs://X")).to.be.reverted;
    });

    it("rejects submission after the cycle ended", async function () {
      const { budget, alice } = await openedCycle();
      await advanceTo((await now()) + 4000);
      await expect(budget.connect(alice).submitProposal("ipfs://late")).to.be.revertedWith(
        "Budget: cycle ended"
      );
    });
  });

  describe("vote", function () {
    async function cycleWithProposal() {
      const fixture = await deploy();
      const t = await now();
      await fixture.budget.openCycle(t + 10, t + 3600, 0);
      await advanceTo(t + 11);
      await fixture.budget.connect(fixture.alice).submitProposal("ipfs://A");
      return fixture;
    }

    it("records a vote and emits an event", async function () {
      const { budget, alice } = await cycleWithProposal();
      await expect(budget.connect(alice).vote(1))
        .to.emit(budget, "VoteCast")
        .withArgs(1n, 1n, alice.address);

      expect(await budget.hasVoted(1, alice.address)).to.equal(true);
      const [, votes] = await budget.getProposal(1, 1);
      expect(votes).to.equal(1n);
    });

    it("rejects an unregistered voter", async function () {
      const { budget, dave } = await cycleWithProposal();
      await expect(budget.connect(dave).vote(1)).to.be.revertedWith(
        "Budget: voter not registered"
      );
    });

    it("rejects double voting by the same wallet", async function () {
      const { budget, alice } = await cycleWithProposal();
      await budget.connect(alice).vote(1);
      await expect(budget.connect(alice).vote(1)).to.be.revertedWith("Budget: already voted");
    });

    it("rejects voting for an unknown proposal", async function () {
      const { budget, alice } = await cycleWithProposal();
      await expect(budget.connect(alice).vote(999)).to.be.revertedWith("Budget: unknown proposal");
    });

    it("rejects voting after closesAt", async function () {
      const { budget, alice } = await cycleWithProposal();
      await advanceTo((await now()) + 4000);
      await expect(budget.connect(alice).vote(1)).to.be.revertedWith("Budget: cycle ended");
    });
  });

  describe("closeCycle and tally", function () {
    it("elects the most-voted proposal", async function () {
      const { budget, alice, bob, carol } = await deploy();
      const t = await now();
      await budget.openCycle(t + 1, t + 1000, 0);
      await advanceTo(t + 2);

      await budget.connect(alice).submitProposal("ipfs://A");
      await budget.connect(bob).submitProposal("ipfs://B");

      await budget.connect(alice).vote(2);
      await budget.connect(bob).vote(2);
      await budget.connect(carol).vote(1);

      await advanceTo(t + 1001);
      await expect(budget.closeCycle())
        .to.emit(budget, "CycleClosed")
        .withArgs(1n, 2n, 2n);

      const cycle = await budget.cycles(1);
      expect(cycle.status).to.equal(2n); // Closed
      expect(cycle.winningProposalId).to.equal(2n);
      expect(cycle.totalVotes).to.equal(3n);
    });

    it("keeps the lowest proposal id on a tie (first-seen wins)", async function () {
      const { budget, alice, bob } = await deploy();
      const t = await now();
      await budget.openCycle(t + 1, t + 1000, 0);
      await advanceTo(t + 2);

      await budget.connect(alice).submitProposal("ipfs://A");
      await budget.connect(bob).submitProposal("ipfs://B");

      await budget.connect(alice).vote(1);
      await budget.connect(bob).vote(2);

      await advanceTo(t + 1001);
      await budget.closeCycle();

      expect((await budget.cycles(1)).winningProposalId).to.equal(1n);
    });

    it("yields winningProposalId = 0 when no votes were cast", async function () {
      const { budget } = await deploy();
      const t = await now();
      await budget.openCycle(t + 1, t + 100, 0);
      await advanceTo(t + 101);
      await budget.closeCycle();
      expect((await budget.cycles(1)).winningProposalId).to.equal(0n);
    });

    it("rejects closing before the deadline", async function () {
      const { budget } = await deploy();
      const t = await now();
      await budget.openCycle(t + 1, t + 3600, 0);
      await expect(budget.closeCycle()).to.be.revertedWith("Budget: cycle still running");
    });

    it("rejects closing a cycle that is already closed", async function () {
      const { budget } = await deploy();
      const t = await now();
      await budget.openCycle(t + 1, t + 100, 0);
      await advanceTo(t + 101);
      await budget.closeCycle();
      await expect(budget.closeCycle()).to.be.revertedWith("Budget: cycle not open");
    });
  });

  describe("getProposal", function () {
    it("reverts for unknown proposals", async function () {
      const { budget } = await deploy();
      const t = await now();
      await budget.openCycle(t + 1, t + 100, 0);
      await expect(budget.getProposal(1, 999)).to.be.revertedWith("Budget: unknown proposal");
    });
  });
});
