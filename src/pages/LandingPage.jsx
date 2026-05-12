import React, { useState } from 'react';
import { Briefcase, CheckCircle, Heart, Users, Sparkles, Key } from 'lucide-react';
import { EvoPathLogo, AnimatedBrandText } from '../components/shared';
import { LanguageToggle, translateText, useLanguage } from '../utils/i18n';

const ADMIN_PORTAL_PIN = "147862";
const digitsOnly = (value) => String(value || "").replace(/\D/g, "");
const usernamePattern = /^[A-Za-z0-9._-]+$/;
const usernameStartsValid = /^[A-Za-z0-9]/;
const usernameHasLetter = /[A-Za-z]/;

function LandingNotice({ message }) {
  const { language } = useLanguage();

  if (!message) return null;

  const isSuccess = message.startsWith("Success:");
  const cleanMessage = translateText(message.replace(/^(Success|Error):\s*/, ""), language);

  if (!isSuccess) {
    return <p data-no-translate className="mb-4 text-sm font-bold text-red-600">{cleanMessage}</p>;
  }

  return (
    <div data-no-translate className="mb-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-emerald-800 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0 rounded-xl bg-white/70 p-2">
          <CheckCircle className="h-5 w-5 text-emerald-600" />
        </div>
        <p className="text-sm font-semibold leading-relaxed">{cleanMessage}</p>
      </div>
    </div>
  );
}

function FieldError({ message }) {
  const { language } = useLanguage();

  if (!message) return null;

  return (
    <div data-no-translate className="mt-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 shadow-sm">
      {translateText(message, language)}
    </div>
  );
}

function LandingPage({ onAuth }) {
  const [loginTab, setLoginTab] = useState('hr'); // 'admin', 'hr', 'vendor', 'employee'
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const resetLandingState = () => {
    setErrorMsg("");
    setFieldErrors({});
  };

  const handleTabSwitch = (tab) => {
    setLoginTab(tab);
    setIsRegistering(false);
    setIsAdminUnlocked(false);
    resetLandingState();
  };

  const isAdminLogin = loginTab === 'admin' && !isRegistering;
  const showAdminGate = isAdminLogin && !isAdminUnlocked;
  const formModeKey = `${loginTab}-${isRegistering ? "register" : "login"}-${isAdminUnlocked ? "unlocked" : "gate"}`;
  const fieldClass = (name, focusClass) =>
    `w-full rounded-xl border outline-none transition-all focus:ring-2 ${
      fieldErrors[name] ? "border-red-300 ring-2 ring-red-100" : `border-slate-200 ${focusClass}`
    }`;
  const clearFieldError = (name) => {
    if (!fieldErrors[name]) return;
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };
  const getFormValue = (form, name) => (form.elements[name]?.value || "").trim();
  const handlePinInput = (event, fieldName) => {
    event.target.value = digitsOnly(event.target.value);
    clearFieldError(fieldName);
  };
  const validateUsername = (value) => {
    if (!value) return "";
    if (!usernamePattern.test(value)) return "Username must use English letters, numbers, dots, underscores, or hyphens only.";
    if (!usernameStartsValid.test(value)) return "Username cannot start with a special character.";
    if (!usernameHasLetter.test(value)) return "Username cannot be only digits.";
    return "";
  };
  const validateLandingForm = (form) => {
    const nextErrors = {};
    const requiredFields = showAdminGate
      ? ["adminGatePin"]
      : [
          "username",
          isAdminLogin ? "password" : "pin",
          ...(isRegistering && loginTab === "vendor" ? ["businessName", "email", "phone"] : []),
          ...(isRegistering && loginTab === "employee" ? ["companyCode"] : []),
        ];

    requiredFields.forEach((name) => {
      if (!getFormValue(form, name)) {
        nextErrors[name] = "Please fill this field.";
      }
    });

    const usernameValue = getFormValue(form, "username");
    const usernameError = validateUsername(usernameValue);
    if (usernameError && !nextErrors.username) {
      nextErrors.username = usernameError;
    }

    ["adminGatePin", "pin"].forEach((name) => {
      const pinValue = getFormValue(form, name);
      if (pinValue && pinValue.length < 4 && !nextErrors[name]) {
        nextErrors[name] = "PIN must be at least 4 digits.";
      }
    });

    const emailInput = form.elements.email;
    if (emailInput && getFormValue(form, "email") && !emailInput.validity.valid) {
      nextErrors.email = "Please enter a valid email address.";
    }

    setFieldErrors(nextErrors);

    const firstInvalidField = requiredFields.find((name) => nextErrors[name]) || (nextErrors.email ? "email" : "");
    if (firstInvalidField) {
      form.elements[firstInvalidField]?.focus();
      return false;
    }

    return true;
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
            Create Unforgettable <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-sky-600">Team Experiences</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            The ultimate ecosystem connecting companies with top-rated coordination vendors, while giving employees a voice in their company culture.
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
            
            <LandingNotice message={errorMsg} />

            <form key={formModeKey} noValidate data-custom-validation="landing" onSubmit={async (e) => {
              e.preventDefault(); 
              resetLandingState();

              if (!validateLandingForm(e.currentTarget)) return;

              if (showAdminGate) {
                const enteredPin = e.target.adminGatePin.value.trim();

                if (enteredPin !== ADMIN_PORTAL_PIN) {
                  setFieldErrors({ adminGatePin: "Invalid admin portal PIN" });
                  e.target.adminGatePin.focus();
                  return;
                }

                setIsAdminUnlocked(true);
                return;
              }

              const username = e.target.username.value;
              const pin = e.target.pin?.value;
              const password = e.target.password?.value;
              const adminPin = isAdminLogin ? ADMIN_PORTAL_PIN : e.target.adminPin?.value;
              const companyCode = e.target.companyCode?.value;
              const businessName = e.target.businessName?.value;
              const email = e.target.email?.value;
              const phone = e.target.phone?.value;
              
              const err = !isRegistering
                ? await onAuth('login', { role: loginTab, portalRole: loginTab, username, pin, password, adminPin })
                : await onAuth('register', { role: loginTab, username, pin, companyCode, businessName, email, phone });

              if (err) {
                setErrorMsg(err);
                if (err.startsWith("Success:")) setIsRegistering(false);
              }
            }} className="space-y-5">
              {showAdminGate ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Admin Portal PIN</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      key="admin-gate-pin"
                      name="adminGatePin"
                      type="password"
                      pattern="[0-9]*"
                      inputMode="numeric"
                      minLength="4"
                      maxLength="6"
                      placeholder="Enter admin portal PIN"
                      required
                      onInput={(event) => handlePinInput(event, "adminGatePin")}
                      className={`${fieldClass("adminGatePin", "focus:border-indigo-500 focus:ring-indigo-200")} pl-10 pr-4 py-3`}
                    />
                  </div>
                  <FieldError message={fieldErrors.adminGatePin} />
                  <p className="mt-2 text-xs font-bold text-indigo-600">Enter admin PIN to continue.</p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      key={isAdminLogin ? "admin-username" : "portal-username"}
                      name="username"
                      type="text"
                      required
                      placeholder="Enter username"
                      onChange={() => clearFieldError("username")}
                      className={`${fieldClass("username", loginTab === 'admin' ? 'focus:border-indigo-500 focus:ring-indigo-200' : loginTab === 'vendor' ? 'focus:border-emerald-500 focus:ring-emerald-200' : loginTab === 'employee' ? 'focus:border-purple-500 focus:ring-purple-200' : 'focus:border-sky-500 focus:ring-sky-200')} pl-10 pr-4 py-3`}
                    />
                  </div>
                  <FieldError message={fieldErrors.username} />
                </div>
              )}

              {isAdminLogin && isAdminUnlocked ? (
                <div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <input
                      key="admin-password"
                      name="password"
                      type="password"
                      placeholder="Enter admin password"
                      required
                      onChange={() => clearFieldError("password")}
                      className={`${fieldClass("password", "focus:border-indigo-500 focus:ring-indigo-200")} px-4 py-3`}
                    />
                    <FieldError message={fieldErrors.password} />
                  </div>
                </div>
              ) : !showAdminGate ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Secure PIN</label>
                  <input
                    key="portal-pin"
                    name="pin"
                    type="password"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    minLength="4"
                    maxLength="6"
                    placeholder="4-6 digit PIN"
                    required
                    onInput={(event) => handlePinInput(event, "pin")}
                    className={`${fieldClass("pin", loginTab === 'admin' ? 'focus:border-indigo-500 focus:ring-indigo-200' : loginTab === 'vendor' ? 'focus:border-emerald-500 focus:ring-emerald-200' : loginTab === 'employee' ? 'focus:border-purple-500 focus:ring-purple-200' : 'focus:border-sky-500 focus:ring-sky-200')} px-4 py-3`}
                  />
                  <FieldError message={fieldErrors.pin} />
                </div>
              ) : null}

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
                        onChange={() => clearFieldError("businessName")}
                        className={`${fieldClass("businessName", "focus:border-emerald-500 focus:ring-emerald-200")} pl-10 pr-4 py-3`}
                      />
                    </div>
                    <FieldError message={fieldErrors.businessName} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Business Email</label>
                    <input 
                      name="email"
                      type="email" 
                      required 
                      placeholder="e.g., contact@vendor.com"
                      onChange={() => clearFieldError("email")}
                      className={`${fieldClass("email", "focus:border-emerald-500 focus:ring-emerald-200")} px-4 py-3`}
                    />
                    <FieldError message={fieldErrors.email} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Business Phone</label>
                    <input 
                      name="phone"
                      type="tel" 
                      required 
                      placeholder="e.g., +962790000000"
                      onChange={() => clearFieldError("phone")}
                      className={`${fieldClass("phone", "focus:border-emerald-500 focus:ring-emerald-200")} px-4 py-3`}
                    />
                    <FieldError message={fieldErrors.phone} />
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
                      onChange={() => clearFieldError("companyCode")}
                      className={`${fieldClass("companyCode", "focus:border-purple-500 focus:ring-purple-200")} pl-10 pr-4 py-3`}
                    />
                  </div>
                  <FieldError message={fieldErrors.companyCode} />
                </div>
              )}

              <button type="submit" className={`w-full text-white font-bold py-3.5 rounded-xl transition-colors shadow-md mt-2 ${
                loginTab === 'admin' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' :
                loginTab === 'hr' ? 'bg-sky-600 hover:bg-sky-700 shadow-sky-200' : 
                loginTab === 'vendor' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' : 
                'bg-purple-600 hover:bg-purple-700 shadow-purple-200'
              }`}>
                {showAdminGate ? "Unlock Admin Portal" : isRegistering ? 'Register Account' : `Access Portal`}
              </button>
            </form>

            {(loginTab === 'vendor' || loginTab === 'employee') && (
              <div className="mt-6 text-center text-sm text-slate-500">
                {isRegistering ? (
                  <>Already have an account? <button onClick={() => { setIsRegistering(false); resetLandingState(); }} className={`font-bold hover:underline ${loginTab === 'vendor' ? 'text-emerald-600' : 'text-purple-600'}`}>Sign In</button></>
                ) : (
                  <>Don't have an account? <button onClick={() => { setIsRegistering(true); resetLandingState(); }} className={`font-bold hover:underline ${loginTab === 'vendor' ? 'text-emerald-600' : 'text-purple-600'}`}>Self-Register</button></>
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
