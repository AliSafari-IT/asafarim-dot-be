import type { SvgIconProps } from "./svg-types";

function Pdf({ width = 24, height = 24, viewBox = "0 0 24 24", fill = "none", stroke = "currentColor", strokeWidth = 2, strokeLinecap = "round" }: SvgIconProps) {
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
      {/* File with folded corner and PDF letters */}
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"/>
      <path d="M14 2v6h6"/>
      <path d="M7.5 16v-4h1.5a1.5 1.5 0 1 1 0 3H7.5"/>
      <path d="M12 12v4h1.5a2 2 0 0 0 0-4H12Z"/>
      <path d="M17 12h-2v4h2"/>
    </svg>
  );
}

export default Pdf;
