# Contributing to VotaSJ

Thanks for contributing. This document specifies the branching model, commit conventions, and the workflow required to merge code into `main`.

## Branching model

We use trunk-based development with short-lived feature branches. There is **no `dev` branch**. `main` is the only long-lived branch and is always deployable.

```text
main ─────●────────●────────●────────●─────>
           \        \        \        \
            feat/x   fix/y    ci/z     docs/w
```

Rules:

- **Never push directly to `main`.** Every change lands via a Pull Request.
- **One feature per branch.** Branches are short-lived (hours to a few days). If a branch gets stale, rebase it on `main` before merging.
- **Delete branches after merge.** Enabled automatically by the GitHub setting in [`scripts/apply-branch-protection.sh`](scripts/apply-branch-protection.sh).

### Branch naming

```text
<type>/<short-kebab-description>
```

Allowed types (match the commit types below):

| Prefix | Use for |
| ------ | ------- |
| `feat/` | New functionality |
| `fix/`  | Bug fix |
| `refactor/` | Behavior-preserving code change |
| `test/` | New or updated tests |
| `docs/` | Documentation only |
| `chore/` | Tooling, dependencies, meta-work |
| `ci/` | Changes to the CI pipeline |

Examples: `feat/zk-eligibility-proof`, `fix/vote-deadline-boundary`, `ci/coverage-threshold`.

## Commit messages

```text
<type>: <imperative, lowercase, <= 72 chars>

Optional body explaining the *why* (not the *what*). Wrap at ~72 cols.
Reference issues/PRs as "Closes #12" or "Relates to #7".

Co-Authored-By: ...
```

Types are the same as branch prefixes. Keep commits atomic — one logical change per commit. Never amend or force-push commits already merged into `main`.

## Pull request workflow

1. Create a branch off the latest `main`:

   ```bash
   git fetch origin
   git checkout -b feat/my-thing origin/main
   ```

2. Make your changes. Run the local checks before pushing:

   ```bash
   npm test
   npm run lint
   npm run coverage   # optional but encouraged
   ```

3. Push the branch and open a PR against `main`:

   ```bash
   git push -u origin feat/my-thing
   gh pr create --base main --fill
   ```

   The PR template ([`.github/pull_request_template.md`](.github/pull_request_template.md)) will be applied automatically.

4. Wait for CI ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) to pass — lint, test, and coverage must all be green.

5. Request at least one review. Address feedback as additional commits (don't force-push during review — makes review harder).

6. Merge with **Squash and merge**. The resulting commit on `main` should follow the commit-message convention above. Delete the feature branch.

## Enabling the local pre-push hook

The repository ships a `pre-push` hook in [`.githooks/`](.githooks/) that refuses direct pushes to `main`. It is opt-in to avoid modifying your git config without consent. Activate it once per clone:

```bash
git config core.hooksPath .githooks
```

After that, `git push origin main` from your local `main` branch will be blocked; you must push a feature branch and open a PR.

## Applying GitHub branch protection (maintainer, one-time)

After the remote is created, a repository admin runs:

```bash
./scripts/apply-branch-protection.sh <owner>/<repo>
```

This uses `gh api` to configure the `main` branch with:

- Required PR review (1 approval).
- Required passing status checks: `lint`, `test`, `coverage`.
- Linear history enforced (squash merges only).
- Force-push and deletion disabled.
- Automatic deletion of merged branches.

See the script for the exact API payload. Re-run safely — it is idempotent.

## Local setup recap

```bash
nvm use 20
npm install
git config core.hooksPath .githooks   # once per clone
npm test
```
