import { ImageResponse } from "next/og";

export const alt = "Observatorio Académico de Conflictos Mineros del Perú";
export const size = { width: 1200, height: 627 };
export const contentType = "image/png";

const backgroundUrl =
  "https://ddev1822.github.io/Conflictos_Mineros/multimedia/backgrounds/portada-dialogo-territorial.webp";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          background: "#072b3d",
          color: "#f7f1e7",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <img
          src={backgroundUrl}
          alt=""
          width={1200}
          height={627}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "linear-gradient(90deg, rgba(4,35,50,0.98) 0%, rgba(4,35,50,0.93) 40%, rgba(4,35,50,0.42) 70%, rgba(4,35,50,0.18) 100%)",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "46px 62px 34px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", width: 720 }}>
            <div
              style={{
                display: "flex",
                color: "#ef8f50",
                fontSize: 15,
                fontWeight: 800,
                letterSpacing: 2.2,
                textTransform: "uppercase",
                marginBottom: 14,
              }}
            >
              Observatorio de Conflictos Mineros del Perú
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontFamily: "Georgia, serif",
                fontSize: 62,
                fontWeight: 700,
                lineHeight: 1.04,
                letterSpacing: -1.8,
              }}
            >
              <span>Conflictos mineros del</span>
              <span>Perú: análisis académico,</span>
              <span>territorial y relacional.</span>
            </div>

            <div
              style={{
                display: "flex",
                width: 660,
                marginTop: 18,
                color: "#dbe5e8",
                fontSize: 20,
                lineHeight: 1.42,
              }}
            >
              Base académica navegable de conflictos, normas, actores,
              territorios, minería ilegal y alternativas de política pública.
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            {[
              ["CONFLICTOS SOCIALES MINEROS", "61", "casos registrados"],
              ["REINFO Y FORMALIZACIÓN", "24,669", "inscripciones vigentes"],
              ["MADRE DE DIOS", "135,939 ha", "pérdida regional acumulada"],
            ].map(([label, value, caption]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: 250,
                  minHeight: 112,
                  padding: "15px 17px",
                  border: "1px solid rgba(214,230,234,0.34)",
                  background: "rgba(3,38,53,0.86)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    color: "#ef8f50",
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: 1.15,
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    display: "flex",
                    marginTop: 10,
                    color: "#f09a5c",
                    fontFamily: "Georgia, serif",
                    fontSize: 30,
                    fontWeight: 700,
                  }}
                >
                  {value}
                </div>
                <div
                  style={{
                    display: "flex",
                    marginTop: 2,
                    color: "#c9d7da",
                    fontSize: 12,
                  }}
                >
                  {caption}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
