import type { SVGProps } from "react";

export function HanIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="none"
            aria-hidden="true"
            shapeRendering="geometricPrecision"
            textRendering="geometricPrecision"
            {...props}
        >
            <text
                x="12"
                y="12.5"
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily="'Hiragino Sans', 'Yu Gothic', 'Noto Sans CJK JP', sans-serif"
                fontSize="20.5"
                fontWeight="600"
                fill="currentColor"
                stroke="none"
            >
                漢
            </text>
        </svg>
    );
}
