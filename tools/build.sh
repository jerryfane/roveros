#!/bin/bash
# Builds a RoverOS image in a throwaway Debian container.
#
# Usage: tools/build.sh [OUTDIR]     (default: out/)
# Needs Docker. On a non-arm64 host, Linux 6.7 or later (see image/build.sh).
# Passed through: ROVER_TARGET (vm or sweet, see image/targets/), and
# ROVER_DEV=1 with ROVER_DEV_SSH_KEY for development images.
set -euo pipefail

repo=$(cd "$(dirname "$0")/.." && pwd)
out=$(realpath -m "${1:-$repo/out}")
mkdir -p "$out"

# --privileged: the build creates user and mount namespaces and its own
# binfmt_misc instance. Nothing is changed on the host.
docker run --rm --privileged \
  -v "$repo/image:/src/image:ro" \
  -v "$out:/out" \
  -e ROVER_TARGET -e ROVER_DEV -e ROVER_DEV_SSH_KEY \
  debian:trixie \
  bash -c 'cp -r /src/image /image && /image/build.sh /out && chown -R '"$(id -u):$(id -g)"' /out'
