from typing import Dict

import pandas as pd


def basic_stats(df: pd.DataFrame) -> Dict[str, float]:
    """
    Compute simple discharge statistics for the 'Q_obs' column.

    Returns a dict with keys like Mean, Median, Max, Q95, Q05, Count.
    """
    if "Q_obs" not in df.columns:
        raise ValueError("DataFrame must contain 'Q_obs' column")

    q = df["Q_obs"]

    return {
        "Mean": float(q.mean()),
        "Median": float(q.median()),
        "Max": float(q.max()),
        "Q95": float(q.quantile(0.95)),
        "Q05": float(q.quantile(0.05)),
        "Count": float(q.count()),
    }


def print_stats(stats: Dict[str, float]) -> None:
    """
    Nicely print the stats dict to console.
    """
    print("Basic discharge stats")
    print("---------------------")
    for key, value in stats.items():
        if key == "Count":
            print(f"{key:7s}: {value:.0f}")
        else:
            print(f"{key:7s}: {value:.3f}")
