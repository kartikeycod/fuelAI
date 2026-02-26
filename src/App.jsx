import { useNavigate } from "react-router-dom";

function Upload() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "20px" }}>
      {/* --- Navigation Buttons --- */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button 
          onClick={() => navigate("/admin")} 
          style={{ padding: "10px", cursor: "pointer", background: "#007bff", color: "white", border: "none", borderRadius: "5px" }}
        >
          Go to Admin Dashboard
        </button>
        <button 
          onClick={() => navigate("/check")} 
          style={{ padding: "10px", cursor: "pointer", background: "#28a745", color: "white", border: "none", borderRadius: "5px" }}
        >
          Check Invoice Status
        </button>
      </div>

      <hr />
      
      <h1>Upload Fuel Records</h1>
      {/* Aapka baaki upload form ka code yahan aayega */}
    </div>
  );
}

export default Upload;