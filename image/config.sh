# RoverOS image inputs. Sourced by image/build.sh.

DEBIAN_SUITE=trixie
DEBIAN_MIRROR=http://deb.debian.org/debian

# HerdrUp Desktop, the app on the Rover's screen.
HERDRUP_URL=https://github.com/jerryfane/herdrup-desktop/releases/download/v0.1.0-preview.17/herdrup_0.1.0.preview.17_arm64.deb
HERDRUP_SHA256=0610ba499dfc6033cc68f18649a2fb97ad6f6dff9d983ce8287ae114036b4d41

# Tailscale's Debian repository and its signing key.
TAILSCALE_KEY_URL=https://pkgs.tailscale.com/stable/debian/trixie.noarmor.gpg
TAILSCALE_KEY_SHA256=3e03dacf222698c60b8e2f990b809ca1b3e104de127767864284e6c228f1fb39
TAILSCALE_SOURCE="deb [signed-by=/usr/share/keyrings/tailscale-archive-keyring.gpg] https://pkgs.tailscale.com/stable/debian trixie main"

# Data partition size in the VM image.
DATA_SIZE_MB=2048

# Paths kept on the data partition and bind-mounted over the read-only root.
# Their contents in the built root seed the data partition.
STATE_PATHS=(
  /home
  /etc/NetworkManager/system-connections
  /var/lib/NetworkManager
  /var/lib/bluetooth
  /var/lib/tailscale
  /var/lib/systemd
  /var/cache
  /var/log
  /var/tmp
)
