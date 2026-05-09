import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Map, Heart, Calendar, Users, 
  TrendingUp, LogOut, Search, Star, Shield, 
  Award, ChevronRight, Menu, X, Sparkles,
  Vote, CheckCircle, BarChart3, MessageSquare,
  PlusCircle, Send, DollarSign, AlignLeft,
  FileText, CheckSquare, Clock, Trash2, Key, ShieldCheck
} from 'lucide-react';

const API_BASE_URL = "https://evopath-backend.onrender.com";

const EvoPathLogo = ({ className = "w-8 h-8", imgUrl }) => (
  <div className={`relative shrink-0 rounded-lg overflow-hidden shadow-sm border border-sky-100 group bg-white ${className}`}>
    <img 
      src={imgUrl || "/evoPic1.jpeg"} 
      alt="EvoPath Brand Logo" 
      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      onError={(e) => {
        e.target.src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80";
      }}
    />
  </div>
);

const AnimatedBrandText = () => (
  <div className="flex items-center cursor-pointer group" style={{ perspective: '500px' }}>
    <span>Evo</span>
    <span className="grid grid-cols-[0fr] group-hover:grid-cols-[1fr] transition-all duration-500 ease-out opacity-0 group-hover:opacity-100">
      <span className="overflow-hidden whitespace-nowrap [transform:rotateY(-90deg)] group-hover:[transform:rotateY(0deg)] transition-all duration-500 ease-out origin-left text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-sky-600">
        lution&nbsp;
      </span>
    </span>
    <span>Path</span>
  </div>
);

// --- PIN RESET SHARED UTILS ---
function usePinReset() {
  const [resetData, setResetData] = useState(null);
  const [resetError, setResetError] = useState("");
  
  const handleResetPin = async (username) => {
    const token = localStorage.getItem("token");
    setResetError("");

    if (!token) {
      setResetError("Session expired. Please login again.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/reset-pin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username: String(username || "").trim() }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setResetError(data.message || "Failed to reset PIN");
        return;
      }
      
      // IMPORTANT: show only the real PIN returned from backend.
      // Do not generate a local mock PIN because it will not work for login.
      setResetData({ username: data.username || username, pin: data.newPin });
    } catch (err) {
      console.error(err);
      setResetError("Cannot connect to backend. The PIN was not changed.");
    }
  };
  
  return { resetData, setResetData, resetError, setResetError, handleResetPin };
}

function ResetPinModal({ resetData, onClose }) {
  if (!resetData) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 mx-auto">
          <Key className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 text-center mb-2">PIN Reset Successful</h3>
        <p className="text-slate-600 text-center mb-6">A new secure PIN has been generated for <strong>{resetData.username}</strong>.</p>
        
        <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl mb-6">
          <div className="flex items-center justify-center gap-2 mb-2 text-amber-800">
            <Shield className="w-5 h-5" />
            <span className="font-bold">Important Security Notice</span>
          </div>
          <p className="text-sm text-amber-700 mb-4 text-center">Please copy this new PIN immediately. For security reasons, it will not be displayed again.</p>
          <div className="bg-white py-4 rounded-xl border border-amber-200 text-center shadow-inner">
            <span className="text-4xl font-mono font-black text-slate-800 tracking-[0.2em]">{resetData.pin}</span>
          </div>
        </div>
        
        <button onClick={onClose} className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-md">
          I have copied the PIN
        </button>
      </div>
    </div>
  );
}

// --- MOCK DATA ---
const INITIAL_ACTIVITIES = [
  {
    id: 1,
    title: "Wadi Rum Desert Retreat & Team Building",
    category: "trips",
    vendor: "Desert Horizons Coordination",
    price: "$120 / person",
    rating: 4.9,
    duration: "2 Days",
    image: "https://images.unsplash.com/photo-1544985390-e79f6e62dd1c?auto=format&fit=crop&w=800&q=80",
    description: "Disconnect to reconnect. A fully guided overnight trip focused on team trust exercises and desert survival games."
  },
  {
    id: 2,
    title: "Tech-Free Forest Hiking",
    category: "trips",
    vendor: "Nature Treks LLC",
    price: "$45 / person",
    rating: 4.7,
    duration: "1 Day",
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80",
    description: "A guided hike designed to relieve corporate burnout. Includes a mountain-top picnic."
  },
  {
    id: 3,
    title: "Local Orphanage Renovation",
    category: "volunteer",
    vendor: "Community Builders NGO",
    price: "Free (Donation Optional)",
    rating: 5.0,
    duration: "6 Hours",
    image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=800&q=80",
    description: "Your team will paint walls, build furniture, and create a better environment for local children. High impact CSR."
  },
  {
    id: 4,
    title: "Tree Planting Initiative",
    category: "volunteer",
    vendor: "Green Earth Society",
    price: "$10 / tree",
    rating: 4.8,
    duration: "4 Hours",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
    description: "Combat climate change while bonding. Compete in teams to see who can plant the most trees."
  },
  {
    id: 5,
    title: "Office Escape Room: The Hack",
    category: "events",
    vendor: "BrainTease Corporate",
    price: "$500 / team",
    rating: 4.9,
    duration: "2 Hours",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80",
    description: "We turn your own conference room into a high-stakes escape room. Perfect ice-breaker."
  },
  {
    id: 6,
    title: "National Independence Day Gala",
    category: "events",
    vendor: "Elite Event Planners",
    price: "Custom Quote",
    rating: 4.6,
    duration: "Evening",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80",
    description: "Full-service catering, traditional music, and decoration for national celebrations right in your headquarters."
  }
];

export default function App() {
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES);
  const [opportunities, setOpportunities] = useState([]);
  const [usersDB, setUsersDB] = useState([]);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) setUser(JSON.parse(savedUser));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleAuth = async (actionOrRole, payloadOrUsername, isRegisteringArg = false, companyCodeArg = "", pinArg = "", businessNameArg = "") => {
    let role = actionOrRole;
    let username = payloadOrUsername;
    let pin = pinArg;
    let isRegistering = isRegisteringArg;
    let companyCode = companyCodeArg;
    let businessName = businessNameArg;

    if (actionOrRole === "login" || actionOrRole === "register") {
      const payload = payloadOrUsername || {};
      isRegistering = actionOrRole === "register";
      role = payload.role;
      username = payload.username;
      pin = payload.pin;
      companyCode = payload.companyCode;
      businessName = payload.businessName;
    }

    username = (username || "").trim();
    pin = pin || "";
    companyCode = (companyCode || "").trim();
    businessName = (businessName || "").trim();

    if (!username || !pin) {
      return "Username and PIN are required.";
    }

    let endpoint = "login";
    let requestBody = { username, pin };

    if (isRegistering) {
      if (role === "employee") {
        endpoint = "employee-signup";
        requestBody = {
          username,
          pin,
          companyCode,
          name: username.replace(/_/g, " "),
        };
      } else if (role === "vendor") {
        endpoint = "vendor-signup";
        requestBody = {
          username,
          pin,
          company: businessName,
          name: username.replace(/_/g, " "),
        };
      } else {
        return "HR and Admin accounts cannot be created from the signup page.";
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        return data.message || "Something went wrong";
      }

      if (isRegistering) {
        if (role === "vendor") {
          alert("Vendor registration submitted successfully. Your account is pending admin approval.");
        } else {
          alert("Account created successfully! Please sign in now.");
        }
        return null;
      }

      if (data.user?.role === "vendor" && data.user?.status === "pending") {
        return "Your account is awaiting admin approval.";
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      return null;
    } catch (error) {
      console.error(error);
      return "Cannot connect to backend. Please make sure the backend URL is correct and the server is running.";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setUsersDB([]);
  };

  if (!user) {
    return <LandingPage onAuth={handleAuth} />;
  }

  if (user.role === 'admin') return <AdminPortal user={user} onLogout={handleLogout} usersDB={usersDB} setUsersDB={setUsersDB} />;
  if (user.role === 'hr') return <HrPortal user={user} onLogout={handleLogout} activities={activities} setActivities={setActivities} setOpportunities={setOpportunities} usersDB={usersDB} setUsersDB={setUsersDB} />;
  if (user.role === 'vendor') return <VendorPortal user={user} onLogout={handleLogout} activities={activities} setActivities={setActivities} />;
  if (user.role === 'employee') return <EmployeePortal user={user} onLogout={handleLogout} opportunities={opportunities} />;

  return <LandingPage onAuth={handleAuth} />;
}


// ==========================================
// 0. ADMIN PORTAL (SYSTEM MANAGER)
// ==========================================
function AdminPortal({ user, onLogout, usersDB, setUsersDB }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
      <Sidebar 
        user={user} isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout}
        portalType="System Admin"
        themeColor="indigo"
        navItems={[
          { id: 'dashboard', icon: <TrendingUp />, label: "Overview" },
          { id: 'manage-hr', icon: <Briefcase />, label: "Manage Companies (HR)" },
          { id: 'approve-vendors', icon: <ShieldCheck />, label: "Manage Vendors" }
        ]}
      />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <MobileHeader setIsOpen={setIsMobileMenuOpen} />
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {activeTab === 'dashboard' && <AdminDashboard usersDB={usersDB} />}
          {activeTab === 'manage-hr' && <AdminManageHR usersDB={usersDB} setUsersDB={setUsersDB} />}
          {activeTab === 'approve-vendors' && <AdminApproveVendors usersDB={usersDB} setUsersDB={setUsersDB} />}
        </div>
      </main>
    </div>
  );
}

function AdminDashboard({ usersDB }) {
  const hrCount = usersDB.filter(u => u.role === 'hr').length;
  const vendorCount = usersDB.filter(u => u.role === 'vendor').length;
  const employeeCount = usersDB.filter(u => u.role === 'employee').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">System Dashboard</h1>
        <p className="text-slate-500 mt-1">Platform overview and user statistics.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-700">Total Companies (HR)</h3>
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Briefcase className="w-5 h-5" /></div>
          </div>
          <p className="text-4xl font-black text-slate-800">{hrCount}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-700">Registered Vendors</h3>
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><ShieldCheck className="w-5 h-5" /></div>
          </div>
          <p className="text-4xl font-black text-slate-800">{vendorCount}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-700">Total Employees</h3>
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Users className="w-5 h-5" /></div>
          </div>
          <p className="text-4xl font-black text-slate-800">{employeeCount}</p>
        </div>
      </div>
    </div>
  );
}

function AdminManageHR({ usersDB, setUsersDB }) {
  const [msg, setMsg] = useState("");
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const { resetData, setResetData, resetError, handleResetPin } = usePinReset();
  const [companySearch, setCompanySearch] = useState("");
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);

  const fetchCompanies = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMsg("Error: Admin token not found. Please login again.");
      return;
    }

    try {
      setIsLoadingCompanies(true);
      const response = await fetch(`${API_BASE_URL}/admin/hrs`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setMsg(`Error: ${data.message || "Failed to load active companies."}`);
        return;
      }

      const hrs = data.hrs || [];
      setUsersDB((prev) => {
        const withoutHrs = prev.filter((u) => u.role !== "hr");
        return [...withoutHrs, ...hrs];
      });
      setMsg("");
    } catch (error) {
      console.error(error);
      setMsg("Error: Cannot load companies from backend.");
    } finally {
      setIsLoadingCompanies(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateHR = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const company = e.target.company.value.trim();
    const name = e.target.name.value.trim();

    if (!token) {
      setMsg("Error: Admin token not found. Please login again.");
      return;
    }

    if (!company || !name) {
      setMsg("Error: HR name and company name are required.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/create-hr`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, company }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMsg(`Error: ${data.message || "Failed to create HR account."}`);
        return;
      }

      const createdHr = data.user;
      const credentials = data.credentials;

      setUsersDB((prev) => {
        const withoutDuplicate = prev.filter((u) => u._id !== createdHr._id && u.username !== createdHr.username);
        return [...withoutDuplicate, createdHr];
      });

      setGeneratedCredentials({
        username: credentials.username,
        pin: credentials.pin,
        companyCode: credentials.companyCode,
        company: createdHr.company,
        name: createdHr.name,
      });

      setMsg(`Success: HR account generated for ${createdHr.company}. Share the credentials securely with the HR representative.`);
      e.target.reset();
      fetchCompanies();
    } catch (error) {
      console.error(error);
      setMsg("Error: Cannot connect to backend. HR account was not created.");
    }
  };

  const hrList = usersDB.filter((u) => u.role === 'hr');
  const normalizedCompanySearch = companySearch.trim().toLowerCase();
  const filteredHrList = normalizedCompanySearch
    ? hrList.filter((hr) =>
        [hr.company, hr.name, hr.username, hr.companyCode]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedCompanySearch))
      )
    : hrList;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Manage Companies (HR)</h1>
        <p className="text-slate-500 mt-1">Create and manage HR accounts from MongoDB, so data appears on every device.</p>
      </header>

      <form onSubmit={handleCreateHR} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">Generate New HR Account</h2>
        {msg && <div className={`p-3 text-sm font-bold rounded-lg ${msg.startsWith('Error') ? 'bg-red-50 text-red-700' : msg.startsWith('Success') ? 'bg-green-50 text-green-700' : 'bg-sky-50 text-sky-700'}`}>{msg}</div>}

        {generatedCredentials && (
          <div className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50">
            <p className="text-sm font-bold text-indigo-800 mb-3">Generated HR Credentials</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="bg-white p-3 rounded-xl border border-indigo-100">
                <p className="text-xs text-slate-400 uppercase font-bold">Username</p>
                <p className="font-mono font-bold text-slate-800">{generatedCredentials.username}</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-indigo-100">
                <p className="text-xs text-slate-400 uppercase font-bold">PIN</p>
                <p className="font-mono font-bold text-slate-800">{generatedCredentials.pin}</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-indigo-100">
                <p className="text-xs text-slate-400 uppercase font-bold">Company Code</p>
                <p className="font-mono font-bold text-indigo-600">{generatedCredentials.companyCode}</p>
              </div>
            </div>
            <p className="text-xs text-indigo-700 mt-3">Note: The PIN is shown once only. Use Reset PIN if it is forgotten.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">HR Representative Name</label>
            <input name="name" type="text" required placeholder="e.g. John Doe" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
            <input name="company" type="text" required placeholder="e.g. Acme Corp" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-2" />
          </div>
        </div>
        <div className="pt-2 flex justify-end">
          <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition-colors">
            Generate HR Account
          </button>
        </div>
      </form>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            Active Companies
            <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full">
              {filteredHrList.length}/{hrList.length}
            </span>
          </h2>
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={companySearch}
                onChange={(e) => setCompanySearch(e.target.value)}
                placeholder="Search company, HR, username, code..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm"
              />
            </div>
            <button onClick={fetchCompanies} className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm">
              Refresh
            </button>
          </div>
        </div>
        {isLoadingCompanies ? (
          <p className="text-slate-500 italic py-4">Loading companies...</p>
        ) : filteredHrList.length === 0 ? (
          <p className="text-slate-500 italic py-4">No companies found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredHrList.map((hr, idx) => (
            <div key={hr._id || hr.username || idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-bold text-slate-800">{hr.company}</p>
                  <p className="text-sm text-slate-500">Rep: {hr.name}</p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">@{hr.username}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wide">Company Code</p>
                  <p className="font-mono font-bold text-indigo-600">{hr.companyCode}</p>
                </div>
              </div>
              <button 
                onClick={() => handleResetPin(hr.username)}
                className="w-full py-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm"
              >
                <Key className="w-4 h-4" /> Reset PIN
              </button>
            </div>
          ))}
          </div>
        )}
      </div>
      
      {resetError && <div className="p-3 text-sm font-bold rounded-lg bg-red-50 text-red-700">{resetError}</div>}
      <ResetPinModal resetData={resetData} onClose={() => setResetData(null)} />
    </div>
  );
}


function AdminApproveVendors({ usersDB, setUsersDB }) {
  const [pendingVendors, setPendingVendors] = useState([]);
  const [activeVendors, setActiveVendors] = useState([]);
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { resetData, setResetData, resetError, handleResetPin } = usePinReset();
  const [vendorSearch, setVendorSearch] = useState("");

  const fetchVendors = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMsg("Error: Admin token not found. Please login again.");
      return;
    }

    try {
      setIsLoading(true);
      const [pendingResponse, activeResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/pending-vendors`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/admin/vendors`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const pendingData = await pendingResponse.json();
      const activeData = await activeResponse.json();

      if (!pendingResponse.ok) {
        setMsg(`Error: ${pendingData.message || "Failed to load pending vendors."}`);
        return;
      }

      if (!activeResponse.ok) {
        setMsg(`Error: ${activeData.message || "Failed to load active vendors."}`);
        return;
      }

      const pending = pendingData.vendors || [];
      const active = activeData.vendors || [];

      setPendingVendors(pending);
      setActiveVendors(active);
      setUsersDB((prev) => {
        const withoutVendors = prev.filter((u) => u.role !== "vendor");
        return [...withoutVendors, ...pending, ...active];
      });
      setMsg("");
    } catch (error) {
      console.error(error);
      setMsg("Error: Cannot load vendors from backend.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const normalizedVendorSearch = vendorSearch.trim().toLowerCase();
  const filteredActiveVendors = normalizedVendorSearch
    ? activeVendors.filter((vendor) =>
        [vendor.company, vendor.name, vendor.username]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedVendorSearch))
      )
    : activeVendors;

  const handleApprove = async (username) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMsg("Error: Admin token not found. Please login again.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/approve-vendor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMsg(`Error: ${data.message || "Failed to approve vendor."}`);
        return;
      }

      setMsg("Success: Vendor approved successfully.");
      fetchVendors();
    } catch (error) {
      console.error(error);
      setMsg("Error: Cannot connect to backend. Vendor was not approved.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Vendor Management</h1>
        <p className="text-slate-500 mt-1">Review pending requests and manage active vendors from MongoDB.</p>
      </header>

      {msg && (
        <div className={`p-3 text-sm font-bold rounded-lg ${msg.startsWith('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {msg}
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4 gap-3">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            Pending Approvals
            <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full">
              {pendingVendors.length}
            </span>
          </h2>
          <button
            onClick={fetchVendors}
            className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm"
          >
            Refresh
          </button>
        </div>

        {isLoading ? (
          <p className="text-slate-500 italic py-4">Loading vendors...</p>
        ) : pendingVendors.length === 0 ? (
          <p className="text-slate-500 italic py-4">No pending vendors at this time.</p>
        ) : (
          <div className="space-y-4">
            {pendingVendors.map((vendor) => (
              <div
                key={vendor._id || vendor.username}
                className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-amber-50 rounded-xl border border-amber-100 gap-4"
              >
                <div>
                  <p className="font-bold text-slate-800 text-lg">{vendor.company}</p>
                  <p className="text-sm text-slate-600">Contact: {vendor.name} (@{vendor.username})</p>
                  <p className="text-xs text-amber-700 font-bold mt-1 uppercase tracking-wide">Status: {vendor.status}</p>
                </div>
                <button
                  onClick={() => handleApprove(vendor.username)}
                  className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow-sm hover:bg-emerald-700 transition-colors w-full md:w-auto"
                >
                  Approve Vendor
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            Active Vendors
            <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full">
              {filteredActiveVendors.length}/{activeVendors.length}
            </span>
          </h2>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={vendorSearch}
              onChange={(e) => setVendorSearch(e.target.value)}
              placeholder="Search vendor, contact, username..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm"
            />
          </div>
        </div>
        {activeVendors.length === 0 ? (
          <p className="text-slate-500 italic py-4">No active vendors found.</p>
        ) : filteredActiveVendors.length === 0 ? (
          <p className="text-slate-500 italic py-4">No active vendors match your search.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredActiveVendors.map((vendor) => (
              <div key={vendor._id || vendor.username} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{vendor.company}</p>
                    <p className="text-xs text-slate-500">Contact: {vendor.name}</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">@{vendor.username}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleResetPin(vendor.username)}
                  className="w-full py-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm"
                >
                  <Key className="w-4 h-4" /> Reset PIN
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {resetError && <div className="p-3 text-sm font-bold rounded-lg bg-red-50 text-red-700">{resetError}</div>}
      <ResetPinModal resetData={resetData} onClose={() => setResetData(null)} />
    </div>
  );
}


// ==========================================
// 1. HR PORTAL (COMPANY ADMIN)
// ==========================================
function HrPortal({ user, onLogout, activities, setActivities, setOpportunities, usersDB, setUsersDB }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
      <Sidebar 
        user={user} isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout}
        portalType="HR Portal"
        navItems={[
          { id: 'dashboard', icon: <TrendingUp />, label: "Dashboard" },
          { id: 'manage-team', icon: <Users />, label: "Manage Team" },
          { id: 'marketplace', icon: <Search />, label: "Activity Marketplace" },
          { id: 'custom', icon: <PlusCircle />, label: "Custom Request" },
          { id: 'create-volunteer', icon: <Heart />, label: "Create Volunteer Op" },
          { id: 'polling', icon: <Vote />, label: "Team Polling" },
          { id: 'events', icon: <Calendar />, label: "My Company Events" }
        ]}
      />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <MobileHeader setIsOpen={setIsMobileMenuOpen} />
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {activeTab === 'dashboard' && <HrDashboard user={user} setTab={setActiveTab} />}
          {activeTab === 'manage-team' && <HrManageEmployees user={user} usersDB={usersDB} setUsersDB={setUsersDB} />}
          {activeTab === 'marketplace' && <Marketplace activities={activities} />}
          {activeTab === 'custom' && <CustomRequest />}
          {activeTab === 'create-volunteer' && <HrCreateVolunteer user={user} setOpportunities={setOpportunities} setTab={setActiveTab} />}
          {activeTab === 'polling' && <TeamPolling role="hr" />}
          {activeTab === 'events' && <EventsPlaceholder />}
        </div>
      </main>
    </div>
  );
}

function HrDashboard({ user, setTab }) {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user.name.split(' ')[0]} 👋</h1>
        <p className="text-slate-500 mt-1">Here is {user.company}'s culture overview.</p>
        <p className="text-xs text-sky-600 font-bold uppercase tracking-wider mt-2 border border-sky-200 inline-block px-2 py-1 rounded-md bg-sky-50">
          Company Code: {user.companyCode}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-xl"><Heart className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Culture Score</p>
            <p className="text-3xl font-bold text-slate-800">{user.cultureScore}/100</p>
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +5 points this month</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-xl"><Award className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Volunteer Impact</p>
            <p className="text-3xl font-bold text-slate-800">{user.volunteerHours} <span className="text-lg text-slate-400">hrs</span></p>
            <p className="text-xs text-slate-500 mt-1">Top 20% in your industry</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-sky-500" /> Culture ROI Insights</h2>
          </div>
          <div className="h-48 flex items-end gap-2 mt-6">
            {[40, 60, 45, 80, 65, 90].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full bg-sky-100 rounded-t-md relative flex items-end justify-center hover:bg-sky-200 transition-colors">
                  <div className="w-full bg-gradient-to-t from-emerald-400 to-sky-500 rounded-t-md transition-all duration-500 group-hover:opacity-90" style={{ height: `${height}%` }}></div>
                  <span className="absolute -top-6 text-xs font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">{height}%</span>
                </div>
                <span className="text-xs text-slate-400 font-medium">Month {i+1}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-500 mt-4 text-center">Employee Engagement Score after EvoPath Activities</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4"><MessageSquare className="w-5 h-5 text-emerald-500" /> Recent Feedback</h2>
          <div className="flex-1 space-y-4">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-700">Engineering Team</span>
                <div className="flex text-yellow-400"><Star className="w-3 h-3 fill-current"/><Star className="w-3 h-3 fill-current"/><Star className="w-3 h-3 fill-current"/><Star className="w-3 h-3 fill-current"/><Star className="w-3 h-3 fill-current"/></div>
              </div>
              <p className="text-sm text-slate-600 italic">"The escape room was exactly what we needed to break the ice with the new hires!"</p>
            </div>
          </div>
          <button onClick={() => setTab('polling')} className="mt-4 w-full py-2 bg-sky-50 text-sky-700 text-sm font-medium rounded-lg hover:bg-sky-100 transition-colors">
            Ask for new feedback
          </button>
        </div>
      </div>
    </div>
  );
}

function HrManageEmployees({ user, usersDB, setUsersDB }) {
  const { resetData, setResetData, resetError, handleResetPin } = usePinReset();
  const [team, setTeam] = useState([]);
  const [teamMsg, setTeamMsg] = useState("");
  const [isLoadingTeam, setIsLoadingTeam] = useState(false);
  const [teamSearch, setTeamSearch] = useState("");

  const fetchTeamEmployees = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setTeamMsg("Error: HR token not found. Please login again.");
      return;
    }

    try {
      setIsLoadingTeam(true);
      setTeamMsg("");

      const response = await fetch(`${API_BASE_URL}/hr/employees`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setTeamMsg(data.message || "Failed to load employees.");
        return;
      }

      const employees = data.employees || [];
      setTeam(employees);

      // Keep local UI cache updated so dashboard counters/lists stay consistent.
      setUsersDB((prev) => {
        const withoutThisCompanyEmployees = prev.filter(
          (u) => !(u.role === "employee" && u.companyCode === user.companyCode)
        );
        return [...withoutThisCompanyEmployees, ...employees];
      });
    } catch (error) {
      console.error(error);
      setTeamMsg("Cannot connect to backend. Showing local cached employees only.");
      setTeam(
        usersDB.filter(
          (u) => u.role === "employee" && u.companyCode === user.companyCode
        )
      );
    } finally {
      setIsLoadingTeam(false);
    }
  };

  useEffect(() => {
    fetchTeamEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.companyCode]);

  const normalizedTeamSearch = teamSearch.trim().toLowerCase();
  const filteredTeam = normalizedTeamSearch
    ? team.filter((emp) =>
        [emp.name, emp.username, emp.companyCode, emp.company]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedTeamSearch))
      )
    : team;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Manage Team</h1>
          <p className="text-slate-500 mt-1">
            View employees registered under company code <strong>{user.companyCode}</strong> and manage their access.
          </p>
        </div>
        <button
          onClick={fetchTeamEmployees}
          className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm"
        >
          Refresh Team
        </button>
      </header>

      {teamMsg && (
        <div className={`p-3 text-sm font-bold rounded-lg ${teamMsg.startsWith("Error") || teamMsg.startsWith("Cannot") ? "bg-red-50 text-red-700" : "bg-sky-50 text-sky-700"}`}>
          {teamMsg}
        </div>
      )}
      {resetError && <div className="p-3 text-sm font-bold rounded-lg bg-red-50 text-red-700">{resetError}</div>}
      
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            Team Members
            <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
              {filteredTeam.length}/{team.length}
            </span>
          </h2>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={teamSearch}
              onChange={(e) => setTeamSearch(e.target.value)}
              placeholder="Search employee, username, code..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 text-sm"
            />
          </div>
        </div>
        {isLoadingTeam ? (
          <div className="text-center py-10">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 italic">Loading employees...</p>
          </div>
        ) : team.length === 0 ? (
          <div className="text-center py-10">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 italic">No employees have registered with your company code yet.</p>
          </div>
        ) : filteredTeam.length === 0 ? (
          <div className="text-center py-10">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 italic">No employees match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeam.map((emp) => (
              <div key={emp._id || emp.username} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between">
                <div className="mb-4">
                  <p className="font-bold text-slate-800 text-lg">{emp.name || emp.username}</p>
                  <p className="text-xs text-slate-500 font-mono mt-1">@{emp.username}</p>
                  <p className="text-xs text-sky-600 font-bold mt-2 uppercase tracking-wide">Company Code: {emp.companyCode}</p>
                </div>
                <button 
                  onClick={() => handleResetPin(emp.username)}
                  className="w-full py-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm"
                >
                  <Key className="w-4 h-4" /> Reset PIN
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <ResetPinModal resetData={resetData} onClose={() => setResetData(null)} />
    </div>
  );
}

// ==========================================
// 2. VENDOR PORTAL
// ==========================================
function VendorPortal({ user, onLogout, activities, setActivities }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
      <Sidebar 
        user={user} isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout}
        portalType="Vendor Partner Portal"
        themeColor="emerald"
        navItems={[
          { id: 'dashboard', icon: <TrendingUp />, label: "Overview" },
          { id: 'bids', icon: <FileText />, label: "Open RFPs & Bids" },
          { id: 'bookings', icon: <CheckSquare />, label: "My Bookings" },
          { id: 'create-listing', icon: <PlusCircle />, label: "Publish Activity" },
        ]}
      />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <MobileHeader setIsOpen={setIsMobileMenuOpen} />
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {user.status === 'pending' && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
              <Clock className="w-6 h-6 text-amber-500" />
              <div>
                <h3 className="font-bold text-amber-800">Account Pending Approval</h3>
                <p className="text-sm text-amber-700">Your vendor account is under review by EvoPath administrators. You can browse open bids, but quoting is restricted until approved.</p>
              </div>
            </div>
          )}
          {activeTab === 'dashboard' && <VendorDashboard user={user} setTab={setActiveTab} />}
          {activeTab === 'bids' && <VendorBids user={user} />}
          {activeTab === 'bookings' && <EventsPlaceholder title="Manage Bookings" desc="Track your confirmed events, attendee lists, and payments here." />}
          {activeTab === 'create-listing' && <VendorCreateListing user={user} setActivities={setActivities} setTab={setActiveTab} />}
        </div>
      </main>
    </div>
  );
}

function VendorDashboard({ user, setTab }) {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Partner Dashboard</h1>
        <p className="text-slate-500 mt-1">{user.company} Analytics</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-700">Active Bookings</h3>
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Calendar className="w-5 h-5" /></div>
          </div>
          <p className="text-4xl font-black text-slate-800">{user.activeTrips}</p>
          <p className="text-sm text-emerald-600 font-medium mt-2">Next event in 3 days</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-700">Pending RFPs</h3>
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><FileText className="w-5 h-5" /></div>
          </div>
          <p className="text-4xl font-black text-slate-800">12</p>
          <button onClick={() => setTab('bids')} className="text-sm text-amber-600 font-medium mt-2 text-left hover:underline">Review new requests &rarr;</button>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-700">Average Rating</h3>
            <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg"><Star className="w-5 h-5 fill-current" /></div>
          </div>
          <p className="text-4xl font-black text-slate-800">{user.rating}</p>
          <p className="text-sm text-slate-500 font-medium mt-2">Based on 48 corporate reviews</p>
        </div>
      </div>
    </div>
  );
}

function VendorBids({ user }) {
  const isPending = user?.status === 'pending';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Open RFPs & Custom Requests</h1>
        <p className="text-slate-500 mt-1">Review custom trip requests from HR managers and submit your competitive proposals.</p>
      </header>

      {isPending && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm font-medium">
          Your vendor account is pending approval. You can review public RFPs, but you cannot submit proposals until an Admin approves your account.
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-4">
          <div>
            <span className="inline-block px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full mb-2 uppercase tracking-wide">Pending Bids (Public)</span>
            <h3 className="text-xl font-bold text-slate-800">Tech Team Winter Survival Retreat</h3>
            <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
              <Briefcase className="w-4 h-4" /> TechNova Solutions
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-700">Budget</p>
            <p className="text-xl font-black text-emerald-600">$150 / person</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Category</p>
            <p className="font-medium text-slate-800">Company Retreat</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Attendees</p>
            <p className="font-medium text-slate-800">50</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Target Date</p>
            <p className="font-medium text-slate-800">Dec 15, 2026</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Time Left</p>
            <p className="font-medium text-red-600 flex items-center gap-1"><Clock className="w-4 h-4"/> 48 Hours</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-bold text-slate-700 mb-2">Detailed Requirements:</p>
          <p className="text-slate-600 text-sm bg-slate-50 p-4 rounded-lg italic">
            "We need transportation from our main office, vegetarian catering options, and at least 2 hours of guided team-building exercises focusing on trust and communication."
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            disabled={isPending}
            className={`px-6 py-2.5 font-bold rounded-xl shadow-md transition-colors ${
              isPending
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-700'
            }`}
          >
            {isPending ? 'Approval Required' : 'Submit Proposal'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. EMPLOYEE PORTAL
// ==========================================
function EmployeePortal({ user, onLogout, opportunities }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
      <Sidebar 
        user={user} isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout}
        portalType="Employee Hub"
        themeColor="purple"
        navItems={[
          { id: 'dashboard', icon: <TrendingUp />, label: "My Impact" },
          { id: 'opportunities', icon: <Heart />, label: "Volunteer Opportunities" },
          { id: 'polling', icon: <Vote />, label: "Have Your Say (Polls)" },
          { id: 'events', icon: <Calendar />, label: "Upcoming Events" }
        ]}
      />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <MobileHeader setIsOpen={setIsMobileMenuOpen} />
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {activeTab === 'dashboard' && <EmployeeDashboard user={user} setTab={setActiveTab} />}
          {activeTab === 'opportunities' && <EmployeeOpportunities opportunities={opportunities} />}
          {activeTab === 'polling' && <TeamPolling role="employee" />}
          {activeTab === 'events' && <EventsPlaceholder title="My Itinerary" desc="Your upcoming booked company events will show up here." />}
        </div>
      </main>
    </div>
  );
}

function EmployeeDashboard({ user, setTab }) {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Welcome, {user.name.split(' ')[0]}!</h1>
        <p className="text-slate-500 mt-1">Track your impact and engage with {user.company}'s culture.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-6 rounded-2xl shadow-md text-white relative overflow-hidden flex flex-col justify-between min-h-[160px]">
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4">
            <Sparkles className="w-32 h-32" />
          </div>
          <div className="relative z-10 flex items-center justify-between mb-4">
            <h3 className="font-bold text-indigo-100">Culture Points</h3>
            <Award className="w-6 h-6 text-yellow-300" />
          </div>
          <div className="relative z-10">
            <p className="text-4xl font-black">{user.culturePoints}</p>
            <p className="text-sm text-indigo-200 mt-1">Top 15% in the company. Keep participating!</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between min-h-[160px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-700">Personal Volunteer Hours</h3>
            <div className="p-2 bg-rose-100 text-rose-600 rounded-lg"><Heart className="w-5 h-5" /></div>
          </div>
          <div>
            <p className="text-4xl font-black text-slate-800">{user.personalVolunteerHours} <span className="text-lg text-slate-400 font-normal">hrs</span></p>
            <p className="text-sm text-slate-500 font-medium mt-1">Goal: 20 hours / year</p>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-slate-800 mb-4">Action Required</h2>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center shrink-0">
            <Vote className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">New Poll: Q3 Team Activity</h3>
            <p className="text-sm text-slate-500">HR has requested your input for the upcoming company retreat.</p>
          </div>
        </div>
        <button onClick={() => setTab('polling')} className="px-4 py-2 bg-sky-50 text-sky-700 font-bold rounded-xl hover:bg-sky-100 transition-colors whitespace-nowrap">
          Vote Now
        </button>
      </div>
    </div>
  );
}

function EmployeeOpportunities({ opportunities }) {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Volunteer Opportunities</h1>
        <p className="text-slate-500 mt-1">Discover and sign up for internal company volunteer events.</p>
      </header>
      
      {opportunities.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-700">No Opportunities Yet</h2>
          <p className="text-slate-500">Check back later for new company-sponsored volunteer events.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map(opp => (
            <ActivityCard key={opp.id} activity={opp} />
          ))}
        </div>
      )}
    </div>
  );
}

// ==========================================
// SHARED COMPONENTS
// ==========================================
function Sidebar({ user, isOpen, setIsOpen, activeTab, setActiveTab, onLogout, portalType, themeColor = 'sky', navItems }) {
  const getThemeColors = () => {
    if (themeColor === 'indigo') return { bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-700', activeBg: 'bg-indigo-600', activeShadow: 'shadow-indigo-200' };
    if (themeColor === 'emerald') return { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', activeBg: 'bg-emerald-600', activeShadow: 'shadow-emerald-200' };
    if (themeColor === 'purple') return { bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-700', activeBg: 'bg-purple-600', activeShadow: 'shadow-purple-200' };
    return { bg: 'bg-sky-50', border: 'border-sky-100', text: 'text-sky-700', activeBg: 'bg-sky-600', activeShadow: 'shadow-sky-200' };
  };
  const theme = getThemeColors();

  return (
    <aside className={`fixed inset-y-0 left-0 bg-white w-64 border-r border-slate-200 z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static flex flex-col z-50`}>
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-xl tracking-tight">
          <EvoPathLogo className="w-8 h-8" /> <AnimatedBrandText />
        </div>
        <button className="md:hidden" onClick={() => setIsOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto">
        <div className={`mb-6 px-3 py-4 rounded-xl border ${theme.bg} ${theme.border}`}>
          <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${theme.text}`}>{portalType}</p>
          <p className="font-bold text-slate-800 truncate">{user.company || "EvoPath Central"}</p>
          <p className="text-sm text-slate-500 truncate">{user.name}</p>
        </div>

        <nav className="space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                activeTab === item.id ? `${theme.activeBg} text-white shadow-md ${theme.activeShadow}` : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {React.cloneElement(item.icon, { className: 'w-5 h-5' })}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t border-slate-100 shrink-0">
        <button onClick={onLogout} className="flex items-center gap-3 px-3 py-2 w-full text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
          <LogOut className="w-5 h-5" /> <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

function MobileHeader({ setIsOpen }) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:hidden shrink-0 z-50 relative">
      <div className="flex items-center gap-2 text-slate-800 font-bold text-lg tracking-tight">
        <EvoPathLogo className="w-6 h-6" /> <AnimatedBrandText />
      </div>
      <button onClick={() => setIsOpen(true)}><Menu className="w-6 h-6 text-slate-600" /></button>
    </header>
  );
}

function TeamPolling({ role = "hr" }) {
  const [polls, setPolls] = useState([
    {
      id: 1,
      question: "What should our Q3 Team Building Activity be?",
      status: "active",
      votes: 142,
      options: [
        { text: "Wadi Rum Desert Retreat", votes: 65, color: "bg-emerald-500" },
        { text: "Tech-Free Forest Hiking", votes: 42, color: "bg-sky-500" },
        { text: "In-Office Escape Room", votes: 35, color: "bg-amber-400" }
      ]
    },
    {
      id: 2,
      question: "Which CSR (Volunteering) initiative do you prefer for next month?",
      status: "completed",
      votes: 180,
      options: [
        { text: "Local Orphanage Renovation", votes: 110, color: "bg-emerald-500" },
        { text: "Tree Planting", votes: 70, color: "bg-sky-500" }
      ]
    }
  ]);

  const [hasVoted, setHasVoted] = useState(false);
  
  // New State for Poll Creation
  const [isCreating, setIsCreating] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newOptions, setNewOptions] = useState(["", ""]);

  const handleAddOption = () => {
    if (newOptions.length < 5) {
      setNewOptions([...newOptions, ""]);
    }
  };

  const handleOptionChange = (index, value) => {
    const updated = [...newOptions];
    updated[index] = value;
    setNewOptions(updated);
  };

  const handleCreatePoll = (e) => {
    e.preventDefault();
    if (!newQuestion.trim() || newOptions.some(opt => !opt.trim())) {
      alert("Please enter a question and all options.");
      return;
    }

    const colors = ["bg-emerald-500", "bg-sky-500", "bg-amber-400", "bg-purple-500", "bg-rose-500"];
    const formattedOptions = newOptions.map((opt, i) => ({
      text: opt,
      votes: 0,
      color: colors[i % colors.length]
    }));

    const newPoll = {
      id: Date.now(),
      question: newQuestion,
      status: "active",
      votes: 0,
      options: formattedOptions
    };

    setPolls([newPoll, ...polls]);
    setIsCreating(false);
    setNewQuestion("");
    setNewOptions(["", ""]);
  };

  const handleDeletePoll = (id) => {
    setPolls(polls.filter(poll => poll.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{role === 'employee' ? 'Have Your Say' : 'Team Polling'}</h1>
          <p className="text-slate-500 mt-1">
            {role === 'employee' ? 'Vote on upcoming activities and shape the company culture.' : 'Let your employees vote on upcoming activities and events.'}
          </p>
        </div>
        {role === 'hr' && !isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            className="px-5 py-2.5 bg-sky-600 text-white font-medium rounded-xl shadow-md shadow-sky-200 hover:bg-sky-700 transition-colors flex items-center gap-2"
          >
            <Vote className="w-4 h-4" /> Create New Poll
          </button>
        )}
      </div>

      {role === 'hr' && isCreating && (
        <form onSubmit={handleCreatePoll} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-8 space-y-5 animate-in fade-in slide-in-from-top-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-xl font-bold text-slate-800">Create a New Poll</h2>
            <p className="text-sm text-slate-500 mt-1">Publish a new poll directly to the employee feed.</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Poll Question</label>
            <input 
              type="text" 
              value={newQuestion} 
              onChange={(e) => setNewQuestion(e.target.value)} 
              placeholder="e.g., Where should we go for our winter team building?" 
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all" 
              required 
            />
          </div>
          
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">Poll Options</label>
            {newOptions.map((opt, i) => (
              <input 
                key={i} 
                type="text" 
                value={opt} 
                onChange={(e) => handleOptionChange(i, e.target.value)} 
                placeholder={`Option ${i + 1}`} 
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all" 
                required 
              />
            ))}
            
            {newOptions.length < 5 && (
              <button 
                type="button" 
                onClick={handleAddOption} 
                className="text-sm font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 mt-2"
              >
                <PlusCircle className="w-4 h-4" /> Add another option
              </button>
            )}
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button" 
              onClick={() => setIsCreating(false)} 
              className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-6 py-2.5 bg-sky-600 text-white rounded-xl shadow-md hover:bg-sky-700 font-bold transition-colors"
            >
              Publish Poll
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-6">
        {polls.map((poll) => (
          <div key={poll.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {poll.status === 'active' ? (
                    <span className="px-2.5 py-1 text-xs font-bold bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> Active
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 text-xs font-bold bg-slate-100 text-slate-600 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Completed
                    </span>
                  )}
                  <span className="text-xs font-medium text-slate-400">{poll.votes} total votes</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 pr-8">{poll.question}</h3>
              </div>
              
              {role === 'hr' && (
                <button 
                  onClick={() => handleDeletePoll(poll.id)}
                  className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                  title="Delete Poll"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="space-y-4">
              {poll.options.map((opt, i) => {
                const percentage = poll.votes === 0 ? 0 : Math.round((opt.votes / poll.votes) * 100);
                return (
                  <div 
                    key={i} 
                    className={`relative ${role === 'employee' && poll.status === 'active' && !hasVoted ? 'cursor-pointer group' : ''}`}
                    onClick={() => {
                      if (role === 'employee' && poll.status === 'active') {
                        setHasVoted(true);
                        alert("Thank you for voting!");
                      }
                    }}
                  >
                    <div className="flex justify-between text-sm font-medium text-slate-700 mb-1.5">
                      <span className={`${role === 'employee' && poll.status === 'active' && !hasVoted ? 'group-hover:text-sky-600' : ''}`}>{opt.text}</span>
                      <span className="text-slate-500">{percentage}% ({opt.votes} votes)</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${opt.color} rounded-full transition-all duration-1000 ${role === 'employee' && poll.status === 'active' && !hasVoted ? 'group-hover:opacity-80' : ''}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {role === 'hr' && poll.status === 'completed' && (
              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                <button className="text-sky-600 font-medium text-sm flex items-center gap-1 hover:underline">
                  Book Winning Activity <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Marketplace({ activities }) {
  const [filter, setFilter] = useState('all');
  const filteredActivities = filter === 'all' ? activities : activities.filter(a => a.category === filter);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Activity Marketplace</h1>
          <p className="text-slate-500 mt-1">Discover and book verified corporate experiences.</p>
        </div>
        <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 p-1">
          <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'all' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>All</button>
          <button onClick={() => setFilter('trips')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'trips' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Trips 🏕️</button>
          <button onClick={() => setFilter('events')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'events' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Office Events 🎉</button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredActivities.map(activity => (
          <ActivityCard key={activity.id} activity={activity} />
        ))}
      </div>
    </div>
  );
}

function CustomRequest() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-10 bg-white rounded-3xl border border-sky-100 shadow-xl text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Request Sent to Vendor(s)!</h2>
        <p className="text-slate-500 mb-8 text-lg">
          Your custom activity request has been dispatched successfully. You will receive notifications once vendors review your requirements and submit their proposals.
        </p>
        <button 
          onClick={() => setIsSubmitted(false)} 
          className="px-6 py-3 bg-sky-600 text-white font-medium rounded-xl shadow-md shadow-sky-200 hover:bg-sky-700 transition-colors"
        >
          Create Another Request
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Custom Activity Request</h1>
        <p className="text-slate-500 mt-1">Design your own trip, event, or volunteering initiative and send it directly to coordination vendors.</p>
      </header>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-8">
        
        {/* Section 1: Basic Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">1. Activity Details</h3>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Activity Title / Concept</label>
            <input 
              type="text" 
              required
              placeholder="e.g., Tech Team Winter Survival Retreat"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Activity Category</label>
              <div className="relative">
                <Map className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <select className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all appearance-none bg-white">
                  <option value="trips">Company Trip / Retreat</option>
                  <option value="volunteer">CSR Volunteering</option>
                  <option value="events">Office Event / Party</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Target Vendor</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <select className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all appearance-none bg-white">
                  <option value="all">Broadcast to All Vendors (Get Bids)</option>
                  <option value="vendor1">Desert Horizons Coordination</option>
                  <option value="vendor2">Nature Treks LLC</option>
                  <option value="vendor3">Community Builders NGO</option>
                  <option value="vendor4">Elite Event Planners</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Logistics */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">2. Logistics & Budget</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Expected Attendees</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="number" 
                  min="1"
                  required
                  placeholder="e.g., 50"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Target Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="date" 
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Budget Per Person ($)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="number" 
                  min="0"
                  placeholder="e.g., 150"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Specifics */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">3. Requirements</h3>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Detailed Requirements & Preferences</label>
            <div className="relative">
              <AlignLeft className="absolute left-3 top-4 w-5 h-5 text-slate-400" />
              <textarea 
                required
                rows="4"
                placeholder="Describe what you are looking for. E.g., 'We need transportation from our main office, vegetarian catering options, and at least 2 hours of guided team-building exercises.'"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all resize-y"
              ></textarea>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button 
            type="submit" 
            className="px-8 py-3.5 bg-sky-600 text-white font-bold rounded-xl shadow-md shadow-sky-200 hover:bg-sky-700 transition-colors flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
            Send Request to Vendor
          </button>
        </div>
      </form>
    </div>
  );
}

function VendorCreateListing({ user, setActivities, setTab }) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const isPending = user?.status === 'pending';

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isPending) {
      alert("Your vendor account must be approved before publishing activities.");
      return;
    }

    const newAct = {
      id: Date.now(),
      title: e.target.title.value,
      category: e.target.category.value,
      vendor: user.company,
      price: e.target.price.value,
      rating: 5.0,
      duration: e.target.duration.value,
      image: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=80",
      description: e.target.description.value
    };
    setActivities(prev => [newAct, ...prev]);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-10 bg-white rounded-3xl border border-emerald-100 shadow-xl text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Activity Published!</h2>
        <p className="text-slate-500 mb-8 text-lg">Your activity is now visible to HR managers in the Activity Marketplace.</p>
        <button onClick={() => setTab('dashboard')} className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl shadow-md hover:bg-emerald-700 transition-colors">Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Publish New Activity</h1>
        <p className="text-slate-500 mt-1">Create a trip or event to be featured in the HR Activity Marketplace.</p>
      </header>

      {isPending && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm font-medium">
          Your vendor account is pending approval. Publishing activities is disabled until Admin approval.
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Activity Title</label>
          <input name="title" type="text" required disabled={isPending} placeholder="e.g., Mountain Yoga Retreat" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select name="category" disabled={isPending} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 outline-none appearance-none bg-white disabled:bg-slate-100 disabled:cursor-not-allowed">
              <option value="trips">Company Trip</option>
              <option value="events">Office Event</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Price (e.g., $50/person)</label>
            <input name="price" type="text" required disabled={isPending} placeholder="$50 / person" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Duration (e.g., 1 Day)</label>
            <input name="duration" type="text" required disabled={isPending} placeholder="1 Day" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea name="description" required rows="4" disabled={isPending} placeholder="Describe the activity..." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 outline-none resize-y disabled:bg-slate-100 disabled:cursor-not-allowed"></textarea>
        </div>
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className={`px-8 py-3.5 font-bold rounded-xl shadow-md transition-colors flex items-center gap-2 ${
              isPending
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            <PlusCircle className="w-5 h-5" /> {isPending ? 'Approval Required' : 'Publish to Marketplace'}
          </button>
        </div>
      </form>
    </div>
  );
}

function HrCreateVolunteer({ user, setOpportunities, setTab }) {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newAct = {
      id: Date.now(),
      title: e.target.title.value,
      category: 'volunteer',
      vendor: `${user.company} (Internal)`,
      price: "Free",
      rating: 5.0,
      duration: e.target.duration.value,
      image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=800&q=80",
      description: e.target.description.value
    };
    setOpportunities(prev => [newAct, ...prev]);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-10 bg-white rounded-3xl border border-sky-100 shadow-xl text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Opportunity Created!</h2>
        <p className="text-slate-500 mb-8 text-lg">Your internal volunteer event has been successfully published to the Employee Opportunities feed.</p>
        <button onClick={() => setTab('dashboard')} className="px-6 py-3 bg-sky-600 text-white font-medium rounded-xl shadow-md hover:bg-sky-700 transition-colors">Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Create Volunteer Opportunity</h1>
        <p className="text-slate-500 mt-1">Publish internal or company-sponsored volunteer events directly to your employees.</p>
      </header>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Opportunity Title</label>
          <input name="title" type="text" required placeholder="e.g., Local Beach Cleanup" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 outline-none" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Target Date</label>
            <input type="date" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Duration (e.g., 4 Hours)</label>
            <input name="duration" type="text" required placeholder="4 Hours" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description & Requirements</label>
          <textarea name="description" required rows="4" placeholder="Describe the volunteer activity..." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 outline-none resize-y"></textarea>
        </div>
        <div className="pt-4 flex justify-end">
          <button type="submit" className="px-8 py-3.5 bg-sky-600 text-white font-bold rounded-xl shadow-md hover:bg-sky-700 transition-colors flex items-center gap-2">
            <Heart className="w-5 h-5" /> Publish Internal Event
          </button>
        </div>
      </form>
    </div>
  );
}

function ActivityCard({ activity }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 group flex flex-col">
      <div className="relative h-48 overflow-hidden">
        <img src={activity.image} alt={activity.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 text-sm font-bold text-slate-800 shadow-sm"><Star className="w-4 h-4 text-yellow-500 fill-current" />{activity.rating}</div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-lg text-slate-900 mb-1 leading-tight group-hover:text-sky-600 transition-colors">{activity.title}</h3>
        <p className="text-sm text-slate-500 flex items-center gap-1.5 mb-3"><Shield className="w-4 h-4 text-slate-400" /> Vendor: {activity.vendor}</p>
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
          <div><span className="block text-xs text-slate-400 uppercase tracking-wider">Est. Cost</span><span className="font-bold text-slate-800">{activity.price}</span></div>
          <button className="px-4 py-2 bg-sky-50 text-sky-700 font-medium rounded-lg hover:bg-sky-600 hover:text-white transition-colors text-sm">Details</button>
        </div>
      </div>
    </div>
  );
}

function EventsPlaceholder({ title = "Company Calendar", desc = "Your upcoming private events and activities will appear here." }) {
  return (
    <div className="text-center py-20">
      <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-slate-700">{title}</h2>
      <p className="text-slate-500">{desc}</p>
    </div>
  );
}

// ==========================================
// LANDING PAGE (MULTI-PORTAL LOGIN)
// ==========================================
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
        <div className="flex items-center gap-2 text-slate-800 font-bold text-2xl tracking-tight">
          <EvoPathLogo className="w-10 h-10" /> <AnimatedBrandText />
        </div>
        <div className="hidden md:flex gap-6 text-slate-600 font-medium">
          <button onClick={() => handleTabSwitch('admin')} className={`hover:text-indigo-600 ${loginTab === 'admin' ? 'text-indigo-600 font-bold' : ''}`}>System Admin</button>
          <button onClick={() => handleTabSwitch('hr')} className={`hover:text-sky-600 ${loginTab === 'hr' ? 'text-sky-600 font-bold' : ''}`}>For Companies</button>
          <button onClick={() => handleTabSwitch('vendor')} className={`hover:text-emerald-600 ${loginTab === 'vendor' ? 'text-emerald-600 font-bold' : ''}`}>For Vendors</button>
          <button onClick={() => handleTabSwitch('employee')} className={`hover:text-purple-600 ${loginTab === 'employee' ? 'text-purple-600 font-bold' : ''}`}>For Employees</button>
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
              
              const err = !isRegistering
                ? await onAuth('login', { username, pin })
                : await onAuth('register', { role: loginTab, username, pin, companyCode, businessName });

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