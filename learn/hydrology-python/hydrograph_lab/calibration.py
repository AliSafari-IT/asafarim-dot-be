"""
Calibration utilities for hydrological models.
"""

from typing import Dict, Tuple, Optional, Any
import pandas as pd
import numpy as np
from scipy.optimize import minimize

from .models import linear_reservoir_model
from .metrics import nse
from .evaluation import evaluate_model


def calibrate_linear_reservoir(
    obs: pd.Series,
    precip: pd.Series,
    aet: Optional[pd.Series] = None,
    initial_k: float = 0.5,
) -> Dict[str, Any]:
    """
    Calibrate the Linear Reservoir Model parameter 'k' to match observations.

    Objective: Maximize NSE (Minimize -NSE).

    Args:
        obs: Observed discharge series
        precip: Precipitation series
        aet: Optional AET series
        initial_k: Initial guess for k

    Returns:
        Dict containing:
        - best_k: optimized parameter
        - metrics: evaluation metrics of the calibrated model
        - sim: simulated discharge series (pd.Series)
    """
    # 1. Align all series to the intersection of their indices
    # We rely on pandas index alignment
    data = pd.DataFrame({"obs": obs, "precip": precip})
    if aet is not None:
        data["aet"] = aet

    # Drop NaNs to ensure valid comparison
    data = data.dropna()

    if data.empty:
        raise ValueError("No overlapping valid data for calibration")

    obs_aligned = data["obs"]
    precip_aligned = data["precip"]
    aet_aligned = data["aet"] if "aet" in data.columns else None

    # 2. Define Objective Function
    def objective(params):
        k = params[0]
        # Constrain k via simplified logic or bounds (minimize handles bounds)
        sim = linear_reservoir_model(
            precip=precip_aligned,
            aet=aet_aligned,
            k=k,
            q0=obs_aligned.iloc[0] # Warm start with observed flow
        )
        # Calculate NSE
        score = nse(obs_aligned, sim)
        # Minimize negative NSE
        return -score

    # 3. Run Optimization
    # Bounds for k: [0.001, 1.0] (avoid 0 to prevent stagnation)
    bounds = [(0.001, 1.0)]

    result = minimize(
        objective,
        x0=[initial_k],
        bounds=bounds,
        method="L-BFGS-B"
    )

    best_k = result.x[0]

    # 4. Final Run
    final_sim = linear_reservoir_model(
        precip=precip_aligned,
        aet=aet_aligned,
        k=best_k,
        q0=obs_aligned.iloc[0]
    )

    # 5. Evaluate
    # We convert series to DF for evaluate_model compatibility
    metrics = evaluate_model(
        obs_df=obs_aligned.to_frame("Q_obs"),
        sim_df=final_sim.to_frame("Q_sim"),
        obs_col="Q_obs",
        sim_col="Q_sim"
    )

    return {
        "best_k": float(best_k),
        "metrics": metrics,
        "sim": final_sim,
        "success": result.success,
        "message": result.message
    }
