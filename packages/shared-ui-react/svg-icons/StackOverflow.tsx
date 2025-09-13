import type { SvgIconProps } from "./svg-types";

function StackOverflow({
  width = 24,
  height = 24,
  viewBox = "0 0 24 24",
  fill = "currentColor",
  stroke = "currentColor",
  strokeWidth = 2,
  strokeLinecap = "round",
}: SvgIconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox={viewBox}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap={strokeLinecap}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        fill={fill}
        d="M17.24 19.399v-4.804h1.6V21H4.381v-6.405h1.598v4.804H17.24zM7.582 17.8h8.055v-1.604H7.582V17.8zm.195-3.64l8.299 1.731.336-1.614-8.294-1.73-.341 1.614zm1.087-4.03l7.68 3.562.686-1.474-7.68-3.564-.686 1.474zm2.145-3.743L18.6 13.572l1.073-1.28-7.594-6.32-1.07 1.239zm4.469-4.249l-1.515 1.122 5.91 7.955 1.514-1.122-5.91-7.955zM7.582 21h9.434v-1.6H7.582V21z"
      />
    </svg>
  );
}

export { StackOverflow as default };
