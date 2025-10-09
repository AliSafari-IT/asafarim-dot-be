import type { SvgIconProps } from "./svg-types";

function Website({
  width = 20,
  height = 20,
  viewBox = "0 0 20 20",
  fill = "currentColor",
  stroke = "none",
  strokeWidth = 0,
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
      aria-hidden
      onClick={onClick}
      className={className}
      style={style}
    >
      <title>{title}</title>
      <path
        d="M2 2h16M2 16h16M7 7V16m0 5v3"
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
      />
    </svg>
  );
}

export default Website;
