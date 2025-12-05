from pathlib import Path
from typing import Union

import pandas as pd


PathLike = Union[str, Path]


def read_hydrograph(csv_path: PathLike) -> pd.DataFrame:
    """
    Read a hydrograph CSV with at least:
        datetime, Q_obs

    - Parses 'datetime' column to pandas datetime
    - Sets it as index
    - Sorts by time
    """
    path = Path(csv_path)
    if not path.exists():
        raise FileNotFoundError(f"File not found: {path}")

    df = pd.read_csv(path)

    if "datetime" not in df.columns:
        raise ValueError("CSV must contain a 'datetime' column")
    if "Q_obs" not in df.columns:
        raise ValueError("CSV must contain a 'Q_obs' column")

    df["datetime"] = pd.to_datetime(df["datetime"])
    df = df.set_index("datetime").sort_index()

    return df
