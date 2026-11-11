#!/usr/bin/env python3
"""Writes a GPT partition table into a disk image file, for any sector size.

sfdisk takes the sector size from the device, and a plain file always has
512-byte sectors; phones with UFS storage need 4096. This writes the
protective MBR, both GPT headers and the partition entries directly.

Usage: gpt.py IMAGE SECTOR_SIZE NAME:TYPE_UUID:START_MIB:SIZE_MIB ...
The image must already have its final size.
"""
import os
import struct
import sys
import uuid
import zlib

ENTRIES = 128
ENTRY_SIZE = 128


def main() -> None:
    path, sector = sys.argv[1], int(sys.argv[2])
    size = os.path.getsize(path)
    if size % sector:
        sys.exit(f"gpt.py: {path} is not a whole number of {sector}-byte sectors")
    last_lba = size // sector - 1
    table_sectors = ENTRIES * ENTRY_SIZE // sector
    first_usable = 2 + table_sectors
    last_usable = last_lba - 1 - table_sectors
    per_mib = (1 << 20) // sector

    table = bytearray(ENTRIES * ENTRY_SIZE)
    for i, spec in enumerate(sys.argv[3:]):
        name, type_uuid, start_mib, size_mib = spec.split(":")
        first = int(start_mib) * per_mib
        last = first + int(size_mib) * per_mib - 1
        if first < first_usable or last > last_usable:
            sys.exit(f"gpt.py: partition {name} does not fit")
        table[i * ENTRY_SIZE:(i + 1) * ENTRY_SIZE] = (
            uuid.UUID(type_uuid).bytes_le
            + uuid.uuid4().bytes_le
            + struct.pack("<QQQ", first, last, 0)
            + name.encode("utf-16-le").ljust(72, b"\0")
        )
    table_crc = zlib.crc32(table)
    disk_guid = uuid.uuid4().bytes_le

    def header(my_lba: int, alt_lba: int, entries_lba: int) -> bytes:
        def pack(crc: int) -> bytes:
            return struct.pack(
                "<8sIIIIQQQQ16sQIII", b"EFI PART", 0x00010000, 92, crc, 0,
                my_lba, alt_lba, first_usable, last_usable, disk_guid,
                entries_lba, ENTRIES, ENTRY_SIZE, table_crc)
        return pack(zlib.crc32(pack(0))).ljust(sector, b"\0")

    mbr_sectors = min(last_lba, 0xFFFFFFFF)
    mbr = bytearray(sector)
    mbr[446:462] = struct.pack("<B3sB3sII", 0, b"\0\x02\0", 0xEE, b"\xff\xff\xff", 1, mbr_sectors)
    mbr[510:512] = b"\x55\xaa"

    with open(path, "r+b") as f:
        def put(lba: int, data: bytes) -> None:
            f.seek(lba * sector)
            f.write(data)
        put(0, bytes(mbr))
        put(1, header(1, last_lba, 2))
        put(2, bytes(table))
        put(last_lba - table_sectors, bytes(table))
        put(last_lba, header(last_lba, 1, last_lba - table_sectors))


if __name__ == "__main__":
    main()
