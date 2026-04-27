import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap, Shield, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';

export default function Login() {
  const [loginRole, setLoginRole] = useState(null);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && role) navigate(role === 'student' ? '/student' : '/admin', { replace: true });
  }, [isAuthenticated, role, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const result = await login(identifier, password, loginRole);
    if (result.success) navigate(loginRole === 'student' ? '/student' : '/admin');
    else setError(result.error);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-white via-red-50/30 to-white">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-red-100/40 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-red-200/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="relative z-10 w-full max-w-lg px-6">
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 mb-6 shadow-lg shadow-red-200">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black text-gray-900">Smart<span className="text-red-500">Campus</span></h1>
          <p className="text-gray-400 text-base mt-2">Techno Main Saltlake</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl shadow-red-100/30 border border-gray-100 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {!loginRole ? (
            <div className="p-10">
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Welcome Back!</h2>
              <p className="text-gray-400 text-base text-center mb-8">Choose your role to continue</p>
              <div className="grid grid-cols-2 gap-5">
                <button onClick={() => setLoginRole('student')}
                  className="group p-8 rounded-2xl border-2 border-gray-100 hover:border-red-200 hover:bg-red-50/50 transition-all text-center active:scale-95">
                  <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-8 h-8 text-red-500" />
                  </div>
                  <p className="font-bold text-lg text-gray-800">Student</p>
                  <p className="text-sm text-gray-400 mt-1">Access your portal</p>
                </button>
                <button onClick={() => setLoginRole('admin')}
                  className="group p-8 rounded-2xl border-2 border-gray-100 hover:border-red-200 hover:bg-red-50/50 transition-all text-center active:scale-95">
                  <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Shield className="w-8 h-8 text-red-500" />
                  </div>
                  <p className="font-bold text-lg text-gray-800">Admin / Teacher</p>
                  <p className="text-sm text-gray-400 mt-1">Manage campus</p>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-10">
              <button type="button" onClick={() => { setLoginRole(null); setError(''); setIdentifier(''); setPassword(''); }}
                className="text-gray-400 text-base hover:text-gray-600 transition-colors mb-6 flex items-center gap-1 font-semibold">← Back</button>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                  {loginRole === 'student' ? <GraduationCap className="w-6 h-6 text-red-500" /> : <Shield className="w-6 h-6 text-red-500" />}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 capitalize">{loginRole} Login</h2>
                  <p className="text-gray-400 text-sm">{loginRole === 'student' ? 'Enter your roll number' : 'Enter your teacher / admin ID'}</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-sm font-semibold text-gray-600 mb-2 block">{loginRole === 'student' ? 'Roll Number' : 'Teacher / Admin ID'}</label>
                  <input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={loginRole === 'student' ? 'e.g. 13000125179' : 'e.g. T001 or ADMIN'}
                    className="form-input" required />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 mb-2 block">Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="form-input pr-14" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    {loginRole === 'student' ? 'Default: {rollNo}_St' : 'Default: teacher@123 or admin@123'}
                  </p>
                </div>
              </div>

              {error && <div className="mt-5 p-4 rounded-xl bg-red-50 border border-red-100 text-red-500 text-base font-semibold animate-fade-in">{error}</div>}

              <button type="submit" disabled={isLoading}
                className="btn-primary w-full mt-8 py-4 text-lg">
                {isLoading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Sign In</span> <ArrowRight className="w-5 h-5" /></>}
              </button>
            </form>
          )}
        </div>
        <p className="text-center text-sm text-gray-400 mt-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>© 2026 SmartCampus • Techno Main Saltlake</p>
      </div>
    </div>
  );
}
