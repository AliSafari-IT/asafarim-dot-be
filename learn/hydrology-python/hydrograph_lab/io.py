from pathlib import Path
from typing import Union, Optional
import pandas as pd

PathLike = Union[str, Path]


def read_hydrograph(csv_path: PathLike, value_col: Optional[str] = None) -> pd.DataFrame:
    """
    Generic hydrograph reader.

    - Ensures the file exists.
    - Ensures 'datetime' exists and becomes the index.
    - If value_col is provided, validates that the column exists.
    - If value_col is None, performs NO value column validation.

    This makes the function valid for both obs (Q_obs) and sim (Q_sim)
    or any other hydrological series (e.g. rainfall, PET, etc.).
    """
    path = Path(csv_path)
    if not path.exists():
        raise FileNotFoundError(f"File not found: {path}")

    df = pd.read_csv(path)

    if "datetime" not in df.columns:
        raise ValueError("CSV must contain a 'datetime' column")

    if value_col is not None and value_col not in df.columns:
        raise ValueError(
            f"CSV must contain '{value_col}' column (found: {list(df.columns)})"
        )

    df["datetime"] = pd.to_datetime(df["datetime"])
    df = df.set_index("datetime").sort_index()

    return df
