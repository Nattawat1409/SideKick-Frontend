import { useNavigate } from 'react-router-dom'
import NavBar_Officer from '../NavBar_Officer'
import Navbar_User from '../Navbar_User'

function QuestionnaireLayout({ children }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    sessionStorage.removeItem('isAuthenticated')
    sessionStorage.removeItem('role')
    navigate('/')
  }

  const role = sessionStorage.getItem('role')

  return (
    <div className="min-h-screen flex flex-col">

      {role === 'police' ? (
        <NavBar_Officer showLogout={true} onLogout={handleLogout} />
      ) : (
        <Navbar_User showLogout={true} onLogout={handleLogout} />
      )}

      <div className="flex-1 container mx-auto px-4">
        {children}
      </div>
      
    </div>
  )
}

export default QuestionnaireLayout