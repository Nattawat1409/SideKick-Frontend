import React, { useState, useEffect } from "react";
import { Plus, Trash2, X, CheckSquare, FileText, List, MessageSquarePlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const QUESTION_TYPES = {
  MULTIPLE: "multiple",
  OPEN: "open",
  MIXED: "mixed",
};

const QUESTION_CONFIG = {
  [QUESTION_TYPES.MULTIPLE]: {
    label: "Multiple Choice",
    icon: CheckSquare,
    color: "bg-blue-500",
    focusColor: "focus:ring-blue-500 focus:border-blue-500",
    buttonColor: "text-blue-500 hover:bg-blue-50",
    minChoices: 2,
    maxChoices: 6,
  },
  [QUESTION_TYPES.OPEN]: {
    label: "Open-end",
    icon: FileText,
    color: "bg-green-500",
    focusColor: "focus:ring-green-500 focus:border-green-500",
    buttonColor: "text-green-500 hover:bg-green-50",
    minOpenEnds: 1,
    maxOpenEnds: 5,
  },
  [QUESTION_TYPES.MIXED]: {
    label: "Mixed",
    icon: List,
    color: "bg-purple-500",
    focusColor: "focus:ring-purple-500 focus:border-purple-500",
    buttonColor: "text-purple-500 hover:bg-purple-50",
    minChoices: 2,
    maxChoices: 4,
  },
};

const IconButton = ({ icon: Icon, onClick, className = "", color = "text-gray-400 hover:text-red-500" }) => (
  <button
    type="button"
    onClick={onClick}
    className={`transition-colors ${color} ${className}`}
  >
    <Icon className="w-4 h-4" />
  </button>
);

const QuestionInput = ({ value, onChange, type }) => {
    const config = QUESTION_CONFIG[type];
    return (
        <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Enter question"
                className={`w-full p-4 border border-gray-200 rounded-lg resize-none ${config.focusColor} transition-colors text-gray-900 placeholder-gray-400`}
                rows={3}
            />
        </div>
    );
};

const ChoiceInput = ({ choices, onUpdate, onAdd, onRemove, type }) => {
    const config = QUESTION_CONFIG[type];
    return (
        <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-4">Choices</label>
            <div className="space-y-4">
                {choices.map((choice, index) => (
                    <div key={choice.id} className="flex items-start gap-3">
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                                <input
                                    type="text"
                                    value={choice.text}
                                    onChange={(e) => onUpdate(index, "text", e.target.value)}
                                    placeholder={`Choice ${index + 1}`}
                                    className={`w-full p-3 border border-gray-200 rounded-lg ${config.focusColor} text-gray-900 placeholder-gray-400`}
                                />
                                {choices.length > config.minChoices && (
                                    <IconButton
                                        icon={Trash2}
                                        onClick={() => onRemove(index)}
                                    />
                                )}
                            </div>
                            {type === QUESTION_TYPES.MIXED && (
                                <div className="flex items-center gap-2 ml-4">
                                    <MessageSquarePlus className="w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={choice.openEndPrompt}
                                        onChange={(e) => onUpdate(index, "openEndPrompt", e.target.value)}
                                        placeholder="Optional: Prompt for this choice..."
                                        className={`w-full p-2 border border-gray-100 rounded-lg text-sm ${config.focusColor} text-gray-700 placeholder-gray-400`}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {choices.length < config.maxChoices && (
                <button
                    type="button"
                    onClick={onAdd}
                    className={`mt-3 px-4 py-2 rounded-lg ${config.buttonColor}`}
                >
                    + Add choice
                </button>
            )}
        </div>
    );
};

const OpenEndInput = ({ openEnds, onUpdate, onAdd, onRemove, type }) => {
    const config = QUESTION_CONFIG[type];
    return (
        <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-4">Open-end</label>
            <div className="space-y-3">
                {openEnds.map((prompt, index) => (
                    <div key={prompt.id} className="flex items-center gap-3">
                        <div className="flex-1 relative">
                            <textarea
                                value={prompt.text}
                                onChange={(e) => onUpdate(index, "text", e.target.value)}
                                placeholder={`Prompt ${index + 1} (e.g., 'Please specify...')`}
                                className={`w-full p-3 border border-gray-200 rounded-lg resize-none ${config.focusColor} text-gray-900 placeholder-gray-400`}
                                rows={2}
                            />
                            {openEnds.length > (config.minOpenEnds || 1) && ( 
                                <IconButton icon={Trash2} onClick={() => onRemove(index)} className="absolute right-2 top-2" />
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {openEnds.length < (config.maxOpenEnds || 1) && (
                <button
                    type="button"
                    onClick={onAdd}
                    className={`mt-3 px-4 py-2 rounded-lg ${config.buttonColor}`}
                >
                    + Add Prompt
                </button>
            )}
        </div>
    );
};

const QuizForm = ({ formId }) => {
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [fetchedFormId, setFetchedFormId] = useState(null); 

  const navigate = useNavigate();
  const apiBaseUrl = 'http://localhost:3000';
  
  const newChoice = (data = {}) => ({
      id: data.id || crypto.randomUUID(),
      _id: data._id, 
      text: data.optionText || data.text || "",
      openEndPrompt: data.openEndPrompt || "",
  });

  const newOpenEnd = (data = {}) => ({
      id: data.id || crypto.randomUUID(),
      _id: data._id, 
      text: data.promptText || data.text || "",
  });
  
  const newQuestion = (data = {}, newId) => ({
      id: newId || data.id || crypto.randomUUID(), 
      _id: data._id, 
      type: data.questionType || data.type || QUESTION_TYPES.MULTIPLE,
      question: data.questionText || data.question || "",
      choices: Array.isArray(data.options) 
        ? data.options.map(c => newChoice(c)) 
        : (data.questionType === QUESTION_TYPES.MULTIPLE || data.questionType === QUESTION_TYPES.MIXED)
          ? [newChoice(), newChoice()]
          : [],
      openEnds: Array.isArray(data.openEnds) 
        ? data.openEnds.map(o => newOpenEnd(o)) 
        : [],
  });

  useEffect(() => {
    const fetchQuizToEdit = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${apiBaseUrl}/forms/${formId}/detail`);
        if (!response.ok) throw new Error("Failed to fetch quiz detail for editing");
        
        const data = await response.json();
        
        setQuizTitle(data.title);
        setQuizDescription(data.description);
        setFetchedFormId(data._id);

        const loadedQuestions = data.questions
            ? data.questions.sort((a,b) => a.orderIndex - b.orderIndex).map(q => newQuestion(q))
            : [];
            
        setQuestions(loadedQuestions.length > 0 ? loadedQuestions : [newQuestion()]);

      } catch (error) {
        console.error("Error loading quiz for edit:", error);
        alert(`Could not load quiz. Maybe the ID is wrong. ${error.message}`);
        navigate("/my-quizzes"); 
      } finally {
        setLoading(false);
      }
    };

    if (formId) {
      fetchQuizToEdit();
    } else {
      setQuizTitle("");
      setQuizDescription("");
      setQuestions([newQuestion()]);
      setFetchedFormId(null); 
      setLoading(false);
    }
  }, [formId]); 
  
  const addQuestion = () => {
    setQuestions([...questions, newQuestion()]);
  };

  const removeQuestion = (id) => {
    if (questions.length > 1)
      setQuestions(questions.filter((q) => q.id !== id));
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  const changeType = (id, newType) => {
    setQuestions(
      questions.map((q) => {
        if (q.id !== id) return q;
        
        const newQuestionData = {
            ...q,
            _id: undefined,
            type: newType,
            choices: (newType === QUESTION_TYPES.MULTIPLE || newType === QUESTION_TYPES.MIXED)
                ? [newChoice(), newChoice()]
                : [],
            openEnds: (newType === QUESTION_TYPES.OPEN || newType === QUESTION_TYPES.MIXED)
                ? [newOpenEnd()]
                : [],
        };
        return newQuestionData;
      })
    );
  };
  
  const updateChoice = (qId, cIndex, field, value) => {
    setQuestions(prevQuestions =>
      prevQuestions.map(q => {
        if (q.id !== qId) return q;
        const newChoices = q.choices.map((c, idx) => {
          if (idx !== cIndex) return c;
          return { ...c, [field]: value };
        });
        return { ...q, choices: newChoices };
      })
    );
  };

  const addChoice = (qId) => {
    setQuestions(prevQuestions =>
      prevQuestions.map(q => {
        if (q.id !== qId) return q;
        return { ...q, choices: [...q.choices, newChoice()] };
      })
    );
  };

  const removeChoice = (qId, cIndex) => {
    setQuestions(prevQuestions =>
      prevQuestions.map(q => {
        if (q.id !== qId) return q;
        if (q.choices.length <= QUESTION_CONFIG[q.type]?.minChoices) return q; 
        return { ...q, choices: q.choices.filter((_, idx) => idx !== cIndex) };
      })
    );
  };

  const updateOpenEnd = (qId, oIndex, field, value) => {
      setQuestions(prevQuestions =>
       prevQuestions.map(q => {
         if (q.id !== qId) return q;
         const newOpenEnds = q.openEnds.map((o, idx) => {
           if (idx !== oIndex) return o;
           return { ...o, [field]: value };
         });
         return { ...q, openEnds: newOpenEnds };
       })
     );
  };

  const addOpenEnd = (qId) => {
    setQuestions(prevQuestions =>
      prevQuestions.map(q => {
        if (q.id !== qId) return q;
        return { ...q, openEnds: [...q.openEnds, newOpenEnd()] };
      })
    );
  };

  const removeOpenEnd = (qId, oIndex) => {
    setQuestions(prevQuestions =>
      prevQuestions.map(q => {
        if (q.id !== qId) return q;
        if (q.openEnds.length <= QUESTION_CONFIG[q.type]?.minOpenEnds) return q; 
        return { ...q, openEnds: q.openEnds.filter((_, idx) => idx !== oIndex) };
      })
    );
  };

  const handleSubmit = async () => { 
    const isEditMode = !!fetchedFormId;

    if (!quizTitle.trim()) return alert("กรุณากรอกชื่อแบบสอบถาม");
    if (!quizDescription.trim()) return alert("กรุณากรอกคำอธิบายแบบสอบถาม");
    for (let q of questions) {
      if (!q.question.trim()) return alert(`คำถามข้อ ${q.id}: กรุณากรอกคำถาม`);
      const config = QUESTION_CONFIG[q.type];
      if (q.type === QUESTION_TYPES.MULTIPLE || q.type === QUESTION_TYPES.MIXED) {
        const validChoices = q.choices.filter(c => c.text.trim() !== "");
        if (validChoices.length < config.minChoices) {
             return alert(`คำถามข้อ ${q.id}: ต้องมีอย่างน้อย ${config.minChoices} choices`);
        }
        if (q.choices.some((c) => !c.text.trim())) {
           return alert(`คำถามข้อ ${q.id}: กรุณากรอก "text" ของ choice ให้ครบ (ถ้ามีช่องว่างให้ลบทิ้ง)`);
        }
      }

      if (q.type === QUESTION_TYPES.OPEN) {
          if (q.openEnds.some((o) => !o.text.trim())) {
            return alert(`คำถามข้อ ${q.id}: กรุณากรอก prompt ให้ครบ (ถ้ามีช่องว่างให้ลบทิ้ง)`);
          }
      }
    }

    try {
      const createdBy = sessionStorage.getItem('policeId') || '000000000000000000000000'; 
      const payload = {
          title: quizTitle,
          description: quizDescription,
          createdBy: createdBy,
          questions: questions.map((q, qIndex) => ({
              ...(q._id && q._id !== "" && { _id: q._id }), 
              questionText: q.question,
              questionType: q.type,
              orderIndex: qIndex,
              
              options: (q.type === QUESTION_TYPES.MULTIPLE || q.type === QUESTION_TYPES.MIXED)
                  ? q.choices.filter(c => c.text.trim() !== "").map((c, cIndex) => ({
                      ...(c._id && c._id !== "" && { _id: c._id }),
                      optionText: c.text,
                      openEndPrompt: c.openEndPrompt,
                      orderIndex: cIndex,
                  }))
                  : undefined,
              openEnds: (q.type === QUESTION_TYPES.OPEN || q.type === QUESTION_TYPES.MIXED)
                  ? q.openEnds.filter(o => o.text.trim() !== "").map((o, oIndex) => ({
                      ...(o._id && o._id !== "" && { _id: o._id }),
                      promptText: o.text,
                      orderIndex: oIndex,
                  }))
                  : undefined,
          })),
      };

      if (fetchedFormId && fetchedFormId !== "") {
          payload._id = fetchedFormId;
      }

      const response = await fetch(`${apiBaseUrl}/forms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
      });

      if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMsg = errorData.error || `HTTP status ${response.status}`;
          throw new Error(`Failed to save form. Server says: ${errorMsg}`);
      }

      if (isEditMode) {
        alert("แก้ไขแบบสอบถามเรียบร้อย ✅");
      } else {
        alert("สร้างแบบสอบถามใหม่เรียบร้อย ✅");
      }
      navigate("/my-quizzes");

    } catch (error) {
      console.error("Error saving quiz:", error);
      alert(`เกิดข้อผิดพลาดในการบันทึก: ${error.message}`);
    }
  };


  if (loading) return <div className="p-10 text-center text-gray-500">กำลังโหลด...</div>;

  return (
    <div className="w-full mx-auto space-y-6 pt-8 max-w-4xl">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <input
          type="text"
          value={quizTitle}
          onChange={(e) => setQuizTitle(e.target.value)}
          placeholder="Untitled form.."
          className="w-full text-2xl font-medium text-gray-900 border border-gray-200 rounded-lg p-3 outline-none mb-4 placeholder-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
        />
        <input
          type="text"
          value={quizDescription}
          onChange={(e) => setQuizDescription(e.target.value)}
          placeholder="Form description.."
          className="w-full text-base text-gray-900 border border-gray-200 rounded-lg p-3 outline-none placeholder-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
        />
      </div>

      {questions.map((q, idx) => {
        const config = QUESTION_CONFIG[q.type];
        return (
          <div key={q.id} className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 ${config.color} text-white rounded-full flex items-center justify-center`}
                >
                  {idx + 1}
                </div>
                <span className="text-lg font-medium">{config.label}</span>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => changeType(q.id, QUESTION_TYPES.MULTIPLE)} className="px-3 py-1 bg-blue-100 text-blue-600 rounded">Multiple</button>
                <button type="button" onClick={() => changeType(q.id, QUESTION_TYPES.OPEN)} className="px-3 py-1 bg-green-100 text-green-600 rounded">Open</button>
                <button type="button" onClick={() => changeType(q.id, QUESTION_TYPES.MIXED)} className="px-3 py-1 bg-purple-100 text-purple-600 rounded">Mixed</button>

                {questions.length > 1 && (
                  <IconButton icon={X} onClick={() => removeQuestion(q.id)} />
                )}
              </div>
            </div>

            <QuestionInput
              value={q.question}
              onChange={(v) => updateQuestion(q.id, "question", v)}
              type={q.type}
            />

            {(q.type === QUESTION_TYPES.MULTIPLE || q.type === QUESTION_TYPES.MIXED) && (
              <ChoiceInput
                choices={q.choices}
                type={q.type}
                onUpdate={(index, field, value) => updateChoice(q.id, index, field, value)}
                onAdd={() => addChoice(q.id)}
                onRemove={(index) => removeChoice(q.id, index)}
              />
            )}

            {(q.type === QUESTION_TYPES.OPEN || q.type === QUESTION_TYPES.MIXED) && ( 
              <OpenEndInput
                openEnds={q.openEnds}
                type={q.type}
                onUpdate={(index, field, value) => updateOpenEnd(q.id, index, field, value)}
                onAdd={() => addOpenEnd(q.id)}
                onRemove={(index) => removeOpenEnd(q.id, index)}
              />
            )}

          </div>
        );
      })}

      <div className="flex justify-center">
        <button
          type="button"
          onClick={addQuestion}
          className="px-6 py-3 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200"
        >
          Add more question
        </button>
      </div>

      <div className="flex justify-center pt-6">
        <button
          type="button"
          onClick={handleSubmit}
          className={`px-8 py-3 text-white rounded-lg hover:opacity-90 font-medium ${fetchedFormId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-500 hover:bg-blue-600'}`}
        >
          {fetchedFormId ? "บันทึกการแก้ไข" : "สร้างแบบสอบถาม"} ({questions.length} ข้อ)
        </button>
      </div>
    </div>
  );
};

export default QuizForm;