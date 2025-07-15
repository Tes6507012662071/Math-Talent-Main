import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { FaUserTie as FaUserTirRaw } from "react-icons/fa";

const FaUserTie = FaUserTirRaw as React.ComponentType<React.SVGProps<SVGSVGElement>>;

interface CommitteeMember {
  name: string;
  position: string;
  //imageUrl?: string; // รองรับภาพในอนาคต
}

const previousCommittee: CommitteeMember[] = [
  { name: 'นางอุทุมพร พลาวงศ์', position: 'ประธานคณะกรรมการ' },
  { name: 'นางสาวสุพร รัตนพันธ์ ', position: 'รองประธานคณะกรรมการ' },
  { name: 'นางสาวรจิต วัฒนสินธุ์', position: 'กรรมการ' },
  { name: 'นางสาวปรียา ขุมทรัพย์', position: 'กรรมการ' },
  { name: 'นายชนศักดิ์ บ่ายเที่ยง', position: 'กรรมการ' },
  { name: 'นางสุรัตนา สังข์หนุน', position: 'กรรมการและเหรัญญิก' },
  { name: 'นางสาวเสาวลักษณ์ เจศรีชัย', position: 'กรรมการและเลขานุการ' },
];

const currentCommittee: CommitteeMember[] = [
  { name: 'นางอุทุมพร พลาวงศ์', position: 'ประธานคณะกรรมการ' },
  { name: 'นางสาวสุพร รัตนพันธ์ ', position: 'รองประธานคณะกรรมการ' },
  { name: 'นางสาวรจิต วัฒนสินธุ์', position: 'กรรมการ' },
  { name: 'นางสาวปรียา ขุมทรัพย์', position: 'กรรมการ' },
  { name: 'นายชนศักดิ์ บ่ายเที่ยง', position: 'กรรมการ' },
  { name: 'นางสาวเสาวลักษณ์ เจศรีชัย', position: 'กรรมการ' },
  { name: 'นางสาววลัยลักษณ์ ชวนัสพร', position: 'กรรมการ' },
  { name: 'รองศาสตราจารย์ ดร.สุรัตนา สังข์หนุน', position: 'กรรมการและเหรัญญิก' },
  { name: 'ผู้ช่วยศาสตราจารย์ ดร.ศิฬาณี นุชิตประสิทธิ์ชัย', position: 'กรรมการและเลขานุการ' },
  { name: 'นางวีณา เนตรสว่าง', position: 'กรรมการและผู้ช่วยเลขานุการ' },
];

const CommitteeSection = ({
  title,
  members,
}: {
  title: string;
  members: CommitteeMember[];
}) => (
  <div className="mb-16">
    <h2 className="text-3xl font-bold text-center text-blue-700 mb-10 mt-12">{title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {members.map((member, index) => (
        <div
          key={index}
          className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6 hover:shadow-2xl hover:scale-105 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="bg-indigo-100 text-indigo-600 p-3 rounded-full text-2xl">
              <FaUserTie />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{member.name}</h3>
              <p className="text-sm text-gray-600">{member.position}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const About = () => {
  return (
    <div className="min-h-screen bg-white">
        <Navbar />
        <CommitteeSection title="รายชื่อคณะกรรมการชุดแรก" members={previousCommittee} />
        <CommitteeSection title="รายชื่อคณะกรรมการชุดปัจจุบัน" members={currentCommittee} />
        <Footer />
    </div>
  );
};


/*const About: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<
    { id: number; name: string; role: string; image: string }[]
  >([]);

  useEffect(() => {
    // Fetch team members data from an API or static file
    const fetchTeamMembers = async () => {
      // Mock data for demonstration
      const members = [
        { id: 1, name: 'John Doe', role: 'Founder', image: '/images/team1.jpg' },
        { id: 2, name: 'Jane Smith', role: 'Developer', image: '/images/team2.jpg' },
        { id: 3, name: 'Alice Johnson', role: 'Designer', image: '/images/team3.jpg' },
      ];
      setTeamMembers(members);
    };

    fetchTeamMembers();
  }, []);

  return (
    <div>
      <Navbar />
      <section className="px-6 py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">เกี่ยวกับเรา</h1>
          <p className="text-center text-lg text-gray-700 mb-6">
            มูลนิธิส่งเสริมอัจฉริยภาพทางคณิตศาสตร์ก่อตั้งขึ้นเพื่อสนับสนุนและพัฒนาศักยภาพทางคณิตศาสตร์ของเยาวชนไทย
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map(member => (
              <div key={member.id} className="bg-white p-4 rounded-lg shadow-md text-center">
                <img src={member.image} alt={member.name} className="w-full h-40 object-cover rounded-t-lg" />
                <h3 className="text-xl font-semibold mt-4">{member.name}</h3>
                <p className="text-gray-500">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  ); 
};*/
export default About;