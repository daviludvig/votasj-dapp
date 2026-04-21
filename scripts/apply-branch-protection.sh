#!/usr/bin/env bash
# Applies branch-protection rules to `main` using the GitHub REST API.
# Idempotent — re-running just overwrites the rule set.
#
# Usage:
#   ./scripts/apply-branch-protection.sh <owner>/<repo>
#
# Requires `gh` authenticated with admin scope on the repository.

set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "usage: $0 <owner>/<repo>" >&2
  exit 1
fi

repo="$1"
branch="main"

if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI not found. Install from https://cli.github.com/" >&2
  exit 1
fi

echo "[branch-protection] applying rules to ${repo}@${branch}..."

gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  "/repos/${repo}/branches/${branch}/protection" \
  --input - <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["Lint", "Test", "Coverage"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false
  },
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_conversation_resolution": true,
  "lock_branch": false,
  "allow_fork_syncing": true
}
JSON

echo "[branch-protection] enabling auto-delete of merged branches..."
gh api \
  --method PATCH \
  -H "Accept: application/vnd.github+json" \
  "/repos/${repo}" \
  -F delete_branch_on_merge=true \
  -F allow_merge_commit=false \
  -F allow_rebase_merge=false \
  -F allow_squash_merge=true >/dev/null

echo "[branch-protection] done."
