# hydrograph_lab (learning spine)

A sandbox for hydrology time-series tools, plotting, and simple model evaluation.

- [x] Stage 0: isolated Python env, linting/formatting, notebooks
- [ ] Stage 1: package skeleton (`pyproject.toml`), tests, basic CLI
- [ ] Stage 2+: data IO (CSV/Excel), resampling, plotting, metrics

## Setup (Stage 0)

1. **Environment**:

   ```powershell
   python -m venv env
   .\env\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Run Basic Script**:

   ```powershell
   python read_and_plot.py sample_hydrograph.csv
   ```

   *Calculates stats and displays a plot (or saves it if a second argument is provided).*

