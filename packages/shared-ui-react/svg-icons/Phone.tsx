import type { SvgIconProps } from "./svg-types";

function Phone({ width = 16, height = 16, viewBox = "0 0 16 16", fill = "currentColor", stroke = "none", strokeWidth = 0, strokeLinecap = "round", title, onClick, className, style }: SvgIconProps) {

    return (
        <svg width={width} height={height} viewBox={viewBox} aria-hidden onClick={onClick} className={className} style={style}>
            <title>{title}</title>
            <path d="M2 2h12M2 14h12M7 7V4m0 5v3" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} />
        </svg>
    );
}

export default Phone;