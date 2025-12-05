"""
Simple hydrological models for simulation.
"""

import pandas as pd
import numpy as np
from typing import Optional


def linear_reservoir_model(
    precip: pd.Series,
    aet: Optional[pd.Series] = None,
    k: float = 0.1,
    q0: float = 0.0,
) -> pd.Series:
    """
    Simple Linear Reservoir Model.

    Q[t] = k * S[t]
    dS/dt = P - E - Q

    Discrete approximation (explicit):
    S[t] = S[t-1] + (P[t] - E[t]) - Q[t-1]
    Q[t] = k * S[t]

    Simplified linear form often used:
    Q[t] = (1 - k) * Q[t-1] + k * (P[t] - E[t])

    Here we implement a simple recursive filter form:
    Q[t] = (1 - k) * Q[t-1] + k * Effective_Precip[t]

    Args:
        precip: Precipitation series [mm/time]
        aet: Actual Evapotranspiration series (optional) [mm/time]
        k: Recession coefficient (0 < k <= 1)
           Higher k = faster response (steep hydrograph)
           Lower k = slower response (flat hydrograph)
        q0: Initial discharge [m3/s] (or mm/time depending on unit consistency)

    Returns:
        Simulated discharge series (pd.Series) matching precip index
    """
    # Ensure inputs are aligned numpy arrays
    p_vals = precip.values
    e_vals = aet.values if aet is not None else np.zeros_like(p_vals)

    # Effective precipitation
    eff_p = np.maximum(0, p_vals - e_vals)

    q_sim = np.zeros_like(eff_p, dtype=float)
    q_prev = q0

    # Basic explicit loop
    # Q_t = (1 - k) * Q_{t-1} + k * P_eff_t
    # This assumes k represents the fraction of storage released per time step
    decay = 1.0 - k

    for t in range(len(q_sim)):
        q_t = decay * q_prev + k * eff_p[t]
        q_sim[t] = q_t
        q_prev = q_t

    return pd.Series(q_sim, index=precip.index, name="Q_sim")
