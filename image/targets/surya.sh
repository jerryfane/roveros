# Target: Xiaomi POCO X3 NFC (codename surya, Snapdragon 732G). Models
# M2007J20CG, M2007J20CI. Not the "POCO X3 Pro" (vayu, Snapdragon 860).
# Sourced by image/build.sh.
#
# Known issue (postmarketOS wiki): SIM slot 1 reports an internal error on the
# current kernel; use slot 2.

. "$(dirname "${BASH_SOURCE[0]}")/common/qcom-sm7150.sh"

TARGET_APKS+=("$PMOS/firmware-xiaomi-surya-5-r0.apk e97183a816e53c63f235cfd8b0271058a8e2823b2fba33b42083fef90b2d634e")

# Two display panels. Under Android: adb logcat | grep "panel name is".
TARGET_UBOOTS=(
  "huaxing $UBOOT/u-boot-sm7150-xiaomi-surya-huaxing.img 279902a1055c9c86eca8b7ff0f3e8a479929e4cf1326887be452da4e10afe5e4"
  "tianma $UBOOT/u-boot-sm7150-xiaomi-surya-tianma.img 452d55e3008b571c332589c7537a14a9ed31b4c9a156181f7b1d33e5d4b45545"
)
TARGET_DTBS=(qcom/sm7150-xiaomi-surya-huaxing.dtb qcom/sm7150-xiaomi-surya-tianma.dtb)
