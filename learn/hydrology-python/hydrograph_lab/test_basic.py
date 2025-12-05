from hydrograph_lab.stats import basic_stats
from hydrograph_lab.io import read_hydrograph
import pandas as pd


def test_basic_stats_smoke():
    # minimal in-memory DataFrame
    df = pd.DataFrame(
        {
            "Q_obs": [1.0, 2.0, 3.0],
        },
        index=pd.date_range("2024-01-01", periods=3, freq="H"),
    )

    stats = basic_stats(df)
    assert "Mean" in stats
    assert stats["Mean"] == 2.0
