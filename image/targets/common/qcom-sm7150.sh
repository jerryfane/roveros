# Shared by every Snapdragon 730/730G/732G (SM7150) phone target. Sourced by
# image/targets/<device>.sh, which adds the phone's own firmware, its U-Boot
# image(s) and device tree(s).
#
# Boot chain, as postmarketOS's qcom-sm7150 port: the stock bootloader loads
# U-Boot from the boot partition; U-Boot boots systemd-boot from the EFI
# partition of the image written to userdata; systemd-boot starts the kernel.
# The kernel, its modules and the firmware come from postmarketOS (renamed
# Nura) v26.06 and Alpine v3.24; the rest of the system is Debian.

PMOS=https://mirror.postmarketos.org/postmarketos/v26.06/aarch64
ALPINE=https://dl-cdn.alpinelinux.org/alpine/v3.24
UBOOT=https://github.com/sm7150-mainline/u-boot/releases/download/2025-12-02

# Debian side of the Qualcomm modem stack (the kernel does pd-mapper itself),
# and the EFI boot manager.
TARGET_PACKAGES=(rmtfs tqftpserv qrtr-tools libqmi-utils systemd-boot-efi)

# "URL SHA256" per package, extracted into the root in this order. Device
# files append their firmware package.
TARGET_APKS=(
  "$PMOS/linux-postmarketos-qcom-sm7150-7.1_rc3-r0.apk 7263bd3c9b98ad91aa25882e3bd71e7064eea18a3612243fbbef8185adbd42aa"
  "$PMOS/firmware-qcom-sm7150-ath10k-2-r0.apk 746ab9752ad9eca42b963f53c50b7644270c03ebb351840e49986fa6e74e0704"
  "$PMOS/firmware-qcom-adreno-a630-20260110-r1.apk f027f4ef5d81858e33962d396ddd88a6a44120ad0f9701398324cac9fb051c92"
  "$PMOS/firmware-qcom-adreno-a630-sqe-20260110-r1.apk cc956488c3085238f069c8e37f4b8c233727e6b0154a72a9a3a3e9e96b56b9b6"
  "$PMOS/bootmac-0.7.1-r0.apk 27f54cc838228869dce78b7a83d05e76e6a3a8d53cb0b7f276353281ab2302a8"
  "$PMOS/bootmac-systemd-0.7.1-r0.apk 439deaa4faa34e0a0700b39b152997b470c25226db50c82017118773148c8355"
  "$ALPINE/main/aarch64/linux-firmware-qca-20260519-r0.apk 6b3a815e06afe10aed121f3815bb15930f5bb76d6c45a5f96d86cc019293f63a"
  "$ALPINE/community/aarch64/msm-modem-uim-selection-13-r1.apk 75f627483b9b699e9647387cc092522bb0836af03b3c3e854109b7fb2edac783"
  "$ALPINE/community/aarch64/msm-modem-uim-selection-systemd-13-r1.apk 360f8a1c5d90e51b9f81473ed4c0998b5e6b364e0b40cc318e52fbeecbf59b83"
)

# Device files set:
#   TARGET_UBOOTS  "PANEL URL SHA256" per display panel variant; the build writes
#                  u-boot-PANEL.img for each. U-Boot carries the device tree the
#                  kernel boots with, so the panel decides which one to flash.
#   TARGET_DTBS    the device trees, copied to the EFI partition too.

# 1080x2340-2400 screens; scale 3 lays HerdrUp out at 360 logical px.
TARGET_SCALE=3

# UFS storage uses 4096-byte sectors.
TARGET_SECTOR_SIZE=4096
TARGET_ESP_SIZE_MB=256
TARGET_CMDLINE="root=LABEL=rover-root ro quiet"
