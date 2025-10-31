import React from "react";
import { Solution } from "../api/solutions"; // (Import Type ที่เราเพิ่งสร้าง)
// 1. ‼️ [แก้ไข] Import Icon (เพิ่ม Raw) ‼️
import { FaDownload as FaDownloadRaw, FaCalendarAlt as FaCalendarAltRaw } from "react-icons/fa";

interface Props {
  solution: Solution;
}

// 2. ✅ [เพิ่ม] Casting Type ‼️
const FaDownload = FaDownloadRaw as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FaCalendarAlt = FaCalendarAltRaw as React.ComponentType<React.SVGProps<SVGSVGElement>>;

// (ดึง Base URL สำหรับสร้าง Link ดาวน์โหลด)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const SolutionCard: React.FC<Props> = ({ solution }) => {

  const formatDate = (dateString: string) => {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "Invalid Date";
        return date.toLocaleDateString('th-TH', {
          year: 'numeric', month: 'long', day: 'numeric'
        });
    } catch (e) { return "Invalid Date"; }
  };

  // สร้าง URL เต็มสำหรับดาวน์โหลด
  const downloadUrl = `${API_BASE_URL}${solution.fileUrl}`;

  return (
    <div className="border rounded-lg shadow-sm hover:shadow-md transition overflow-hidden bg-white">
      {/* Placeholder สีเทา */}
      <div className="h-40 w-full overflow-hidden">
        <img
          src="/images/solution_default.jpg" // 👈 (เปลี่ยนเป็นชื่อไฟล์รูปของคุณ)
          alt="Solution Cover"
          className="w-full h-full object-cover" // (ใช้ object-cover เพื่อให้รูปเต็มกรอบ)
        />
      </div>

      {/* ข้อมูลด้านล่าง */}
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">
          เฉลย: {solution.event.nameEvent}
        </h3>
        
        <p className="text-sm text-gray-500 mb-4 flex items-center">
          <FaCalendarAlt className="mr-2" />
          อัปโหลดเมื่อ: {formatDate(solution.uploadedAt)}
        </p>

        <a 
          href={downloadUrl}
          target="_blank" // เปิดใน Tab ใหม่
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          {/* 3. ✅ (ตอนนี้ Component นี้จะทำงานถูกต้อง) */}
          <FaDownload className="mr-2" />
          ดาวน์โหลดเฉลย (PDF)
        </a>
      </div>
    </div>
  );
};

export default SolutionCard;