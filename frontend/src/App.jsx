import { useState, useEffect } from "react";
import MallMap from "./MallMap";

function App() {
  const [start, setStart] = useState("");
  const [destination, setDestination] = useState("");
  const [stores, setStores] = useState([]); // Dynamic store list from API
  const [route, setRoute] = useState([]);
  const [distance, setDistance] = useState(null);
  const [directions, setDirections] = useState([]);
  const [tripMetadata, setTripMetadata] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [startCategory, setStartCategory] = useState("All");
  const [destCategory, setDestCategory] = useState("All");

  // Load available stores on component mount
  useEffect(() => {
    fetch("http://127.0.0.1:8000/stores")
      .then((res) => res.json())
      .then((data) => setStores(data))
      .catch(() => setError("Failed to load store directory from server."));
  }, []);

  // Filter start dropdown list independently
  const filteredStartStores = startCategory === "All" 
    ? stores 
    : stores.filter(store => store.category === startCategory);

  // Filter destination dropdown list independently
  const filteredDestStores = destCategory === "All" 
    ? stores 
    : stores.filter(store => store.category === destCategory);

  const handleNavigation = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    if (!start || !destination) {
      setError("Please select both a start location and a destination.");
      setLoading(false);
      return;
    }
    if (start === destination) {
      setError("You are already at your destination!");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/navigate?start=${start}&destination=${destination}`
      );
      const data = await response.json();

      if (response.ok) {
        setRoute(data.shortest_path);
        setDistance(data.distance);
        setDirections(data.directions || []);
        setTripMetadata({
          startFloor: data.start_floor,
          destFloor: data.destination_floor,
          floorChange: data.requires_floor_change
        });
      } else {
        setError(data.detail || "Failed to calculate navigation route.");
      }
    } catch (err) {
      setError("Unable to connect to the backend navigation server.");
    } finally {
      setLoading(false);
    }
  };

  const formatName = (name) => name.replace("_", " ");

  const colors = {
    bgLight: "#f8fafc",
    cardLight: "#ffffff",
    textDark: "#0f172a",
    textMuted: "#64748b",
    periwinkleSolid: "#6366f1",
    periwinkleSoft: "#e0e7ff",
    periwinkleText: "#4338ca",
    bottomSheetBg: "#0f172a"
  };

  return (
    <div style={{ background: colors.bgLight, minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
      <div style={{ width: "100%", 
        maxWidth: "440px", // Reduced from 480px for tighter fit
        minHeight: "100vh", 
        background: colors.cardLight, 
        display: "flex", 
        flexDirection: "column", 
        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.05)",
        padding: "16px 16px 0 16px" }}>
        
        {/* Header */}
        {/* Increased bottom margin from 12px to 20px */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <h1 style={{ fontSize: "26px", fontWeight: "800", color: colors.textDark, margin: 0, letterSpacing: "-0.5px" }}>
              Mall Wayfinder
            </h1>
            <span style={{ background: colors.periwinkleSoft, color: colors.periwinkleText, padding: "6px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: "700" }}>
              v2.0
            </span>
          </div>
          {/* Increased font from 12px to 14px */}
          <p style={{ fontSize: "14px", color: colors.textMuted, margin: 0 }}>
            Multi-level intelligent pathfinding core.
          </p>
        </div>

          <MallMap 
            start={start} 
            destination={destination} 
            route={route} 
          />

          {/* START CATEGORY PILLS */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "8px", overflowX: "auto" }}>
            {["All", "Apparel", "Food", "Groceries"].map((cat) => (
              <button
                key={`start-${cat}`}
                type="button"
                onClick={() => setStartCategory(cat)}
                style={{
                  padding: "6px 14px", // Increased padding from 4px 10px
                  borderRadius: "10px",
                  border: "none",
                  fontSize: "12px", // Increased font from 11px
                  fontWeight: "600",
                  cursor: "pointer",
                  background: startCategory === cat ? "#6366f1" : "#e2e8f0",
                  color: startCategory === cat ? "#ffffff" : "#475569",
                  transition: "all 0.2s"
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <form onSubmit={handleNavigation}>
            {/* Increased padding to 14px 16px */}
            <div style={{ background: colors.bgLight, border: "1px solid #e2e8f0", borderRadius: "16px", padding: "14px 16px", marginBottom: "16px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: colors.periwinkleText, letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>
                START LOCATION
              </span>
              <select 
                value={start} 
                onChange={(e) => setStart(e.target.value)}
                style={{ width: "100%", border: "none", background: "transparent", fontSize: "16px", fontWeight: "600", color: colors.textDark, outline: "none" }}
              >
                <option value="">Select current store...</option>
                {filteredStartStores.map(item => (
                  <option key={item.name} value={item.name}>
                    {formatName(item.name)} ({item.floor})
                  </option>
                ))}
              </select>
            </div>

            {/* DESTINATION CATEGORY PILLS */}
            <div style={{ display: "flex", gap: "6px", marginBottom: "8px", overflowX: "auto" }}>
              {["All", "Apparel", "Food", "Groceries"].map((cat) => (
                <button
                key={`dest-${cat}`}
                type="button"
                onClick={() => setDestCategory(cat)}
                style={{
                  padding: "6px 14px", // Increased padding from 4px 10px
                  borderRadius: "10px",
                  border: "none",
                  fontSize: "12px", // Increased font from 11px
                  fontWeight: "600",
                  cursor: "pointer",
                  background: destCategory === cat ? "#6366f1" : "#e2e8f0",
                  color: destCategory === cat ? "#ffffff" : "#475569",
                  transition: "all 0.2s"
                }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Destination Dropdown */}
            {/* Increased padding to 14px 16px */}
            <div style={{ background: colors.bgLight, border: "1px solid #e2e8f0", borderRadius: "16px", padding: "14px 16px", marginBottom: "16px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: colors.periwinkleText, letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>
                DESTINATION
              </span>
              <select 
                value={destination} 
                onChange={(e) => setDestination(e.target.value)}
                style={{ width: "100%", border: "none", background: "transparent", fontSize: "16px", fontWeight: "600", color: colors.textDark, outline: "none" }}
              >
                <option value="">Select target store...</option>
                {filteredDestStores.map(item => (
                  <option key={item.name} value={item.name}>
                    {formatName(item.name)} ({item.floor})
                  </option>
                ))}
              </select>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                width: "100%", 
                padding: "16px", 
                marginTop: "8px", // Added top margin for separation
                marginBottom: "16px", // Added bottom margin for separation
                background: colors.periwinkleSolid, 
                color: "#ffffff", 
                border: "none", 
                borderRadius: "20px", 
                fontSize: "16px", // Increased font from 15px
                fontWeight: "700", 
                cursor: "pointer", 
                boxShadow: "0 10px 15px -3px rgba(99, 102, 241, 0.3)" 
              }}
            >
              {loading ? "Computing Multi-Floor Route..." : "Find Shortest Path ➔"}
            </button>
          </form>
        

        {error && (
          <div style={{ margin: "0 24px 20px 24px", background: "#fef2f2", border: "1px solid #fee2e2", color: "#991b1b", padding: "12px 16px", borderRadius: "12px", fontSize: "13px" }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ flexGrow: 1 }} />

        {/* Results Card */}
        {directions.length > 0 && (
          <div style={{ background: colors.bottomSheetBg, borderRadius: "28px 28px 0 0", padding: "28px 24px", color: "#ffffff" }}>
            
            {/* Floor Transition Alert Banner */}
            {tripMetadata?.floorChange && (
              <div style={{ background: "rgba(99, 102, 241, 0.2)", border: "1px solid rgba(99, 102, 241, 0.4)", borderRadius: "14px", padding: "10px 14px", marginBottom: "20px", fontSize: "13px", color: colors.periwinkleSoft, display: "flex", alignItems: "center", gap: "8px" }}>
                <span>🛗</span> <strong>Floor Transition Required:</strong> {tripMetadata.startFloor} ➔ {tripMetadata.destFloor}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>Trip Guide</h2>
              <span style={{ background: "rgba(255,255,255,0.1)", color: "#38bdf8", fontSize: "12px", fontWeight: "600", padding: "4px 12px", borderRadius: "12px" }}>
                {distance} meters walking
              </span>
            </div>

            {/* Steps Timeline */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {directions.map((step, index) => (
                <div key={index} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", padding: "14px 16px", borderRadius: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: "0 0 4px 0", fontSize: "14px", color: "#f1f5f9", lineHeight: "1.4" }}>
                      {step}.
                    </p>
                    <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600" }}>
                      {formatName(route[index])} ➔ {formatName(route[index + 1])}
                    </span>
                  </div>

                  <div style={{ background: colors.periwinkleSoft, color: colors.periwinkleText, width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "12px", flexShrink: 0 }}>
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px dashed rgba(255,255,255,0.15)", color: "#4ade80", fontWeight: "600", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>🎉</span> Arrived at {formatName(destination)}!
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default App;