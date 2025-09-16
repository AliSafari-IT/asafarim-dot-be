import type { SvgIconProps } from "./svg-types";

function Html({ width = 24, height = 24, viewBox = "0 0 24 24", fill = "none", stroke = "currentColor", strokeWidth = 2, strokeLinecap = "round" }: SvgIconProps) {
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
    >
      {/* Simple HTML5 shield */}
      <path d="M3 3h18l-1.5 15L12 21l-7.5-3L3 3Z"/>
      <path d="M7 7h10M8 12h8M9 16h6"/>
    </svg>
  );
}

export default Html;
