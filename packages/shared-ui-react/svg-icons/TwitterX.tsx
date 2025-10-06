import type { SvgIconProps } from "./svg-types";

function TwitterX({
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
      <path d="M12.658 14.577v-4.27h1.423V16H1.23v-5.693h1.42v4.27h10.006zm-8.583-1.423h7.16V11.73h-7.16v1.424zm.173-3.948l6.987 1.465.294-1.398L4.272 7.81l-.294 1.396zm.861-3.295l6.47 3.016.585-1.258-6.47-3.016-.585 1.258zm1.723-3.143L10.238 5.13l.88-1.058-4.53-3.77-.88 1.058z" />
    </svg>
  );
}

export default TwitterX;
