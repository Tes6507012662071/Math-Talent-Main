const API_URL = "http://localhost:5000/api";

// ฟังก์ชันส่งข้อมูลแบบฟอร์มบุคคลธรรมดา (Individual)
export const submitIndividualForm = async (token: string, data: any) => {
    const response = await fetch(`${API_URL}/individual-registration`, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "สมัครไม่สำเร็จ");
    }

    return await response.json();
};

// ถ้ามี API อื่นๆสำหรับ IndividualForm ก็เพิ่มได้ที่นี่
