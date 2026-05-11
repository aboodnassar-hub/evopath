import React, { useState } from 'react';
import { Briefcase, Heart, Users, Sparkles, Key } from 'lucide-react';
import { EvoPathLogo, AnimatedBrandText } from '../components/shared';
import { LanguageToggle } from '../utils/i18n';

function LandingPage({ onAuth }) {
  const [loginTab, setLoginTab] = useState('admin'); // 'admin', 'hr', 'vendor', 'employee'
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleTabSwitch = (tab) => {
    setLoginTab(tab);
    if (tab === 'admin' || tab === 'hr') setIsRegistering(false); // Admin and HR cannot self-register
    setErrorMsg("");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans overflow-hidden relative">
      <style>{`
        @keyframes float3d {
          0%, 100% { transform: translateY(0px) rotateX(15deg) rotateY(-15deg); }
          50% { transform: translateY(-20px) rotateX(-5deg) rotateY(10deg); }
        }
        .animate-float3d {
          animation: float3d 6s ease-in-out infinite;
          transform-style: preserve-3d;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 10s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .bg-grid-pattern {
          background-image: radial-gradient(#cbd5e1 1px, transparent 1px);
          background-size: 32px 32px;
        }
      `}</style>

      {/* Animated Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
        <div className="absolute top-[-10%] -left-10 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob"></div>
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-sky-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-[20%] w-96 h-96 bg-teal-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-4000"></div>
      </div>

      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full z-10 relative">
        <div data-no-translate dir="ltr" className="flex items-center gap-2 text-slate-800 font-bold text-2xl tracking-tight">
          <EvoPathLogo className="w-10 h-10" /> <AnimatedBrandText />
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex gap-6 text-slate-600 font-medium">
            <button onClick={() => handleTabSwitch('admin')} className={`hover:text-indigo-600 ${loginTab === 'admin' ? 'text-indigo-600 font-bold' : ''}`}>System Admin</button>
            <button onClick={() => handleTabSwitch('hr')} className={`hover:text-sky-600 ${loginTab === 'hr' ? 'text-sky-600 font-bold' : ''}`}>For Companies</button>
            <button onClick={() => handleTabSwitch('vendor')} className={`hover:text-emerald-600 ${loginTab === 'vendor' ? 'text-emerald-600 font-bold' : ''}`}>For Vendors</button>
            <button onClick={() => handleTabSwitch('employee')} className={`hover:text-purple-600 ${loginTab === 'employee' ? 'text-purple-600 font-bold' : ''}`}>For Employees</button>
          </div>
          <LanguageToggle />
        </div>
      </nav>

      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center p-6 max-w-7xl mx-auto w-full gap-12 lg:gap-24 relative z-10">
        <div className="flex-1 space-y-6 text-center lg:text-left">
          
          {/* Creative 3D Hero Logo */}
          <div className="perspective-1000 mx-auto lg:mx-0 w-48 h-48 md:w-56 md:h-56 mb-8 mt-4">
            <div className="relative w-full h-full animate-float3d group">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-sky-500 rounded-3xl blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-700" style={{ transform: 'translateZ(-30px)' }}></div>
              <div className="absolute inset-0 bg-white rounded-3xl shadow-2xl border-4 border-white overflow-hidden transition-all duration-500">
                <img 
                  src="/evoPic1.jpeg" 
                  alt="EvoPath 3D Logo" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80";
                  }}
                />
              </div>
              {/* 3D Floating Badges */}
              <div className="absolute -right-8 -top-8 bg-white/90 backdrop-blur-sm p-3 rounded-2xl shadow-xl border border-sky-100 transform translate-z-12 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-500" style={{ transform: 'translateZ(40px)' }}>
                 <Sparkles className="w-6 h-6 text-sky-500" />
              </div>
              <div className="absolute -left-6 -bottom-6 bg-white/90 backdrop-blur-sm p-3 rounded-2xl shadow-xl border border-emerald-100 transform translate-z-12 group-hover:-translate-x-2 group-hover:translate-y-2 transition-transform duration-500" style={{ transform: 'translateZ(60px)' }}>
                 <Heart className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-50 text-sky-700 font-medium text-sm border border-sky-100">
            <Sparkles className="w-4 h-4" /> The New Standard in Corporate Culture
          </div>
          <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight">
            Curate Unforgettable <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-sky-600">Team Experiences</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            The ultimate ecosystem connecting HR teams with top-rated coordination vendors, while giving employees a voice in their company culture.
          </p>
        </div>

        <div className="w-full max-w-md">
          <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 relative overflow-hidden">
            {/* Dynamic Header Line */}
            <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${
              loginTab === 'admin' ? 'from-indigo-500 to-blue-600' :
              loginTab === 'hr' ? 'from-sky-500 to-indigo-600' : 
              loginTab === 'vendor' ? 'from-emerald-500 to-teal-600' : 
              'from-purple-500 to-pink-600'
            }`}></div>
            
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">{isRegistering ? 'Self-Registration' : 'Sign In'}</h2>
              <p className="text-slate-500 text-sm mt-1">{isRegistering ? (loginTab === 'employee' ? 'Enter your details and provided company code.' : 'Enter your business details to partner with us.') : 'Select your portal to continue.'}</p>
            </div>

            {/* Login Tabs (Mobile/Fallback) */}
            <div className="flex md:hidden p-1 bg-slate-100 rounded-xl mb-6 flex-wrap gap-1">
              <button onClick={() => handleTabSwitch('admin')} className={`flex-1 min-w-[45%] py-2 text-xs font-bold rounded-lg transition-all ${loginTab === 'admin' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>Admin</button>
              <button onClick={() => handleTabSwitch('hr')} className={`flex-1 min-w-[45%] py-2 text-xs font-bold rounded-lg transition-all ${loginTab === 'hr' ? 'bg-white shadow-sm text-sky-600' : 'text-slate-500 hover:text-slate-700'}`}>HR Admin</button>
              <button onClick={() => handleTabSwitch('vendor')} className={`flex-1 min-w-[45%] py-2 text-xs font-bold rounded-lg transition-all ${loginTab === 'vendor' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}>Vendor</button>
              <button onClick={() => handleTabSwitch('employee')} className={`flex-1 min-w-[45%] py-2 text-xs font-bold rounded-lg transition-all ${loginTab === 'employee' ? 'bg-white shadow-sm text-purple-600' : 'text-slate-500 hover:text-slate-700'}`}>Employee</button>
            </div>
            
            {errorMsg && (
              <div className="mb-5 p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={async (e) => { 
              e.preventDefault(); 
              setErrorMsg("");
              const username = e.target.username.value;
              const pin = e.target.pin.value;
              const companyCode = e.target.companyCode?.value;
              const businessName = e.target.businessName?.value;
              const email = e.target.email?.value;
              const phone = e.target.phone?.value;
              
              const err = !isRegistering
                ? await onAuth('login', { username, pin })
                : await onAuth('register', { role: loginTab, username, pin, companyCode, businessName, email, phone });

              if (err) setErrorMsg(err);
            }} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Username
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    name="username"
                    type="text" 
                    required 
                    placeholder="Enter username"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none transition-all focus:ring-2 ${loginTab === 'admin' ? 'focus:border-indigo-500 focus:ring-indigo-200' : loginTab === 'vendor' ? 'focus:border-emerald-500 focus:ring-emerald-200' : loginTab === 'employee' ? 'focus:border-purple-500 focus:ring-purple-200' : 'focus:border-sky-500 focus:ring-sky-200'}`} 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Secure PIN</label>
                <input 
                  name="pin"
                  type="password" 
                  pattern="[0-9]*"
                  inputMode="numeric"
                  maxLength="6"
                  placeholder="4-6 digit PIN"
                  required 
                  className={`w-full px-4 py-3 rounded-xl border border-slate-200 outline-none transition-all focus:ring-2 ${loginTab === 'admin' ? 'focus:border-indigo-500 focus:ring-indigo-200' : loginTab === 'vendor' ? 'focus:border-emerald-500 focus:ring-emerald-200' : loginTab === 'employee' ? 'focus:border-purple-500 focus:ring-purple-200' : 'focus:border-sky-500 focus:ring-sky-200'}`} 
                />
              </div>

              {isRegistering && loginTab === 'vendor' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Business Name</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        name="businessName"
                        type="text" 
                        required 
                        placeholder="e.g., Desert Horizons Coordination"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none transition-all focus:ring-2 focus:border-emerald-500 focus:ring-emerald-200`} 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Business Email</label>
                    <input 
                      name="email"
                      type="email" 
                      required 
                      placeholder="e.g., contact@vendor.com"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none transition-all focus:ring-2 focus:border-emerald-500 focus:ring-emerald-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Business Phone</label>
                    <input 
                      name="phone"
                      type="tel" 
                      required 
                      placeholder="e.g., +962790000000"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none transition-all focus:ring-2 focus:border-emerald-500 focus:ring-emerald-200"
                    />
                  </div>
                </div>
              )}

              {isRegistering && loginTab === 'employee' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Company Code</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      name="companyCode"
                      type="text" 
                      required 
                      placeholder="e.g., TECH-2026"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none transition-all focus:ring-2 focus:border-purple-500 focus:ring-purple-200`} 
                    />
                  </div>
                </div>
              )}

              <button type="submit" className={`w-full text-white font-bold py-3.5 rounded-xl transition-colors shadow-md mt-2 ${
                loginTab === 'admin' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' :
                loginTab === 'hr' ? 'bg-sky-600 hover:bg-sky-700 shadow-sky-200' : 
                loginTab === 'vendor' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' : 
                'bg-purple-600 hover:bg-purple-700 shadow-purple-200'
              }`}>
                {isRegistering ? 'Register Account' : `Access Portal`}
              </button>
            </form>

            {(loginTab === 'vendor' || loginTab === 'employee') && (
              <div className="mt-6 text-center text-sm text-slate-500">
                {isRegistering ? (
                  <>Already have an account? <button onClick={() => { setIsRegistering(false); setErrorMsg(""); }} className={`font-bold hover:underline ${loginTab === 'vendor' ? 'text-emerald-600' : 'text-purple-600'}`}>Sign In</button></>
                ) : (
                  <>Don't have an account? <button onClick={() => { setIsRegistering(true); setErrorMsg(""); }} className={`font-bold hover:underline ${loginTab === 'vendor' ? 'text-emerald-600' : 'text-purple-600'}`}>Self-Register</button></>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default LandingPage;
