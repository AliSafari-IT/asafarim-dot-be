"""
datasets.py

Core data abstractions for hydrograph_lab.
Provides a simple, typed way to manage hydrological time series
and their metadata (obs, sim, rainfall, PET, etc.).
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, Optional, Union, Iterable

import pandas as pd

from .io import read_hydrograph


PathLike = Union[str, Path]


@dataclass
class HydroMetadata:
    """Basic metadata for a hydrological dataset."""
    name: str = "Unnamed catchment"
    river: Optional[str] = None
    station: Optional[str] = None
    area_km2: Optional[float] = None
    units: Dict[str, str] = field(default_factory=dict)  # e.g. {"Q": "m3/s", "P": "mm"}
    source: Optional[str] = None
    notes: Optional[str] = None


@dataclass
class ColumnRoles:
    """
    Maps logical roles to column names in the underlying DataFrame.
    Example roles:
      - obs_q: observed discharge
      - sim_q: simulated discharge
      - p: precipitation
      - pet: potential evapotranspiration
    """
    obs_q: Optional[str] = "Q_obs"
    sim_q: Optional[str] = "Q_sim"
    p: Optional[str] = None
    pet: Optional[str] = None

    def as_dict(self) -> Dict[str, str]:
        return {k: v for k, v in self.__dict__.items() if v is not None}


@dataclass
class HydroDataset:
    """
    Core hydrological dataset abstraction.

    Wraps a time-indexed DataFrame plus metadata and column role mapping.
    """
    data: pd.DataFrame
    roles: ColumnRoles = field(default_factory=ColumnRoles)
    meta: HydroMetadata = field(default_factory=HydroMetadata)

    @classmethod
    def from_csv(
        cls,
        path: PathLike,
        value_cols: Optional[Iterable[str]] = None,
        roles: Optional[ColumnRoles] = None,
        meta: Optional[HydroMetadata] = None,
    ) -> "HydroDataset":
        """
        Create a HydroDataset from a CSV with a 'datetime' column.

        - value_cols: if given, ensures those columns exist
        - roles: optional ColumnRoles
        - meta: optional HydroMetadata
        """
        df = pd.read_csv(path)
        if "datetime" not in df.columns:
            raise ValueError("CSV must contain a 'datetime' column")

        df["datetime"] = pd.to_datetime(df["datetime"])
        df = df.set_index("datetime").sort_index()

        if value_cols is not None:
            missing = [c for c in value_cols if c not in df.columns]
            if missing:
                raise ValueError(f"Missing expected columns: {missing}")

        return cls(
            data=df,
            roles=roles or ColumnRoles(),
            meta=meta or HydroMetadata(name=str(path)),
        )

    def copy(self) -> "HydroDataset":
        return HydroDataset(
            data=self.data.copy(),
            roles=self.roles,
            meta=self.meta,
        )

    def get_obs(self) -> pd.Series:
        if not self.roles.obs_q:
            raise ValueError("No obs_q role defined")
        return self.data[self.roles.obs_q]

    def get_sim(self) -> pd.Series:
        if not self.roles.sim_q:
            raise ValueError("No sim_q role defined")
        return self.data[self.roles.sim_q]

    def get_precip(self) -> pd.Series:
        if not self.roles.p:
            raise ValueError("No precipitation (p) role defined")
        return self.data[self.roles.p]

    def get_pet(self) -> pd.Series:
        if not self.roles.pet:
            raise ValueError("No PET (pet) role defined")
        return self.data[self.roles.pet]

    def subset(self, start: str, end: str) -> "HydroDataset":
        """
        Return a new HydroDataset clipped to [start, end].
        """
        start_dt = pd.to_datetime(start)
        end_dt = pd.to_datetime(end)
        sub = self.data.loc[start_dt:end_dt]
        return HydroDataset(data=sub, roles=self.roles, meta=self.meta)

    def resample(self, rule: str, how: str = "mean") -> "HydroDataset":
        """
        Resample the dataset to a new time resolution.

        rule examples: 'D' (daily), 'H' (hourly), '15T' (15-minute)
        how: 'mean', 'sum', etc.
        """
        if how == "sum":
            new_data = self.data.resample(rule).sum()
        elif how == "mean":
            new_data = self.data.resample(rule).mean()
        else:
            raise ValueError(f"Unsupported resample method: {how}")

        return HydroDataset(data=new_data, roles=self.roles, meta=self.meta)
