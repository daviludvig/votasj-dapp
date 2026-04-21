const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const Registry = await ethers.getContractFactory("VoterRegistry");
  const registry = await Registry.deploy(deployer.address);
  await registry.waitForDeployment();
  console.log("VoterRegistry:", await registry.getAddress());

  const Budget = await ethers.getContractFactory("ParticipatoryBudget");
  const budget = await Budget.deploy(await registry.getAddress(), deployer.address);
  await budget.waitForDeployment();
  console.log("ParticipatoryBudget:", await budget.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
