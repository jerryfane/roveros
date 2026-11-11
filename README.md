# RoverOS

A dedicated operating system for one pocket device: a phone with its own
battery, USB-C charging and a SIM. It is built on the Linux kernel and the
[postmarketOS](https://postmarketos.org) hardware ports. It lets AI agents on
the owner's other [Tailscale](https://tailscale.com) machines reach devices
near the Rover over Bluetooth, USB and the local network.

Status: planning. No phone chosen yet. See [docs/DESIGN.md](docs/DESIGN.md).

## Goals

- Joins Tailscale at boot; SSH in (keys only, tailnet only) and out.
- Wi-Fi, 4G/5G with SIM or eSIM, hotspot.
- Bluetooth and USB devices: fitness equipment, XREAL glasses, car OBD-II
  dongles, health sensors, cameras, TVs.
- HerdrUp on the Rover's own screen, to talk to agents on other machines.
- A terminal, and optionally agents on the Rover itself under herdr, kept in
  an isolated workspace.
- A hub service: a fixed list of device actions, an allow-list of devices,
  an audit log, and owner approval for anything that acts on a device.
- A settings panel for mobile data, Wi-Fi, hotspot, Bluetooth and devices.
- Read-only image, reproducible builds, A/B over-the-air updates.
