import { useState } from "react";

function App() {
  const [start, setStart] = useState("");
  const [destination, setDestination] = useState("");
  const [route, setRoute] = useState([]);
  const [distance, setDistance] = useState(null);
  const [directions, setDirections] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const availableStores = ["Nike", "Adidas", "AM_PM", "Reebok", "Limelight", "Shaheen_Grocers"];

  const handleNavigation = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    if (!start || !destination) {
      setError("Please select both your location and destination.");
      setLoading(false);
      return;
    }
    if (start === destination) {
      setError("You are already standing at your chosen destination.");
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
      } else {
        setError(data.detail || "Failed to calculate path.");
      }
    } catch (err) {
      setError("Unable to connect to the backend navigation server.");
    } finally {
      setLoading(false);
    }
  };

  const formatName = (name) => name.replace("_", " ");

  // Periwinkle Color Palette Tokens based on image_47421a.jpg setup
  const colors = {
    bgLight: "#f9fafb",
    cardLight: "#ffffff",
    textDark: "#0c0a09",
    textMuted: "#78716c",
    periwinkleSolid: "#6366f1",     // Clean structural periwinkle indigo
    periwinkleSoft: "#e0e7ff",      // Soft tint to replace the soft pink elements
    periwinkleText: "#4338ca",
    bottomSheetBg: "#11111c",       // Deep dark slate/navy for the bottom section
    darkCardBg: "#1e1e2f"
  };

  return (
    <div style={{ background: colors.bgLight, minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
      
      {/* Mobile-Responsive Viewport Wrapper Container */}
      <div style={{ width: "100%", maxWidth: "480px", minHeight: "100vh", background: colors.cardLight, display: "flex", flexDirection: "column", justifyContent: "between", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.08)", position: "relative", overflowX: "hidden" }}>
        
        {/* Top Header Section - Inspired by Center Panel of image_47421a.jpg */}
        <div style={{ padding: "32px 24px 20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
            <div>
              <h1 style={{ fontSize: "32px", fontWeight: "800", color: colors.textDark, margin: 0, lineHeight: "1.1", letterSpacing: "-1px" }}>
                Hello,<br />Explorer
              </h1>
            </div>
            {/* Status Compass Badge */}
            <div style={{ background: colors.textDark, color: "white", width: "42px", height: "42px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
              🧭
            </div>
          </div>
          
          <p style={{ fontSize: "14px", color: colors.textMuted, margin: "0 0 28px 0", fontWeight: "500" }}>
            Where would you like to navigate today? Select your nodes below.
          </p>

          {/* Core Configuration Control Panel Form */}
          <form onSubmit={handleNavigation}>
            
            {/* Dropdown 1: Starting Store Card */}
            <div style={{ background: colors.bgLight, border: "1px solid #f3f4f6", borderRadius: "20px", padding: "16px", marginBottom: "14px", display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "11px", fontWeight: "700", color: colors.periwinkleText, letterSpacing: "0.5px" }}>
                STARTING STORE
              </span>
              <select 
                value={start} 
                onChange={(e) => setStart(e.target.value)}
                style={{ width: "100%", border: "none", background: "transparent", fontSize: "16px", fontWeight: "600", color: colors.textDark, outline: "none", cursor: "pointer", padding: "4px 0" }}
              >
                <option value="">Choose your starting point...</option>
                {availableStores.map(store => <option key={store} value={store}>{formatName(store)}</option>)}
              </select>
            </div>

            {/* Dropdown 2: Target Destination Card */}
            <div style={{ background: colors.bgLight, border: "1px solid #f3f4f6", borderRadius: "20px", padding: "16px", marginBottom: "24px", display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "11px", fontWeight: "700", color: colors.textMuted, letterSpacing: "0.5px" }}>
                TARGET DESTINATION
              </span>
              <select 
                value={destination} 
                onChange={(e) => setDestination(e.target.value)}
                style={{ width: "100%", border: "none", background: "transparent", fontSize: "16px", fontWeight: "600", color: colors.textDark, outline: "none", cursor: "pointer", padding: "4px 0" }}
              >
                <option value="">Where is your destination?</option>
                {availableStores.map(store => <option key={store} value={store}>{formatName(store)}</option>)}
              </select>
            </div>

            {/* Dynamic Interactive Action Button */}
            <button 
              type="submit" 
              disabled={loading}
              style={{ width: "100%", padding: "16px", background: colors.periwinkleSolid, color: "#ffffff", border: "none", borderRadius: "24px", fontSize: "16px", fontWeight: "700", cursor: "pointer", boxShadow: `0 10px 20px -4px rgba(99,102,241,0.3)`, display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", transition: "transform 0.1s" }}
            >
              {loading ? "Computing Dijkstra Matrix..." : "Generate Route Guide"}
              <span style={{ background: "rgba(255,255,255,0.2)", width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>➔</span>
            </button>
          </form>
        </div>

        {/* Floating Error Alert Toast */}
        {error && (
          <div style={{ margin: "0 24px 24px 24px", background: "#fef2f2", border: "1px solid #fee2e2", color: "#991b1b", padding: "14px 18px", borderRadius: "16px", fontSize: "14px", fontWeight: "500", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Dynamic Space Filler to push bottom sheet flush if no results are shown */}
        <div style={{ flexGrow: 1 }} />

        {/* Enriched Dark Bottom Sheet Layer - Mimicking "Practices" Container from image_47421a.jpg */}
        {directions.length > 0 && (
          <div style={{ background: colors.bottomSheetBg, borderRadius: "32px 32px 0 0", padding: "32px 24px", color: "#ffffff", boxShadow: "0 -20px 25px -5px rgba(0,0,0,0.1)" }}>
            
            {/* Header Module for Bottom Sheet */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "700", margin: 0, letterSpacing: "-0.5px" }}>Guidance Path</h2>
              <span style={{ background: "rgba(255,255,255,0.08)", color: colors.periwinkleSoft, fontSize: "12px", fontWeight: "600", padding: "6px 14px", borderRadius: "20px" }}>
                ⚡ {distance}m total
              </span>
            </div>

            {/* Turn-by-Turn Instruction Timeline */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {directions.map((step, index) => (
                <div 
                  key={index} 
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", padding: "16px", borderRadius: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
                    {/* Direction Text */}
                    <p style={{ margin: 0, fontSize: "14.5px", fontWeight: "500", lineHeight: "1.4", color: "#f3f4f6" }}>
                      {step}.
                    </p>
                    {/* Node Segment Trace Badge */}
                    <span style={{ fontSize: "11px", color: colors.textMuted, fontWeight: "600", letterSpacing: "0.2px" }}>
                      {formatName(route[index])} ➔ {formatName(route[index + 1])}
                    </span>
                  </div>

                  {/* Periwinkle Step Action Token Marker */}
                  <div style={{ background: colors.periwinkleSoft, color: colors.periwinkleText, width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "13px", flexShrink: 0 }}>
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>

            {/* Arrival Decorative Anchor Banner */}
            <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px dashed rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: "12px", color: "#4ade80", fontWeight: "600", fontSize: "14px" }}>
              <div style={{ background: "rgba(74,222,128,0.1)", width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>🎉</div>
              Arrived securely at {formatName(destination)}!
            </div>
            
          </div>
        )}

      </div>
    </div>
  );
}

export default App;