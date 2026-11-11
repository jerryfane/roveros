# RoverOS design

Status: draft, 2026-11-11. Planning only: nothing here is built, and no phone
is chosen. Facts marked "research" come from web research on 2026-11-11 and
have not been tested on hardware.

## What it is

RoverOS is a dedicated operating system for one pocket device (a phone with
its own battery, USB-C and a SIM). The device does three things and nothing
else:

1. Stays connected: Wi-Fi, 4G/5G with SIM or eSIM, and Tailscale.
2. Gives AI agents that run on the owner's other Tailscale machines access to
   devices near the Rover: over Bluetooth, USB and the local network.
3. Shows HerdrUp on its own screen, so the owner can talk to those agents.

Agents normally run on the other machines. HerdrUp on the Rover connects over
SSH to those machines, as it does on any other computer. The Rover also has a
terminal, and can run agents itself under herdr when needed (see "Terminal and
local agents").

## Parts

| Part | What it is | Who writes it |
|---|---|---|
| Kernel and drivers | Linux, from the postmarketOS (renamed Nura in 2026) port for the chosen phone | Reused |
| Base image | Read-only system with only what the parts below need. No desktop, no package manager on the device | RoverOS |
| Rover service | Owns the settings (network, hotspot, Bluetooth pairing, raw-access switches) and serves the panel. Also a `rover` command for the same settings | RoverOS |
| Panel | Settings and devices screen. A web page served by the Rover service on the device | RoverOS |
| Shell | Full-screen compositor, status bar, lock screen, first-boot setup, touch keyboard | RoverOS, on existing pieces |
| HerdrUp Desktop | The app for talking to agents. It has a Linux ARM build and uses the system web engine (WebKitGTK) | Reused |
| System services | NetworkManager and ModemManager (Wi-Fi, 4G/5G, hotspot), BlueZ (Bluetooth), lpac (eSIM), Tailscale, OpenSSH | Reused |
| Terminal | A terminal app on the Rover's screen | Reused |
| Workspace | An isolated area on the data partition with the radios and USB passed through. Remote agents' shells land here; herdr and local agents run here | RoverOS, on herdr and a container runtime |
| Raw-access services | OpenSSH, USB/IP, Tailscale subnet routing, optionally a Bluetooth LE proxy | Reused |

The panel is shown in the same web engine HerdrUp uses, so the image carries
one UI toolkit.

## How agents reach nearby devices

Agents get raw access. There is no layer of named actions between an agent and
a device: the agent talks to the Bluetooth adapter, the USB bus and the local
network itself, and brings its own code for each device.

```mermaid
flowchart LR
  subgraph other[Other Tailscale machine]
    A[Agent]
  end
  subgraph rover[Rover]
    W[Workspace shell: Bluetooth, USB, serial, network]
    X[USB/IP]
    R[LAN route]
  end
  A -- "SSH over Tailscale" --> W
  A -- "USB device attached remotely" --> X
  A -- "direct IP" --> R
  W -- Bluetooth --> B[Bike, sensors, OBD dongle]
  W -- USB --> U[Glasses, cameras]
  X -- USB --> U
  R -- "Wi-Fi / LAN" --> L[TV, cameras]
```

| Channel | What the agent gets | Used for |
|---|---|---|
| Shell on the Rover | SSH over Tailscale into the workspace, where the Bluetooth adapter, USB bus, serial ports and network are passed through. The agent runs anything: `bluetoothctl`, Python with a Bluetooth library, `lsusb`, serial tools, network scans | Everything. The main channel, and the only one for classic Bluetooth |
| USB passthrough | A USB device plugged into the Rover appears on the agent's own machine as if plugged in there (USB/IP) | Devices that need drivers or software on that machine |
| LAN route | The agent's machine reaches the Wi-Fi network the Rover is on, by IP (Tailscale subnet routing) | TVs, cameras and anything else on that network |
| Bluetooth LE proxy | Code on the agent's machine uses the Rover's Bluetooth LE radio directly (the ESPHome proxy protocol) | Optional, later. The shell already covers Bluetooth |

How it works in practice:

1. The Rover is on the tailnet. An agent on another machine opens an SSH
   session to it, the same way it reaches any other machine.
2. The session lands in the workspace. The agent scans, pairs, connects, reads
   and writes with ordinary Linux tools, and can install what it needs there.
3. Settings (hotspot, Wi-Fi, mobile data, pairing) are available in that shell
   through the `rover` command.

What still limits access:

- **Tailnet only.** Nothing listens on mobile data, Wi-Fi or the hotspot.
- **Which machines.** Tailscale access rules and SSH keys decide which
  machines can connect. A machine that can connect can do everything.
- **Switches.** The panel has one switch per channel and one for all raw
  access. The LAN route is off until switched on for the current network.
- **Session log.** The Rover records which machine connected, when, and over
  which channel. It does not record what was sent to a device.
- **System image.** The image is read-only and the workspace can be wiped.
  This keeps the system tidy; it is not a security wall. A workspace with the
  radios and USB passed through has enough rights that a determined process
  could reach the rest of the Rover.

Accepted risks of raw access:

- An agent can write to any device, including the car's diagnostic port. No
  software on the Rover stops a harmful command; only the agent's instructions
  do.
- One compromised or mistaken tailnet machine with access controls every
  nearby device, and with the LAN route on, reaches the network the Rover is
  visiting.
- Nothing arbitrates between agents. Two agents using the same Bluetooth
  device at once will disturb each other.

Details the channels need:

- **LAN without a route.** An agent can reach a device on the Rover's Wi-Fi
  through its SSH session (port forwarding or a SOCKS proxy). This needs no
  Tailscale settings change and has no address clashes, so it is the default.
  The subnet route is for cases that need more.
- **Who owns Bluetooth.** The Bluetooth service runs in the system, and the
  workspace talks to it. Pairings are stored in the data area, so they
  survive updates and a workspace wipe.
- **Pairing codes.** Some devices show or ask for a code. The Rover's screen
  shows it, and an agent can answer it from the shell.
- **Sharing a device.** The `rover` command offers a simple claim ("I am
  using the bike") that other agents can see. It is a courtesy, not a lock.
- **How agents learn the Rover.** A skill file for agents on the other
  machines: how to connect, what `rover` offers, and notes per known device
  (address, protocol, what worked). Agents add to the notes, so the next one
  does not start from zero. `rover` prints machine-readable output.
- **Rover offline.** The Rover is often asleep, out of coverage or off.
  Agents must treat that as normal and say so, not retry forever.

## The Rover's own hardware

The phone has devices of its own, reachable from the workspace like any other:

| Hardware | Use | Note |
|---|---|---|
| GPS | Location for agents | Needs a privacy switch on the panel |
| Camera | Photos and video for agents | Camera support under mainline Linux is weak on most phones |
| Microphone and speaker | Voice input to HerdrUp (its Linux build includes speech-to-text), sound for alerts | Needs a privacy switch |
| SMS | Agents can read and send texts through the modem | Wanted, low priority. Login codes arrive by SMS, so this is sensitive: its own switch, off by default |
| Phone calls | Out of scope | The Rover is not the owner's phone |
| Vibration, LED | Alerts from HerdrUp | |

## A device that can be lost

The Rover is carried, and it holds the keys to more than itself: HerdrUp on it
logs in to the owner's other machines over SSH.

- **Its own Tailscale identity** with a tag. The Rover may reach any of the
  owner's machines where agents run (owner decision, 2026-11-11), so a lost
  Rover is a risk to all of them until it is removed.
- **SSH key for HerdrUp** lives in the encrypted data area, unlocked by the
  PIN, and is unique to the Rover so it can be removed from every machine at
  once.
- **Lost-device steps**, written down before first use: remove the Rover from
  Tailscale, remove its SSH key from the machines, block the SIM.
- **Wipe.** Too many wrong PINs erases the data area. A remote wipe command
  works only while the Rover is still online.
- **Screen lock** after idle. Raw access by remote agents keeps working while
  the screen is locked.

## Power and reachability

- A sleeping phone drops off Tailscale and Bluetooth. The Rover has two
  states: **awake** (reachable, uses battery) and **asleep** (unreachable).
- The panel sets the policy: stay awake while charging, while a session is
  open, for a set time, or always.
- Waking a sleeping Rover from far away is only possible by SMS or call to its
  SIM, if the modem supports wake on the chosen phone. Untested.
- **One USB-C port.** A device plugged into the port blocks charging. Using
  the glasses or a USB camera for long needs a hub that passes power through,
  and the phone must support that. Untested.
- Charge limit (for example 80%) when the Rover sits on a charger for days.
- Heat: a phone that is awake, on 4G and charging in a car gets hot. The
  Rover slows down or stops charging before it overheats.

## Connectivity

- Wi-Fi first, mobile data when there is no Wi-Fi, switching without a
  restart.
- **Wi-Fi login pages** (hotels, airports) need a browser. The Rover opens
  the page in its web engine.
- **Data guard.** Mobile data use is counted; a limit and a roaming switch
  stop surprise bills. Updates and large downloads wait for Wi-Fi unless
  allowed.
- Tailscale connections over mobile data may be relayed and slower. A relay
  on one of the owner's machines helps.
- Tailscale works on UAE mobile data (owner, 2026-11-11). Other countries are
  unchecked.
- Clock: set from the network at boot, because secure connections fail with a
  wrong date.
- Hotspot clients get internet only. They do not reach the tailnet or the
  Rover's services.

## Terminal and local agents

The Rover has a terminal app, and can run agents on itself through herdr. This
is for when the other machines are unreachable, or when a job is best done on
the Rover.

- **Where they run.** In the workspace: an isolated area on the data
  partition with its own tools and packages. The system image stays read-only
  and untouched. The workspace can be wiped and rebuilt without reinstalling
  the Rover.
- **herdr.** herdr ships a static Linux ARM binary, so it needs nothing from
  the base system. With herdr running, the Rover shows up as a machine in
  HerdrUp on the Rover's own screen and on the owner's other devices.
- **Devices.** Local agents run in the same workspace and have the same raw
  access as remote agents.
- **Terminal.** It opens in the workspace by default. A system shell for
  maintenance is separate and asks for the PIN.
- **Off by default.** herdr and local agents start when the owner asks and
  stop when idle, because they cost battery and memory.

## Screen

| Piece | Purpose |
|---|---|
| HerdrUp | Talk to agents on other machines, and on the Rover when herdr runs there |
| Terminal | A shell in the workspace |
| Panel | Settings and devices |
| Status bar | Battery, signal, Wi-Fi, Tailscale, switch between HerdrUp, the terminal and the panel |
| Lock screen | PIN |
| First-boot setup | Wi-Fi or SIM, join Tailscale by QR code, set the PIN |
| Raw-access indicator | Shows in the status bar while a remote session or passthrough is active |

### Panel screens

| Screen | Settings |
|---|---|
| Mobile | SIM and eSIM profiles (add by QR, switch), APN, 4G/5G mode, roaming, data use and limit |
| Wi-Fi | Join networks, saved networks |
| Hotspot | Share the connection over Wi-Fi or USB, name and password, connected clients |
| Bluetooth | Scan, pair, forget |
| Devices | Bluetooth and USB devices in range or plugged in, and which session is using them |
| Raw access | Switches for the shell, USB passthrough, the LAN route and all raw access; machines allowed; the session log |
| Tailscale | State, name, exit node |
| System | Battery and stay-awake policy, updates and rollback, storage, PIN, SSH keys, reset |

Hardware drivers have no settings screen: they are fixed in the image for each
phone model.

## Devices

RoverOS ships no per-device modules. Agents bring their own code; the workspace
comes with the common tools and libraries preinstalled. Difficulty is from
research, not from testing.

| Device | Link | Difficulty | Note |
|---|---|---|---|
| Fitness bike: read power, cadence, speed | Bluetooth | Easy | Standard fitness profile (FTMS) on newer consoles; one connection at a time |
| Fitness bike: set resistance | Bluetooth | Medium | Depends on the model |
| Health sensors with standard profiles | Bluetooth | Easy | Heart rate, scale, blood pressure. Closed wearables need their cloud APIs instead |
| Car OBD-II dongle | Bluetooth | Easy | Raw access can also send commands to the car, not only read |
| TVs and cameras | Local network | Easy | Mature open libraries per vendor |
| USB cameras | USB | Easy | Standard video class |
| XREAL One: control and head tracking | USB network link | Medium | Unofficial protocol; firmware updates may break it |
| XREAL One: picture | USB-C video out | Hard | Needs video output and power from the phone, which most Linux phones lack |

## Image and updates

- Read-only system image, built in CI from this repository, signed.
- Two system slots (A/B). An update writes the other slot and switches to it;
  a failed boot switches back.
- No package manager and no compiler in the system image. Those exist only
  inside the workspace.
- Secrets (Tailscale state, SSH keys, eSIM data, the session log) live in an
  encrypted data area, apart from the system image.
- A Tailscale key is entered at first-boot setup, never built into the image.
- Base system: Debian (glibc), because the HerdrUp Desktop Linux ARM build is
  linked against glibc (checked on `v0.1.0-preview.15`) and postmarketOS uses
  musl. The phone's kernel and firmware will come from its postmarketOS port.
  The VM image uses Debian's own arm64 kernel.
- HerdrUp, herdr and the workspace's base tools ship inside the image or as
  signed add-ons. HerdrUp's own self-update is off: it cannot write to a
  read-only image.
- First install needs the owner's hands: unlocking the phone's bootloader and
  flashing over USB. A recovery mode reinstalls the last good image.
- The image-signing key is kept off the Rover and off CI logs. Where it lives
  is to be decided.
- Logs are capped in size so they cannot fill the storage.
- Settings and pairings can be exported and restored, so a replaced or reset
  Rover does not start from zero.

## Testing without a phone

- The image boots in a virtual ARM machine in CI.
- Bluetooth and USB are tested with the kernel's virtual Bluetooth controller
  and virtual USB devices, so raw access is checked on every change.
- Modem, real radios, battery and heat can only be tested on the phone.

## Open questions

| Question | Why it matters |
|---|---|
| First phone | Bought by the owner on 2026-11-11: Redmi Note 10 Pro, 4G version (codename `sweet`, Snapdragon 732G, 8 GB), refurbished. Its postmarketOS page marks mobile data, Wi-Fi, Bluetooth, USB host and GPU as working; battery is "partial" and suspend is undocumented. Audio and camera do not work. Untested by us |
| Glasses picture and eSIM | Dropped for the first phone (owner, 2026-11-11). It has no video out and no eSIM; a physical SIM is used |
| Battery | The Rover must stay awake to stay reachable. No published numbers for that on the chosen phone |
| eSIM with du and e& | Deferred with eSIM. No report found that their profiles install with lpac |
| 5G | 4G is reported working on the candidates; 5G under mainline Linux is unconfirmed |
| Disk encryption and unattended reboot | A fully encrypted phone cannot be unlocked remotely on today's postmarketOS |
| HerdrUp Desktop at phone width with touch | It derives from the mobile app, so the layouts should fit; needs a first run to confirm |
| Model access for local agents | Agents on the Rover need model credentials. A carried device can be lost, so what it may hold or reach (the keyring included) needs a decision |
| Terminal app | HerdrUp's own terminal pointed at the Rover may be enough; otherwise a small separate terminal app |
| Cost of local agents | Memory and battery use of herdr plus an agent on a phone is unmeasured |
| USB/IP and container device passthrough on the phone kernel | Both need kernel options that the phone ports may not enable; unchecked |
| LAN route on visited networks | Address ranges of different networks can clash with each other and with the tailnet |
| Typing | A terminal needs Ctrl, Esc, Tab and arrows on the touch keyboard. A Bluetooth or USB keyboard should also work |
| SSH into the Rover | Tailscale's own SSH or OpenSSH. Research could not confirm that the packaged Tailscale has a recent SSH security fix |
| Kernel and security updates | Each phone's kernel comes from the postmarketOS port; how fast fixes arrive, and for how long, depends on that port |

## Build order

No purchase and no flashing is needed for steps 1 and 2.

1. Kiosk image for a virtual ARM machine: boot into HerdrUp full-screen at
   phone size and connect to machines on the tailnet. Proves the base, the
   image build and HerdrUp at phone width. Built by `tools/build.sh` and
   checked in CI by `tools/boot-test.sh`; joining the tailnet waits for a
   Tailscale key.
2. Raw access: the workspace with Bluetooth and USB passed through, SSH over
   Tailscale, USB passthrough and the LAN route, tested against real devices
   from any Linux machine. Then the Rover service and the panel.
3. Choose the phone. Bring the image up on it: modem, Wi-Fi, Bluetooth, USB,
   screen, touch.
4. A/B updates, encrypted data area, first-boot setup, lock screen.
5. Terminal app, and herdr for local agents.
