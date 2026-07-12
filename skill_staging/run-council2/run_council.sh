#!/usr/bin/env bash
# run_council.sh — convene the agents-council (two-member or full roster).
#
# All run discipline (cwd, absolute deliberations pinning, stale-dist guard, per-seat
# roster preflight) lives in the sourced run-council-common.sh. This wrapper only maps
# the mode to a roster and drives the C1 `council solve` CLI. Backgrounding is safe:
# the transcript path is pinned to an absolute dir, so a detached run keeps it.
#
# Verdict is in the saved deliberations/*.json, not the exit code — only a `blocked`
# outcome exits non-zero; ratified / ratified_with_edits / not_attempted exit 0.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../run-council-common.sh
source "$SCRIPT_DIR/../run-council-common.sh"

usage() {
  cat >&2 <<'EOF'
Usage:
  run_council.sh two  "<prompt...>"      # default roster: Opus 4.8 + GPT-5.5 (xhigh)
  run_council.sh full "<prompt...>"      # 5-model roster (needs OPENROUTER_API_KEY + gemini CLI)
  run_council.sh two|full --file PATH    # read the prompt from a file (passed straight to --file)
  run_council.sh check [two|full]        # preflight only: validate + print, do NOT run
EOF
}

mode="${1:-}"
shift || true
[[ -n "$mode" ]] || {
  usage
  exit 2
}

checkonly=0
if [[ "$mode" == "check" ]]; then
  checkonly=1
  mode="${1:-two}"
  shift || true
fi

case "$mode" in
  two) roster="claude,chatgpt" ;;
  full) roster="claude,chatgpt,kimi,deepseek,gemini" ;;
  *)
    echo "ERROR: roster must be 'two' or 'full' (got '$mode')" >&2
    usage
    exit 2
    ;;
esac

council_enter
council_resolve_runner
council_preflight_roster "$roster" 0

echo ">>> roster=$mode ($roster)  runner=$RUNNER  cwd=$PWD  deliberations=$AGENTS_COUNCIL_DELIBERATIONS_DIR" >&2

if [[ "$checkonly" == 1 ]]; then
  if [[ "$PREFLIGHT_PROBLEMS" == 0 ]]; then
    echo ">>> preflight OK — ready to run." >&2
  else
    echo ">>> preflight FAILED ($PREFLIGHT_PROBLEMS unmet; see above)." >&2
  fi
  exit "$PREFLIGHT_PROBLEMS"
fi
[[ "$PREFLIGHT_PROBLEMS" == 0 ]] || {
  echo "ERROR: preflight failed; fix the above before running." >&2
  exit 1
}

# Pin the roster explicitly. `two` MUST set claude,chatgpt — unsetting the env and
# trusting the engine default is a trap: the default silently became a 3-member panel
# (incl. gemini) on 2026-06-09, and any rebuild re-arms it.
export AGENTS_COUNCIL_MEMBERS="$roster"

echo ">>> convening… multi-round, multi-model; expect several minutes. Backgrounding is safe — transcripts land in $AGENTS_COUNCIL_DELIBERATIONS_DIR." >&2

# --- prompt: --file passes straight through to C1 (never cat into argv); else argv ---
if [[ "${1:-}" == "--file" ]]; then
  [[ -r "${2:-}" ]] || {
    echo "ERROR: --file needs a readable path (got '${2:-}')" >&2
    exit 2
  }
  # shellcheck disable=SC2086
  exec $RUNNER solve --file "$2"
else
  prompt="$*"
  [[ -n "${prompt//[[:space:]]/}" ]] || {
    echo "ERROR: empty prompt" >&2
    usage
    exit 2
  }
  # shellcheck disable=SC2086
  exec $RUNNER solve "$prompt"
fi
