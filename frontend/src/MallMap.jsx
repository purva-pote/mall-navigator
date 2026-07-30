// frontend/src/MallMap.jsx
import { useState, useEffect } from "react";

function MallMap({ start, destination, route }) {
  const [activeFloor, setActiveFloor] = useState("Ground Floor");

  // 1. Separate Coordinates for Ground Floor Layout
  const groundFloorCoords = {
    Nike: { x: 70, y: 80 },
    Adidas: { x: 200, y: 80 },
    AM_PM: { x: 330, y: 80 },
    Elevator_GF: { x: 260, y: 170 },
    Shaheen_Grocers: { x: 70, y: 170 },
  };

  // 2. Separate Coordinates for 1st Floor Layout (Spaced Cleanly!)
  const firstFloorCoords = {
    Elevator_1F: { x: 260, y: 80 },
    Reebok: { x: 100, y: 170 },
    Limelight: { x: 200, y: 170 },
    Zara: { x: 300, y: 170 },
  };

  // Auto-switch visible map view if user selects a 1st floor destination
  useEffect(() => {
    if (["Reebok", "Limelight", "Zara", "Elevator_1F"].includes(destination)) {
      setActiveFloor("1st Floor");
    } else if (["Nike", "Adidas", "AM_PM", "Shaheen_Grocers", "Elevator_GF"].includes(start)) {
      setActiveFloor("Ground Floor");
    }
  }, [start, destination]);

  const currentCoords = activeFloor === "Ground Floor" ? groundFloorCoords : firstFloorCoords;

  const isNodeInRoute = (store) => route.includes(store);

  const getNodeColor = (store) => {
    if (store === start) return "#22c55e"; // Green
    if (store === destination) return "#6366f1"; // Periwinkle
    if (isNodeInRoute(store)) return "#3b82f6"; // Blue
    return "#475569"; // Slate Muted
  };

  return (
    <div style={{ background: "#0f172a", borderRadius: "20px", padding: "20px", marginBottom: "25px" }}>
      
      {/* Header & Floor Switcher Tabs */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            onClick={() => setActiveFloor("Ground Floor")}
            style={{
              padding: "6px 12px",
              borderRadius: "10px",
              border: "none",
              fontSize: "11px",
              fontWeight: "700",
              cursor: "pointer",
              background: activeFloor === "Ground Floor" ? "#6366f1" : "rgba(255,255,255,0.1)",
              color: "#ffffff",
              transition: "all 0.2s"
            }}
          >
            Ground Floor
          </button>
          <button
            type="button"
            onClick={() => setActiveFloor("1st Floor")}
            style={{
              padding: "6px 12px",
              borderRadius: "10px",
              border: "none",
              fontSize: "11px",
              fontWeight: "700",
              cursor: "pointer",
              background: activeFloor === "1st Floor" ? "#6366f1" : "rgba(255,255,255,0.1)",
              color: "#ffffff",
              transition: "all 0.2s"
            }}
          >
            1st Floor
          </button>
        </div>

        <div style={{ display: "flex", gap: "8px", fontSize: "10px", color: "#94a3b8", fontWeight: "600" }}>
          <span style={{ color: "#22c55e" }}>● Start</span>
          <span style={{ color: "#6366f1" }}>● Target</span>
        </div>
      </div>

      {/* SVG Blueprint Canvas */}
      <svg viewBox="0 0 400 220" style={{ width: "100%", height: "auto", overflow: "visible" }}>
        
        {/* Render Ground Floor Corridors */}
        {activeFloor === "Ground Floor" && (
          <g stroke="#334155" strokeWidth="3" strokeDasharray="4">
            <line x1="70" y1="80" x2="200" y2="80" />
            <line x1="200" y1="80" x2="330" y2="80" />
            <line x1="200" y1="80" x2="260" y2="170" />
            <line x1="70" y1="80" x2="70" y2="170" />
          </g>
        )}

        {/* Render 1st Floor Corridors */}
        {activeFloor === "1st Floor" && (
          <g stroke="#334155" strokeWidth="3" strokeDasharray="4">
            <line x1="260" y1="80" x2="100" y2="170" />
            <line x1="100" y1="170" x2="200" y2="170" />
            <line x1="200" y1="170" x2="300" y2="170" />
          </g>
        )}

        {/* Render Active Level Store Nodes */}
        {Object.entries(currentCoords).map(([storeName, coords]) => (
          <g key={storeName}>
            <circle
              cx={coords.x}
              cy={coords.y}
              r={storeName === start || storeName === destination || isNodeInRoute(storeName) ? "11" : "7"}
              fill={getNodeColor(storeName)}
              style={{ transition: "all 0.3s ease" }}
            />
            <text
              x={coords.x}
              y={coords.y + 22}
              fill="#f8fafc"
              fontSize="10"
              fontWeight="600"
              textAnchor="middle"
            >
              {storeName.replace("_", " ")}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default MallMap;