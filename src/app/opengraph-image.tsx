import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Theologik";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#faf8f5",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px",
        }}
      >
        {/* Logo wordmark */}
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            color: "#1a1a1a",
            letterSpacing: "-3px",
            lineHeight: 1,
            marginBottom: 28,
          }}
        >
          THEOLOGIK
        </div>
        {/* Divider */}
        <div
          style={{
            width: 64,
            height: 2,
            background: "#b5956a",
            marginBottom: 28,
          }}
        />
        {/* Tagline */}
        <div
          style={{
            fontSize: 22,
            color: "#8b7d6b",
            letterSpacing: "3px",
            textTransform: "uppercase",
          }}
        >
          Theologie · Bibelauslegung · Kirchengeschichte
        </div>
      </div>
    ),
    { ...size }
  );
}
