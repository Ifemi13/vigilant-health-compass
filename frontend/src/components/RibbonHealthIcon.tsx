import type { IconProps } from '@mingcute/react'

/**
 * Awareness ribbon, from Tabler Icons "ribbon-health" (MIT, © Paweł Kuna): MingCute has no ribbon. Takes the
 * same props as the MingCute icon components.
 */
export default function RibbonHealthIcon({ size = 24, color = 'currentColor', title, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      {...props}
    >
      {title && <title>{title}</title>}
      <path
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 21s9.286-9.841 9.286-13.841a3.86 3.86 0 0 0-1.182-3.008A4.13 4.13 0 0 0 12 3.007A4.13 4.13 0 0 0 8.896 4.15a3.86 3.86 0 0 0-1.182 3.01C7.714 11.16 17 21 17 21"
      />
    </svg>
  )
}
