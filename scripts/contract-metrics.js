/**
 * Structural metrics for every contract in contracts/: lines of code, function
 * inventory, a heuristic cyclomatic-complexity score per function, and deployed
 * bytecode size against the EIP-170 24576-byte limit.
 *
 * This complements scripts/demo-cycle.js (behavioral evidence — "it runs
 * correctly") with structural evidence — "it is small and simple enough to
 * audit". Nothing here requires a network or a deployment; it only reads the
 * Solidity source and the compiled artifacts.
 *
 * Complexity methodology (documented here because "cyclomatic complexity" means
 * slightly different things to different tools): each function starts at 1,
 * plus 1 for every `if` (else-if chains count once per `if`, since each is a
 * nested IfStatement), `for`, `while`, `do/while`, ternary (`?:`), `&&`/`||`
 * short-circuit operator, and `require`/`assert` call. Counting `require` is a
 * deliberate choice for a contract whose entire job is enforcing guard
 * conditions — it is the metric a security reviewer actually cares about here.
 *
 * Usage: npm run metrics   (runs `hardhat compile` first via the npm script)
 */

const fs = require("fs");
const path = require("path");
const parser = require("@solidity-parser/parser");

const CONTRACTS_DIR = path.join(__dirname, "..", "contracts");
const ARTIFACTS_DIR = path.join(__dirname, "..", "artifacts", "contracts");
const REPORT_DIR = path.join(__dirname, "..", "reports");
const BYTECODE_LIMIT = 24576; // EIP-170

function countLoc(source) {
  const lines = source.split(/\r?\n/);
  let code = 0;
  let blank = 0;
  let comment = 0;
  let inBlockComment = false;
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line === "") {
      blank += 1;
      continue;
    }
    if (inBlockComment) {
      comment += 1;
      if (line.includes("*/")) inBlockComment = false;
      continue;
    }
    if (line.startsWith("//")) {
      comment += 1;
      continue;
    }
    if (line.startsWith("/*")) {
      comment += 1;
      if (!line.includes("*/")) inBlockComment = true;
      continue;
    }
    code += 1;
  }
  return { total: lines.length, code, blank, comment };
}

// Generic recursive walk — the parser's AST is plain nested objects/arrays,
// so we don't need per-node-type knowledge of children to traverse it.
function walk(node, visitor) {
  if (Array.isArray(node)) {
    for (const item of node) walk(item, visitor);
    return;
  }
  if (!node || typeof node !== "object") return;
  if (node.type) visitor(node);
  for (const key of Object.keys(node)) {
    if (key === "type") continue;
    walk(node[key], visitor);
  }
}

function complexityOf(functionBodyNode) {
  let score = 1;
  const breakdown = { if: 0, loop: 0, ternary: 0, logical: 0, require: 0 };
  walk(functionBodyNode, (node) => {
    if (node.type === "IfStatement") {
      score += 1;
      breakdown.if += 1;
    } else if (node.type === "ForStatement" || node.type === "WhileStatement" || node.type === "DoWhileStatement") {
      score += 1;
      breakdown.loop += 1;
    } else if (node.type === "Conditional") {
      score += 1;
      breakdown.ternary += 1;
    } else if (node.type === "BinaryOperation" && (node.operator === "&&" || node.operator === "||")) {
      score += 1;
      breakdown.logical += 1;
    } else if (
      node.type === "FunctionCall" &&
      node.expression &&
      node.expression.type === "Identifier" &&
      (node.expression.name === "require" || node.expression.name === "assert")
    ) {
      score += 1;
      breakdown.require += 1;
    }
  });
  return { score, breakdown };
}

function analyzeContractFile(fileName) {
  const filePath = path.join(CONTRACTS_DIR, fileName);
  const source = fs.readFileSync(filePath, "utf8");
  const loc = countLoc(source);
  const ast = parser.parse(source, { loc: false, tolerant: false });

  const contracts = [];
  walk(ast, (node) => {
    if (node.type !== "ContractDefinition") return;

    const functions = [];
    const stateVariables = [];
    const events = [];
    const modifiers = [];

    for (const sub of node.subNodes) {
      if (sub.type === "FunctionDefinition") {
        const name = sub.name || (sub.isConstructor ? "constructor" : "<fallback/receive>");
        const { score, breakdown } = complexityOf(sub.body);
        functions.push({
          name,
          visibility: sub.visibility,
          stateMutability: sub.stateMutability || "nonpayable",
          isConstructor: !!sub.isConstructor,
          parameterCount: (sub.parameters || []).length,
          complexity: score,
          complexityBreakdown: breakdown,
        });
      } else if (sub.type === "StateVariableDeclaration") {
        for (const v of sub.variables) stateVariables.push(v.name);
      } else if (sub.type === "EventDefinition") {
        events.push(sub.name);
      } else if (sub.type === "ModifierDefinition") {
        modifiers.push(sub.name);
      }
    }

    contracts.push({
      name: node.name,
      kind: node.kind,
      functions,
      stateVariables,
      events,
      modifiers,
    });
  });

  return { fileName, loc, contracts };
}

function readBytecodeSize(contractName, fileName) {
  const artifactPath = path.join(ARTIFACTS_DIR, fileName, `${contractName}.json`);
  if (!fs.existsSync(artifactPath)) {
    return null;
  }
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const hex = (artifact.deployedBytecode || "0x").slice(2);
  const bytes = hex.length / 2;
  return bytes;
}

function main() {
  if (!fs.existsSync(ARTIFACTS_DIR)) {
    console.error('No compiled artifacts found. Run "npm run build" (or let "npm run metrics" do it) first.');
    process.exitCode = 1;
    return;
  }

  const solFiles = fs.readdirSync(CONTRACTS_DIR).filter((f) => f.endsWith(".sol"));
  const report = { generatedAt: new Date().toISOString(), files: [] };

  console.log("=".repeat(78));
  console.log("VotaSJ — contract structural metrics");
  console.log("=".repeat(78));

  for (const fileName of solFiles) {
    const analysis = analyzeContractFile(fileName);

    for (const contract of analysis.contracts) {
      const bytecodeBytes = readBytecodeSize(contract.name, fileName);
      const pctOfLimit = bytecodeBytes !== null ? ((bytecodeBytes / BYTECODE_LIMIT) * 100).toFixed(1) : null;
      const complexities = contract.functions.map((f) => f.complexity);
      const maxComplexity = complexities.length ? Math.max(...complexities) : 0;
      const avgComplexity = complexities.length
        ? (complexities.reduce((a, b) => a + b, 0) / complexities.length).toFixed(1)
        : "0.0";
      const mostComplex = contract.functions.find((f) => f.complexity === maxComplexity);

      console.log(`\n${fileName} :: ${contract.name}`);
      console.log(`  lines of code (non-blank, non-comment): ${analysis.loc.code} / ${analysis.loc.total} total`);
      console.log(`  functions: ${contract.functions.length}  events: ${contract.events.length}  modifiers: ${contract.modifiers.length}  state vars: ${contract.stateVariables.length}`);
      console.log(`  complexity — avg: ${avgComplexity}, max: ${maxComplexity} (${mostComplex ? mostComplex.name : "n/a"})`);
      if (bytecodeBytes !== null) {
        console.log(`  deployed bytecode: ${bytecodeBytes} bytes (${pctOfLimit}% of the ${BYTECODE_LIMIT}-byte EIP-170 limit)`);
      }

      report.files.push({
        fileName,
        contractName: contract.name,
        loc: analysis.loc,
        functions: contract.functions,
        events: contract.events,
        modifiers: contract.modifiers,
        stateVariables: contract.stateVariables,
        bytecodeBytes,
        bytecodeLimit: BYTECODE_LIMIT,
        bytecodePctOfLimit: pctOfLimit,
        complexity: { avg: Number(avgComplexity), max: maxComplexity, maxFunction: mostComplex ? mostComplex.name : null },
      });
    }
  }

  writeReports(report);

  console.log(`\n${"=".repeat(78)}`);
  console.log(`Reports written to ${path.relative(process.cwd(), REPORT_DIR)}/`);
  console.log("=".repeat(78));
}

function writeReports(report) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  fs.writeFileSync(path.join(REPORT_DIR, "contract-metrics.json"), JSON.stringify(report, null, 2));

  const lines = [];
  lines.push("# VotaSJ — Contract Structural Metrics");
  lines.push("");
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push("");
  lines.push("Regenerate at any time with `npm run metrics`. Methodology for the complexity column is documented at the top of `scripts/contract-metrics.js` — briefly: 1 (base path) + 1 per `if` / loop / ternary / `&&`|`||` / `require`|`assert`.");
  lines.push("");
  lines.push("| Contract | LOC (code) | Functions | Events | Modifiers | State vars | Avg complexity | Max complexity | Bytecode | % of 24KB limit |");
  lines.push("| -------- | ---------- | --------- | ------ | --------- | ---------- | --------------- | --------------- | -------- | ---------------- |");
  for (const f of report.files) {
    const bytecode = f.bytecodeBytes !== null ? `${f.bytecodeBytes} B` : "—";
    const pct = f.bytecodePctOfLimit !== null ? `${f.bytecodePctOfLimit}%` : "—";
    lines.push(
      `| ${f.contractName} | ${f.loc.code} | ${f.functions.length} | ${f.events.length} | ${f.modifiers.length} | ${f.stateVariables.length} | ${f.complexity.avg} | ${f.complexity.max} (${f.complexity.maxFunction}) | ${bytecode} | ${pct} |`
    );
  }
  lines.push("");
  lines.push("## Per-function complexity");
  lines.push("");
  for (const f of report.files) {
    lines.push(`### ${f.contractName}`);
    lines.push("");
    lines.push("| Function | Visibility | Complexity | if | loop | ternary | &&/\\|\\| | require/assert |");
    lines.push("| -------- | ---------- | ---------- | -- | ---- | ------- | ------- | -------------- |");
    for (const fn of f.functions) {
      const b = fn.complexityBreakdown;
      lines.push(
        `| ${fn.name} | ${fn.visibility} | ${fn.complexity} | ${b.if} | ${b.loop} | ${b.ternary} | ${b.logical} | ${b.require} |`
      );
    }
    lines.push("");
  }
  lines.push(
    "Full machine-readable version is in `contract-metrics.json` next to this file."
  );
  fs.writeFileSync(path.join(REPORT_DIR, "contract-metrics.md"), lines.join("\n") + "\n");
}

main();
