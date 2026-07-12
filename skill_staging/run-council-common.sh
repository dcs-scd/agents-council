#!/usr/bin/env bash
# run-council-common.sh — shared run discipline for run-council2 and run-council4.
#
# SOURCED (never executed) by both wrappers. It factors out the discipline the bare
# `council solve` invocation gets wrong, so the two skills stay behaviorally identical
# where they must and differ only in roster:
#
#   * council_enter            cd into the council repo AND pin
#                              AGENTS_COUNCIL_DELIBERATIONS_DIR to an ABSOLUTE path, so
#                              transcripts land under the repo even when the run is
#                              backgrounded. (Kills the historical EACCES-on-detach:
#                              deliberations/ used to be written cwd-relative, so a
#                              detached run wrote to /deliberations and lost the file.)
#   * council_resolve_runner   Stale-dist guard: prefer ./dist/council, but fall back
#                              to bun-from-source — with a LOUD stderr warning naming
#                              both mtimes — when dist is OLDER than the newest file
#                              under src/. (dist was once ~5 weeks stale and silently
#                              preferred, running long-dead code.)
#   * council_preflight_roster Validate EVERY seat in the resolved roster (claude /
#                              codex / gemini CLIs + gemini auth, plus the OpenRouter /
#                              Moonshot / DeepSeek keys the direct-vendor mode dictates)
#                              — not just claude+codex.
#
# Verdict is NOT the exit code beyond the blocked hard-stop: read consensus.outcome +
# ratifiedBy/blockedBy from the saved deliberations/*.json. Never logs secrets — the
# key checks test presence only, never a value.

COUNCIL_DIR="/home/dstefanescu/other_systems/o4/agents-council"

# cd into the council repo and pin the deliberations dir to an absolute path. Call
# this before council_resolve_runner (which uses relative src/ and dist/ paths).
council_enter() {
  [[ -d "$COUNCIL_DIR" ]] || {
    echo "ERROR: council dir not found: $COUNCIL_DIR" >&2
    exit 1
  }
  cd "$COUNCIL_DIR" || {
    echo "ERROR: cannot cd into $COUNCIL_DIR" >&2
    exit 1
  }
  export AGENTS_COUNCIL_DELIBERATIONS_DIR="$COUNCIL_DIR/deliberations"
}

# Resolve $RUNNER: the compiled ./dist/council when it is at least as new as every
# file under src/, else bun-from-source. Warns loudly (naming both mtimes) when it
# rejects a stale dist. Must be called after council_enter (needs cwd = council dir).
council_resolve_runner() {
  RUNNER="bun src/cli/index.ts"
  [[ -x dist/council ]] || return 0
  local newer
  newer="$(find src -type f -newer dist/council -print -quit 2>/dev/null || true)"
  if [[ -n "$newer" ]]; then
    local dist_mtime src_mtime
    dist_mtime="$(stat -c '%y' dist/council 2>/dev/null || echo '?')"
    src_mtime="$(stat -c '%y' "$newer" 2>/dev/null || echo '?')"
    echo "WARNING: ignoring STALE dist/council — a source file is newer; using bun-from-source." >&2
    echo "  dist/council mtime : $dist_mtime" >&2
    echo "  newer source file  : $newer ($src_mtime)" >&2
    return 0
  fi
  RUNNER="./dist/council"
}

# Require a command on PATH; increments PREFLIGHT_PROBLEMS on a miss.
_council_need_cmd() {
  local cmd="$1" why="$2"
  command -v "$cmd" >/dev/null 2>&1 || {
    echo "MISSING: '$cmd' not on PATH ($why)" >&2
    PREFLIGHT_PROBLEMS=$((PREFLIGHT_PROBLEMS + 1))
  }
}

# Require an API-key env var to be set (presence only — value is never printed).
# Deduplicates repeated keys (OpenRouter is shared by kimi+deepseek).
_council_need_key() {
  local var="$1" why="$2"
  case " $_council_keys_seen " in *" $var "*) return 0 ;; esac
  _council_keys_seen="$_council_keys_seen $var"
  if [[ -z "${!var:-}" ]]; then
    echo "MISSING: $var ($why)" >&2
    PREFLIGHT_PROBLEMS=$((PREFLIGHT_PROBLEMS + 1))
  fi
}

# Gemini auth heuristic: the official @google/gemini-cli authenticates either via
# `gemini auth login` (creds under ~/.gemini) or a Google API-key env. Absence of
# both is reported as a problem, but flagged advisory since creds can live elsewhere.
_council_check_gemini_auth() {
  if [[ -n "${GEMINI_API_KEY:-}${GOOGLE_API_KEY:-}${GOOGLE_GENAI_API_KEY:-}" ]] || [[ -d "$HOME/.gemini" ]]; then
    return 0
  fi
  echo "MISSING: Gemini auth — no ~/.gemini creds dir and no GEMINI_API_KEY/GOOGLE_API_KEY set." >&2
  echo "  (advisory) run 'gemini auth login' once, or export GEMINI_API_KEY; ignore if your creds live elsewhere." >&2
  PREFLIGHT_PROBLEMS=$((PREFLIGHT_PROBLEMS + 1))
}

# council_preflight_roster "<csv roster>" <direct_vendor 0|1>
# Sets PREFLIGHT_PROBLEMS to the count of unmet prerequisites (0 = ready to run).
council_preflight_roster() {
  local roster="$1" direct_vendor="${2:-0}"
  PREFLIGHT_PROBLEMS=0
  _council_keys_seen=""
  local seat
  local _seats=()
  IFS=',' read -ra _seats <<<"$roster" || true
  for seat in "${_seats[@]}"; do
    seat="${seat//[[:space:]]/}"
    case "$seat" in
      claude) _council_need_cmd claude "Opus member; run 'claude' once to authenticate" ;;
      chatgpt) _council_need_cmd codex "GPT member; run 'codex login'" ;;
      gemini)
        _council_need_cmd gemini "Gemini member; npm install -g @google/gemini-cli"
        _council_check_gemini_auth
        ;;
      kimi)
        if [[ "$direct_vendor" == 1 ]]; then
          _council_need_key MOONSHOT_API_KEY "kimi via direct Moonshot API"
        else
          _council_need_key OPENROUTER_API_KEY "kimi via OpenRouter"
        fi
        ;;
      deepseek)
        if [[ "$direct_vendor" == 1 ]]; then
          _council_need_key DEEPSEEK_API_KEY "deepseek via direct DeepSeek API"
        else
          _council_need_key OPENROUTER_API_KEY "deepseek via OpenRouter"
        fi
        ;;
      *) echo "WARNING: unknown seat '$seat' in roster — skipping its preflight" >&2 ;;
    esac
  done
}
