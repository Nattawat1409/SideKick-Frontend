import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import QuestionnaireLayout from '../components/layouts/QuestionnaireLayout'

function QuestionnairePage() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const role = sessionStorage.getItem('role')

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true)
      try {
        const res = await fetch('http://localhost:3000/forms')
        if (!res.ok) throw new Error('Failed to fetch forms')
        const data = await res.json()
        setQuizzes(data.items || [])
      } catch (err) {
        console.error(err)
        setQuizzes([])
      } finally {
        setLoading(false)
      }
    }
    fetchQuizzes()
  }, [])

  return (
    <QuestionnaireLayout>
      <div className="pt-24 px-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">แบบสอบถามที่สร้างไว้</h1>

        {loading && <p className="text-gray-500">กำลังโหลด...</p>}

        {!loading && quizzes.length === 0 && (
          <p className="text-gray-500">{role === 'police' ? 'ยังไม่มีแบบสอบถามที่สร้างไว้' : 'ยังไม่มีแบบสอบถามให้ตอบ'}</p>
        )}

        {!loading && quizzes.length > 0 && (
          <div className="grid gap-6">
            {quizzes.map((quiz) => (
              <div key={quiz._id || quiz.id} className="bg-white shadow-md rounded-lg p-6 border border-gray-200 hover:shadow-lg transition">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">{quiz.title}</h2>
                <p className="text-gray-600 mb-4">{quiz.description}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>สร้างเมื่อ: {new Date(quiz.createdAt).toLocaleString('th-TH')}</span>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => navigate(`/quiz/${quiz._id || quiz.id}`)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-lg shadow hover:opacity-90 transition"
                  >
                    ดูและทำแบบสอบถาม
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </QuestionnaireLayout>
  )
}

export default QuestionnairePage