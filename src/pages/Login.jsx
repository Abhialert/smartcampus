import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap, Shield, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';

export default function Login() {
  const [loginRole, setLoginRole] = useState(null); // null, 'student', 'admin'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const result = login(identifier, password, loginRole);
      if (result.success) {
        navigate(loginRole === 'student' ? '/student' : '/admin');
      } else {
        setError(result.error);
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-blue-500 mb-4 glow-accent-strong">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-accent-light to-blue-300 bg-clip-text text-transparent">
            SmartCampus
          </h1>
          <p className="text-text-muted text-sm mt-1">Techno Main Saltlake</p>
        </div>

        {/* Card */}
        <div className="glass-strong rounded-2xl overflow-hidden glow-accent animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {!loginRole ? (
            /* Role Selection */
            <div className="p-8">
              <h2 className="text-xl font-semibold text-center mb-2">Welcome Back!</h2>
              <p className="text-text-muted text-sm text-center mb-8">Choose your role to continue</p>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setLoginRole('student')}
                  className="group p-6 rounded-xl border border-glass-border hover:border-accent/40 hover:bg-accent/5 transition-all duration-300 text-center"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent/20 to-blue-500/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-7 h-7 text-accent-light" />
                  </div>
                  <p className="font-medium text-sm">Student</p>
                  <p className="text-[11px] text-text-muted mt-1">Access your portal</p>
                </button>

                <button
                  onClick={() => setLoginRole('admin')}
                  className="group p-6 rounded-xl border border-glass-border hover:border-blue-400/40 hover:bg-blue-500/5 transition-all duration-300 text-center"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Shield className="w-7 h-7 text-blue-400" />
                  </div>
                  <p className="font-medium text-sm">Admin</p>
                  <p className="text-[11px] text-text-muted mt-1">Manage campus</p>
                </button>
              </div>
            </div>
          ) : (
            /* Login Form */
            <form onSubmit={handleSubmit} className="p-8">
              <button
                type="button"
                onClick={() => { setLoginRole(null); setError(''); setIdentifier(''); setPassword(''); }}
                className="text-text-muted text-sm hover:text-text-primary transition-colors mb-4 flex items-center gap-1"
              >
                ← Back to role selection
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  loginRole === 'student'
                    ? 'bg-gradient-to-br from-accent/20 to-blue-500/20'
                    : 'bg-gradient-to-br from-blue-500/20 to-purple-500/20'
                }`}>
                  {loginRole === 'student' ? (
                    <GraduationCap className="w-5 h-5 text-accent-light" />
                  ) : (
                    <Shield className="w-5 h-5 text-blue-400" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-semibold capitalize">{loginRole} Login</h2>
                  <p className="text-text-muted text-xs">
                    {loginRole === 'student'
                      ? 'Enter your roll number'
                      : 'Enter your teacher ID'
                    }
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-text-secondary mb-1.5 block">
                    {loginRole === 'student' ? 'Roll Number' : 'Teacher ID'}
                  </label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={loginRole === 'student' ? 'Enter roll number' : 'Enter teacher ID (e.g., T001)'}
                    className="w-full bg-surface/50 text-sm text-text-primary px-4 py-3 rounded-xl border border-glass-border focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all placeholder:text-text-muted"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-text-secondary mb-1.5 block">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full bg-surface/50 text-sm text-text-primary px-4 py-3 rounded-xl border border-glass-border focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all placeholder:text-text-muted pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-text-muted mt-1.5">
                    Default: {loginRole === 'student' ? 'student@123' : 'teacher@123'}
                  </p>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm animate-fade-in">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-accent to-blue-500 hover:from-accent-glow hover:to-blue-600 text-white font-medium text-sm flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-[11px] text-text-muted mt-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          © 2026 SmartCampus • Techno Main Saltlake
        </p>
      </div>
    </div>
  );
}
