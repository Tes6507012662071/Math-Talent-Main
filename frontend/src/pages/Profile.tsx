import React, { useEffect, useState } from "react";

interface Student {
  fullname: string;
  grade: string;
  school: string;
  phone: string;
  email: string;
}

interface Registration {
  eventId: string;
  type: "individual" | "school";
  status: string;
  students: Student[];
}

const Profile: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/registration/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setRegistrations(data);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <p className="p-6">กำลังโหลด...</p>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">โปรไฟล์ของฉัน</h1>

      {registrations.length === 0 ? (
        <p>ยังไม่มีการลงทะเบียน</p>
      ) : (
        registrations.map((reg, idx) => (
          <div
            key={idx}
            className="border border-gray-300 p-4 rounded mb-6 bg-white shadow"
          >
            <p>
              <strong>กิจกรรม:</strong> {reg.eventId}
            </p>
            <p>
              <strong>ประเภท:</strong>{" "}
              {reg.type === "individual" ? "บุคคล" : "โรงเรียน"}
            </p>
            <p>
              <strong>สถานะ:</strong>{" "}
              <span className="font-semibold text-blue-600">{reg.status}</span>
            </p>

            <div className="mt-3">
              <p className="font-medium">รายชื่อผู้สมัคร:</p>
              <ul className="list-disc pl-6 text-sm">
                {reg.students.map((stu, i) => (
                  <li key={i}>
                    {stu.fullname} ({stu.grade}) - {stu.school}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Profile;
