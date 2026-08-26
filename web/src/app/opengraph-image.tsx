import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Willow — A gentle space to talk things through";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 84, fontWeight: 700, color: "#fff", letterSpacing: "-2px" }}>
          Willow
        </div>
        <div style={{ fontSize: 28, color: "#a3a3a3", marginTop: 16, textAlign: "center", maxWidth: 820 }}>
          A gentle space to talk things through · CBT skills in conversation
        </div>
      </div>
    ),
    { ...size },
  );
}
