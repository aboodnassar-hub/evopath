import React, { useState, useEffect } from 'react';
import { Briefcase, Users, TrendingUp, Search, CheckCircle, Clock, Key, ShieldCheck, XCircle, Trash2, Star, MessageSquare } from 'lucide-react';
import { apiRequest, getAuthToken } from '../../utils/api';
import { Sidebar, MobileHeader, usePinReset, ResetPinModal, ConfirmActionModal } from '../../components/shared';

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
          { id: 'manage-hr', icon: <Briefcase />, label: "Manage Companies" },
          { id: 'approve-vendors', icon: <ShieldCheck />, label: "Manage Vendors" }
        ]}
      />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <MobileHeader setIsOpen={setIsMobileMenuOpen} />
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {activeTab === 'dashboard' && <AdminDashboard />}
          {activeTab === 'manage-hr' && <AdminManageHR usersDB={usersDB} setUsersDB={setUsersDB} />}
          {activeTab === 'approve-vendors' && <AdminApproveVendors usersDB={usersDB} setUsersDB={setUsersDB} />}
        </div>
      </main>
    </div>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState({
    hrCount: 0,
    vendorCount: 0,
    employeeCount: 0,
    pendingVendorCount: 0,
    vendorRatings: [],
    recentFeedback: [],
  });
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [statsMsg, setStatsMsg] = useState("");

  const fetchStats = async () => {
    const token = getAuthToken();

    if (!token) {
      setStatsMsg("Error: Admin token not found. Please login again.");
      return;
    }

    try {
      setIsLoadingStats(true);
      setStatsMsg("");

      const { response, data } = await apiRequest("/admin/stats", { token });

      if (!response.ok) {
        setStatsMsg(`Error: ${data.message || "Failed to load dashboard stats."}`);
        return;
      }

      setStats({
        hrCount: data.hrCount || 0,
        vendorCount: data.vendorCount || 0,
        employeeCount: data.employeeCount || 0,
        pendingVendorCount: data.pendingVendorCount || 0,
        vendorRatings: data.vendorRatings || [],
        recentFeedback: data.recentFeedback || [],
      });
    } catch (error) {
      console.error(error);
      setStatsMsg("Error: Cannot load dashboard stats from backend.");
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <header className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">System Dashboard</h1>
          <p className="text-slate-500 mt-1">Platform overview and real MongoDB user statistics.</p>
        </div>
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm"
        >
          Refresh Stats
        </button>
      </header>

      {statsMsg && (
        <div className={`p-3 text-sm font-bold rounded-lg ${statsMsg.startsWith("Error") ? "bg-red-50 text-red-700" : "bg-sky-50 text-sky-700"}`}>
          {statsMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-700">Total Companies (HR)</h3>
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Briefcase className="w-5 h-5" /></div>
          </div>
          <p className="text-4xl font-black text-slate-800">{isLoadingStats ? "..." : stats.hrCount}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-700">Active Vendors</h3>
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><ShieldCheck className="w-5 h-5" /></div>
          </div>
          <p className="text-4xl font-black text-slate-800">{isLoadingStats ? "..." : stats.vendorCount}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-700">Pending Vendors</h3>
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><Clock className="w-5 h-5" /></div>
          </div>
          <p className="text-4xl font-black text-slate-800">{isLoadingStats ? "..." : stats.pendingVendorCount}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-700">Total Employees</h3>
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Users className="w-5 h-5" /></div>
          </div>
          <p className="text-4xl font-black text-slate-800">{isLoadingStats ? "..." : stats.employeeCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Vendor Ratings</h2>
              <p className="text-sm text-slate-500">Current vendor rating summary from employee feedback.</p>
            </div>
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><Star className="w-5 h-5" /></div>
          </div>
          {stats.vendorRatings.length === 0 ? (
            <p className="text-slate-500 italic py-4">No vendor ratings yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.vendorRatings.map((vendor) => (
                <div key={vendor.vendorId || vendor.vendorCompany} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-slate-800">{vendor.vendorCompany || "Vendor"}</p>
                      <p className="text-xs text-slate-500"><span>{vendor.ratingCount || 0}</span> <span>employee feedback</span></p>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500 font-black">
                      <Star className="w-4 h-4 fill-current" />
                      {Number(vendor.averageRating || 0).toFixed(1)}
                    </div>
                  </div>
                  {(vendor.email || vendor.phone) && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {vendor.email && <p className="break-all rounded-lg bg-white px-3 py-2 text-slate-600"><strong>Email:</strong> {vendor.email}</p>}
                      {vendor.phone && <p className="rounded-lg bg-white px-3 py-2 text-slate-600"><strong>Phone:</strong> {vendor.phone}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Recent Vendor Feedback</h2>
              <p className="text-sm text-slate-500">Latest employee comments across the platform.</p>
            </div>
            <div className="p-2 bg-sky-100 text-sky-600 rounded-lg"><MessageSquare className="w-5 h-5" /></div>
          </div>
          {stats.recentFeedback.length === 0 ? (
            <p className="text-slate-500 italic py-4">No recent feedback yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentFeedback.map((feedback) => (
                <div key={feedback._id || feedback.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-slate-800">{feedback.vendorCompany || "Vendor"}</p>
                      <p className="text-xs text-slate-500">{feedback.eventTitle || "Completed Event"} - {feedback.employeeName || feedback.employeeUsername || "Employee"}</p>
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <Star key={score} className={`w-3.5 h-3.5 ${score <= Number(feedback.rating || 0) ? "fill-current" : "text-slate-300"}`} />
                      ))}
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-600 italic">"{feedback.comment || "No written comment."}"</p>
                </div>
              ))}
            </div>
          )}
        </section>
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
  const [confirmAction, setConfirmAction] = useState(null);
  const [processingDelete, setProcessingDelete] = useState("");

  const fetchCompanies = async () => {
    const token = getAuthToken();

    if (!token) {
      setMsg("Error: Admin token not found. Please login again.");
      return;
    }

    try {
      setIsLoadingCompanies(true);
      const { response, data } = await apiRequest("/admin/hrs", { token });

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

    const token = getAuthToken();
    const company = e.target.company.value.trim();
    const name = e.target.name.value.trim();
    const email = e.target.email.value.trim();
    const phone = e.target.phone.value.trim();

    if (!token) {
      setMsg("Error: Admin token not found. Please login again.");
      return;
    }

    if (!company || !name || !email || !phone) {
      setMsg("Error: HR name, company name, email, and phone are required.");
      return;
    }

    try {
      const { response, data } = await apiRequest("/admin/create-hr", {
        method: "POST",
        token,
        body: { name, company, email, phone },
      });

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
        email: createdHr.email,
        phone: createdHr.phone,
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
        [hr.company, hr.name, hr.username, hr.companyCode, hr.email, hr.phone]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedCompanySearch))
      )
    : hrList;

  const deleteHrCompany = async (hr) => {
    const token = getAuthToken();
    const hrId = hr?._id;

    if (!token) {
      setMsg("Error: Admin token not found. Please login again.");
      return;
    }

    if (!hrId) {
      setMsg("Error: HR company ID is missing.");
      return;
    }

    try {
      setProcessingDelete(hrId);
      const { response, data } = await apiRequest(`/admin/hr/${hrId}`, {
        method: "DELETE",
        token,
      });

      if (!response.ok) {
        setMsg(`Error: ${data.message || "Failed to delete HR company."}`);
        return;
      }

      setMsg("Success: HR company deleted from the system.");
      setUsersDB((prev) => prev.filter((u) => u._id !== hrId && u.companyCode !== hr.companyCode));
      fetchCompanies();
    } catch (error) {
      console.error(error);
      setMsg("Error: Cannot connect to backend. HR company was not deleted.");
    } finally {
      setProcessingDelete("");
      setConfirmAction(null);
    }
  };

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mt-3">
              <div className="bg-white p-3 rounded-xl border border-indigo-100">
                <p className="text-xs text-slate-400 uppercase font-bold">Email</p>
                <p className="font-medium text-slate-800 break-all">{generatedCredentials.email}</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-indigo-100">
                <p className="text-xs text-slate-400 uppercase font-bold">Phone</p>
                <p className="font-medium text-slate-800">{generatedCredentials.phone}</p>
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
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">HR Email</label>
            <input name="email" type="email" required placeholder="e.g. hr@company.com" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">HR Phone</label>
            <input name="phone" type="tel" required placeholder="e.g. +962790000000" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-2" />
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
                  <p className="text-xs text-slate-500 mt-0.5">Email: {hr.email || "N/A"}</p>
                  <p className="text-xs text-slate-500">Phone: {hr.phone || "N/A"}</p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">@{hr.username}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wide">Company Code</p>
                  <p className="font-mono font-bold text-indigo-600">{hr.companyCode}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => handleResetPin(hr.username)}
                  className="w-full py-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm"
                >
                  <Key className="w-4 h-4" /> Reset PIN
                </button>
                <button
                  onClick={() =>
                    setConfirmAction({
                      title: "Delete HR Company?",
                      message: "This HR company and all its employees will be deleted from the system.",
                      confirmLabel: "Delete Company",
                      onConfirm: () => deleteHrCompany(hr),
                    })
                  }
                  disabled={processingDelete === hr._id}
                  className="w-full py-2 bg-red-50 border border-red-100 hover:bg-red-100 text-red-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm disabled:opacity-60"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>
      
      {resetError && <div className="p-3 text-sm font-bold rounded-lg bg-red-50 text-red-700">{resetError}</div>}
      <ResetPinModal resetData={resetData} onClose={() => setResetData(null)} />
      <ConfirmActionModal
        isOpen={Boolean(confirmAction)}
        title={confirmAction?.title}
        message={confirmAction?.message}
        confirmLabel={confirmAction?.confirmLabel}
        isProcessing={Boolean(processingDelete)}
        onCancel={() => setConfirmAction(null)}
        onConfirm={confirmAction?.onConfirm}
      />
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
  const [processingVendor, setProcessingVendor] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);

  const fetchVendors = async () => {
    const token = getAuthToken();

    if (!token) {
      setMsg("Error: Admin token not found. Please login again.");
      return;
    }

    try {
      setIsLoading(true);
      const [pendingResult, activeResult] = await Promise.all([
        apiRequest("/admin/pending-vendors", { token }),
        apiRequest("/admin/vendors", { token }),
      ]);

      const { response: pendingResponse, data: pendingData } = pendingResult;
      const { response: activeResponse, data: activeData } = activeResult;

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
        [vendor.company, vendor.name, vendor.username, vendor.email, vendor.phone]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedVendorSearch))
      )
    : activeVendors;

  const handleApprove = async (username) => {
    const token = getAuthToken();

    if (!token) {
      setMsg("Error: Admin token not found. Please login again.");
      return;
    }

    try {
      setProcessingVendor(username);
      const { response, data } = await apiRequest("/admin/approve-vendor", {
        method: "POST",
        token,
        body: { username },
      });

      if (!response.ok) {
        setMsg(`Error: ${data.message || "Failed to approve vendor."}`);
        return;
      }

      setMsg("Success: Vendor approved successfully.");
      fetchVendors();
    } catch (error) {
      console.error(error);
      setMsg("Error: Cannot connect to backend. Vendor was not approved.");
    } finally {
      setProcessingVendor("");
    }
  };

  const rejectPendingVendor = async (username) => {
    const token = getAuthToken();

    if (!token) {
      setMsg("Error: Admin token not found. Please login again.");
      return;
    }

    try {
      setProcessingVendor(username);
      const { response, data } = await apiRequest("/admin/reject-vendor", {
        method: "POST",
        token,
        body: { username },
      });

      if (!response.ok) {
        setMsg(`Error: ${data.message || "Failed to reject vendor."}`);
        return;
      }

      setMsg("Success: Vendor rejected and deleted from the system.");
      fetchVendors();
    } catch (error) {
      console.error(error);
      setMsg("Error: Cannot connect to backend. Vendor was not rejected.");
    } finally {
      setProcessingVendor("");
      setConfirmAction(null);
    }
  };

  const deleteActiveVendor = async (vendor) => {
    const token = getAuthToken();
    const vendorId = vendor?._id;

    if (!token) {
      setMsg("Error: Admin token not found. Please login again.");
      return;
    }

    if (!vendorId) {
      setMsg("Error: Vendor ID is missing.");
      return;
    }

    try {
      setProcessingVendor(vendor.username);
      const { response, data } = await apiRequest(`/admin/vendors/${vendorId}`, {
        method: "DELETE",
        token,
      });

      if (!response.ok) {
        setMsg(`Error: ${data.message || "Failed to delete vendor."}`);
        return;
      }

      setMsg("Success: Vendor deleted from the system.");
      setUsersDB((prev) => prev.filter((u) => u._id !== vendorId));
      fetchVendors();
    } catch (error) {
      console.error(error);
      setMsg("Error: Cannot connect to backend. Vendor was not deleted.");
    } finally {
      setProcessingVendor("");
      setConfirmAction(null);
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
                  <p className="text-xs text-slate-600">Email: {vendor.email || "N/A"}</p>
                  <p className="text-xs text-slate-600">Phone: {vendor.phone || "N/A"}</p>
                  <p className="text-xs text-amber-700 font-bold mt-1 uppercase tracking-wide">Status: {vendor.status}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                  <button
                    onClick={() => handleApprove(vendor.username)}
                    disabled={processingVendor === vendor.username}
                    className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow-sm hover:bg-emerald-700 transition-colors w-full md:w-auto disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {processingVendor === vendor.username ? "Processing..." : "Approve Vendor"}
                  </button>
                  <button
                    onClick={() =>
                      setConfirmAction({
                        title: "Reject Vendor?",
                        message: "This pending vendor account will be deleted from the system.",
                        confirmLabel: "Reject Vendor",
                        onConfirm: () => rejectPendingVendor(vendor.username),
                      })
                    }
                    disabled={processingVendor === vendor.username}
                    className="px-6 py-2 bg-red-600 text-white font-bold rounded-xl shadow-sm hover:bg-red-700 transition-colors w-full md:w-auto disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject Vendor
                  </button>
                </div>
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
                    <p className="text-xs text-slate-500 break-all">Email: {vendor.email || "N/A"}</p>
                    <p className="text-xs text-slate-500">Phone: {vendor.phone || "N/A"}</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">@{vendor.username}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleResetPin(vendor.username)}
                  className="w-full py-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm"
                >
                  <Key className="w-4 h-4" /> Reset PIN
                </button>
                <button
                  onClick={() =>
                    setConfirmAction({
                      title: "Delete Vendor?",
                      message: "This active vendor and its related activities/bookings will be deleted from the system.",
                      confirmLabel: "Delete Vendor",
                      onConfirm: () => deleteActiveVendor(vendor),
                    })
                  }
                  disabled={processingVendor === vendor.username}
                  className="mt-2 w-full py-2 bg-red-50 border border-red-100 hover:bg-red-100 text-red-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm disabled:opacity-60"
                >
                  <Trash2 className="w-4 h-4" /> Delete Vendor
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {resetError && <div className="p-3 text-sm font-bold rounded-lg bg-red-50 text-red-700">{resetError}</div>}
      <ResetPinModal resetData={resetData} onClose={() => setResetData(null)} />
      <ConfirmActionModal
        isOpen={Boolean(confirmAction)}
        title={confirmAction?.title}
        message={confirmAction?.message}
        confirmLabel={confirmAction?.confirmLabel}
        isProcessing={Boolean(processingVendor)}
        onCancel={() => setConfirmAction(null)}
        onConfirm={confirmAction?.onConfirm}
      />
    </div>
  );
}


// ==========================================
// 1. HR PORTAL (COMPANY ADMIN)

export { AdminPortal, AdminDashboard, AdminManageHR, AdminApproveVendors };
