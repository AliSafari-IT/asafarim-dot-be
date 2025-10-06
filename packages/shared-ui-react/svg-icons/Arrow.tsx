import type { SvgIconProps } from "./svg-types";

function Arrow({ width = 24, height = 24, viewBox = "0 0 24 24", fill = "none", stroke = "currentColor", strokeWidth = 2, strokeLinecap = "round", title, onClick, className, style }: SvgIconProps) {
    return (
      <svg width={width} height={height} viewBox={viewBox} aria-hidden onClick={onClick} className={className} style={style}>
        <title>{title}</title>
        <path
          d="M7 17L17 7M17 7H9m8 0v8"
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap={strokeLinecap}
        />
      </svg>
    );
  }
  
  export default Arrow;