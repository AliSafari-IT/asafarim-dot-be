import type { SvgIconProps } from "./svg-types";

function Google({
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
      className={className}
      aria-hidden
      style={style}
    >
      <title>{title}</title>
      <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
      <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
      <circle cx="12" cy="7" r="2"/>
      <path d="M16 12h6v2h-6v-2z"/>
      <path d="M8 14h6v2H8v-2z"/>
    </svg>
  );
}

export default Google;

