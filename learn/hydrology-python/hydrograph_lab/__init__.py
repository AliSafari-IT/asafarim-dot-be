"""
hydrograph_lab

Small hydrology toolkit for learning Python:
- read time series
- compute basic stats
- plot hydrographs
- extract and detect events
"""

from .io import read_hydrograph
from .stats import basic_stats
from .plotting import plot_hydrograph
from .events import extract_event, detect_events

__all__ = [
    "read_hydrograph",
    "basic_stats",
    "plot_hydrograph",
    "extract_event",
    "detect_events",
]
