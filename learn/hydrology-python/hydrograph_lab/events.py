from typing import List, Tuple

import pandas as pd


def extract_event(df: pd.DataFrame, start: str, end: str) -> pd.DataFrame:
    """
    Extract a time window [start, end] from the hydrograph.
    start, end can be any string understood by pandas.to_datetime.
    """
    if "Q_obs" not in df.columns:
        raise ValueError("DataFrame must contain 'Q_obs' column")

    start_dt = pd.to_datetime(start)
    end_dt = pd.to_datetime(end)
    return df.loc[start_dt:end_dt]


def detect_events(
    df: pd.DataFrame,
    threshold: float,
    min_gap_hours: int = 6,
) -> List[Tuple[pd.Timestamp, pd.Timestamp]]:
    """
    Detect events when Q_obs rises above 'threshold'.
    Event ends when Q_obs stays below 'threshold' for min_gap_hours.

    Returns a list of (event_start, event_end) timestamps.
    Assumes a regular time step in the index (e.g. hourly).
    """
    if "Q_obs" not in df.columns:
        raise ValueError("DataFrame must contain 'Q_obs' column")

    # Create a boolean series where flow is above threshold
    above = df["Q_obs"] > threshold

    events: List[Tuple[pd.Timestamp, pd.Timestamp]] = []

    in_event = False
    event_start: pd.Timestamp | None = None
    gap_counter = 0

    # Estimate dt in hours from first two points (simple assumption)
    if len(df.index) > 1:
        dt = df.index[1] - df.index[0]
        hours_per_step = dt.total_seconds() / 3600.0
    else:
        hours_per_step = 1.0  # fallback

    for idx, is_above in above.items():
        if is_above:
            if not in_event:
                in_event = True
                event_start = idx
            gap_counter = 0
        else:
            if in_event:
                gap_counter += hours_per_step
                if gap_counter >= min_gap_hours:
                    if event_start is not None:
                        events.append((event_start, idx))
                    in_event = False
                    gap_counter = 0

    # If still in event at end of series, close it
    if in_event and event_start is not None:
        events.append((event_start, df.index[-1]))

    return events
