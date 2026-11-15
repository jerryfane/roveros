# Target: Xiaomi Redmi Note 10 Pro, 4G version (codename sweet, Snapdragon
# 732G). Models M2101K6G, M2101K6R, M2101K6P. Not the "Redmi Note 10 Pro 5G".
# Sourced by image/build.sh.

. "$(dirname "${BASH_SOURCE[0]}")/common/qcom-sm7150.sh"

TARGET_APKS+=("$PMOS/firmware-xiaomi-sweet-3-r0.apk c34aa001d4c9ca6ecd01075f58bdd4347b0fb7f2d22dc882fc8e6b193931fe1c")

# One U-Boot for every sweet panel.
TARGET_UBOOTS=("sweet $UBOOT/u-boot-sm7150-xiaomi-sweet.img 56ee9de8d92a187e5dc283689ae122dee1792af310fe8ae3796a0e6caa7714f1")
TARGET_DTBS=(qcom/sm7150-xiaomi-sweet.dtb)
