"""
Model–observation evaluation helpers.

This module sits *above* metrics.py:

- Handles time alignment (inner join on datetime index)
- Computes a bundle of metrics at once
"""

from __future__ import annotations

from typing import Dict, Tuple

import pandas as pd

from .io import read_hydrograph
from .metrics import nse, log_nse, rmse, bias, pearson_r, kge


def align_obs_sim(
    obs_df: pd.DataFrame,
    sim_df: pd.DataFrame,
    obs_col: str = "Q_obs",
    sim_col: str = "Q_sim",
) -> Tuple[pd.Series, pd.Series]:
    """
    Align observed and simulated series by datetime index.

    - Uses inner join on index
    - Returns obs_series, sim_series with same index and no NaNs
    """
    # Rename columns to avoid duplication when joining
    obs = obs_df[[obs_col]].rename(columns={obs_col: "obs"})
    sim = sim_df[[sim_col]].rename(columns={sim_col: "sim"})

    joined = obs.join(sim, how="inner")

    # Drop any rows where either is NaN
    joined = joined.dropna(subset=["obs", "sim"])

    if joined.empty:
        raise ValueError("No overlapping data between obs and sim after alignment")

    return joined["obs"], joined["sim"]


def evaluate_model(
    obs_df: pd.DataFrame,
    sim_df: pd.DataFrame,
    obs_col: str = "Q_obs",
    sim_col: str = "Q_sim",
    use_log_nse: bool = True,
) -> Dict[str, float]:
    """
    Compute a bundle of performance metrics for a model.

    Returns a dict with keys:
        NSE, logNSE (optional), KGE, RMSE, Bias, R

    Assumes obs_df and sim_df have datetime index and columns as specified.
    """
    obs_series, sim_series = align_obs_sim(obs_df, sim_df, obs_col, sim_col)

    metrics: Dict[str, float] = {}

    # Core metrics
    metrics["NSE"] = nse(obs_series, sim_series)
    metrics["KGE"] = kge(obs_series, sim_series)
    metrics["RMSE"] = rmse(obs_series, sim_series)
    metrics["Bias"] = bias(obs_series, sim_series)
    metrics["R"] = pearson_r(obs_series, sim_series)

    # logNSE is optional (can fail for non-positive flows)
    if use_log_nse:
        try:
            metrics["logNSE"] = log_nse(obs_series, sim_series)
        except ValueError:
            metrics["logNSE"] = float("nan")

    return metrics


def evaluate_from_csv(
    obs_csv: str,
    sim_csv: str,
    obs_col: str = "Q_obs",
    sim_col: str = "Q_sim",
    use_log_nse: bool = True,
) -> Dict[str, float]:
    """
    Convenience helper:

    - Reads obs and sim CSVs with read_hydrograph
    - Expects obs CSV to have column obs_col (default Q_obs)
    - Expects sim CSV to have column sim_col (default Q_sim)
    - Returns metrics dict
    """
    obs_df = read_hydrograph(obs_csv, value_col=obs_col)

    # For sim, we reuse read_hydrograph to parse datetime + index.
    sim_df = read_hydrograph(sim_csv, value_col=sim_col)

    return evaluate_model(obs_df, sim_df, obs_col=obs_col, sim_col=sim_col, use_log_nse=use_log_nse)
