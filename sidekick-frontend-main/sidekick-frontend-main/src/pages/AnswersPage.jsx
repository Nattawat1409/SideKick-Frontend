import React, { useEffect, useState } from "react";
import QuestionnaireLayout from "../components/layouts/QuestionnaireLayout";

const API_URL = "http://localhost:3000";

function AnswersPage() {
  const [viewLevel, setViewLevel] = useState(1);
  const [forms, setForms] = useState([]);
  const [responses, setResponses] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [quizDetail, setQuizDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const formRes = await fetch(`${API_URL}/forms`);
      const formData = await formRes.json();
      setForms(formData.items || []);

      const respRes = await fetch(`${API_URL}/forms/all-responses`);
      const respData = await respRes.json();
      setResponses(respData);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectForm = async (form) => {
    setSelectedForm(form);
    setViewLevel(2);
    try {
      const res = await fetch(`${API_URL}/forms/${form._id}/detail`);
      if (!res.ok) throw new Error("Load detail failed");
      const data = await res.json();
      setQuizDetail(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewDetail = (resp) => {
    setSelectedResponse(resp);
    setViewLevel(3);
  };

  const handleDeleteResponse = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("ยืนยันการลบ?")) return;
    try {
        await fetch(`${API_URL}/forms/response/${id}`, { method: "DELETE" });
        setResponses(prev => prev.filter(r => r._id !== id));
    } catch (err) {
        console.error("Delete failed", err);
    }
  };

  const goBack = () => setViewLevel((prev) => prev - 1);
  
  const handleExportJSON = () => {
    if (!selectedResponse) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(selectedResponse, null, 2));
    const a = document.createElement('a');
    a.setAttribute("href", dataStr);
    a.setAttribute("download", `ans_${selectedResponse.suspectId}.json`);
    a.click();
  };
  return (
    <QuestionnaireLayout>
      <div className="pt-24 px-6 max-w-5xl mx-auto pb-20 text-black">
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h1 className="text-3xl font-bold">
            {viewLevel === 1 && "📋 จัดการผลการตอบ"}
            {viewLevel === 2 && `👥 รายชื่อผู้ตอบ: ${selectedForm?.title}`}
            {viewLevel === 3 && `📝 ข้อมูล: ${selectedResponse?.suspectId}`}
          </h1>
          {viewLevel > 1 && (
            <button onClick={goBack} className="px-5 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700 active:scale-95 transition-all font-medium shadow-md flex items-center gap-2">← ย้อนกลับ</button>
          )}
        </div>

        {viewLevel === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {forms.map((f) => (
              <div key={f._id} onClick={() => handleSelectForm(f)} className="p-6 bg-white rounded-2xl shadow-sm border border-gray-200 cursor-pointer hover:border-blue-500 transition-all">
                <h2 className="text-xl font-bold text-blue-600 mb-2">{f.title}</h2>
                <p className="text-gray-600">{f.description}</p>
              </div>
            ))}
          </div>
        )}

        {viewLevel === 2 && (
          <div className="space-y-4">
            {responses.filter(r => r.formId === selectedForm?._id).length > 0 ? (
              responses.filter(r => r.formId === selectedForm?._id).map((resp) => (
                <div key={resp._id} onClick={() => handleViewDetail(resp)} className="p-5 bg-white rounded-xl border border-gray-200 flex justify-between items-center hover:shadow-lg cursor-pointer transition">
                  <div>
                    <p className="font-bold text-lg text-gray-800">ID: <span className="text-blue-600">{resp.suspectId}</span></p>
                    <p className="text-sm text-gray-400">ส่งเมื่อ: {new Date(resp.dateTime).toLocaleString('th-TH')}</p>
                  </div>
                  <div className="flex gap-3 items-center">
                    <button
                      onClick={(e) => handleDeleteResponse(e, resp._id)}
                      className="px-4 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition font-medium text-sm"
                    >
                      ลบ
                    </button>
                    <span className="text-blue-500 font-medium">ดูคำตอบ →</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-gray-400">ยังไม่มีข้อมูลผู้ตอบสำหรับแบบฟอร์มนี้</p>
              </div>
            )}
          </div>
        )}

        {viewLevel === 3 && quizDetail && selectedResponse && (
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex justify-end mb-6">
              <button onClick={handleExportJSON} className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition font-medium shadow-sm flex items-center gap-2">
                <span>📥</span> Export JSON
              </button>
            </div>
            {quizDetail.questions?.map((q, qIndex) => {
              const allAnswers = selectedResponse.answer_docs || [];

              return (
                <div key={q._id} className="mb-10 border-b last:border-0 pb-8">
                  <h3 className="font-bold text-xl mb-4 text-gray-900">
                    {qIndex + 1}. {q.questionText}
                  </h3>

                  <div className="pl-6 space-y-4">
                    {q.questionType === "open" && q.openEnds?.map((oe, oeIdx) => {
                      const ans = allAnswers.find(a => a.questionId === oe._id);
                      return (
                        <div key={oe._id} className="space-y-2">
                          <p className="text-sm font-bold text-gray-600 italic">
                            {qIndex + 1}.{oeIdx + 1} {oe.promptText}
                          </p>
                          <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500 shadow-sm">
                            <p className="text-gray-800 whitespace-pre-wrap">
                              {ans ? ans.answerText : "ไม่ได้ตอบ"}
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {q.questionType === "multiple" && q.options?.map(opt => {
                      const isChecked = allAnswers.some(a => a.answerText === opt._id);
                      return (
                        <div key={opt._id} className={`flex items-center ${isChecked ? "text-blue-600 font-bold" : "text-gray-300"}`}>
                          <span className="mr-2 text-xl">{isChecked ? "☑" : "☐"}</span>
                          <span>{opt.optionText}</span>
                        </div>
                      );
                    })}

                    {q.questionType === "mixed" && (
                      <div className="space-y-4">
                        {q.options?.map(opt => {
                          const mainAns = allAnswers.find(a => a.questionId === q._id);
                          let isChecked = false;

                          try {
                            const selectedIds = JSON.parse(mainAns?.answerText || "[]");
                            isChecked = selectedIds.includes(opt._id);
                          } catch (e) {
                            isChecked = mainAns?.answerText === opt._id;
                          }
                          if (!isChecked) isChecked = allAnswers.some(a => a.answerText === opt._id);

                          const extraAns = allAnswers.find(a => a.questionId === opt._id);

                          return (
                            <div key={opt._id} className="space-y-2">
                              <div className={`flex items-center ${isChecked ? "text-purple-600 font-bold" : "text-gray-300"}`}>
                                <span className="mr-2 text-xl">{isChecked ? "☑" : "☐"}</span>
                                <span>{opt.optionText}</span>
                              </div>
                              
                              {extraAns && extraAns.answerText && (
                                <div className="ml-8 space-y-2 border-l-4 border-purple-100 pl-4 mt-2">
                                  <p className="text-sm font-bold text-purple-600 italic">
                                    {opt.openEndPrompt || "รายละเอียดเพิ่มเติม:"}
                                  </p>
                                  <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-400 shadow-sm">
                                    <p className="text-gray-800 italic">"{extraAns.answerText}"</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {q.openEnds?.map((oe, oeIdx) => {
                          const subAns = allAnswers.find(a => a.questionId === oe._id);
                          return (
                            <div key={oe._id} className="mt-6 pt-4 border-t border-gray-100 space-y-2">
                              <p className="text-sm font-bold text-gray-600 italic">
                                {oe.promptText || "คำถามเพิ่มเติม:"}
                              </p>
                              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                                <p className="text-gray-800 whitespace-pre-wrap">
                                  {subAns && subAns.answerText ? subAns.answerText : "- ไม่ได้ตอบ -"}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </QuestionnaireLayout>
  );
}

export default AnswersPage;