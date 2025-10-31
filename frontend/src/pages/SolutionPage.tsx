import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SolutionCard from "../components/SolutionCard";
import { fetchAllSolutions, Solution } from "../api/solutions";

const SolutionPage: React.FC = () => {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSolutions = async () => {
      try {
        setLoading(true);
        const data = await fetchAllSolutions();
        setSolutions(data);
      } catch (err) {
        setError("ไม่สามารถโหลดข้อมูลเฉลยข้อสอบได้");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadSolutions();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          คลังเฉลยข้อสอบ
        </h1>

        {loading && (
          <div className="text-center text-gray-500">กำลังโหลดข้อมูล...</div>
        )}
        
        {error && (
          <div className="text-center text-red-500">{error}</div>
        )}

        {!loading && !error && (
          solutions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {solutions.map((solution) => (
                <SolutionCard key={solution.id} solution={solution} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">ยังไม่มีเฉลยข้อสอบในขณะนี้</div>
          )
        )}

      </div>
      <Footer />
    </div>
  );
};

export default SolutionPage;