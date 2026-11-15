# Installing RoverOS on the Redmi Note 10 Pro

For the 4G Redmi Note 10 Pro only: codename `sweet`, model M2101K6G,
Snapdragon 732G. Not the "Redmi Note 10 Pro 5G", which is a different phone.

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

## 2. Get the RoverOS files

From the latest successful `image` run on `main` in this repository
(Actions → image → artifact `rover-sweet`): `rover.img.zst`, `u-boot.img`,
`SHA256SUMS`.

```sh
zstd -d rover.img.zst
sha256sum -c SHA256SUMS
```

Then let your SSH key log in (this changes `rover.img`, so check the sums
first). There is no other way in yet: first-boot setup is not built.

```sh
tools/add-ssh-key.sh rover.img ~/.ssh/id_ed25519.pub sweet
```

You need `fastboot` (Android platform tools; on a Mac: `brew install
android-platform-tools`; on Debian: `apt install fastboot`).

## 3. Flash

Phone in fastboot mode (power off, then Volume down + Power), connected by USB:

```sh
fastboot erase dtbo
fastboot flash boot u-boot.img
fastboot flash userdata rover.img
fastboot reboot
```

`boot` gets U-Boot, which starts RoverOS from the image in `userdata`.

## 4. First boot

Expected: the Redmi logo, then a few seconds of black, then HerdrUp
full-screen. If it stops earlier, a photo of the screen is what helps most.

Not yet tested on a real phone.

## 5. Log in over the USB cable

With the phone still connected, RoverOS shows up on the computer as a USB
network adapter. The Rover is `172.16.42.1`; give the computer's side an
address and log in with the key from step 2:

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
