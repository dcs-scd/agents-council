#!/usr/bin/env bash
# run_council4.sh — convene the 4-member direct-vendor agents-council (large-brief capable).
#
# Roster (fixed): claude,chatgpt,kimi,deepseek — NO gemini. AGENTS_COUNCIL_DIRECT_VENDOR_KEYS=1
# routes kimi->Moonshot and deepseek->DeepSeek direct APIs (measured ~2x faster for Kimi than
# OpenRouter's Novita routing). The prompt reaches the engine through the C1 `council solve
# --file` CLI — no argv/MAX_ARG_STRLEN limit — so the retired deep-import driver is gone.
#
# All shared run discipline (cwd, absolute deliberations pinning, stale-dist guard, per-seat
# preflight) lives in the sourced run-council-common.sh. Backgrounding is safe: the transcript
# path is pinned to an absolute dir. Verdict is in the saved deliberations/*.json, not the exit
# code — only `blocked` exits non-zero.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../run-council-common.sh
source "$SCRIPT_DIR/../run-council-common.sh"

ROSTER="claude,chatgpt,kimi,deepseek"

usage() {
  cat >&2 <<'EOF'
Usage:
  run_council4.sh check                 # preflight only: validate auth + API keys, do NOT run
  run_council4.sh run --file PATH       # convene on the prompt read from PATH (preferred — large briefs)
  run_council4.sh run "<prompt...>"     # convene on an inline prompt (small prompts only)
EOF
}

mode="${1:-}"
shift || true
[[ -n "$mode" ]] || {
  usage
  exit 2
}
case "$mode" in
  check | run) ;;
  *)
    echo "ERROR: first arg must be 'check' or 'run' (got '$mode')" >&2
    usage
    exit 2
    ;;
esac

command -v bun >/dev/null 2>&1 || {
  echo "ERROR: 'bun' not on PATH" >&2
  exit 1
}

council_enter
council_resolve_runner
council_preflight_roster "$ROSTER" 1

[[ -n "${AGENTS_COUNCIL_MAX_ROUNDS:-}" ]] && echo ">>> AGENTS_COUNCIL_MAX_ROUNDS=$AGENTS_COUNCIL_MAX_ROUNDS (default 6 when unset)" >&2
echo ">>> roster=four ($ROSTER)  direct-vendor=on  runner=$RUNNER  cwd=$PWD  deliberations=$AGENTS_COUNCIL_DELIBERATIONS_DIR" >&2

if [[ "$mode" == "check" ]]; then
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

export AGENTS_COUNCIL_MEMBERS="$ROSTER"
export AGENTS_COUNCIL_DIRECT_VENDOR_KEYS=1

# --- resolve prompt to a FILE (never argv) and pass it straight to the C1 CLI ---
cleanup_tmp=""
trap '[[ -n "$cleanup_tmp" ]] && rm -f "$cleanup_tmp"' EXIT
if [[ "${1:-}" == "--file" ]]; then
  promptfile="${2:-}"
  [[ -r "$promptfile" ]] || {
    echo "ERROR: --file needs a readable path (got '${2:-}')" >&2
    exit 2
  }
else
  [[ -n "${*//[[:space:]]/}" ]] || {
    echo "ERROR: empty prompt" >&2
    usage
    exit 2
  }
  promptfile="$(mktemp /tmp/run_council4_prompt.XXXXXX)"
  cleanup_tmp="$promptfile"
  printf '%s' "$*" >"$promptfile"
fi

echo ">>> convening 4-member direct-vendor council… multi-round, multi-model; expect several minutes (the reasoning members are the long pole). Backgrounding is safe — transcripts land in $AGENTS_COUNCIL_DELIBERATIONS_DIR." >&2

# Not `exec` — run in this shell so the EXIT trap cleans up the temp prompt file, then
# propagate the CLI's exit code.
rc=0
# shellcheck disable=SC2086
$RUNNER solve --file "$promptfile" || rc=$?
exit "$rc"
