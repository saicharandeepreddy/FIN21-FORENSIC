import os
import hashlib
from typing import List
try:
    from PIL import Image
except ImportError:
    Image = None

try:
    import piexif
except ImportError:
    piexif = None

GSTIN_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"


def validate_gstin(gstin: str) -> tuple[bool, str]:
    """Validates Indian GSTIN including the Mod-36 Luhn checksum.
    Returns (is_valid, reason)."""
    if not gstin:
        return False, "GSTIN missing"
    g = str(gstin).upper().strip()
    if len(g) != 15:
        return False, f"GSTIN must be 15 characters (got {len(g)})"

    try:
        state = int(g[:2])
        if state < 1 or state > 38:
            return False, f"Invalid state code: {g[:2]}"
    except ValueError:
        return False, f"Invalid state code: {g[:2]}"

    for c in g:
        if c not in GSTIN_CHARS:
            return False, f"Invalid character in GSTIN: {c}"

    if g[13] != "Z":
        return False, "13th character must be 'Z'"

    total = 0
    for i, ch in enumerate(g[:14]):
        code_point = GSTIN_CHARS.index(ch)
        factor = 1 if i % 2 == 0 else 2
        product = code_point * factor
        total += (product // 36) + (product % 36)

    checksum_idx = (36 - (total % 36)) % 36
    expected = GSTIN_CHARS[checksum_idx]

    if expected != g[14]:
        return False, f"GSTIN checksum failed (expected {expected}, got {g[14]})"
    return True, "valid"


SUSPICIOUS_SOFTWARE_KEYWORDS = [
    "photoshop",
    "gimp",
    "canva",
    "pixelmator",
    "paint.net",
    "lightroom",
    "illustrator",
    "coreldraw",
    "snapseed",
    "vsco",
    "picsart",
    "befunky",
    "pixlr",
]


def calculate_file_hash(file_path: str) -> str:
    hasher = hashlib.sha256()
    with open(file_path, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()


def analyze_image_forensics(image_path: str) -> List[str]:
    flags: List[str] = []

    if not os.path.exists(image_path):
        return ["Receipt file not found on disk"]

    # File size checks
    file_size = os.path.getsize(image_path)
    if file_size < 2048:
        flags.append("Suspiciously small image file (under 2KB)")

    try:
        with Image.open(image_path) as img:
            width, height = img.size
            if width < 200 or height < 200:
                flags.append("Image resolution unusually low for physical receipt")

            # Check EXIF metadata
            info = img.info or {}
            exif_bytes = info.get("exif")

            if not exif_bytes:
                # Many receipts captured or saved via web/screenshot lack EXIF
                # We flag as advisory or check software strings in other chunks
                pass
            else:
                try:
                    exif_dict = piexif.load(exif_bytes)
                    # 0th IFD contains Software and Make/Model
                    zeroth = exif_dict.get("0th", {})

                    # Check Software tag (0x0131 in EXIF / piexif.ImageIFD.Software)
                    software_tag = zeroth.get(piexif.ImageIFD.Software)
                    if software_tag:
                        software_str = (
                            software_tag.decode("utf-8", errors="ignore").lower()
                            if isinstance(software_tag, bytes)
                            else str(software_tag).lower()
                        )
                        for keyword in SUSPICIOUS_SOFTWARE_KEYWORDS:
                            if keyword in software_str:
                                flags.append(
                                    f"EXIF indicates editing software: {software_str.strip()}"
                                )
                                break

                    # Check Artist / Processing Software
                    artist_tag = zeroth.get(piexif.ImageIFD.Artist)
                    if artist_tag:
                        artist_str = (
                            artist_tag.decode("utf-8", errors="ignore").lower()
                            if isinstance(artist_tag, bytes)
                            else str(artist_tag).lower()
                        )
                        for keyword in SUSPICIOUS_SOFTWARE_KEYWORDS:
                            if keyword in artist_str:
                                flags.append(
                                    f"EXIF metadata references modification tool: {artist_str.strip()}"
                                )
                                break
                except Exception:
                    flags.append("Corrupted or tampered EXIF header detected")

            # Check PNG text chunks or comment chunks for software metadata
            for k, v in info.items():
                if isinstance(v, str):
                    lower_val = v.lower()
                    for keyword in SUSPICIOUS_SOFTWARE_KEYWORDS:
                        if keyword in lower_val:
                            flags.append(
                                f"Image metadata header indicates digital manipulation: {keyword}"
                            )
                            break

    except Exception as exc:
        flags.append(f"Image analysis error: {str(exc)}")

    return list(dict.fromkeys(flags))  # Deduplicate preserving order
