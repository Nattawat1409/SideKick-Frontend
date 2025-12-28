import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LoginLayout from '../components/layouts/LoginLayout'
import { primaryDefaultButton } from '../styles/loginStyles'


const generateMongoId = () => {
    
    const timestamp = (new Date().getTime() / 1000 | 0).toString(16);
   
    let hexId = timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function() {
        return (Math.random() * 16 | 0).toString(16);
    }).toLowerCase();
    while (hexId.length < 24) {
        hexId += '0';
    }
    return hexId.slice(0, 24);
};


function LoginPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.username.trim()) {
      newErrors.username = 'กรุณากรอกชื่อผู้ใช้'
    } else if (formData.username.length < 3) {
      newErrors.username = 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร'
    }
    
    if (!formData.password) {
      newErrors.password = 'กรุณากรอกรหัสผ่าน'
    } else if (formData.password.length < 6) {
      newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    try {
      const newMongoSuspectId = generateMongoId();
      
      
      const existing = JSON.parse(localStorage.getItem('suspects') || '[]')
      const newSuspect = { 
        
        id: newMongoSuspectId, 
        name: formData.username, 
        createdAt: new Date().toISOString() 
      }
      localStorage.setItem('suspects', JSON.stringify([...existing, newSuspect]))

      
      sessionStorage.setItem('isAuthenticated', 'true')
      sessionStorage.setItem('role', 'suspect')
      sessionStorage.setItem('suspectName', formData.username)
      sessionStorage.setItem('suspectId', newMongoSuspectId) 
      
      
      navigate('/questionnaire')
    } catch (error) {
      
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    } finally {
      setIsLoading(false)
    }
  }

  const handleThaiPoliceLogin = () => {
    navigate('/police-register')
  }

  return (
    <LoginLayout>
      <div className="fixed inset-0 w-screen h-screen">
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: 'url(/background_sidekick.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        
        <div className="relative w-full h-full flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-100">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                  ลงทะเบียน
                </h1>
                <p className="text-gray-600 text-sm">
                  สร้างบัญชีใหม่เพื่อเริ่มต้นใช้งาน
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ชื่อผู้ใช้
                  </label>
                  <input
                    type="text"
                    placeholder="กรอกชื่อผู้ใช้ของคุณ"
                    value={formData.username}
                    onChange={(e) => {
                      setFormData({...formData, username: e.target.value})
                      if (errors.username) setErrors({...errors, username: ''})
                    }}
                    className={`w-full px-4 py-3.5 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 transition-all placeholder-gray-400 text-gray-700 ${
                      errors.username 
                        ? 'border-red-300 focus:ring-red-400' 
                        : 'border-gray-200 focus:ring-gray-400 focus:border-transparent'
                    }`}
                    disabled={isLoading}
                  />
                  {errors.username && (
                    <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
                      <span>⚠</span> {errors.username}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    รหัสผ่าน
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="กรอกรหัสผ่านของคุณ"
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({...formData, password: e.target.value})
                        if (errors.password) setErrors({...errors, password: ''})
                      }}
                      className={`w-full px-4 py-3.5 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 transition-all placeholder-gray-400 text-gray-700 pr-12 ${
                        errors.password 
                          ? 'border-red-300 focus:ring-red-400' 
                          : 'border-gray-200 focus:ring-gray-400 focus:border-transparent'
                      }`}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
                      <span>⚠</span> {errors.password}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  style={primaryDefaultButton}
                  disabled={isLoading}
                  className="w-full disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>กำลังสมัครสมาชิก...</span>
                    </>
                  ) : (
                    'ลงทะเบียน'
                  )}
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">หรือ</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleThaiPoliceLogin}
                  disabled={isLoading}
                  className="w-full bg-white border-2 border-blue-500 text-blue-600 py-3.5 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  ลงทะเบียนด้วยบัญชีตำรวจไทย
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                มีปัญหาในการลงทะเบียน?{' '}
                <button className="text-blue-600 hover:text-blue-700 font-medium underline">
                  ติดต่อเรา
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </LoginLayout>
  )
}

export default LoginPage