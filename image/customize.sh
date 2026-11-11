#!/bin/bash
# mmdebstrap customize hook: turns the installed Debian root ($1) into the
# RoverOS root, and writes the data partition's seed and the boot files to
# $ROVER_WORK. Runs as root of mmdebstrap's user namespace.
set -euo pipefail
root=$1
work=$ROVER_WORK
read -r -a state_paths <<<"$ROVER_STATE_PATHS"

# The repository's owner is not mapped in this namespace.
cp -a --no-preserve=ownership "$ROVER_IMAGE_DIR/overlay/." "$root/"
sed -i "s/^GDK_SCALE=.*/GDK_SCALE=$ROVER_GDK_SCALE/" "$root/etc/rover/kiosk.env"

# Kernel, modules and firmware from postmarketOS/Alpine packages (phone
# targets). An .apk is concatenated gzip tar streams; the package's metadata
# files start with a dot. /lib is a symlink to /usr/lib in Debian.
for apk in "$work"/apks/*.apk; do
  [ -e "$apk" ] || continue
  # Metadata (.PKGINFO, .SIGN.*, install scripts) sits at the top level.
  tar -xzf "$apk" -C "$root" --ignore-zeros --keep-directory-symlink \
    --no-same-owner --anchored --exclude='.[A-Za-z]*' --warning=no-unknown-keyword
done
if [ -d "$root/usr/share/mkinitfs/files" ]; then
  install -d "$root/usr/share/rover/initramfs-files"
  mv "$root"/usr/share/mkinitfs/files/*.files "$root/usr/share/rover/initramfs-files/"
  rm -rf "$root/usr/share/mkinitfs"
fi

# HerdrUp Desktop. Its dependencies are in image/packages; dpkg checks them.
# The image has dpkg but no apt.
cp "$work/herdrup.deb" "$root/tmp/herdrup.deb"
chroot "$root" dpkg -i /tmp/herdrup.deb
rm -f "$root/tmp/herdrup.deb"

chroot "$root" useradd --create-home --shell /bin/bash \
  --groups video,render,input,bluetooth rover
# No password, and not locked: key-only SSH works, password login does not.
chroot "$root" usermod --password '*' rover

chroot "$root" systemctl enable \
  rover-kiosk.service rover-selfcheck.service rover-ssh-hostkeys.service \
  nftables.service tailscaled.service ssh.service \
  NetworkManager.service ModemManager.service bluetooth.service \
  systemd-timesyncd.service
# Qualcomm modem services, on phone targets.
for unit in rmtfs.service tqftpserv.service msm-modem-uim-selection.service; do
  if [ -e "$root/usr/lib/systemd/system/$unit" ]; then
    chroot "$root" systemctl enable "$unit"
  fi
done
chroot "$root" systemctl set-default graphical.target

# Writable things the read-only root must not hold.
ln -sf ../run/NetworkManager/resolv.conf "$root/etc/resolv.conf"
rm -f "$root"/etc/ssh/ssh_host_*
# The machine ID lives on the data partition; the initramfs binds it here.
: >"$root/etc/machine-id"
ln -sf /etc/machine-id "$root/var/lib/dbus/machine-id"
# Kernel: Debian's package (VM), or the one unpacked from an .apk above,
# which installs /boot/vmlinuz without a version in its name.
if [ -e "$root/boot/vmlinuz" ]; then
  kver=$(ls "$root/usr/lib/modules")
  [ "$(echo "$kver" | wc -l)" = 1 ] || { echo "customize: expected one kernel, got: $kver" >&2; exit 1; }
  mv "$root/boot/vmlinuz" "$root/boot/vmlinuz-$kver"
  chroot "$root" depmod -a "$kver"
  chroot "$root" update-initramfs -c -k "$kver"
else
  chroot "$root" update-initramfs -u -k all
fi

if [ "${ROVER_DEV:-}" = 1 ]; then
  echo "DEVELOPMENT IMAGE: SSH open on every interface" >&2
  sed -i 's|^\(\s*\)# dev: ssh$|\1tcp dport 22 accept|' "$root/etc/nftables.conf"
  owner=$(chroot "$root" id -u rover):$(chroot "$root" id -g rover)
  install -d -m700 -o "${owner%:*}" -g "${owner#*:}" "$root/home/rover/.ssh"
  printf '%s\n' "${ROVER_DEV_SSH_KEY:?ROVER_DEV=1 needs ROVER_DEV_SSH_KEY}" \
    >"$root/home/rover/.ssh/authorized_keys"
  chown "$owner" "$root/home/rover/.ssh/authorized_keys"
  chmod 600 "$root/home/rover/.ssh/authorized_keys"
fi

# The data partition: its state directories start as copies of the root's,
# and are bind-mounted over them at boot.
install -d "$root/data"
data="$work/data"
rm -rf "$data"
install -d -m700 "$data/ssh"
install -d -m2755 "$root/var/log/journal"
for p in "${state_paths[@]}"; do
  mkdir -p "$root$p" "$(dirname "$data/state$p")"
  cp -a "$root$p" "$data/state$p"
  echo "/data/state$p $p none bind,x-systemd.requires-mounts-for=/data 0 0" >>"$root/etc/fstab"
done
tar -C "$data" --numeric-owner -cf "$work/data.tar" .
rm -rf "$data"

# Boot files. The VM's are loaded by qemu; a phone's go on its EFI partition,
# laid out as postmarketOS does: U-Boot starts EFI/BOOT/BOOTAA64.EFI
# (systemd-boot), which reads loader/entries/.
boot="$work/boot"
install -d "$boot"
cp "$(ls "$root"/boot/vmlinuz-* | sort -V | tail -1)" "$boot/vmlinuz"
cp "$(ls "$root"/boot/initrd.img-* | sort -V | tail -1)" "$boot/initrd.img"
if [ -n "$ROVER_DTB" ]; then
  install -D -m644 "$root/boot/dtbs/$ROVER_DTB" "$boot/dtbs/$ROVER_DTB"
  install -D -m644 "$root/usr/lib/systemd/boot/efi/systemd-bootaa64.efi" "$boot/EFI/BOOT/BOOTAA64.EFI"
  install -d "$boot/loader/entries"
  printf 'default rover.conf\ntimeout 0\n' >"$boot/loader/loader.conf"
  printf 'title RoverOS\nlinux /vmlinuz\ninitrd /initrd.img\noptions %s\n' \
    "$ROVER_CMDLINE" >"$boot/loader/entries/rover.conf"
fi
