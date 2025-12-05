from pathlib import Path
import sys

import pandas as pd
import matplotlib.pyplot as plt


def read_hydrograph(csv_path: str) -> pd.DataFrame:
    df = pd.read_csv(csv_path)
    df["datetime"] = pd.to_datetime(df["datetime"])
    return df.set_index("datetime").sort_index()


def extract_event(df: pd.DataFrame, start: str, end: str) -> pd.DataFrame:
    start_dt = pd.to_datetime(start)
    end_dt = pd.to_datetime(end)
    return df.loc[start_dt:end_dt]


def plot_event(df_event: pd.DataFrame, output: str | None = None):
    plt.figure(figsize=(10, 4))
    df_event["Q_obs"].plot()
    plt.xlabel("Time")
    plt.ylabel("Discharge [m³/s]")
    plt.title("Extracted Hydrograph Event")
    plt.tight_layout()

    if output:
        plt.savefig(output, dpi=150)
        print(f"Saved event plot to: {output}")
    else:
        plt.show()


def main():
    if len(sys.argv) < 4:
        print("Usage: python event_extraction.py data.csv '2024-01-01' '2024-01-03' [output.csv] [output.png]")
        sys.exit(1)

    csv_path = sys.argv[1]
    start = sys.argv[2]
    end = sys.argv[3]

    output_csv = sys.argv[4] if len(sys.argv) > 4 else None
    output_png = sys.argv[5] if len(sys.argv) > 5 else None

    df = read_hydrograph(csv_path)
    event = extract_event(df, start, end)

    if output_csv:
        event.to_csv(output_csv)
        print(f"Saved event CSV to: {output_csv}")

    plot_event(event, output_png)


if __name__ == "__main__":
    main()
