from typing import Optional

import matplotlib.pyplot as plt
import pandas as pd


def plot_hydrograph(
    df: pd.DataFrame,
    title: str = "Observed Hydrograph",
    output_path: Optional[str] = None,
) -> None:
    """
    Plot 'Q_obs' over time.

    If output_path is given, saves to file instead of showing.
    """
    if "Q_obs" not in df.columns:
        raise ValueError("DataFrame must contain 'Q_obs' column")

    plt.figure(figsize=(10, 4))
    df["Q_obs"].plot()
    plt.xlabel("Time")
    plt.ylabel("Discharge [m³/s]")
    plt.title(title)
    plt.tight_layout()

    if output_path:
        plt.savefig(output_path, dpi=150)
        print(f"Saved plot to: {output_path}")
        plt.close()
    else:
        plt.show()
