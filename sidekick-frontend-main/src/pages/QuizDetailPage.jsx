QuizDetailPage
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QuestionnaireLayout from "../components/layouts/QuestionnaireLayout";

function QuizDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const suspectId = sessionStorage.getItem('suspectId');

  useEffect(() => {
    const fetchQuizDetail = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3000/forms/${id}/detail`);
        if (!response.ok) {
          throw new Error('Failed to fetch quiz detail');
        }
        const data = await response.json();
        setQuiz(data);

        const initialAnswers = {};
        if (data.questions && Array.isArray(data.questions)) {
          data.questions.forEach(q => {
            initialAnswers[q._id] = "";
            q.openEnds?.forEach(oe => {
              initialAnswers[oe._id] = "";
            });

            q.options?.forEach(opt => {
              if (opt.openEndPrompt) {
                initialAnswers[opt._id] = "";
              }
            });
          });
        }
        setAnswers(initialAnswers);

      } catch (error) {
        console.error(error);

        setQuiz(null);

      } finally {
        setLoading(false);
      }
    };

    fetchQuizDetail();

  }, [id]);

  const handleOptionChange = (qId, optId, type) => {
    setAnswers((prev) => {
      const newAnswers = { ...prev };

      if (type === "multiple") {
        newAnswers[qId] = optId;
      } else if (type === "mixed") {

        const currentSelection = Array.isArray(prev[qId]) ? prev[qId] : [];
        const exists = currentSelection.includes(optId);
        if (exists) {
          newAnswers[qId] = currentSelection.filter((id) => id !== optId);
        } else {
          newAnswers[qId] = [...currentSelection, optId];
        }
      }
      return newAnswers;
    });
  };

  const handleTextChange = (key, text) => {
    setAnswers((prev) => ({
      ...prev,
      [key]: text,

    }));
  };

  const createQuestionSnapshot = (quiz) => {
    if (!quiz || !quiz.questions) return {};
    const snapshot = {};
    quiz.questions.forEach(q => {
      const qidHex = q._id.toString();
      const choices = q.options?.map(opt => opt.optionText) || [];
      const openEnds = q.openEnds?.map(oe => oe.promptText) || [];
      snapshot[qidHex] = {
        questionText: q.questionText,
        type: q.questionType,
        choices: choices,
        openEnds: openEnds,
        orderIndex: q.orderIndex,
      };
    });
    return snapshot;
  };

  const handleSubmit = async () => {
    if (!suspectId) {
        alert("ข้อผิดพลาด: ไม่พบ ID ผู้ใช้ กรุณาลองลงทะเบียนอีกครั้ง");
        navigate('/login');
        return;
    }
    try {
      const questionSnapshot = createQuestionSnapshot(quiz);
      const response = await fetch(`http://localhost:3000/forms/${quiz._id}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId: quiz._id,
          suspectId: suspectId,
          answers: answers,
          submission: "web-form",
          questions: questionSnapshot,
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit answers');
      }
      alert("บันทึกคำตอบเรียบร้อย ✅");
      navigate("/questionnaire");

    } catch (error) {
      console.error("Error submitting answers:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกคำตอบ");
    }
  };

  if (loading) {
     return <QuestionnaireLayout><div className="pt-24 px-6 max-w-3xl mx-auto text-center"><p className="text-black">กำลังโหลด...</p></div></QuestionnaireLayout>;
  }

  if (!quiz) {
    return (
      <QuestionnaireLayout>
        <div className="pt-24 px-6 max-w-3xl mx-auto text-center">
          <p className="text-black">ไม่พบแบบสอบถามนี้ (ID: {id})</p>
          <button
            onClick={() => navigate("/my-quizzes")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            กลับไปหน้ารายการ
          </button>
        </div>
      </QuestionnaireLayout>
    );
  }

  return (
    <QuestionnaireLayout>
      <div className="pt-24 px-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-2">{quiz.title}</h1>
        <p className="text-black mb-6">{quiz.description}</p>

        {quiz.questions && quiz.questions.map((q, qIndex) => (
          <div
            key={q._id}
            className="mb-6 p-4 bg-white shadow rounded-lg border border-gray-200"
          >
            <h3 className="font-medium text-black mb-3">
              {qIndex + 1}. {q.questionText}
            </h3>

            {q.questionType === "multiple" && q.options &&
              q.options.map((opt, idx) => {
                const checked = answers[q._id] === opt._id;
                return (
                  <label
                    key={opt._id}
                    className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 transition mb-2"
                  >
                    <input
                      type="radio"
                      name={`q-${q._id}`}
                      value={opt._id}
                      checked={checked}
                      onChange={() => handleOptionChange(q._id, opt._id, "multiple")}
                      className="hidden"
                    />
                    <span className={`w-5 h-5 mr-3 flex items-center justify-center rounded border-2 ${checked ? "border-blue-500 bg-blue-500" : "border-gray-400 bg-white"}`}>
                      {checked && ( <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> )}
                    </span>
                    <span className="text-black">
                      {opt.optionText}
                    </span>
                  </label>
                );
              })}

            {q.questionType === "open" && (
              <div className="space-y-6">

                {q.openEnds?.map((oe, oeIdx) => (
                  <div key={oe._id} className="ml-8 space-y-2 border-l-4 border-blue-100 pl-4">
                    <label className="text-gray-800 font-semibold text-sm">
                      {qIndex + 1}.{oeIdx + 1} {oe.promptText}
                    </label>
                    <textarea
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition bg-white text-black"
                      style={{ color: "#000000", minHeight: "80px" }}
                      placeholder={oe.promptText}
                      value={answers[oe._id] || ""}
                      onChange={(e) => handleTextChange(oe._id, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            )}

            {q.questionType === "mixed" && q.options &&
              q.options.map((opt, idx) => {
                const selected = Array.isArray(answers[q._id]) && answers[q._id].includes(opt._id);
                return (
                  <div key={opt._id} className="mb-2">
                    <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-purple-50 transition">
                      <input
                        type="checkbox"
                        value={opt._id}
                        checked={selected}
                        onChange={() => handleOptionChange(q._id, opt._id, "mixed")}
                        className="hidden"
                      />
                      <span
                        className={`w-5 h-5 mr-3 flex items-center justify-center rounded border-2 ${
                          selected ? "border-purple-500 bg-purple-500" : "border-gray-400 bg-white"
                        }`}
                      >
                        {selected && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                      <span className="text-black">{opt.optionText}</span>
                    </label>

                    {opt.openEndPrompt && selected && (
                      <div className="ml-8 mt-4 space-y-2 border-l-4 border-purple-100 pl-4">
                        <label className="text-gray-800 font-semibold text-sm">
                          {opt.openEndPrompt}
                        </label>
                        <textarea
                          placeholder="พิมพ์คำตอบที่นี่..."
                          className="w-full p-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                          style={{ color: "#000000", minHeight: "80px" }}
                          value={answers[opt._id] || ""}
                          onChange={(e) => handleTextChange(opt._id, e.target.value)}
                          rows={3}
                        />
                      </div>
                    )}
                  </div>
                );
              })
            }
            {q.questionType === "mixed" && q.openEnds &&
              q.openEnds.map((oe, idx) => (
                <div key={oe._id} className="ml-4 space-y-2">
                  <label className="text-gray-800 font-semibold text-sm">
                    {oe.promptText}
                  </label>
                  <textarea
                    placeholder="พิมพ์คำตอบเพิ่มเติม..."
                    className="w-full p-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                    style={{ color: "#000000", minHeight: "80px" }}
                    value={answers[oe._id] || ""}
                    onChange={(e) => handleTextChange(oe._id, e.target.value)}
                    rows={3}
                  />
                </div>
              ))
            }
          </div>
        ))}

        <div className="flex justify-center mt-6">
          <button
            onClick={handleSubmit}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow hover:opacity-90 transition font-medium"
          >
            ส่งคำตอบ
          </button>
        </div>
      </div>
    </QuestionnaireLayout>
  );
}
export default QuizDetailPage; 