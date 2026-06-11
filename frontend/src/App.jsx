import { useState } from "react";

function App() {
  // 1. Initialize our short-term memory (State)
  const [start, setStart] = useState("");
  const [destination, setDestination] = useState("");
  const [route, setRoute] = useState([]);
  const [distance, setDistance] = useState(null);
  const [error, setError] = useState("");

  // Our list of valid stores from the ground floor plan blueprint
  const availableStores = [
    "Nike",
    "Adidas",
    "AM_PM",
    "Reebok",
    "Limelight",
    "Shaheen_Grocers",
  ];

  // 2. The Logic triggered when clicking "Find Shortest Route"
  const handleNavigation = async (e) => {
    e.preventDefault(); // Prevents the browser from reloading the page
    setError(""); // Reset errors from previous searches
    setRoute([]);
    setDistance(null);

    // Validation Check: Ensure they chose two different locations
    if (!start || !destination) {
      setError("Please select both a start location and a destination.");
      return;
    }
    if (start === destination) {
      setError("You are already standing at your destination!");
      return;
    }

    try {
      // Fetch data live from our local FastAPI backend server!
      const response = await fetch(
        `http://127.0.0.1:8000/navigate?start=${start}&destination=${destination}`
      );
      
      const data = await response.json();

      if (response.ok) {
        // If the backend says 200 OK, save the path details into our memory slots
        setRoute(data.shortest_path);
        setDistance(data.distance);
      } else {
        setError(data.detail || "An unexpected error occurred.");
      }
    } catch (err) {
      setError("Could not connect to the backend navigation server.");
    }
  };

  // 3. The Visual Output (JSX Layout)
  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <h2>📍 Mall Indoor Navigator</h2>
      <p style={{ color: "#666" }}>Scan complete. Select your locations below to generate the optimal walking path.</p>

      {/* Input Selection Card */}
      <form onSubmit={handleNavigation} style={{ background: "#f5f5f5", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
        
        {/* Dropdown 1: Starting Store */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Where are you standing?</label>
          <select value={start} onChange={(e) => setStart(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "4px" }}>
            <option value="">-- Choose Current Store --</option>
            {availableStores.map((store) => (
              <option key={store} value={store}>{store.replace("_", " ")}</option>
            ))}
          </select>
        </div>

        {/* Dropdown 2: Destination Store */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Where do you want to go?</label>
          <select value={destination} onChange={(e) => setDestination(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "4px" }}>
            <option value="">-- Choose Target Destination --</option>
            {availableStores.map((store) => (
              <option key={store} value={store}>{store.replace("_", " ")}</option>
            ))}
          </select>
        </div>

        <button type="submit" style={{ width: "100%", padding: "12px", background: "#0070f3", color: "white", border: "none", borderRadius: "4px", fontSize: "16px", cursor: "pointer" }}>
          Find Shortest Route
        </button>
      </form>

      {/* Error Displays */}
      {error && <div style={{ color: "red", padding: "10px", background: "#ffebee", borderRadius: "4px", marginBottom: "20px" }}>⚠️ {error}</div>}

      {/* Navigation Results Card */}
      {route.length > 0 && (
        <div style={{ border: "2px solid #0070f3", padding: "20px", borderRadius: "8px", background: "#f0f7ff" }}>
          <h3 style={{ marginTop: 0, color: "#0070f3" }}>🗺️ Generated Route</h3>
          <p><strong>Total Distance:</strong> {distance} steps/meters</p>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", marginTop: "15px" }}>
            {route.map((step, index) => (
              <span key={step} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ padding: "8px 12px", background: "white", borderRadius: "4px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", fontWeight: "bold" }}>
                  {step.replace("_", " ")}
                </span>
                {index < route.length - 1 && <span style={{ color: "#0070f3", fontWeight: "bold" }}>➔</span>}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;