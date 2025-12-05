"""
Hydrological performance metrics for model–observation comparison.

All functions assume:
- obs: observed discharge (pd.Series or 1D array-like)
- sim: simulated discharge (same shape as obs)

No alignment is done here: obs and sim must already be aligned and
have the same length. Alignment logic lives in evaluation.py.
"""

from __future__ import annotations

from typing import Sequence, Tuple

import numpy as np
import pandas as pd


ArrayLike = Sequence[float] | np.ndarray | pd.Series


def _to_numpy_pair(obs: ArrayLike, sim: ArrayLike) -> Tuple[np.ndarray, np.ndarray]:
    """
    Convert obs and sim to numpy arrays and ensure same length.

    This is a low-level helper used by all metrics.
    """
    o = np.asarray(obs, dtype=float)
    s = np.asarray(sim, dtype=float)

    if o.shape != s.shape:
        raise ValueError(f"obs and sim must have same shape, got {o.shape} vs {s.shape}")

    # Remove any pairs where either is NaN
    mask = ~np.isnan(o) & ~np.isnan(s)
    o_clean = o[mask]
    s_clean = s[mask]

    if o_clean.size == 0:
        raise ValueError("No valid data points after removing NaNs")

    return o_clean, s_clean


def nse(obs: ArrayLike, sim: ArrayLike) -> float:
    """
    Nash–Sutcliffe Efficiency.

    NSE = 1 - sum((sim - obs)^2) / sum((obs - mean(obs))^2)
    """
    o, s = _to_numpy_pair(obs, sim)
    denom = np.sum((o - np.mean(o)) ** 2)
    if denom == 0:
        raise ValueError("Denominator is zero in NSE (obs are constant)")
    return 1.0 - np.sum((s - o) ** 2) / denom


def log_nse(obs: ArrayLike, sim: ArrayLike) -> float:
    """
    logNSE: NSE in log space, often used to emphasize low flows.

    logNSE = NSE(log(obs), log(sim))

    Assumes strictly positive values (you can filter or shift before calling).
    """
    o, s = _to_numpy_pair(obs, sim)

    if np.any(o <= 0) or np.any(s <= 0):
        raise ValueError("log_nse requires positive obs and sim values")

    o_log = np.log(o)
    s_log = np.log(s)

    denom = np.sum((o_log - np.mean(o_log)) ** 2)
    if denom == 0:
        raise ValueError("Denominator is zero in logNSE (log(obs) are constant)")
    return 1.0 - np.sum((s_log - o_log) ** 2) / denom


def rmse(obs: ArrayLike, sim: ArrayLike) -> float:
    """
    Root Mean Square Error.
    """
    o, s = _to_numpy_pair(obs, sim)
    return float(np.sqrt(np.mean((s - o) ** 2)))


def bias(obs: ArrayLike, sim: ArrayLike) -> float:
    """
    Relative bias (in %):

    bias = 100 * (mean(sim) - mean(obs)) / mean(obs)
    """
    o, s = _to_numpy_pair(obs, sim)
    mean_o = np.mean(o)
    if mean_o == 0:
        raise ValueError("Mean of obs is zero; relative bias is undefined")
    return 100.0 * (np.mean(s) - mean_o) / mean_o


def pearson_r(obs: ArrayLike, sim: ArrayLike) -> float:
    """
    Pearson correlation coefficient between obs and sim.
    """
    o, s = _to_numpy_pair(obs, sim)
    # np.corrcoef returns 2x2 matrix; [0, 1] is correlation
    return float(np.corrcoef(o, s)[0, 1])


def kge(obs: ArrayLike, sim: ArrayLike) -> float:
    """
    Kling–Gupta Efficiency.

    KGE = 1 - sqrt( (r - 1)^2 + (alpha - 1)^2 + (beta - 1)^2 )

    where:
        r     = correlation coefficient between obs and sim
        alpha = std(sim) / std(obs)
        beta  = mean(sim) / mean(obs)
    """
    o, s = _to_numpy_pair(obs, sim)

    mean_o = np.mean(o)
    mean_s = np.mean(s)
    std_o = np.std(o, ddof=1)
    std_s = np.std(s, ddof=1)

    if std_o == 0:
        raise ValueError("Standard deviation of obs is zero; KGE undefined")

    r = np.corrcoef(o, s)[0, 1]
    alpha = std_s / std_o
    beta = mean_s / mean_o if mean_o != 0 else np.nan

    return float(1.0 - np.sqrt((r - 1.0) ** 2 + (alpha - 1.0) ** 2 + (beta - 1.0) ** 2))
