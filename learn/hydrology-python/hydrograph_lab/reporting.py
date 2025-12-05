"""
Reporting module for hydrological model evaluation.

Generates summaries in Text, Markdown, HTML, and LaTeX formats.
"""

from typing import Dict, Optional
import pandas as pd


def to_text_table(metrics: Dict[str, float]) -> str:
    """Generate a plain text table of metrics."""
    lines = []
    lines.append(f"{'Metric':<10} {'Value':<10}")
    lines.append("-" * 20)
    for k, v in metrics.items():
        lines.append(f"{k:<10} {v:.4f}")
    return "\n".join(lines)


def to_markdown_table(metrics: Dict[str, float]) -> str:
    """Generate a Markdown table of metrics."""
    lines = []
    lines.append("| Metric | Value |")
    lines.append("| :--- | :--- |")
    for k, v in metrics.items():
        lines.append(f"| {k} | {v:.4f} |")
    return "\n".join(lines)


def to_html_table(metrics: Dict[str, float]) -> str:
    """Generate an HTML table of metrics."""
    lines = []
    lines.append("<table border='1' style='border-collapse: collapse;'>")
    lines.append("  <thead>")
    lines.append("    <tr><th style='padding: 8px;'>Metric</th><th style='padding: 8px;'>Value</th></tr>")
    lines.append("  </thead>")
    lines.append("  <tbody>")
    for k, v in metrics.items():
        lines.append(f"    <tr><td style='padding: 8px;'>{k}</td><td style='padding: 8px;'>{v:.4f}</td></tr>")
    lines.append("  </tbody>")
    lines.append("</table>")
    return "\n".join(lines)


def to_latex_table(metrics: Dict[str, float]) -> str:
    """Generate a LaTeX table of metrics."""
    lines = []
    lines.append("\\begin{table}[h]")
    lines.append("\\centering")
    lines.append("\\begin{tabular}{|l|l|}")
    lines.append("\\hline")
    lines.append("Metric & Value \\\\")
    lines.append("\\hline")
    for k, v in metrics.items():
        lines.append(f"{k} & {v:.4f} \\\\")
    lines.append("\\hline")
    lines.append("\\end{tabular}")
    lines.append("\\caption{Hydrological Model Evaluation Metrics}")
    lines.append("\\end{table}")
    return "\n".join(lines)


def create_report(
    metrics: Dict[str, float],
    plot_path: Optional[str] = None,
    format: str = "md"
) -> str:
    """
    Create a full hydrological evaluation report.

    Args:
        metrics: Dictionary of performance metrics
        plot_path: Optional path to an image file to embed
        format: Output format ('txt', 'md', 'html', 'latex')

    Returns:
        String containing the formatted report
    """
    fmt = format.lower()
    
    if fmt == "md":
        report = "# Hydrological Model Evaluation Report\n\n"
        report += "## Summary\n"
        # Use list format for summary in MD report as requested in prompt example
        # "Summary of metrics" -> prompt example shows list, but function A says table. 
        # I will use the table function I created for A, but the prompt example for B shows a list.
        # I'll follow the prompt's specific example for the full report structure if it differs, 
        # but reusing the table is cleaner. 
        # However, the prompt example: "- NSE: 0.81". Let's stick to a table for consistency with A.
        report += to_markdown_table(metrics) + "\n\n"
        
        if plot_path:
            report += "## Plot\n"
            report += f"![Hydrograph Comparison]({plot_path})\n"
            
    elif fmt == "html":
        report = "<!DOCTYPE html>\n<html>\n<head>\n<title>Hydrological Model Evaluation Report</title>\n</head>\n<body>\n"
        report += "<h1>Hydrological Model Evaluation Report</h1>\n"
        report += "<h2>Summary</h2>\n"
        report += to_html_table(metrics) + "\n"
        
        if plot_path:
            report += "<h2>Plot</h2>\n"
            # In HTML, we assume the plot path is relative or absolute and accessible
            report += f"<img src='{plot_path}' alt='Hydrograph Comparison' style='max-width: 100%;'>\n"
        
        report += "</body>\n</html>"
        
    elif fmt == "latex":
        report = "\\documentclass{article}\n"
        report += "\\usepackage{graphicx}\n"
        report += "\\begin{document}\n\n"
        report += "\\section*{Hydrological Model Evaluation Report}\n\n"
        report += "\\subsection*{Summary}\n"
        report += to_latex_table(metrics) + "\n\n"
        
        if plot_path:
            report += "\\subsection*{Plot}\n"
            report += "\\begin{figure}[h]\n"
            report += "\\centering\n"
            # LaTeX graphics usually omit extension or need specific handling, 
            # but we'll put the path as is. User might need to adjust for actual compiling.
            report += f"\\includegraphics[width=0.8\\textwidth]{{{plot_path}}}\n"
            report += "\\caption{Hydrograph Comparison}\n"
            report += "\\end{figure}\n"
            
        report += "\\end{document}"
        
    else: # text
        report = "Hydrological Model Evaluation Report\n"
        report += "-" * 36 + "\n"
        report += to_text_table(metrics) + "\n"
        
        if plot_path:
            report += "\n[Plot attached/referenced at: " + plot_path + "]\n"

    return report
