#!/usr/bin/env bash
# Prints the slot name for a deployment, used as the subdomain and as the resource suffix.
# Usage: slot-name.sh <ref> [pr-number] [explicit-name]
set -euo pipefail
ref=${1:-main}
pr=${2:-}
name=${3:-}

if [ -n "$name" ]; then
  slot=$name
elif [ -n "$pr" ]; then
  slot="pr-$pr"
elif [[ $ref =~ ^refs/pull/([0-9]+)/ ]]; then
  slot="pr-${BASH_REMATCH[1]}"
else
  slot=$ref
fi

slot=$(printf '%s' "$slot" | tr '[:upper:]' '[:lower:]' | sed -E 's#^refs/heads/##; s/[^a-z0-9]+/-/g; s/^-+//; s/-+$//' | cut -c1-40 | sed -E 's/-+$//')
[ -n "$slot" ] || { echo "empty slot name for ref '$ref'" >&2; exit 1; }
printf '%s\n' "$slot"
