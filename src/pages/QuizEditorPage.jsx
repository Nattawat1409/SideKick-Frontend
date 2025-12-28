import React from "react";
import { useParams } from "react-router-dom";
import QuestionnaireLayout from "../components/layouts/QuestionnaireLayout";
import QuizForm from "../components/QuizForm"; 

function QuizEditorPage() {
  const { id } = useParams(); 
  
  return (
    <QuestionnaireLayout>
      <div className="pt-24 px-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 max-w-4xl mx-auto">
          {id ? "แก้ไขแบบสอบถาม" : "สร้างแบบสอบถามใหม่"}
        </h1>
        
        <QuizForm formId={id} /> 
      </div>
    </QuestionnaireLayout>
  );
}

export default QuizEditorPage;