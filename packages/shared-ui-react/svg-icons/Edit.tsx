import type { SvgIconProps } from "./svg-types";

function Edit({
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
      <g id="SVGRepo_iconCarrier">
        <path
          d="M14 6L8 12V16H12L18 10M14 6L17 3L21 7L18 10M14 6L18 10M10 4L4 4L4 20L20 20V14"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>
      </g>
    </svg>
  );
}

export default Edit;
