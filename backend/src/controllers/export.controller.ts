import { Request, Response } from "express";
import prisma from '../utils/prisma';
import * as XLSX from "xlsx";
import { Prisma } from '../generated/client'; 

export const exportSurveyResponses = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const survey = await prisma.survey.findUnique({
      where: { eventId },
      include: {
        questions: { orderBy: { id: 'asc' } }
      }
    });
    if (!survey) {
      return res.status(404).json({ message: "ไม่พบแบบสอบถามสำหรับ Event นี้" });
    }
    const responses = await prisma.surveyResponse.findMany({
      where: { surveyId: survey.id },
      include: {
        user: { select: { name: true, email: true } },
        answers: { orderBy: { questionIndex: 'asc' } }
      }
    });
    const headers = ["User Code", "Name", "Email", "Submit Time"];
    survey.questions.forEach(q => { headers.push(q.question); });
    const exportData = responses.map(response => {
      const row: any = {
        "User Code": response.userCode,
        "Name": response.user?.name || '',
        "Email": response.user?.email || '',
        "Submit Time": response.submittedAt.toLocaleString('th-TH'),
      };
      response.answers.forEach(answer => {
        let answerValue = answer.answer;
        try {
          const parsed = JSON.parse(answerValue as string);
          if (Array.isArray(parsed)) {
            answerValue = parsed.join(', ');
          }
        } catch (e) {}
        row[answer.question] = answerValue;
      });
      return row;
    });
    const worksheet = XLSX.utils.json_to_sheet(exportData, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Survey Responses");
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=survey_export_${eventId}.xlsx`);
    res.send(buffer);
  } catch (error: any) {
    console.error("❌ Export Survey Error:", error);
    res.status(500).json({ message: "Export ล้มเหลว", error: error.message });
  }
};

export const exportApplicants = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;

    const applicants = await prisma.individualRegistration.findMany({
      where: { eventId: eventId },
      orderBy: {
        createdAt: 'asc' 
      }
    });

    if (applicants.length === 0) {
      return res.status(404).json({ message: "ไม่พบผู้สมัครสำหรับ Event นี้" });
    }

    const exportData = applicants.map(app => ({
      'รหัสผู้สมัคร (User Code)': app.userCode,
      'รหัสแอดมิน (Admin Code)': app.adminCode,
      'ชื่อ-นามสกุล': app.fullname,
      'ระดับชั้น': app.grade,
      'โรงเรียน': app.school,
      'ศูนย์สอบ': app.stationName,
      'เบอร์โทร': app.phone,
      'อีเมล': app.email,
      'สถานะ': app.status,
      'วันที่สมัคร': app.createdAt.toLocaleString('th-TH')
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Applicants");
    
    
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    
    res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
        'Content-Disposition',
        `attachment; filename=applicants_export_${eventId}.xlsx`
    );
    res.send(buffer);

  } catch (error: any) {
    console.error("❌ Export Applicants Error:", error);
    res.status(500).json({ message: "Export ล้มเหลว", error: error.message });
  }
};