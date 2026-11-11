# Target: virtual arm64 machine (qemu virt), booted directly by qemu with
# tools/run-vm.sh. Sourced by image/build.sh.

TARGET_PACKAGES=(linux-image-arm64)
# Kernel packages from postmarketOS/Alpine: none, Debian's kernel is used.
TARGET_APKS=()

# 720x1560 screen; scale 2 lays HerdrUp out at 360 logical px.
TARGET_SCALE=2

# Plain 512-byte sectors, no EFI partition: qemu loads the kernel itself.
TARGET_SECTOR_SIZE=512
TARGET_ESP_SIZE_MB=0
TARGET_CMDLINE="root=LABEL=rover-root ro console=ttyAMA0"
