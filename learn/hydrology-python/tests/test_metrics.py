import numpy as np
import pandas as pd

from hydrograph_lab.metrics import nse, rmse, bias, pearson_r, kge


def test_nse_perfect():
    obs = [1, 2, 3, 4, 5]
    sim = [1, 2, 3, 4, 5]
    assert nse(obs, sim) == 1.0


def test_nse_worse_than_mean():
    obs = [1, 2, 3, 4, 5]
    sim = [5, 4, 3, 2, 1]
    value = nse(obs, sim)
    # Should be negative in this case
    assert value < 0


def test_rmse_zero_for_perfect_match():
    obs = [1, 2, 3]
    sim = [1, 2, 3]
    assert rmse(obs, sim) == 0.0


def test_bias_zero_for_unbiased():
    obs = [1, 2, 3]
    sim = [1, 2, 3]
    assert abs(bias(obs, sim)) < 1e-9


def test_pearson_r_perfect_positive():
    obs = [1, 2, 3, 4]
    sim = [2, 4, 6, 8]
    r = pearson_r(obs, sim)
    assert r > 0.999  # allow tiny numeric differences


def test_kge_perfect():
    obs = [1, 2, 3, 4, 5]
    sim = [1, 2, 3, 4, 5]
    value = kge(obs, sim)
    assert abs(value - 1.0) < 1e-9
