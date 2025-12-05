from pathlib import Path
import sys
import pandas as pd


def read_hydrograph(csv_path: str) -> pd.DataFrame:
    df = pd.read_csv(csv_path)
    df["datetime"] = pd.to_datetime(df["datetime"])
    return df.set_index("datetime").sort_index()


def detect_events(df: pd.DataFrame, threshold: float, min_gap_hours: int = 6):
    """
    Detect events when Q rises above a threshold.
    Event ends when flow stays below threshold for min_gap_hours.
    """
    df["above"] = df["Q_obs"] > threshold

    events = []
    in_event = False
    event_start = None
    gap_counter = 0

    for dt, row in df.iterrows():
        if row["above"]:
            if not in_event:
                in_event = True
                event_start = dt
            gap_counter = 0
        else:
            if in_event:
                gap_counter += 1
                if gap_counter >= min_gap_hours:
                    events.append((event_start, dt))
                    in_event = False
                    gap_counter = 0

    # Close last event if still open
    if in_event:
        events.append((event_start, df.index[-1]))

    return events


def main():
    if len(sys.argv) < 3:
        print("Usage: python event_detection.py data.csv threshold [min_gap_hours]")
        sys.exit(1)

    csv_path = sys.argv[1]
    threshold = float(sys.argv[2])
    min_gap = int(sys.argv[3]) if len(sys.argv) > 3 else 6

    df = read_hydrograph(csv_path)
    events = detect_events(df, threshold, min_gap)

    print("Detected events:")
    for s, e in events:
        print(f"- {s} → {e}")


if __name__ == "__main__":
    main()
