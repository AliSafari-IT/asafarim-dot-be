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
