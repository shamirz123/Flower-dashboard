import { ImageResponse } from "next/og";

// PNG fallback for browsers without SVG favicon support (e.g. Safari).
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <svg width="64" height="64" viewBox="0 0 40 40">
        <rect width="40" height="40" rx="11" fill="#059669" />
        <path d="M12 31V23M20 31V17M28 31V11" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" fill="none" />
        <circle cx="12" cy="20" r="3.4" fill="#ffffff" />
        <circle cx="20" cy="14" r="3.4" fill="#ffffff" />
        <circle cx="28" cy="8" r="3.4" fill="#ffffff" />
      </svg>
    ),
    size,
  );
}
