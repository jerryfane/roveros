# RoverOS

A dedicated operating system for one pocket device: a phone with its own
battery, USB-C charging and a SIM. It is built on the Linux kernel and the
[postmarketOS](https://postmarketos.org) hardware ports. It lets AI agents on
the owner's other [Tailscale](https://tailscale.com) machines reach devices
near the Rover over Bluetooth, USB and the local network.

Status: step 1 of [docs/DESIGN.md](docs/DESIGN.md). A VM image boots into
HerdrUp full-screen at phone size. No phone chosen yet.

## Goals

- Joins Tailscale at boot; SSH in (keys only, tailnet only) and out.
- Wi-Fi, 4G/5G with SIM or eSIM, hotspot.
- Bluetooth and USB devices: fitness equipment, XREAL glasses, car OBD-II
  dongles, health sensors, cameras, TVs.
- HerdrUp on the Rover's own screen, to talk to agents on other machines.
- A terminal, and optionally agents on the Rover itself under herdr, kept in
  an isolated workspace.
- Raw access for agents: a shell on the Rover with Bluetooth, USB and network
  passed through, USB passthrough to other machines, and a route to the local
  network. Limited by the tailnet, per-channel switches and a session log.
- A settings panel for mobile data, Wi-Fi, hotspot, Bluetooth and devices.
- Read-only image, reproducible builds, A/B over-the-air updates.

## Build and run

Needs Docker. On an x86-64 host, Linux 6.7 or later: arm64 programs run
through qemu-user, registered only inside the build's own namespace.

```sh
tools/build.sh out        # out/rover.img, vmlinuz, initrd.img, cmdline.txt
tools/boot-test.sh out    # boots headless, checks services, saves out/screen.png
tools/run-vm.sh out       # boots with a 720x1560 window (needs qemu-system-aarch64)
```

The Redmi Note 10 Pro (4G, codename `sweet`) image uses that phone's
postmarketOS kernel and firmware. CI checks its structure but cannot boot it;
installing is in [docs/FLASHING-SWEET.md](docs/FLASHING-SWEET.md):

```sh
ROVER_TARGET=sweet tools/build.sh out-sweet   # out-sweet/rover.img, u-boot.img
tools/check-phone-image.sh out-sweet sweet
```

The image has a read-only root and a data partition for state (Tailscale,
network, Bluetooth pairings, SSH host key, logs, `/home`). The `rover` user
runs HerdrUp under the `cage` compositor. SSH takes keys only and, like
everything else, is reachable only over Tailscale.

A development image opens SSH on every interface for one key, so the VM can
be reached through the forwarded port `127.0.0.1:2222`. Never ship one:

```sh
ROVER_DEV=1 ROVER_DEV_SSH_KEY="$(cat key.pub)" tools/build.sh out
```

Not done yet: joining the tailnet (needs the owner's approval), the panel,
booting on the phone, A/B updates and disk encryption.
