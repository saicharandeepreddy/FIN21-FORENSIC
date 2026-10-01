"""
ELA + DWT Forensic Analysis
----------------------------
Detects edited, AI-generated, or tampered regions in receipt images.

ELA (Error Level Analysis):
    Re-saves the image at a known JPEG quality and computes the pixel-wise
    difference. Regions edited after the last compression show a different
    error level than the rest of the image.

DWT (Discrete Wavelet Transform):
    Decomposes the image into frequency bands. AI-generated or in-painted
    regions have statistically different high-frequency energy than natural
    photographic texture.
"""

import io
from typing import List

import numpy as np
import pywt
from PIL import Image

# Thresholds — tuned so natural photos pass and edited images fail
ELA_HOTSPOT_THRESHOLD = 0.05   # >5% pixels above mean + 2*std → suspicious
DWT_HF_LF_THRESHOLD = 0.40     # HF/LF energy ratio > 0.40 → suspicious


def compute_ela(image_path: str, quality: int = 90) -> dict:
    """
    Error Level Analysis.
    Returns: {"ela_score": float, "ela_std": float, "hotspot_ratio": float}
    """
    original = Image.open(image_path).convert("RGB")

    buffer = io.BytesIO()
    original.save(buffer, "JPEG", quality=quality)
    buffer.seek(0)
    recompressed = Image.open(buffer).convert("RGB")

    orig_arr = np.asarray(original, dtype=np.int16)
    recomp_arr = np.asarray(recompressed, dtype=np.int16)

    # Absolute difference averaged across RGB channels
    diff = np.abs(orig_arr - recomp_arr).mean(axis=2).astype(np.float32)

    mean_diff = float(diff.mean())
    std_diff = float(diff.std())

    if std_diff > 0:
        hotspot_ratio = float((diff > (mean_diff + 2 * std_diff)).mean())
    else:
        hotspot_ratio = 0.0

    return {
        "ela_score": mean_diff,
        "ela_std": std_diff,
        "hotspot_ratio": hotspot_ratio,
    }


def compute_dwt(image_path: str) -> dict:
    """
    Discrete Wavelet Transform energy analysis.
    Returns: {"hf_energy": float, "lf_energy": float, "hf_lf_ratio": float}
    """
    img = Image.open(image_path).convert("L")
    arr = np.asarray(img, dtype=np.float32)

    # Cap size to keep computation bounded on large images
    if arr.shape[0] > 2048 or arr.shape[1] > 2048:
        img.thumbnail((2048, 2048))
        arr = np.asarray(img, dtype=np.float32)

    coeffs = pywt.dwt2(arr, "haar")
    LL, (LH, HL, HH) = coeffs

    hf_energy = float(
        (np.mean(np.abs(HH)) + np.mean(np.abs(HL)) + np.mean(np.abs(LH))) / 3.0
    )
    lf_energy = float(np.mean(np.abs(LL)))
    hf_lf_ratio = hf_energy / (lf_energy + 1e-6)

    return {
        "hf_energy": hf_energy,
        "lf_energy": lf_energy,
        "hf_lf_ratio": hf_lf_ratio,
    }


def analyze_forgery(image_path: str) -> List[str]:
    """
    Runs ELA and DWT. Returns a list of human-readable violation strings.
    Returns empty list if the image looks clean OR if analysis fails.
    """
    flags: List[str] = []

    try:
        ela = compute_ela(image_path)
        if ela["hotspot_ratio"] > ELA_HOTSPOT_THRESHOLD:
            flags.append(
                f"ELA forensics: {ela['hotspot_ratio'] * 100:.1f}% of pixels "
                f"show compression anomalies — localized editing suspected"
            )
    except Exception as exc:
        flags.append(f"ELA analysis error: {exc}")

    try:
        dwt = compute_dwt(image_path)
        if dwt["hf_lf_ratio"] > DWT_HF_LF_THRESHOLD:
            flags.append(
                f"DWT forensics: high-frequency energy ratio "
                f"{dwt['hf_lf_ratio']:.2f} — synthetic texture suspected"
            )
    except Exception as exc:
        flags.append(f"DWT analysis error: {exc}")

    return flags