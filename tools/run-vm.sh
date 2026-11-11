#!/bin/bash
# Boots a RoverOS image in a virtual arm64 machine with a phone-sized screen.
#
# Usage: tools/run-vm.sh [OUTDIR] [-- extra qemu arguments]
# Environment:
#   ROVER_DISPLAY  qemu -display value (default: gtk; "none" for headless)
#   ROVER_SSH_PORT host port forwarded to the VM's SSH (default: 2222)
#   ROVER_SNAPSHOT=1 discards writes to the disk when the VM stops
# The serial console is on stdio. qemu's monitor is on a UNIX socket in OUTDIR.
set -euo pipefail

repo=$(cd "$(dirname "$0")/.." && pwd)
out=$(realpath -m "${1:-$repo/out}")
[ $# -gt 0 ] && shift
[ "${1:-}" = -- ] && shift

accel=(-machine virt -cpu max)
if [ "$(uname -m)" = aarch64 ] && [ -w /dev/kvm ]; then
  accel=(-machine virt,accel=kvm -cpu host)
fi
snapshot=()
[ "${ROVER_SNAPSHOT:-}" = 1 ] && snapshot=(-snapshot)

exec qemu-system-aarch64 "${accel[@]}" -smp 4 -m 3072 \
  -kernel "$out/vmlinuz" -initrd "$out/initrd.img" \
  -append "$(cat "$out/cmdline.txt")" \
  -drive "if=virtio,format=raw,file=$out/rover.img" "${snapshot[@]}" \
  -device virtio-gpu-pci,xres=720,yres=1560 \
  -device qemu-xhci -device usb-kbd -device usb-tablet \
  -netdev "user,id=net0,hostfwd=tcp:127.0.0.1:${ROVER_SSH_PORT:-2222}-:22" \
  -device virtio-net-pci,netdev=net0 \
  -device virtio-rng-pci \
  -display "${ROVER_DISPLAY:-gtk}" \
  -serial stdio \
  -monitor "unix:$out/monitor.sock,server,nowait" \
  "$@"
