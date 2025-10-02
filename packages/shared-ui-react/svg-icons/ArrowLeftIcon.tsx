import {type SvgIconProps} from "./svg-types";

function ArrowLeftIcon({ width = 24, height = 24, viewBox = "0 0 24 24", fill = "none", stroke = "currentColor", strokeWidth = 2, strokeLinecap = "round", title, onClick, className }: SvgIconProps) {
    return (
      <svg width={width} height={height} viewBox={viewBox} aria-hidden onClick={onClick} className={className}>
        <title>{title}</title>
        <path
          d="M17 17L7 7M7 7H15m-8 0v8"
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap={strokeLinecap}
        />
      </svg>
    );
  }
  
  export default ArrowLeftIcon;
