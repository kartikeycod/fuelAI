const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const vision = require("@google-cloud/vision");
const pdfParse = require("pdf-parse");
const db = require("./firebase");
// import admin from "firebase-admin";
const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
});
const app = express();

app.use(cors());
app.use(express.json());

app.use("/invoices", express.static("invoices"));

/* ================= MULTER ================= */

const upload = multer({ dest: "uploads/" });
const invoiceUpload = multer({ dest: "invoices/" });

/* ================= GOOGLE OCR ================= */

const client = new vision.ImageAnnotatorClient({
  keyFilename: "key.json",
});
// const client = new vision.ImageAnnotatorClient();
async function runOCR(path) {
  const [result] = await client.textDetection(path);
  return result.textAnnotations[0]?.description || "";
}

/* ================= PDF OCR ================= */

async function extractInvoiceDetails(pdfPath) {
  const buffer = fs.readFileSync(pdfPath);
  const data = await pdfParse(buffer);
  const text = data.text;

  const amountMatch = text.match(
    /(Total|Grand Total|Amount)[^\d]*(\d+[,\d]*)/i
  );

  const invoiceMatch = text.match(
    /Invoice\s*(No|#)[:\s]*([A-Z0-9-]+)/i
  );

  return {
    rawText: text,
    amount: amountMatch ? amountMatch[2] : null,
    invoiceNumber: invoiceMatch ? invoiceMatch[2] : null,
  };
}

/* =================================================
   USER UPLOAD (PHOTO + LOCATION + TIME)
================================================= */

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

      const billText = await runOCR(files.bill[0].path);
      const beforeText = await runOCR(files.before[0].path);
      const afterText = await runOCR(files.after[0].path);
      const pumpText = await runOCR(files.pump[0].path);

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

      const doc = await db.collection("fuelRecords").add(record);

      res.json({
        success: true,
        userId: doc.id,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Upload failed");
    }
  }
);

/* ================= ADMIN VIEW ================= */

app.get("/admin", async (req, res) => {
  const snapshot = await db
    .collection("fuelRecords")
    .orderBy("createdAt", "desc")
    .get();

  const data = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));

  res.json(data);
});

/* ================= ADMIN UPLOAD PDF ================= */

app.post(
  "/upload-invoice/:id",
  invoiceUpload.single("invoice"),
  async (req, res) => {
    try {
      const id = req.params.id;

      const finalPath = `invoices/${id}.pdf`;
      fs.renameSync(req.file.path, finalPath);

      const invoiceData =
        await extractInvoiceDetails(finalPath);

      await db.collection("fuelRecords")
        .doc(id)
        .update({
          verified: true,
          invoiceUrl: `/invoices/${id}.pdf`,
          invoiceData,
        });

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).send("Invoice failed");
    }
  }
);

/* ================= USER CHECK BY ID ================= */

app.get("/user/:id", async (req, res) => {
  const doc = await db
    .collection("fuelRecords")
    .doc(req.params.id)
    .get();

  res.json(doc.data());
});

/* =========================================
   DOWNLOAD USER REPORT PDF
========================================= */

const PDFDocument = require("pdfkit");

app.get("/report/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const docSnap = await db
      .collection("fuelRecords")
      .doc(id)
      .get();

    const data = docSnap.data();

    if (!data) return res.status(404).send("Not found");

    const doc = new PDFDocument();

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=report-${id}.pdf`
    );

    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    /* ===== PDF CONTENT ===== */

    doc.fontSize(18).text("Fuel Verification Report", {
      align: "center",
    });

    doc.moveDown();

    doc.fontSize(12).text(`User ID: ${id}`);
    doc.text(`Upload Time: ${data.uploadTime}`);
    doc.text(`Location: ${data.location?.address}`);

    doc.moveDown();

    doc.fontSize(14).text("Bill OCR:");
    doc.fontSize(10).text(data.billText);

    doc.moveDown();

    doc.fontSize(14).text("Before Meter:");
    doc.fontSize(10).text(data.beforeText);

    doc.moveDown();

    doc.fontSize(14).text("After Meter:");
    doc.fontSize(10).text(data.afterText);

    doc.moveDown();

    doc.fontSize(14).text("Pump OCR:");
    doc.fontSize(10).text(data.pumpText);

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("PDF generation failed");
  }
});
/* ================= SERVER ================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on ${PORT}`);
});