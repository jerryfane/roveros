# Target: Xiaomi Mi Note 10 / Mi CC9 Pro (codename tucana, Snapdragon 730G).
# Not the "Mi Note 10 Lite" (toco), which has no firmware package yet.
# Sourced by image/build.sh.
#
# Only the Visionox display panel works (postmarketOS wiki); the Tianma one
# probably exists only as a spare part.

. "$(dirname "${BASH_SOURCE[0]}")/common/qcom-sm7150.sh"

TARGET_APKS+=("$PMOS/firmware-xiaomi-tucana-3-r0.apk 22db937bc104e683b0ff9ca81eeb39569c8539a9f0ec4a5db591f68c55fb4c3d")

TARGET_UBOOTS=("tucana $UBOOT/u-boot-sm7150-xiaomi-tucana.img 13a03b68263c84c57ef2f16f796c1c6aa3560d3c408524ec6cbff1b3f9c90cc8")
TARGET_DTBS=(qcom/sm7150-xiaomi-tucana.dtb)
