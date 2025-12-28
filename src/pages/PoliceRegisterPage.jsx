import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LoginLayout from '../components/layouts/LoginLayout'
import { inputDefault, primaryDefaultButton, secondaryButtonDefault } from '../styles/loginStyles'

function PoliceRegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ policeId: '', password: '' })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const validatePoliceId = (id) => /^[0-9]{14}$/.test(id)

  const validateForm = () => {
    const newErrors = {}
    
    if (!form.policeId.trim()) {
      newErrors.policeId = 'กรุณากรอกหมายเลขประจำตัวตำรวจ'
    } else if (!validatePoliceId(form.policeId)) {
      newErrors.policeId = 'หมายเลขประจำตัวตำรวจต้องเป็นตัวเลข 14 หลักเท่านั้น'
    }
    
    if (!form.password) {
      newErrors.password = 'กรุณากรอกรหัสผ่าน'
    } else if (form.password.length < 6) {
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
      const { policeId, password } = form
      
      const existing = JSON.parse(localStorage.getItem('police') || '[]')
      
      if (existing.find((p) => p.policeId === policeId)) {
        setErrors({ policeId: 'หมายเลขประจำตัวนี้ถูกใช้งานแล้ว กรุณาใช้หมายเลขอื่น' })
        setIsLoading(false)
        return
      }

      const newPolice = { 
        id: `police_${Date.now()}`, 
        policeId, 
        password, 
        createdAt: new Date().toISOString() 
      }
      localStorage.setItem('police', JSON.stringify([...existing, newPolice]))

      sessionStorage.setItem('isAuthenticated', 'true')
      sessionStorage.setItem('role', 'police')
      sessionStorage.setItem('policeId', policeId)

      await new Promise(resolve => setTimeout(resolve, 300))
      navigate('/my-quizzes')
    } catch (error) {
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePoliceIdChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 14)
    setForm({ ...form, policeId: value })
    if (errors.policeId) setErrors({ ...errors, policeId: '' })
  }

  const formatPoliceId = (id) => {
    if (id.length <= 5) return id
    if (id.length <= 10) return `${id.slice(0, 5)}-${id.slice(5)}`
    return `${id.slice(0, 5)}-${id.slice(5, 10)}-${id.slice(10)}`
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
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-3">
                  <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  ลงทะเบียนเจ้าหน้าที่
                </h1>
                <p className="text-gray-600 text-sm">
                  สำหรับเจ้าหน้าที่ตำรวจเท่านั้น
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    หมายเลขประจำตัวตำรวจ
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L11 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L5 10.274zm10 0l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L15 10.274z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="xxxxxxxxxxxxxxxx (14 หลัก)"
                      value={form.policeId}
                      onChange={handlePoliceIdChange}
                      className={`w-full pl-10 pr-4 py-3.5 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 transition-all placeholder-gray-400 text-gray-700 ${
                        errors.policeId 
                          ? 'border-red-300 focus:ring-red-400' 
                          : 'border-gray-200 focus:ring-blue-400 focus:border-transparent'
                      }`}
                      disabled={isLoading}
                      maxLength={14}
                      inputMode="numeric"
                    />
                  </div>
                  {form.policeId && (
                    <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      รูปแบบ: {formatPoliceId(form.policeId)} ({form.policeId.length}/14 หลัก)
                    </p>
                  )}
                  {errors.policeId && (
                    <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
                      <span>⚠</span> {errors.policeId}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    รหัสผ่าน
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="กรอกรหัสผ่านของคุณ (อย่างน้อย 6 ตัวอักษร)"
                      value={form.password}
                      onChange={(e) => {
                        setForm({ ...form, password: e.target.value })
                        if (errors.password) setErrors({ ...errors, password: '' })
                      }}
                      className={`w-full pl-10 pr-12 py-3.5 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 transition-all placeholder-gray-400 text-gray-700 ${
                        errors.password 
                          ? 'border-red-300 focus:ring-red-400' 
                          : 'border-gray-200 focus:ring-blue-400 focus:border-transparent'
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
                  {form.password && form.password.length > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${
                              form.password.length < 6 ? 'bg-red-400 w-1/3' :
                              form.password.length < 10 ? 'bg-yellow-400 w-2/3' :
                              'bg-green-500 w-full'
                            }`}
                          />
                        </div>
                        <span className={`text-xs font-medium ${
                          form.password.length < 6 ? 'text-red-500' :
                          form.password.length < 10 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {form.password.length < 6 ? 'อ่อนแอ' :
                           form.password.length < 10 ? 'ปานกลาง' :
                           'แข็งแรง'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex gap-2">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">ข้อมูลสำคัญ:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• หมายเลขประจำตัวตำรวจต้องเป็นตัวเลข 14 หลัก</li>
                        <li>• รหัสผ่านควรมีความปลอดภัยสูง</li>
                        <li>• ห้ามแชร์ข้อมูลบัญชีกับผู้อื่น</li>
                      </ul>
                    </div>
                  </div>
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
                      <span>กำลังลงทะเบียน...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>ลงทะเบียน</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/')}
                  style={secondaryButtonDefault}
                  disabled={isLoading}
                  className="w-full disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>กลับหน้าหลัก</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </LoginLayout>
  )
}

export default PoliceRegisterPage