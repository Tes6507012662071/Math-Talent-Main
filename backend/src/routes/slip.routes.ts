// routes/slipRoutes.ts
import express from "express";
import Slip from "../models/Slip";

const router = express.Router();

// ✅ อัปโหลดสลิป (user)
router.post("/upload", async (req, res) => {
  try {
    const { eventId, userId, slipUrl } = req.body;
    const slip = await Slip.create({ eventId, userId, slipUrl });
    res.status(201).json({ message: "Slip uploaded successfully", slip });
  } catch (err) {
    res.status(500).json({ error: "Upload failed" });
  }
});

// ✅ admin เปลี่ยนสถานะ
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const slip = await Slip.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json({ message: "Status updated", slip });
  } catch (err) {
    res.status(500).json({ error: "Failed to update status" });
  }
});

export default router;
