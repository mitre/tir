#!/usr/bin/env bash
# Creates the two GitHub environments the deploy workflow uses on any repository.
# Needs repository admin. Reviewers are GitHub user logins or org teams as org/team-slug.
# Usage: setup-environments.sh <owner/repo> <reviewer> [reviewer...]
set -euo pipefail
repo=${1:?owner/repo}
shift
[ $# -gt 0 ] || { echo "at least one reviewer is required" >&2; exit 1; }

reviewers='[]'
for r in "$@"; do
  if [[ $r == */* ]]; then
    id=$(gh api "orgs/${r%%/*}/teams/${r##*/}" --jq .id)
    reviewers=$(jq -c --argjson id "$id" '. + [{type: "Team", id: $id}]' <<< "$reviewers")
  else
    id=$(gh api "users/$r" --jq .id)
    reviewers=$(jq -c --argjson id "$id" '. + [{type: "User", id: $id}]' <<< "$reviewers")
  fi
done

gh api -X PUT "repos/$repo/environments/review" --jq '"created \(.name)"'
gh api -X PUT "repos/$repo/environments/review-external" \
  --input <(jq -n --argjson reviewers "$reviewers" '{reviewers: $reviewers, prevent_self_review: false}') \
  --jq '"created \(.name) with \(.protection_rules | map(select(.type == "required_reviewers")) | length) reviewer rule"'
