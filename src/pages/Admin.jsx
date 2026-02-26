import { useEffect, useState } from "react";
import axios from "axios";

export default function Admin() {
  const [records, setRecords] = useState([]);

  /* ================= FETCH DATA ================= */
  const loadData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/admin");
      setRecords(res.data);
    } catch (err) {
      console.error("Failed to load records");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ================= UPLOAD PDF ================= */
  const uploadInvoice = async (id, file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("invoice", file);

    try {
      await axios.post(`http://localhost:5000/upload-invoice/${id}`, formData);
      alert("✅ Invoice successfully linked to User " + id);
      loadData(); 
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  return (
    <div className="admin-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Rajdhani:wght@300;500;700&display=swap');

        :root {
          --bg-dark: #020617;
          --accent-cyan: #00f2ff;
          --accent-pink: #ff00e5;
          --accent-purple: #7000ff;
          --glass: rgba(15, 23, 42, 0.9);
          --card-border: rgba(0, 242, 255, 0.2);
        }

        .admin-wrapper {
          background-color: var(--bg-dark);
          background-image: 
            radial-gradient(circle at 10% 10%, rgba(112, 0, 255, 0.1) 0%, transparent 40%),
            radial-gradient(circle at 90% 90%, rgba(0, 242, 255, 0.1) 0%, transparent 40%);
          min-height: 100vh;
          font-family: 'Rajdhani', sans-serif;
          color: #f8fafc;
          padding: 40px 20px;
        }

        .container {
          max-width: 1100px;
          margin: 0 auto;
        }

        .title {
          font-family: 'Orbitron', sans-serif;
          font-size: 2.5rem;
          text-align: center;
          background: linear-gradient(90deg, var(--accent-cyan), var(--accent-pink));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 10px rgba(0, 242, 255, 0.4));
          margin-bottom: 40px;
          text-transform: uppercase;
          letter-spacing: 4px;
        }

        .record-card {
          background: var(--glass);
          border: 1px solid var(--card-border);
          border-radius: 20px;
          padding: 25px;
          margin-bottom: 30px;
          display: grid;
          grid-template-columns: 1fr 2fr 1fr;
          gap: 20px;
          transition: 0.3s ease;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }

        .record-card:hover {
          border-color: var(--accent-cyan);
          box-shadow: 0 0 20px rgba(0, 242, 255, 0.15);
        }

        .user-info h3 {
          color: var(--accent-cyan);
          font-family: 'Orbitron', sans-serif;
          margin-top: 0;
        }

        .info-label {
          color: #94a3b8;
          font-size: 0.75rem;
          text-transform: uppercase;
          display: block;
          margin-top: 10px;
        }

        .info-value {
          font-weight: 500;
          color: #e2e8f0;
        }

        /* OCR Data Section */
        .ocr-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          background: rgba(0,0,0,0.3);
          padding: 15px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .ocr-item b {
          color: var(--accent-pink);
          font-size: 0.8rem;
          display: block;
          margin-bottom: 4px;
        }

        .ocr-text {
          font-size: 0.9rem;
          color: #cbd5e1;
          background: rgba(0,0,0,0.2);
          padding: 5px 8px;
          border-radius: 4px;
          min-height: 20px;
        }

        /* Actions Section */
        .actions-panel {
          display: flex;
          flex-direction: column;
          gap: 15px;
          justify-content: center;
          border-left: 1px solid rgba(255,255,255,0.1);
          padding-left: 20px;
        }

        .file-input-wrapper {
          position: relative;
        }

        .custom-file-upload {
          display: block;
          width: 100%;
          padding: 10px;
          background: transparent;
          border: 1px dashed var(--accent-cyan);
          color: var(--accent-cyan);
          text-align: center;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.8rem;
          transition: 0.3s;
        }

        .custom-file-upload:hover {
          background: rgba(0, 242, 255, 0.1);
        }

        .btn-download {
          background: linear-gradient(45deg, var(--accent-purple), var(--accent-pink));
          color: white;
          border: none;
          padding: 12px;
          border-radius: 8px;
          font-family: 'Orbitron', sans-serif;
          font-size: 0.7rem;
          cursor: pointer;
          text-decoration: none;
          text-align: center;
          transition: 0.3s;
        }

        .btn-download:hover {
          box-shadow: 0 0 15px var(--accent-pink);
          filter: brightness(1.1);
        }

        .status-sent {
          color: #39ff14;
          text-shadow: 0 0 8px rgba(57, 255, 20, 0.5);
          font-weight: bold;
          text-align: center;
          font-size: 0.9rem;
        }

        @media (max-width: 900px) {
          .record-card { grid-template-columns: 1fr; }
          .actions-panel { border-left: none; padding-left: 0; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px;}
        }
      `}</style>

      <div className="container">
        <h1 className="title">System Terminal: Admin</h1>

        {records.map((r) => (
          <div key={r.id} className="record-card">
            
            {/* COLUMN 1: USER INFO */}
            <div className="user-info">
              <h3>ID: {r.id}</h3>
              <span className="info-label">Address</span>
              <div className="info-value">{r.location?.address || "N/A"}</div>
              
              <span className="info-label">Timestamp</span>
              <div className="info-value" style={{fontSize: '0.85rem'}}>
                {new Date(r.uploadTime).toLocaleString()}
              </div>
            </div>

            {/* COLUMN 2: OCR DATA */}
            <div className="ocr-grid">
              <div className="ocr-item">
                <b>BILL OCR</b>
                <div className="ocr-text">{r.billText || "No data"}</div>
              </div>
              <div className="ocr-item">
                <b>PUMP OCR</b>
                <div className="ocr-text">{r.pumpText || "No data"}</div>
              </div>
              <div className="ocr-item">
                <b>BEFORE METER</b>
                <div className="ocr-text">{r.beforeText || "No data"}</div>
              </div>
              <div className="ocr-item">
                <b>AFTER METER</b>
                <div className="ocr-text">{r.afterText || "No data"}</div>
              </div>
            </div>

            {/* COLUMN 3: ACTIONS */}
            <div className="actions-panel">
              <div className="file-input-wrapper">
                <label className="custom-file-upload">
                  <input
                    type="file"
                    accept="application/pdf"
                    style={{ display: "none" }}
                    onChange={(e) => uploadInvoice(r.id, e.target.files[0])}
                  />
                  📤 LINK INVOICE (PDF)
                </label>
              </div>

              <a
                href={`http://localhost:5000/report/${r.id}`}
                target="_blank"
                rel="noreferrer"
                className="btn-download"
              >
                VIEW REPORT PDF
              </a>

              {r.verified && (
                <div className="status-sent">
                  ⚡ SYSTEM VERIFIED
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}