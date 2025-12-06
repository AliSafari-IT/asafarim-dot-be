"""
models_ext.py

Additional hydrological models for hydrograph_lab:
- SCS Curve Number direct runoff
- SCS Unit Hydrograph (discrete)
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional, Tuple

import numpy as np
import pandas as pd
from scipy.signal import fftconvolve


@dataclass
class SCSCurveNumberParams:
    """
    Parameters for SCS Curve Number method.

    CN : Curve Number (dimensionless, 0–100)
    Ia_ratio : initial abstraction ratio (Ia / S), often 0.2
    """
    CN: float
    Ia_ratio: float = 0.2

    @property
    def S(self) -> float:
        """
        Potential maximum retention S [mm].
        S = (25400 / CN) - 254 (for CN in 0–100).
        """
        if not (0 < self.CN <= 100):
            raise ValueError("CN must be in (0, 100]")
        return (25400.0 / self.CN) - 254.0


def scs_direct_runoff(P: pd.Series, params: SCSCurveNumberParams) -> pd.Series:
    """
    Compute direct runoff depth [mm] from rainfall depth [mm] using SCS CN.

    P: rainfall series [mm], typically event total or time-distributed.
    Returns time series of runoff depths [mm].
    """
    S = params.S
    Ia = params.Ia_ratio * S

    P_arr = P.to_numpy(dtype=float)
    Q_arr = np.zeros_like(P_arr)

    # Apply SCS CN equation point-wise (simple approach)
    # For events, you might use cumulative rainfall; here we assume
    # it is applied on incremental depths for simplicity.
    for i, p in enumerate(P_arr):
        if p <= Ia:
            Q_arr[i] = 0.0
        else:
            Q_arr[i] = (p - Ia) ** 2 / (p - Ia + S)

    return pd.Series(Q_arr, index=P.index, name="Q_runoff")


@dataclass
class SCSUnitHydrographParams:
    """
    Parameters for a simple SCS Unit Hydrograph.

    This is a simplified representation, not a full SCS procedure.
    """
    dt_hours: float        # time step of P and UH [hours]
    peak_time_hours: float  # time to peak [hours]
    base_time_hours: float  # hydrograph base time [hours]
    uh_peak: float          # peak of unit hydrograph [m3/s per mm]


def scs_unit_hydrograph_kernel(params: SCSUnitHydrographParams) -> np.ndarray:
    """
    Build a very simple triangular unit hydrograph kernel as an array.

    Area under UH is 1 (for 1 mm runoff over unit area); in practice you might
    scale by catchment area to get m3/s.
    """
    n_steps = int(np.round(params.base_time_hours / params.dt_hours)) + 1
    t = np.linspace(0, params.base_time_hours, n_steps)

    # Simple triangular shape: rise to peak_time, then fall to base_time.
    uh = np.zeros_like(t)
    tp = params.peak_time_hours
    tb = params.base_time_hours

    for i, ti in enumerate(t):
        if 0 <= ti <= tp:
            uh[i] = ti / tp
        elif tp < ti <= tb:
            uh[i] = (tb - ti) / (tb - tp)
        else:
            uh[i] = 0.0

    # Normalize area to 1.0 then scale to desired peak (roughly)
    area = np.trapz(uh, t)
    if area == 0:
        raise ValueError("UH area is zero; check parameters")

    uh = uh / area

    # Optional: scale peak to params.uh_peak; for now we keep area=1
    return uh


def convolve_runoff_with_uh(
    runoff: pd.Series,
    params: SCSUnitHydrographParams,
) -> pd.Series:
    """
    Convolve direct runoff [mm/time step] with SCS Unit Hydrograph kernel
    to obtain discharge hydrograph (relative units).

    For real discharge in m3/s, multiply by (catchment area, unit conversions).
    """
    uh = scs_unit_hydrograph_kernel(params)

    q_run = runoff.to_numpy(dtype=float)

    # Use FFT-based convolution for speed; 'full' then trim to original length
    conv = fftconvolve(q_run, uh, mode="full")
    conv = conv[: len(q_run)]

    return pd.Series(conv, index=runoff.index, name="Q_scs")
