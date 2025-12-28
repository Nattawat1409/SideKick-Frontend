import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/loginpage'
import PoliceRegisterPage from './pages/PoliceRegisterPage'
import QuestionnairePage from './pages/QuestionnairePage'
import MyQuizzesPage from './pages/MyQuizzesPage'
import QuizDetailPage from './pages/QuizDetailPage'
// import QuizCreator from './components/QuizCreator' // <--- [REMOVED] ลบ QuizCreator ที่เป็นปัญหา
import QuestionnaireLayout from './components/layouts/QuestionnaireLayout'
import AnswersPage from './pages/AnswersPage'
import QuizEditorPage from './pages/QuizEditorPage' 
import './App.css'

// Protected Route Component (role-aware)
function ProtectedRoute({ children, allowedRoles } = {}) {
  const isAuth = sessionStorage.getItem('isAuthenticated') === 'true'
  
  if (!isAuth) return <Navigate to="/" replace /> 
  if (allowedRoles && Array.isArray(allowedRoles)) {
    const role = sessionStorage.getItem('role')
    if (!allowedRoles.includes(role)) return <Navigate to="/" replace />
  }
  return children
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />

      {/* Police register (public) */}
      <Route path="/police-register" element={<PoliceRegisterPage />} />
      
      {/* -------------------- Protected Routes -------------------- */}
      
      {/* Public Quizzes (for both suspect and police to view) */}
      <Route
        path="/questionnaire"
        element={
          <ProtectedRoute>
            <QuestionnairePage />
          </ProtectedRoute>
        }
      />

      {/* Police Only: My Quizzes List */}
      <Route
        path="/my-quizzes"
        element={
          <ProtectedRoute allowedRoles={["police"]}>
            <MyQuizzesPage />
          </ProtectedRoute>
        }
      />

      {/* Police Only: Create Quiz (ใช้ QuizEditorPage ที่ไม่มี ID) */}
      <Route
        path="/my-quizzes/create"
        element={
          <ProtectedRoute allowedRoles={["police"]}>
            <QuizEditorPage /> {/* [FIXED] ใช้ QuizEditorPage แทน QuizCreator */}
          </ProtectedRoute>
        }
      />

      {/* Quiz Detail / Answering Page (Public) */}
      <Route
        path="/quiz/:id"
        element={
          <ProtectedRoute>
            <QuizDetailPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/edit-quiz/:id"
        element={
          <ProtectedRoute allowedRoles={["police"]}>
            <QuizEditorPage /> 
          </ProtectedRoute>
        }
      />

      <Route
        path="/answers"
        element={
          <ProtectedRoute allowedRoles={["police"]}>
            <AnswersPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App;