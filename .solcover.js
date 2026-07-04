module.exports = {
  // Adds json-summary to solidity-coverage's default reporter list so CI can
  // read a single per-metric percentage (coverage/coverage-summary.json) to
  // generate the dynamic coverage badge — see scripts/generate-coverage-badge.js.
  istanbulReporter: ["html", "lcov", "text", "json", "json-summary"],
};
