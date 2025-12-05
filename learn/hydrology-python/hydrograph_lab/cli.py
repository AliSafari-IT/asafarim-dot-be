import argparse
from typing import Optional

from .io import read_hydrograph
from .stats import basic_stats, print_stats
from .plotting import plot_hydrograph
from .events import extract_event, detect_events


def main(argv: Optional[list[str]] = None) -> None:
    parser = argparse.ArgumentParser(
        prog="hydrograph-lab",
        description="Hydrology toolkit for hydrographs and events.",
    )

    subparsers = parser.add_subparsers(dest="command", required=True)

    # stats
    stats_parser = subparsers.add_parser(
        "stats", help="Compute basic statistics for Q_obs"
    )
    stats_parser.add_argument("csv", help="Path to hydrograph CSV")

    # plot
    plot_parser = subparsers.add_parser(
        "plot", help="Plot the hydrograph"
    )
    plot_parser.add_argument("csv", help="Path to hydrograph CSV")
    plot_parser.add_argument(
        "--out",
        help="Optional output image path; if omitted, shows interactive plot",
        default=None,
    )

    # event-extract
    ee_parser = subparsers.add_parser(
        "event-extract", help="Extract a time window as event"
    )
    ee_parser.add_argument("csv", help="Path to hydrograph CSV")
    ee_parser.add_argument("start", help="Start datetime (e.g. '2024-01-01')")
    ee_parser.add_argument("end", help="End datetime (e.g. '2024-01-03')")
    ee_parser.add_argument(
        "--out-csv",
        help="Optional output CSV file for event",
        default=None,
    )
    ee_parser.add_argument(
        "--out-png",
        help="Optional output image for event hydrograph",
        default=None,
    )

    # event-detect
    ed_parser = subparsers.add_parser(
        "event-detect", help="Detect events above threshold"
    )
    ed_parser.add_argument("csv", help="Path to hydrograph CSV")
    ed_parser.add_argument("threshold", type=float, help="Flow threshold")
    ed_parser.add_argument(
        "--min-gap-hours",
        type=int,
        default=6,
        help="Minimum hours below threshold to close an event (default 6)",
    )

    # evaluate
    eval_parser = subparsers.add_parser(
        "evaluate", help="Evaluate model vs observations"
    )
    eval_parser.add_argument("--obs", required=True, help="Observed CSV file")
    eval_parser.add_argument("--sim", required=True, help="Simulated CSV file")
    eval_parser.add_argument(
        "--obs-col",
        default="Q_obs",
        help="Column of observed discharge (default: Q_obs)",
    )
    eval_parser.add_argument(
        "--sim-col",
        default="Q_sim",
        help="Column of simulated discharge (default: Q_sim)",
    )
    eval_parser.add_argument(
        "--out",
        help="Optional text output file to save metrics",
        default=None,
    )
    eval_parser.add_argument(
        "--plot",
        help="Optional PNG file to save comparison plot",
        default=None,
    )
    eval_parser.add_argument(
        "--pub",
        action="store_true",
        help="Use publication-quality plotting style",
    )

    # calibrate
    calib_parser = subparsers.add_parser(
        "calibrate", help="Calibrate Linear Reservoir Model"
    )
    calib_parser.add_argument("--obs", required=True, help="Observed discharge CSV")
    calib_parser.add_argument("--precip", required=True, help="Precipitation CSV")
    calib_parser.add_argument(
        "--aet", default=None, help="Potential/Actual Evapotranspiration CSV (optional)"
    )
    calib_parser.add_argument(
        "--obs-col",
        default="Q_obs",
        help="Column name for observed discharge (default: Q_obs)",
    )
    calib_parser.add_argument(
        "--precip-col",
        default="precip",
        help="Column name for precipitation (default: precip)",
    )
    calib_parser.add_argument(
        "--aet-col",
        default="aet",
        help="Column name for AET (default: aet)",
    )
    calib_parser.add_argument(
        "--out",
        required=True,
        help="Output JSON file for best parameters and metrics",
    )
    calib_parser.add_argument(
        "--plot",
        default=None,
        help="Optional PNG file to save calibration plot",
    )

    # report
    report_parser = subparsers.add_parser(
        "report", help="Generate hydrological evaluation report"
    )
    report_parser.add_argument(
        "--metrics", required=True, help="JSON file containing metrics"
    )
    report_parser.add_argument(
        "--format",
        default="md",
        choices=["txt", "md", "html", "latex"],
        help="Output format (default: md)",
    )
    report_parser.add_argument(
        "--plot",
        default=None,
        help="Optional path to plot image to embed in report",
    )
    report_parser.add_argument(
        "--out",
        required=True,
        help="Output file path",
    )

    args = parser.parse_args(argv)

    if args.command == "stats":
        df = read_hydrograph(args.csv)
        stats = basic_stats(df)
        print_stats(stats)

    elif args.command == "plot":
        df = read_hydrograph(args.csv)
        plot_hydrograph(df, output_path=args.out)

    elif args.command == "event-extract":
        df = read_hydrograph(args.csv)
        event_df = extract_event(df, args.start, args.end)
        if args.out_csv:
            event_df.to_csv(args.out_csv)
            print(f"Saved event CSV to: {args.out_csv}")
        if args.out_png:
            from .plotting import plot_hydrograph  # local import to avoid circular issues

            plot_hydrograph(
                event_df,
                title=f"Event {args.start} → {args.end}",
                output_path=args.out_png,
            )
        if not args.out_csv and not args.out_png:
            # Show a quick preview in console
            print(event_df.head())

    elif args.command == "event-detect":
        df = read_hydrograph(args.csv)
        events = detect_events(df, args.threshold, args.min_gap_hours)
        print("Detected events:")
        for start, end in events:
            print(f"- {start} -> {end}")

    elif args.command == "evaluate":
        from .evaluation import evaluate_from_csv, align_obs_sim
        from .plotting_compare import plot_model_comparison

        metrics = evaluate_from_csv(
            obs_csv=args.obs,
            sim_csv=args.sim,
            obs_col=args.obs_col,
            sim_col=args.sim_col,
        )

        # Print to console
        print("Model Evaluation Metrics")
        print("------------------------")
        for k, v in metrics.items():
            print(f"{k:8s}: {v:.4f}")

        # Save to file if requested
        if args.out:
            with open(args.out, "w") as f:
                for k, v in metrics.items():
                    f.write(f"{k}: {v}\n")
            print(f"Saved metrics to: {args.out}")

        # Save plot if requested
        if args.plot:
            import pandas as pd

            # Re-read and align for plotting
            obs_df = pd.read_csv(args.obs)
            sim_df = pd.read_csv(args.sim)

            obs_df["datetime"] = pd.to_datetime(obs_df["datetime"])
            sim_df["datetime"] = pd.to_datetime(sim_df["datetime"])

            obs_df = obs_df.set_index("datetime")
            sim_df = sim_df.set_index("datetime")

            obs_series, sim_series = align_obs_sim(
                obs_df, sim_df, obs_col=args.obs_col, sim_col=args.sim_col
            )

            if args.pub:
                from .plotting_pub import plot_model_comparison_pub, enable_publication_style
                enable_publication_style()
                plot_model_comparison_pub(obs_series, sim_series, output_path=args.plot)
            else:
                plot_model_comparison(obs_series, sim_series, output_path=args.plot)

            print(f"Saved plot to: {args.plot}")

    elif args.command == "calibrate":
        import json
        from .calibration import calibrate_linear_reservoir
        from .plotting_compare import plot_model_comparison

        obs_df = read_hydrograph(args.obs, value_col=args.obs_col)
        precip_df = read_hydrograph(args.precip, value_col=args.precip_col)

        aet_series = None
        if args.aet:
            aet_df = read_hydrograph(args.aet, value_col=args.aet_col)
            if args.aet_col in aet_df.columns:
                aet_series = aet_df[args.aet_col]

        obs_series = obs_df[args.obs_col]
        precip_series = precip_df[args.precip_col]

        print("Starting calibration...")
        result = calibrate_linear_reservoir(
            obs=obs_series,
            precip=precip_series,
            aet=aet_series,
        )

        # Prepare JSON output
        output_data = {
            "best_k": result["best_k"],
            "metrics": result["metrics"],
            "success": result["success"],
            "message": result["message"],
        }

        with open(args.out, "w") as f:
            json.dump(output_data, f, indent=2)
        print(f"Calibration complete. Best k: {result['best_k']:.4f}")
        print(f"Saved results to: {args.out}")

        if args.plot:
            plot_model_comparison(
                obs=obs_series,
                sim=result["sim"],
                output_path=args.plot,
            )
            print(f"Saved plot to: {args.plot}")

    elif args.command == "report":
        import json
        from .reporting import create_report

        with open(args.metrics, "r") as f:
            data = json.load(f)

        # Handle both direct metrics dict and calibration output format
        if "metrics" in data and isinstance(data["metrics"], dict):
            metrics = data["metrics"]
        else:
            metrics = data

        report_content = create_report(
            metrics=metrics,
            plot_path=args.plot,
            format=args.format,
        )

        with open(args.out, "w") as f:
            f.write(report_content)
        
        print(f"Report generated: {args.out}")


if __name__ == "__main__":
    main()
