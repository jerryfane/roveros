# RoverOS

A pocket device with its own battery, USB-C charging and a SIM, running our own
Linux image (based on [postmarketOS](https://postmarketos.org)). It lets agents
reach nearby devices (Bluetooth, USB-C, GPS, camera) over the
[Tailscale](https://tailscale.com) network.

Status: planning. No phone chosen yet.

## Goals

- Joins Tailscale at boot; SSH in (keys only, tailnet only) and out.
- Wi-Fi and 4G (eSIM where possible).
- Bluetooth and USB devices: fitness equipment, XREAL glasses, car OBD-II
  dongles, health sensors.
- herdr runs on it, so it appears in HerdrUp.
- A hub service: a fixed list of device actions, an allow-list of devices,
  an audit log, and owner approval for anything that acts on a device.
- Reproducible image builds and over-the-air updates.
