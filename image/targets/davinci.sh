# Target: Xiaomi Mi 9T / Redmi K20 (codename davinci, Snapdragon 730). Models
# M1903F10G (Mi 9T), M1903F10A and M1903F10C (Redmi K20). Not the "Mi 9T Pro" /
# "Redmi K20 Pro" (raphael, Snapdragon 855). Sourced by image/build.sh.

. "$(dirname "${BASH_SOURCE[0]}")/common/qcom-sm7150.sh"

TARGET_APKS+=("$PMOS/firmware-xiaomi-davinci-5-r0.apk d301ae87fe1c3354dc58b8509307d2aae22a5a37b6c33fdb676f15e0676b35d0")

# Two display panels. Under Android: adb logcat | grep "panel name is".
TARGET_UBOOTS=(
  "samsung $UBOOT/u-boot-sm7150-xiaomi-davinci-samsung.img a18bf172a03dd8532da85775600c36813cd0128552ca83ac58000f5c787ecd36"
  "visionox $UBOOT/u-boot-sm7150-xiaomi-davinci-visionox.img 4d9fcc0c085de641e4352b0f0680425bcb08ab45e5ee3d6237d859d6b9f70a67"
)
TARGET_DTBS=(qcom/sm7150-xiaomi-davinci-samsung.dtb qcom/sm7150-xiaomi-davinci-visionox.dtb)
