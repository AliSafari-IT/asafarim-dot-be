"""
Plotting utilities for model–observation comparison.
"""

from typing import Optional

import matplotlib.pyplot as plt
import pandas as pd


def plot_model_comparison(
    obs: pd.Series,
    sim: pd.Series,
    output_path: Optional[str] = None,
):
    """
    Creates a figure with:
    - Hydrograph overlay (obs vs sim)
    - Scatter plot (obs vs sim)

    Saves to output_path if provided; otherwise shows interactively.
    """
    fig, axes = plt.subplots(1, 2, figsize=(14, 4))

    # 1. Hydrograph plot
    axes[0].plot(obs.index, obs.values, label="Observed", color="black")
    axes[0].plot(sim.index, sim.values, label="Simulated", color="blue", alpha=0.7)

    axes[0].set_title("Hydrograph Comparison")
    axes[0].set_xlabel("Time")
    axes[0].set_ylabel("Discharge [m³/s]")
    axes[0].legend()
    axes[0].grid(True)

    # 2. Scatter plot
    axes[1].scatter(obs, sim, alpha=0.5, edgecolor="k")
    max_val = max(obs.max(), sim.max())
    axes[1].plot([0, max_val], [0, max_val], "r--")  # 1:1 line

    axes[1].set_title("Obs vs Sim")
    axes[1].set_xlabel("Observed [m³/s]")
    axes[1].set_ylabel("Simulated [m³/s]")
    axes[1].grid(True)

    plt.tight_layout()

    if output_path:
        fig.savefig(output_path, dpi=150)
        plt.close(fig)
    else:
        plt.show()
