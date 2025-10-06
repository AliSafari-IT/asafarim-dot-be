import type { SvgIconProps } from "./svg-types";

function MarkDown({ width = 24, height = 24, viewBox = "0 0 24 24", fill = "none", stroke = "currentColor", strokeWidth = 2, strokeLinecap = "round", title, onClick, className, style }: SvgIconProps) {
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
      {/* Minimal Markdown logo: box with M and down arrow */}
      <rect x="3" y="4" width="18" height="16" rx="2"/>
      <path d="M7 15V9l2.5 3L12 9v6"/>
      <path d="M16 9v4m0 0l2-2m-2 2l-2-2"/>
    </svg>
  );
}

export default MarkDown;
