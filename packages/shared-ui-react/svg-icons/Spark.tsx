import type { SvgIconProps } from "./svg-types";

function Spark({ width = 24, height = 24, viewBox = "0 0 24 24", fill = "none", stroke = "currentColor", strokeWidth = 2, strokeLinecap = "round", title, onClick, className, style }: SvgIconProps) {
    return (
      <svg width={width} height={height} viewBox={viewBox} aria-hidden onClick={onClick} className={className} style={style}>
        <title>{title}</title>
        <path
          d="M12 3l1.7 5.2L19 10l-5.3 1.8L12 17l-1.7-5.2L5 10l5.3-1.8L12 3z"
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap={strokeLinecap}
          opacity=".9"
        />
      </svg>
    );
  }
  
  export default Spark;