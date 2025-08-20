import { Request, Response } from "express";
import * as XLSX from "xlsx";
import IndividualRegistration from "../models/IndividualRegistration";

interface ExcelRow {
  userCode?: string;
  fullname?: string;
}

export const uploadAttendance = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "กรุณาอัปโหลดไฟล์ Excel" });
    }

    console.log("📂 รับไฟล์:", req.file.originalname);

    // อ่าน Excel จาก buffer
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const rows: ExcelRow[] = (sheet as any[]).map((row: any) => ({
      userCode: row.userCode ? String(row.userCode).trim() : undefined,
      fullname: row.fullname ? String(row.fullname).trim() : undefined,
    }));

    console.log("📄 อ่าน Excel rows:", rows);

    let updated = 0;
    let notFound = 0;

    for (const [index, row] of rows.entries()) {
      console.log(`\n🔹 Processing row ${index + 1}:`, row);

      let user = null;

      // ค้นหา userCode
      if (row.userCode) {
        console.log(`👉 กำลังค้นหา User ด้วย userCode='${row.userCode}'`);
        user = await IndividualRegistration.findOne({ userCode: row.userCode });
        console.log("   ⬅️ Query userCode result:", user);
      }

      // fallback fullname (case-insensitive)
      if (!user && row.fullname) {
        console.log(
          `👉 กำลังค้นหา User ด้วย fullname (case-insensitive)='${row.fullname}'`
        );
        user = await IndividualRegistration.findOne({
          fullname: { $regex: new RegExp(`^${row.fullname}$`, "i") },
        });
        console.log("   ⬅️ Query fullname result:", user);
      }

      if (user) {
        user.status = "completed"; // หรือ "completed"
        await user.save();
        updated++;
        console.log(`✅ Updated User: ${user.fullname} (${user.userCode})`);
      } else {
        notFound++;
        console.log("❌ User not found in DB");
      }
    }

    console.log(`\n📊 Summary: Updated ${updated}, Not Found ${notFound}`);

    return res.json({
      message: "Upload สำเร็จ",
      updated,
      notFound,
    });
  } catch (error) {
    console.error("❌ Error in uploadAttendance:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};
