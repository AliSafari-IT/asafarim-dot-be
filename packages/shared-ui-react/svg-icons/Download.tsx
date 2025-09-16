import type { SvgIconProps } from "./svg-types";

function Download({ width = 24, height = 24, viewBox = "0 0 24 24", fill = "none", stroke = "currentColor", strokeWidth = 2, strokeLinecap = "round" }: SvgIconProps) {
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
        <path d="M12 16v-4l-4-4-4 4v4M12 22c5 0 7-1.73 7-7h-4l-4 4M2 12h20v8H2z" />
    </svg>
  );
}

export default Download;