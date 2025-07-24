import type { SVGProps } from "react";

export function VitaNovaIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 22c-5 0-9-4.5-9-10S7 2 12 2s9 4.5 9 10-4 10-9 10z" />
      <path d="M12 14a2.5 2.5 0 0 0 2.5-2.5c0-2-2.5-4-2.5-4s-2.5 2-2.5 4A2.5 2.5 0 0 0 12 14z" />
      <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z" />
      <path d="M12 12c-3 0-5 2.5-5 5" />
    </svg>
  );
}
