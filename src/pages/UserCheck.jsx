import { useState } from "react";
import axios from "axios";

export default function UserCheck() {
  const [id, setId] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkInvoice = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/user/${id}`);
      setData(res.data);
    } catch (err) {
      alert("Verification ID not found in system.");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-check-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Rajdhani:wght@300;500;700&display=swap');

        :root {
          --bg-dark: #020617;
          --neon-cyan: #00f2ff;
          --neon-pink: #ff00e5;
          --neon-amber: #ffaa00;
          --glass: rgba(15, 23, 42, 0.8);
        }

        .user-check-wrapper {
          background-color: var(--bg-dark);
          background-image: 
            radial-gradient(circle at 50% 0%, rgba(0, 242, 255, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 100% 100%, rgba(112, 0, 255, 0.1) 0%, transparent 50%);
          min-height: 100vh;
          font-family: 'Rajdhani', sans-serif;
          color: #f8fafc;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 60px 20px;
        }

        .container {
          width: 100%;
          max-width: 600px;
          text-align: center;
        }

        .title {
          font-family: 'Orbitron', sans-serif;
          font-size: 2rem;
          margin-bottom: 2rem;
          background: linear-gradient(90deg, var(--neon-cyan), #fff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-transform: uppercase;
          letter-spacing: 3px;
        }

        /* Search Section */
        .search-box {
          background: var(--glass);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 8px;
          border-radius: 16px;
          display: flex;
          gap: 10px;
          margin-bottom: 40px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }

        .input-field {
          flex: 1;
          background: transparent;
          border: none;
          padding: 15px 20px;
          color: white;
          font-family: 'Orbitron', sans-serif;
          font-size: 1rem;
          outline: none;
        }

        .btn-check {
          background: var(--neon-cyan);
          color: #000;
          border: none;
          padding: 0 30px;
          border-radius: 12px;
          font-family: 'Orbitron', sans-serif;
          font-weight: bold;
          cursor: pointer;
          transition: 0.3s;
          text-transform: uppercase;
        }

        .btn-check:hover {
          box-shadow: 0 0 20px var(--neon-cyan);
          transform: translateY(-2px);
        }

        /* Result Card */
        .result-card {
          background: var(--glass);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px;
          padding: 40px;
          text-align: left;
          animation: slideUp 0.5s ease-out;
          box-shadow: 0 0 40px rgba(0,0,0,0.4);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .status-waiting {
          color: var(--neon-amber);
          background: rgba(255, 170, 0, 0.1);
          padding: 15px;
          border-radius: 12px;
          border: 1px solid var(--neon-amber);
          text-align: center;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .verified-header {
          color: var(--neon-cyan);
          font-family: 'Orbitron', sans-serif;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }

        .data-row {
          margin-bottom: 15px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          padding-bottom: 10px;
        }

        .data-row b {
          color: #94a3b8;
          font-size: 0.8rem;
          text-transform: uppercase;
          display: block;
        }

        .data-row span {
          font-size: 1.2rem;
          color: #fff;
        }

        .ocr-container {
          background: rgba(0,0,0,0.4);
          padding: 20px;
          border-radius: 12px;
          font-family: monospace;
          font-size: 0.85rem;
          color: #a5f3fc;
          margin: 20px 0;
          border: 1px solid rgba(0, 242, 255, 0.2);
          max-height: 200px;
          overflow-y: auto;
        }

        .btn-download {
          display: block;
          width: 100%;
          background: linear-gradient(45deg, var(--neon-pink), var(--neon-cyan));
          color: white;
          text-align: center;
          padding: 18px;
          border-radius: 12px;
          text-decoration: none;
          font-family: 'Orbitron', sans-serif;
          font-weight: bold;
          margin-top: 20px;
          transition: 0.3s;
        }

        .btn-download:hover {
          box-shadow: 0 0 25px rgba(255, 0, 229, 0.5);
          filter: brightness(1.1);
        }
      `}</style>

      <div className="container">
        <h1 className="title">Invoice Portal</h1>

        <div className="search-box">
          <input
            placeholder="ENTER YOUR TRACKING ID"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="input-field"
          />
          <button className="btn-check" onClick={checkInvoice}>
            {loading ? "..." : "SEARCH"}
          </button>
        </div>

        {data && (
          <div className="result-card">
            {!data.verified ? (
              <div className="status-waiting">
                ⏳ VERIFICATION IN PROGRESS...
                <p style={{fontSize: '0.8rem', marginTop: '5px', fontWeight: 'normal'}}>
                  The administrator is currently reviewing your data.
                </p>
              </div>
            ) : (
              <div className="verified-content">
                <h3 className="verified-header">
                  <span>✅</span> SYSTEM VERIFIED
                </h3>

                <div className="data-row">
                  <b>Invoice Reference</b>
                  <span>{data.invoiceData?.invoiceNumber || "N/A"}</span>
                </div>

                <div className="data-row">
                  <b>Total Amount</b>
                  <span style={{color: 'var(--neon-cyan)'}}>
                    {data.invoiceData?.amount || "Calculated at Source"}
                  </span>
                </div>

                <h4 style={{fontSize: '0.8rem', color: '#94a3b8', marginTop: '25px'}}>
                  EXTRACTED RAW DATA
                </h4>
                <div className="ocr-container">
                  {data.invoiceData?.rawText}
                </div>

                <a
                  href={`http://localhost:5000${data.invoiceUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-download"
                >
                  DOWNLOAD OFFICIAL PDF
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}