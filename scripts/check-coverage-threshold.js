/**
 * Turns the coverage badge from a report into a gate: fails (non-zero exit)
 * if any of statements/branches/functions/lines falls below the threshold.
 * The badge script (generate-coverage-badge.js) only *reports* the number;
 * this is what makes CI actually enforce it instead of just displaying it.
 *
 * Usage: npm run coverage && node scripts/check-coverage-threshold.js [threshold]
 * Default threshold: 100.
 */

const fs = require("fs");
const path = require("path");

const SUMMARY_PATH = path.join(__dirname, "..", "coverage", "coverage-summary.json");
const threshold = Number(process.argv[2] || process.env.VOTASJ_COVERAGE_THRESHOLD || 100);

function main() {
  if (!fs.existsSync(SUMMARY_PATH)) {
    console.error(`Missing ${path.relative(process.cwd(), SUMMARY_PATH)}. Run "npm run coverage" first.`);
    process.exitCode = 1;
    return;
  }

  const summary = JSON.parse(fs.readFileSync(SUMMARY_PATH, "utf8"));
  const total = summary.total;
  const categories = ["statements", "branches", "functions", "lines"];

  console.log(`Coverage threshold: ${threshold}%`);
  let failed = false;
  for (const category of categories) {
    const pct = total[category].pct;
    const status = pct >= threshold ? "OK" : "BELOW THRESHOLD";
    console.log(`  ${category.padEnd(12)} ${pct}%  [${status}]`);
    if (pct < threshold) failed = true;
  }

  if (failed) {
    console.error(`\nCoverage dropped below ${threshold}%. This is a hard gate, not a suggestion — add tests before merging.`);
    process.exitCode = 1;
  } else {
    console.log("\nAll categories meet the threshold.");
  }
}

main();
