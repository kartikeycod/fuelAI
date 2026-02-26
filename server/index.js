const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const vision = require("@google-cloud/vision");
const pdfParse = require("pdf-parse");
const db = require("./firebase");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/invoices", express.static("invoices"));

/* ================= MULTER ================= */
const upload = multer({ dest: "uploads/" });
const invoiceUpload = multer({ dest: "invoices/" });

/* ================= GOOGLE OCR SETUP ================= */
// Absolute path use kar rahe hain taaki Windows/OneDrive ka issue na aaye
const keyPath = path.join(__dirname, "key.json");

const client = new vision.ImageAnnotatorClient({
  keyFilename: keyPath,
});

async function runOCR(filePath) {
  try {
    const [result] = await client.textDetection(filePath);
    return result.textAnnotations[0]?.description || "";
  } catch (err) {
    console.error(`❌ OCR Error for ${filePath}:`, err.message);
    // Agar credentials ka issue hai toh ye yahan print ho jayega
    if (err.code === 16) {
      console.error("👉 Check if Cloud Vision API is enabled for project in key.json");
    }
    throw err; 
  }
}

/* ================= PDF OCR ================= */
async function extractInvoiceDetails(pdfPath) {
  const buffer = fs.readFileSync(pdfPath);
  const data = await pdfParse(buffer);
  const text = data.text;

  const amountMatch = text.match(/(Total|Grand Total|Amount)[^\d]*(\d+[,\d]*)/i);
  const invoiceMatch = text.match(/Invoice\s*(No|#)[:\s]*([A-Z0-9-]+)/i);

  return {
    rawText: text,
    amount: amountMatch ? amountMatch[2] : null,
    invoiceNumber: invoiceMatch ? invoiceMatch[2] : null,
  };
}

/* ================= USER UPLOAD ROUTE ================= */
app.post(
  "/upload",
  upload.fields([
    { name: "bill" },
    { name: "before" },
    { name: "after" },
    { name: "pump" },
  ]),
  async (req, res) => {
    try {
      const files = req.files;
      if (!files.bill || !files.before || !files.after || !files.pump) {
        return res.status(400).send("All 4 images are required.");
      }

      console.log("⚡ Starting OCR Analysis...");

      // Parallel execution for speed
      const [billText, beforeText, afterText, pumpText] = await Promise.all([
        runOCR(files.bill[0].path),
        runOCR(files.before[0].path),
        runOCR(files.after[0].path),
        runOCR(files.pump[0].path)
      ]);

      const record = {
        billText,
        beforeText,
        afterText,
        pumpText,
        location: JSON.parse(req.body.location || "{}"),
        uploadTime: req.body.uploadTime,
        verified: false,
        createdAt: new Date(),
      };

      console.log("📝 Saving to Firestore...");
      const doc = await db.collection("fuelRecords").add(record);

      res.json({
        success: true,
        userId: doc.id,
      });
    } catch (err) {
      console.error("🚨 Server Upload Error:", err);
      res.status(500).json({ 
        message: "Upload failed", 
        error: err.message,
        hint: "Check terminal for detailed OCR/Permission logs"
      });
    }
  }
);

/* ================= ADMIN & USER ROUTES ================= */
app.get("/admin", async (req, res) => {
  const snapshot = await db.collection("fuelRecords").orderBy("createdAt", "desc").get();
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.json(data);
});

app.post("/upload-invoice/:id", invoiceUpload.single("invoice"), async (req, res) => {
  try {
    const id = req.params.id;
    const finalPath = `invoices/${id}.pdf`;
    fs.renameSync(req.file.path, finalPath);

    const invoiceData = await extractInvoiceDetails(finalPath);

    await db.collection("fuelRecords").doc(id).update({
      verified: true,
      invoiceUrl: `/invoices/${id}.pdf`,
      invoiceData,
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("Invoice processing failed");
  }
});

app.get("/user/:id", async (req, res) => {
  const doc = await db.collection("fuelRecords").doc(req.params.id).get();
  res.json(doc.data());
});

/* ================= REPORT GENERATION ================= */
const PDFDocument = require("pdfkit");
app.get("/report/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const docSnap = await db.collection("fuelRecords").doc(id).get();
    const data = docSnap.data();

    if (!data) return res.status(404).send("Not found");

    const doc = new PDFDocument();
    res.setHeader("Content-Disposition", `attachment; filename=report-${id}.pdf`);
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    doc.fontSize(18).text("Fuel Verification Report", { align: "center" });
    doc.moveDown().fontSize(12).text(`User ID: ${id}`);
    doc.text(`Upload Time: ${data.uploadTime}`);
    doc.text(`Location: ${data.location?.address}`);
    
    doc.moveDown().fontSize(14).text("Bill OCR:").fontSize(10).text(data.billText);
    doc.moveDown().fontSize(14).text("Before Meter:").fontSize(10).text(data.beforeText);
    doc.moveDown().fontSize(14).text("After Meter:").fontSize(10).text(data.afterText);
    doc.moveDown().fontSize(14).text("Pump OCR:").fontSize(10).text(data.pumpText);

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("PDF generation failed");
  }
});

/* ================= SERVER START ================= */
app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
  console.log("📁 Vision Key Path:", keyPath);
});