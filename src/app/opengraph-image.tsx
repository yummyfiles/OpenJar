import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "OpenJar — Open support for open creators";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0a0a0a",
        fontFamily: "monospace"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 24, color: "#ffffff" }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "9999px",
            backgroundColor: "#a3e635",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#0a0a0a",
            fontSize: 28,
            fontWeight: 700
          }}
        >
          ●
        </div>
        <div style={{ fontSize: 72, fontWeight: 700 }}>OpenJar</div>
      </div>
      <div style={{ marginTop: 24, fontSize: 28, color: "#9ca3af" }}>
        Open support for open creators · free &amp; open source
      </div>
    </div>,
    { ...size }
  );
}
