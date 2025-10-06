import type { SvgIconProps } from "./svg-types";

function ORCID({
  width = 24,
  height = 24,
  viewBox = "0 0 24 24",
  fill = "none",
  stroke = "currentColor",
  strokeWidth = 2,
  strokeLinecap = "round",
  title,
  onClick,
  className,
  style,
}: SvgIconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox={viewBox}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap={strokeLinecap}
      onClick={onClick}
      className={className || "text-phosphor"}
      aria-hidden
      style={style}
    >
      <title>{title}</title>
      <circle cx="12" cy="12" r="10" fill="var(--warning-color)" />
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fill="white"
        fontSize="12"
        fontWeight="normal"
      >
        iD
      </text>
    </svg>
  );
}

export default ORCID;
