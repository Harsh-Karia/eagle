import { useState } from 'react';
import { AlertCircle, ArrowLeft, Mail, Lock } from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string, password: string, name?: string, role?: 'junior' | 'senior') => void;
  onBack: () => void;
}

export function LoginPage({ onLogin, onBack }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'junior' | 'senior'>('junior');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isSignUp) {
        await onLogin(email, password, name, role);
      } else {
        await onLogin(email, password);
      }
    } catch (error: any) {
      alert(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = (demoRole: 'junior' | 'senior') => {
    const demoEmail = demoRole === 'senior' ? 'demo-senior@engineering.com' : 'demo-junior@engineering.com';
    setEmail(demoEmail);
    setPassword('demo');
    // Immediately login with demo account
    onLogin(demoEmail, 'demo');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6 overflow-y-auto">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        {/* Login Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="bg-blue-500 rounded-lg p-2">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              <span className="text-white text-2xl">DrawingReview AI</span>
            </div>
            <h2 className="text-2xl text-white mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-slate-400">
              {isSignUp ? 'Sign up to get started' : 'Sign in to continue to your workspace'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John Doe"
                    required={isSignUp}
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'junior' | 'senior')}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required={isSignUp}
                  >
                    <option value="junior">Junior Engineer</option>
                    <option value="senior">Senior Engineer</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="you@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading 
                ? (isSignUp ? 'Creating account...' : 'Signing in...') 
                : (isSignUp ? 'Sign Up' : 'Sign In')
              }
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"
              }
            </button>
          </div>

          {/* Demo Accounts */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-sm text-slate-400 mb-3 text-center">Quick Demo Access:</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => quickLogin('junior')}
                className="px-4 py-2.5 bg-green-500/20 border border-green-500/30 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors text-sm"
              >
                Junior Engineer
              </button>
              <button
                onClick={() => quickLogin('senior')}
                className="px-4 py-2.5 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors text-sm"
              >
                Senior Engineer
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-3 text-center">
              Click either button to instantly access the demo
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-400 text-sm mt-6">
          Don't have an account? <button className="text-blue-400 hover:text-blue-300">Contact Sales</button>
        </p>
      </div>
    </div>
  );
}
