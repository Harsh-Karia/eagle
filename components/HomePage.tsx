import { AlertCircle, Zap, CheckCircle, TrendingUp, ArrowRight, FileText, Users, Clock } from 'lucide-react';

interface HomePageProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onDemoLogin: (email: string) => void;
}

export function HomePage({ onGetStarted, onLogin, onDemoLogin }: HomePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-y-auto">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 rounded-lg p-2">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-xl">DrawingReview AI</span>
          </div>
          <button
            onClick={onLogin}
            className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors border border-white/20"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300 text-sm mb-8">
            <Zap className="w-4 h-4" />
            <span>AI-Powered Drawing Review Platform</span>
          </div>
          
          <h1 className="text-6xl text-white mb-6 leading-tight">
            Transform Your Civil Engineering
            <span className="block bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Drawing Review Workflow
            </span>
          </h1>
          
          <p className="text-xl text-slate-300 mb-10 leading-relaxed">
            Cut review time by 60% with AI-powered analysis. Catch issues before they become problems.
            Purpose-built for civil engineering teams who demand precision.
          </p>

          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-4 justify-center">
              <button
                onClick={onGetStarted}
                className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all hover:scale-105 shadow-xl shadow-blue-500/30 flex items-center gap-2 text-lg"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </button>
              <button 
                onClick={onLogin}
                className="px-8 py-4 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors border border-white/20 text-lg"
              >
                Sign In
              </button>
            </div>
            
            {/* Demo Accounts */}
            <div className="mt-6 pt-6 border-t border-white/10 w-full max-w-md">
              <p className="text-sm text-slate-400 mb-3 text-center">Try Demo Accounts:</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => onDemoLogin('demo-junior@engineering.com')}
                  className="px-4 py-2.5 bg-green-500/20 border border-green-500/30 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Junior Engineer
                </button>
                <button
                  onClick={() => onDemoLogin('demo-senior@engineering.com')}
                  className="px-4 py-2.5 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Senior Engineer
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2 text-center">
                No signup required - instant access to demo projects
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mt-20">
          <div className="text-center">
            <div className="text-4xl text-white mb-2">60%</div>
            <div className="text-slate-400">Faster Reviews</div>
          </div>
          <div className="text-center">
            <div className="text-4xl text-white mb-2">95%</div>
            <div className="text-slate-400">Issue Detection</div>
          </div>
          <div className="text-center">
            <div className="text-4xl text-white mb-2">100+</div>
            <div className="text-slate-400">Projects Completed</div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-slate-900/50 backdrop-blur-sm border-y border-white/10 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl text-white mb-4">
              Everything You Need for Professional Drawing Review
            </h2>
            <p className="text-xl text-slate-400">
              Built specifically for civil engineering workflows
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl text-white mb-3">AI-Powered Analysis</h3>
              <p className="text-slate-400 leading-relaxed">
                Automatically detect missing dimensions, specification inconsistencies, code compliance issues, and grading errors the moment you upload.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl text-white mb-3">Visual Markups</h3>
              <p className="text-slate-400 leading-relaxed">
                Pin issues directly on drawings with severity indicators. Comments stay attached to the exact location, even when zooming and panning.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl text-white mb-3">Team Collaboration</h3>
              <p className="text-slate-400 leading-relaxed">
                Senior engineers review AI findings, add their expertise, and hand off consolidated feedback to junior engineers in one clean package.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-xl text-white mb-3">Issue Tracking</h3>
              <p className="text-slate-400 leading-relaxed">
                Track every issue from detection to resolution. Filter by type, severity, status, and source. Never lose track of what needs attention.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl text-white mb-3">Faster Turnaround</h3>
              <p className="text-slate-400 leading-relaxed">
                What used to take days now takes hours. AI handles the tedious first pass, letting your senior engineers focus on judgment calls.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-xl text-white mb-3">Quality Assurance</h3>
              <p className="text-slate-400 leading-relaxed">
                Reduce errors, improve consistency, and build a knowledge base of common issues specific to your firm's standards.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl text-white mb-6">
          Ready to Transform Your Review Process?
        </h2>
        <p className="text-xl text-slate-300 mb-10">
          Join engineering firms already saving 20+ hours per week on drawing reviews
        </p>
        <button
          onClick={onGetStarted}
          className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all hover:scale-105 shadow-xl shadow-blue-500/30 flex items-center gap-2 text-lg mx-auto"
        >
          Start Your Free Trial
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 bg-black/20 backdrop-blur-sm py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-400 text-sm">
          © 2024 DrawingReview AI. Built for civil engineers, by engineers.
        </div>
      </div>
    </div>
  );
}
