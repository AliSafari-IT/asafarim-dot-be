import type { SvgIconProps } from "./svg-types";

function Drive({
  width = 24,
  height = 24,
  viewBox = "0 0 24 24",
  fill = "none",
  stroke = "currentColor",
  strokeWidth = 2,
  strokeLinecap = "round",
  onClick,
  className,
  title,
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
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      className={className}
      aria-hidden
      style={style}
    >
      {title && <title>{title}</title>}
      <path d="M12 2L2 19h20L12 2z" />
    </svg>
  );
}

export default Drive;
