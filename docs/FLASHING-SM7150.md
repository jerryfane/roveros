# Installing RoverOS on a Snapdragon 730/732G Xiaomi phone

These phones share one kernel, so RoverOS supports them the same way:

| Phone | Target | Models to accept | Display panels |
|---|---|---|---|
| Redmi Note 10 Pro (4G) | `sweet` | M2101K6G | one |
| POCO X3 NFC | `surya` | M2007J20CG, M2007J20CI | Huaxing or Tianma |
| Mi 9T / Redmi K20 | `davinci` | M1903F10G, M1903F10A, M1903F10C | Samsung or Visionox |
| Mi Note 10 / Mi CC9 Pro | `tucana` | M1910F4G, M1910F4E | Visionox only |

Lookalikes that are **different phones** and will not work: Redmi Note 10 Pro
5G (MediaTek, e.g. M2104K10AC "chopin"), POCO X3 Pro (vayu), Mi 9T Pro /
Redmi K20 Pro (raphael), Mi Note 10 Lite (toco, not yet supported).

**Check the inside, not the label.** A refurbished phone can wear another
model's back cover. Under Android, with USB debugging on:

```sh
adb shell getprop ro.product.device   # must print the target name above
adb shell getprop ro.board.platform   # anything starting with mt is MediaTek: not supported
```

Installing erases the phone. Nothing on it survives.

## 1. Unlock the bootloader (once, takes about a week)

Xiaomi makes you wait between asking and unlocking.

1. On the phone, under Android: sign in to a Xiaomi (Mi) account, with a SIM
   card in the phone and mobile data on.
2. Settings → About phone → tap "MIUI version" seven times to turn on
   Developer options.
3. Settings → Additional settings → Developer options: turn on "OEM
   unlocking", then open "Mi Unlock status" and add the account.
4. Wait the period Xiaomi shows (often 7 days; the unlock tool says how long
   is left).
5. Then, on a Windows computer: install Xiaomi's Mi Unlock tool, power the
   phone off, hold Volume down + Power until "FASTBOOT" appears, connect it
   by USB, and run the tool. The phone erases itself and reboots.

## 2. Know your display panel (surya and davinci)

U-Boot carries the device tree the kernel boots with, so it must match the
panel. Under Android, with USB debugging on:

```sh
adb wait-for-device && adb reboot && adb logcat | grep "panel name is"
```

sweet has one panel; tucana works with Visionox only.

## 3. Get the RoverOS files

From the latest successful `image` run on `main` in this repository
(Actions → image → artifact `rover-<target>`, e.g. `rover-surya`):
`rover.img.zst`, `u-boot-<panel>.img` (one per panel), `SHA256SUMS`.

```sh
zstd -d rover.img.zst
sha256sum -c SHA256SUMS
```

Then let your SSH key log in (this changes `rover.img`, so check the sums
first). There is no other way in yet: first-boot setup is not built.

```sh
tools/add-ssh-key.sh rover.img ~/.ssh/id_ed25519.pub <target>
```

You need `fastboot` (Android platform tools; on a Mac: `brew install
android-platform-tools`; on Debian: `apt install fastboot`).

## 4. Flash

Phone in fastboot mode (power off, then Volume down + Power), connected by USB.
Use the U-Boot for your panel:

```sh
fastboot erase dtbo
fastboot flash boot u-boot-<panel>.img
fastboot flash userdata rover.img
fastboot reboot
```

`boot` gets U-Boot, which starts RoverOS from the image in `userdata`.

## 5. First boot

Expected: the phone's logo, then a few seconds of black, then HerdrUp
full-screen. If it stops earlier, a photo of the screen is what helps most.
A black screen after the logo usually means the wrong panel's U-Boot.

Not yet tested on a real phone.

## 6. Log in over the USB cable

With the phone still connected, RoverOS shows up on the computer as a USB
network adapter. The Rover is `172.16.42.1`; give the computer's side an
address and log in with the key from step 3:

```sh
ip -br link                                   # find the new interface, e.g. usb0 or enx…
sudo ip address add 172.16.42.2/24 dev <it>
ssh rover@172.16.42.1
```

Only SSH is open on this link. Mobile data, Wi-Fi and the hotspot let nothing
in; Tailscale lets in your tailnet once the Rover has joined it.

## Back to Android

Flash Xiaomi's fastboot ROM for this model with Mi Flash. The bootloader stays
unlocked.
