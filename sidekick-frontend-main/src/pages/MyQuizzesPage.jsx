import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import QuestionnaireLayout from "../components/layouts/QuestionnaireLayout";


function MyQuizzesPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  
  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        
        const response = await fetch('http://localhost:3000/forms');
        
        if (!response.ok) {
          throw new Error('Failed to fetch quizzes from server');
        }
        const data = await response.json(); 
        
        setQuizzes(data.items || []);
        
      } catch (error) {
        console.error("Error fetching quizzes:", error);
        setQuizzes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const handleDelete = async (id) => {

    console.log("Deleting quiz:", id); 

    try {
      const response = await fetch(`http://localhost:3000/forms/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete quiz');
      }
      
      setQuizzes(quizzes.filter((q) => q._id !== id));

    } catch (error) {
      console.error("Error deleting quiz:", error);
      alert("เกิดข้อผิดพลาดในการลบ (คุณอาจจะยังไม่ได้สร้าง API DELETE ใน BE)");
    }
  };


  return (
    <QuestionnaireLayout>
      <div className="pt-24 px-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          แบบสอบถามที่สร้างไว้
        </h1>

        <div className="mb-6">
          <button
            onClick={() => navigate('/my-quizzes/create')}
            className="px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-lg hover:from-blue-600 hover:to-blue-700 transition transform hover:-translate-y-0.5"
            style={{ fontWeight: 600 }}
          >
            สร้างแบบสอบถามใหม่
          </button>
        </div>

        {loading && <p className="text-gray-500">กำลังโหลด...</p>}

        {!loading && quizzes.length === 0 && (
          <p className="text-gray-500">ยังไม่มีแบบสอบถามที่บันทึกไว้</p>
        )}

        {!loading && quizzes.length > 0 && (
          <div className="grid gap-6">
            {quizzes.map((quiz) => (
              <div
                key={quiz._id} 
                className="bg-white shadow-md rounded-lg p-6 border border-gray-200 hover:shadow-lg transition"
              >
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                  {quiz.title}
                </h2>
                <p className="text-gray-600 mb-4">{quiz.description}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>
                    สร้างเมื่อ: {new Date(quiz.createdAt).toLocaleString("th-TH")}
                  </span>
                </div>
                <div className="mt-4 flex gap-3">
                  
                  <button
                    onClick={() => navigate(`/quiz/${quiz._id}`)} 
                    className="px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-lg shadow hover:opacity-90 transition"
                  >
                    ดู
                  </button>
                  
                  
                  <button
                    onClick={() => navigate(`/edit-quiz/${quiz._id}`)} 
                    className="px-4 py-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-lg shadow hover:opacity-90 transition"
                  >
                    แก้ไข
                  </button>

                  <button
                    onClick={() => handleDelete(quiz._id)} 
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow hover:opacity-90 transition"
                  >
                    ลบ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </QuestionnaireLayout>
  );
}

export default MyQuizzesPage;