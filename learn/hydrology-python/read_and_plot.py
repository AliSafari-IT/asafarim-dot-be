import sys
from pathlib import Path

import pandas as pd
import matplotlib.pyplot as plt


def read_hydrograph(csv_path: str) -> pd.DataFrame:
    path = Path(csv_path)
    if not path.exists():
        raise FileNotFoundError(f"File not found: {path}")

    df = pd.read_csv(path)
    if "datetime" not in df.columns or "Q_obs" not in df.columns:
        raise ValueError("CSV must contain 'datetime' and 'Q_obs' columns")

    df["datetime"] = pd.to_datetime(df["datetime"])
    df = df.set_index("datetime").sort_index()
    return df


def basic_stats(df: pd.DataFrame):
    q = df["Q_obs"]

    print("Basic discharge stats")
    print("---------------------")
    print(f"Mean     : {q.mean():.3f}")
    print(f"Median   : {q.median():.3f}")
    print(f"Max      : {q.max():.3f}")
    print(f"Q95      : {q.quantile(0.95):.3f}")
    print(f"Q05      : {q.quantile(0.05):.3f}")
    print(f"Count    : {q.count()}")


def plot_hydrograph(df: pd.DataFrame, output_path=None):
    plt.figure(figsize=(10, 4))
    df["Q_obs"].plot()
    plt.xlabel("Time")
    plt.ylabel("Discharge [m³/s]")
    plt.title("Observed Hydrograph")
    plt.tight_layout()

    if output_path:
        plt.savefig(output_path, dpi=150)
        print(f"Saved plot to: {output_path}")
    else:
        plt.show()


def main():
    if len(sys.argv) < 2:
        print("Usage: python read_and_plot.py data.csv [output.png]")
        sys.exit(1)

    csv_path = sys.argv[1]
    out = sys.argv[2] if len(sys.argv) > 2 else None

    df = read_hydrograph(csv_path)
    basic_stats(df)
    plot_hydrograph(df, out)


if __name__ == "__main__":
    main()
