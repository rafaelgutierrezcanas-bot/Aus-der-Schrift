import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#1a1a1a",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            color: "#b5956a",
            fontSize: 22,
            fontWeight: 700,
            fontFamily: "serif",
            letterSpacing: "-1px",
            lineHeight: 1,
          }}
        >
          T
        </div>
      </div>
    ),
    { ...size }
  );
}
