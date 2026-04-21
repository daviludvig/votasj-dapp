const { expect } = require("chai");
const { ethers } = require("hardhat");

const ZERO = ethers.ZeroAddress;
const ZERO_HASH = ethers.ZeroHash;
const hash = (label) => ethers.keccak256(ethers.toUtf8Bytes(label));

describe("VoterRegistry", function () {
  async function deploy() {
    const [admin, alice, bob, mallory] = await ethers.getSigners();
    const Registry = await ethers.getContractFactory("VoterRegistry");
    const registry = await Registry.deploy(admin.address);
    return { registry, admin, alice, bob, mallory };
  }

  describe("constructor", function () {
    it("rejects the zero address as admin", async function () {
      const Registry = await ethers.getContractFactory("VoterRegistry");
      await expect(Registry.deploy(ZERO)).to.be.revertedWith("VoterRegistry: admin is zero");
    });

    it("stores the initial admin", async function () {
      const { registry, admin } = await deploy();
      expect(await registry.admin()).to.equal(admin.address);
    });
  });

  describe("registerVoter", function () {
    it("registers a voter, increments the count, and emits an event", async function () {
      const { registry, alice } = await deploy();
      const credential = hash("alice");

      await expect(registry.registerVoter(alice.address, credential))
        .to.emit(registry, "VoterRegistered")
        .withArgs(alice.address, credential);

      expect(await registry.isRegistered(alice.address)).to.equal(true);
      expect(await registry.credentialOf(alice.address)).to.equal(credential);
      expect(await registry.totalVoters()).to.equal(1n);
    });

    it("rejects callers other than the admin", async function () {
      const { registry, alice, mallory } = await deploy();
      await expect(
        registry.connect(mallory).registerVoter(alice.address, hash("x"))
      ).to.be.revertedWith("VoterRegistry: not admin");
    });

    it("rejects the zero address", async function () {
      const { registry } = await deploy();
      await expect(
        registry.registerVoter(ZERO, hash("x"))
      ).to.be.revertedWith("VoterRegistry: voter is zero");
    });

    it("rejects an empty credential hash", async function () {
      const { registry, alice } = await deploy();
      await expect(
        registry.registerVoter(alice.address, ZERO_HASH)
      ).to.be.revertedWith("VoterRegistry: empty credential");
    });

    it("rejects double registration", async function () {
      const { registry, alice } = await deploy();
      await registry.registerVoter(alice.address, hash("alice"));
      await expect(
        registry.registerVoter(alice.address, hash("alice-again"))
      ).to.be.revertedWith("VoterRegistry: already registered");
    });
  });

  describe("revokeVoter", function () {
    it("revokes a registered voter and emits an event", async function () {
      const { registry, alice } = await deploy();
      await registry.registerVoter(alice.address, hash("alice"));

      await expect(registry.revokeVoter(alice.address, "moved out"))
        .to.emit(registry, "VoterRevoked")
        .withArgs(alice.address, "moved out");

      expect(await registry.isRegistered(alice.address)).to.equal(false);
      expect(await registry.totalVoters()).to.equal(0n);
    });

    it("rejects callers other than the admin", async function () {
      const { registry, alice, mallory } = await deploy();
      await registry.registerVoter(alice.address, hash("alice"));
      await expect(
        registry.connect(mallory).revokeVoter(alice.address, "x")
      ).to.be.revertedWith("VoterRegistry: not admin");
    });

    it("rejects revoking an unregistered voter", async function () {
      const { registry, mallory } = await deploy();
      await expect(
        registry.revokeVoter(mallory.address, "x")
      ).to.be.revertedWith("VoterRegistry: not registered");
    });

    it("allows re-registration after revocation", async function () {
      const { registry, alice } = await deploy();
      await registry.registerVoter(alice.address, hash("alice"));
      await registry.revokeVoter(alice.address, "re-enroll");
      await expect(registry.registerVoter(alice.address, hash("alice-v2"))).not.to.be.reverted;
      expect(await registry.totalVoters()).to.equal(1n);
    });
  });

  describe("transferAdmin", function () {
    it("transfers admin and emits an event", async function () {
      const { registry, admin, alice } = await deploy();

      await expect(registry.transferAdmin(alice.address))
        .to.emit(registry, "AdminTransferred")
        .withArgs(admin.address, alice.address);

      expect(await registry.admin()).to.equal(alice.address);
    });

    it("rejects the zero address as new admin", async function () {
      const { registry } = await deploy();
      await expect(registry.transferAdmin(ZERO)).to.be.revertedWith("VoterRegistry: admin is zero");
    });

    it("rejects callers other than the current admin", async function () {
      const { registry, alice, mallory } = await deploy();
      await expect(
        registry.connect(mallory).transferAdmin(alice.address)
      ).to.be.revertedWith("VoterRegistry: not admin");
    });

    it("lets the new admin register voters", async function () {
      const { registry, alice, bob } = await deploy();
      await registry.transferAdmin(alice.address);
      await expect(
        registry.connect(alice).registerVoter(bob.address, hash("bob"))
      ).not.to.be.reverted;
    });
  });
});
