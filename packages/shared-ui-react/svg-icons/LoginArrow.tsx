import type { SvgIconProps } from "./svg-types";

function LoginArrow({
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
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" 
      />
    </svg>
  );
}

export default LoginArrow;
