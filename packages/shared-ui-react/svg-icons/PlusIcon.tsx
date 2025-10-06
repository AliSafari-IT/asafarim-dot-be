import type { SvgIconProps } from "./svg-types";

function PlusIcon({
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
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export default PlusIcon;