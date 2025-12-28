import { useNavigate } from 'react-router-dom'
import NavBar_User from '../NavBar_User'

function LoginLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar_User showLogout={false} /> 
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}

export default LoginLayout