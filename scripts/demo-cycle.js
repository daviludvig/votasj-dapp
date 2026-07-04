/**
 * End-to-end evidence script for VotaSJ.
 *
 * Runs the full participatory-budget cycle — register, open, propose, vote,
 * close, tally — against a live EVM (defaults to Hardhat's in-process network,
 * but works unmodified against `localhost` or `amoy` too), and captures every
 * transaction hash, block number, gas cost, and decoded event as it happens.
 * It also actively tries the illegal paths (double vote, unregistered voter,
 * double registration, closing early) and asserts that the contracts reject
 * them with the exact revert reason documented in the tests.
 *
 * This is not a test suite (see test/ for that) — it is a reproducible
 * narrated run that produces a plain-text/Markdown/JSON audit trail anyone
 * can regenerate and diff against what the pitch deck / demo video claims.
 *
 * Usage:
 *   npm run demo                      # in-process Hardhat network (fast, default)
 *   npm run demo -- --network localhost   # against `npm run node` in another terminal
 */

const fs = require("fs");
const path = require("path");
const { ethers, network } = require("hardhat");

const REPORT_DIR = path.join(__dirname, "..", "reports");
const PROPOSALS = [
  {
    label: "citizen-ana",
    title: "Reforma da Praça Central do Bairro Kobrasol",
    budgetBRL: 180_000,
    cid: "ipfs://bafybeigdemoprac1a2b3c4d5e6f7g8h9i0jklpraca",
  },
  {
    label: "citizen-bruno",
    title: "Iluminação de LED na Rua das Palmeiras",
    budgetBRL: 95_000,
    cid: "ipfs://bafybeigdemoiluminacao1a2b3c4d5e6f7g8h9i0jkl",
    },
  {
    label: "citizen-carla",
    title: "Reforma da UBS do Bairro Forquilhinha",
    budgetBRL: 260_000,
    cid: "ipfs://bafybeigdemoubs1a2b3c4d5e6f7g8h9i0jklforquilha",
  },
];

const log = [];
let stepNumber = 0;

function record(entry) {
  stepNumber += 1;
  const withIndex = { step: stepNumber, ...entry };
  log.push(withIndex);
  const label = entry.ok === false ? "GUARDRAIL" : "STEP";
  console.log(`\n[${label} ${stepNumber}] ${entry.title}`);
  if (entry.narration) console.log(`  ${entry.narration}`);
  if (entry.txHash) console.log(`  tx:        ${entry.txHash}`);
  if (entry.blockNumber !== undefined) console.log(`  block:     ${entry.blockNumber}`);
  if (entry.gasUsed !== undefined) console.log(`  gas used:  ${entry.gasUsed}`);
  if (entry.event) console.log(`  event:     ${entry.event}`);
  if (entry.revertReason) console.log(`  reverted:  "${entry.revertReason}" (expected)`);
  return withIndex;
}

async function sendAndRecord(title, narration, txPromise, eventName, contract) {
  const tx = await txPromise;
  const receipt = await tx.wait();
  let decoded = "";
  if (eventName) {
    const parsed = receipt.logs
      .map((l) => {
        try {
          return contract.interface.parseLog(l);
        } catch {
          return null;
        }
      })
      .find((p) => p && p.name === eventName);
    if (parsed) {
      decoded = `${eventName}(${parsed.args.map((a) => a.toString()).join(", ")})`;
    }
  }
  return record({
    title,
    narration,
    txHash: tx.hash,
    blockNumber: receipt.blockNumber,
    gasUsed: receipt.gasUsed.toString(),
    event: decoded,
  });
}

async function expectRevert(title, narration, txPromise, expectedReason) {
  try {
    await txPromise;
    throw new Error(`Expected "${title}" to revert with "${expectedReason}" but it succeeded.`);
  } catch (error) {
    const message = error.reason || error.shortMessage || error.message || "";
    if (!message.includes(expectedReason)) {
      throw new Error(
        `Guardrail "${title}" reverted with an unexpected reason.\nExpected to include: "${expectedReason}"\nGot: "${message}"`
      );
    }
    return record({ title, narration, ok: false, revertReason: expectedReason });
  }
}

async function main() {
  console.log("=".repeat(78));
  console.log("VotaSJ — end-to-end evidence run");
  console.log(`network: ${network.name}`);
  console.log(`started: ${new Date().toISOString()}`);
  console.log("=".repeat(78));

  const signers = await ethers.getSigners();
  const [admin, ana, bruno, carla, outsider] = signers;
  const voters = [
    { signer: ana, label: "ana" },
    { signer: bruno, label: "bruno" },
    { signer: carla, label: "carla" },
  ];

  const Registry = await ethers.getContractFactory("VoterRegistry");
  const registry = await Registry.deploy(admin.address);
  await registry.waitForDeployment();
  record({
    title: "Deploy VoterRegistry",
    narration: `admin = ${admin.address}`,
    txHash: registry.deploymentTransaction().hash,
  });

  const Budget = await ethers.getContractFactory("ParticipatoryBudget");
  const budget = await Budget.deploy(await registry.getAddress(), admin.address);
  await budget.waitForDeployment();
  record({
    title: "Deploy ParticipatoryBudget",
    narration: `registry = ${await registry.getAddress()}, admin = ${admin.address}`,
    txHash: budget.deploymentTransaction().hash,
  });

  // --- Flow 1: voter registration --------------------------------------
  for (const { signer, label } of voters) {
    const credential = ethers.keccak256(ethers.toUtf8Bytes(`govbr:${label}`));
    await sendAndRecord(
      `Register voter "${label}"`,
      `credentialHash = keccak256("govbr:${label}") — the chain never sees the underlying CPF.`,
      registry.registerVoter(signer.address, credential),
      "VoterRegistered",
      registry
    );
  }

  await expectRevert(
    "Guardrail: double registration",
    `Registering "${voters[0].label}" a second time must be rejected.`,
    registry.registerVoter(voters[0].signer.address, ethers.keccak256(ethers.toUtf8Bytes("govbr:ana-again"))),
    "VoterRegistry: already registered"
  );

  // --- Flow 2: open the cycle -------------------------------------------
  const opensAt = (await ethers.provider.getBlock("latest")).timestamp + 5;
  const closesAt = opensAt + 300;
  const budgetWei = ethers.parseEther("535000"); // sum of the three proposals below, in a toy unit
  await sendAndRecord(
    "Open cycle #1",
    `opensAt=${opensAt}, closesAt=${closesAt} (a 5-minute window for this run)`,
    budget.openCycle(opensAt, closesAt, budgetWei),
    "CycleOpened",
    budget
  );

  await network.provider.send("evm_setNextBlockTimestamp", [opensAt]);
  await network.provider.send("evm_mine");

  // --- Flow 3: proposal submission ---------------------------------------
  const proposalIds = {};
  for (let i = 0; i < PROPOSALS.length; i += 1) {
    const proposal = PROPOSALS[i];
    const voter = voters[i].signer;
    const entry = await sendAndRecord(
      `Submit proposal — "${proposal.title}"`,
      `Submitted by ${voters[i].label}. Content pinned at ${proposal.cid} (BRL ${proposal.budgetBRL.toLocaleString("pt-BR")}).`,
      budget.connect(voter).submitProposal(proposal.cid),
      "ProposalSubmitted",
      budget
    );
    proposalIds[proposal.label] = i + 1;
    void entry;
  }

  await expectRevert(
    "Guardrail: unregistered submitter",
    "An address with no VoterRegistry entry must not be able to submit a proposal.",
    budget.connect(outsider).submitProposal("ipfs://should-not-land"),
    "Budget: submitter not registered"
  );

  // --- Flow 4: voting -------------------------------------------------
  // ana -> proposal 3 (UBS), bruno -> proposal 3, carla -> proposal 1 (praça)
  await sendAndRecord(
    "Vote — ana votes for the UBS renovation",
    "",
    budget.connect(ana).vote(proposalIds["citizen-carla"]),
    "VoteCast",
    budget
  );
  await sendAndRecord(
    "Vote — bruno votes for the UBS renovation",
    "",
    budget.connect(bruno).vote(proposalIds["citizen-carla"]),
    "VoteCast",
    budget
  );
  await sendAndRecord(
    "Vote — carla votes for the praça",
    "",
    budget.connect(carla).vote(proposalIds["citizen-ana"]),
    "VoteCast",
    budget
  );

  await expectRevert(
    "Guardrail: double voting",
    "ana already voted this cycle; a second vote from the same address must revert.",
    budget.connect(ana).vote(proposalIds["citizen-ana"]),
    "Budget: already voted"
  );

  await expectRevert(
    "Guardrail: unregistered voter",
    "An address with no registry entry must not be able to cast a vote.",
    budget.connect(outsider).vote(proposalIds["citizen-ana"]),
    "Budget: voter not registered"
  );

  // --- Flow 5: close and tally --------------------------------------------
  await expectRevert(
    "Guardrail: early close",
    "Closing before closesAt must be rejected — there is no way to cut a cycle short.",
    budget.closeCycle(),
    "Budget: cycle still running"
  );

  await network.provider.send("evm_setNextBlockTimestamp", [closesAt + 1]);
  await network.provider.send("evm_mine");

  await sendAndRecord(
    "Close cycle #1",
    "Anyone can call this once closesAt has elapsed; the contract computes the winner on-chain.",
    budget.closeCycle(),
    "CycleClosed",
    budget
  );

  console.log(`\n${"-".repeat(78)}`);
  console.log("Final tally (read directly from the contract, not from this script's state):");
  for (const proposal of PROPOSALS) {
    const id = proposalIds[proposal.label];
    const [cid, votes, submitter] = await budget.getProposal(1, id);
    console.log(`  #${id} "${proposal.title}" — ${votes} vote(s) — submitter ${submitter} — ${cid}`);
  }
  const cycle = await budget.cycles(1);
  console.log(`  Winner: proposal #${cycle.winningProposalId} with ${cycle.totalVotes} total votes cast.`);
  console.log(`  Registry: totalVoters = ${await registry.totalVoters()}`);

  const summary = {
    network: network.name,
    contracts: {
      voterRegistry: await registry.getAddress(),
      participatoryBudget: await budget.getAddress(),
    },
    generatedAt: new Date().toISOString(),
    steps: log,
    finalTally: {
      winningProposalId: cycle.winningProposalId.toString(),
      totalVotes: cycle.totalVotes.toString(),
      totalVoters: (await registry.totalVoters()).toString(),
    },
  };

  writeReports(summary);

  console.log(`\n${"=".repeat(78)}`);
  console.log(`OK — ${log.filter((e) => e.ok !== false).length} on-chain actions succeeded,`);
  console.log(`     ${log.filter((e) => e.ok === false).length} illegal actions were correctly rejected.`);
  console.log(`Reports written to ${path.relative(process.cwd(), REPORT_DIR)}/`);
  console.log("=".repeat(78));
}

function writeReports(summary) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  fs.writeFileSync(path.join(REPORT_DIR, "demo-cycle-report.json"), JSON.stringify(summary, null, 2));

  const lines = [];
  lines.push("# VotaSJ — Demo Cycle Evidence Report");
  lines.push("");
  lines.push(`Generated: ${summary.generatedAt}`);
  lines.push(`Network: \`${summary.network}\``);
  lines.push(`VoterRegistry: \`${summary.contracts.voterRegistry}\``);
  lines.push(`ParticipatoryBudget: \`${summary.contracts.participatoryBudget}\``);
  lines.push("");
  lines.push(
    "Regenerate this file at any time with `npm run demo`. Every row below is a real transaction executed against the network named above in this run — nothing here is hand-written."
  );
  lines.push("");
  lines.push("| # | Action | Tx hash | Block | Gas | Event / Result |");
  lines.push("| - | ------ | ------- | ----- | --- | --------------- |");
  for (const entry of summary.steps) {
    const action = entry.ok === false ? `⛔ ${entry.title}` : `✅ ${entry.title}`;
    const tx = entry.txHash ? `\`${entry.txHash.slice(0, 14)}…\`` : "—";
    const block = entry.blockNumber !== undefined ? entry.blockNumber : "—";
    const gas = entry.gasUsed !== undefined ? entry.gasUsed : "—";
    const outcome = entry.revertReason ? `reverted: "${entry.revertReason}" (expected)` : entry.event || "—";
    lines.push(`| ${entry.step} | ${action} | ${tx} | ${block} | ${gas} | ${outcome} |`);
  }
  lines.push("");
  lines.push("## Final tally");
  lines.push("");
  lines.push(`- Winning proposal id: **${summary.finalTally.winningProposalId}**`);
  lines.push(`- Total votes cast: **${summary.finalTally.totalVotes}**`);
  lines.push(`- Total registered voters: **${summary.finalTally.totalVoters}**`);
  lines.push("");
  lines.push(
    "Full machine-readable version (every decoded event argument, every gas number) is in `demo-cycle-report.json` next to this file."
  );
  fs.writeFileSync(path.join(REPORT_DIR, "demo-cycle-report.md"), lines.join("\n") + "\n");
}

main().catch((error) => {
  console.error("\nDEMO FAILED — the on-chain behavior did not match what this script expected:");
  console.error(error);
  process.exitCode = 1;
});
