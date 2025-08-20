import multer from "multer";

const storage = multer.memoryStorage(); // เก็บไฟล์ใน memory
export const uploadExcel = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.mimetype === "application/vnd.ms-excel"
    ) {
      cb(null, true);
    } else {
      cb(new Error("กรุณาอัปโหลดไฟล์ Excel เท่านั้น (.xlsx, .xls)"));
    }
  },
});
