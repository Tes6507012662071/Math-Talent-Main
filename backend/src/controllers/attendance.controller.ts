// backend/src/controllers/attendance.controller.ts (เวอร์ชัน Prisma)
import { Request, Response } from "express";
import * as XLSX from "xlsx";
// 1. ❌ ลบ Mongoose Model ทิ้ง
// import IndividualRegistration from "../models/IndividualRegistration";

// 2. ✅ Import Prisma Client และ Enum ที่จำเป็น
import prisma from '../utils/prisma'; 
import { IndividualStatus } from '../generated/client'; 

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

    // --- Logic การอ่าน Excel (ไม่ต้องแก้) ---
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const rows: ExcelRow[] = (sheet as any[]).map((row: any) => ({
      userCode: row.userCode ? String(row.userCode).trim() : undefined,
      fullname: row.fullname ? String(row.fullname).trim() : undefined,
    }));
    // --- Logic การอ่าน Excel ---

    console.log("📄 อ่าน Excel rows:", rows);

    let updated = 0;
    let notFound = 0;

    for (const [index, row] of rows.entries()) {
      console.log(`\n🔹 Processing row ${index + 1}:`, row);

      let user = null;

      // 3. ‼️ ค้นหา userCode (Prisma: findFirst) ‼️
      if (row.userCode) {
        console.log(`👉 กำลังค้นหา User ด้วย userCode='${row.userCode}'`);
        user = await prisma.individualRegistration.findFirst({
          where: { userCode: row.userCode },
        });
        console.log("   ⬅️ Query userCode result:", user);
      }

      // 4. ‼️ fallback fullname (เปลี่ยน $regex เป็น contains/insensitive) ‼️
      if (!user && row.fullname) {
        console.log(
          `👉 กำลังค้นหา User ด้วย fullname (case-insensitive)='${row.fullname}'`
        );
        
        // Mongoose: { fullname: { $regex: new RegExp(`^${row.fullname}$`, "i") } }
        // Prisma: { fullname: { equals: row.fullname, mode: 'insensitive' } }
        user = await prisma.individualRegistration.findFirst({
          where: { 
            fullname: { 
              equals: row.fullname,
              mode: 'insensitive' // 👈 ถ้าตรงนี้ยังติด error
            } as any // 👈 ใช้ 'as any' เพื่อให้ TS ยอมรับบล็อก fullname
          },
        });
        console.log("   ⬅️ Query fullname result:", user);
      }

      if (user) {
        // 5. ‼️ Mongoose: user.status = ...; await user.save() -> Prisma: .update() ‼️
        await prisma.individualRegistration.update({
          where: { id: user.id }, // ✅ ใช้ Primary Key (id) ในการอัปเดต
          data: {
            status: IndividualStatus.completed, // ✅ ใช้ Enum
          }
        });

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