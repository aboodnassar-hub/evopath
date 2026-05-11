import React, { useState, useEffect } from 'react';
import { Briefcase, Map as MapIcon, Heart, Calendar, Users, 
  TrendingUp, Search, Star,
  Award, X,
  Vote, CheckCircle, MessageSquare,
  PlusCircle, Send, DollarSign, AlignLeft,
  Clock, Key, Trash2, History } from 'lucide-react';
import { API_BASE_URL } from '../../utils/constants';
import { Sidebar, MobileHeader, usePinReset, ResetPinModal, ConfirmActionModal, TeamPolling, ActivityCard } from '../../components/shared';

const isDateReached = (dateValue) => {
  if (!dateValue) return false;
  const eventDate = new Date(dateValue);
  if (Number.isNaN(eventDate.getTime())) return false;
  const today = new Date();
  eventDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return eventDate <= today;
};

function HrPortal({ user, onLogout, activities, setActivities, usersDB, setUsersDB }) {
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
          { id: 'volunteering', icon: <Heart />, label: "Volunteering" },
          { id: 'polling', icon: <Vote />, label: "Team Polling" },
          { id: 'events', icon: <Calendar />, label: "My Company Events" },
          { id: 'history', icon: <History />, label: "History" }
        ]}
      />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <MobileHeader setIsOpen={setIsMobileMenuOpen} />
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {activeTab === 'dashboard' && <HrDashboard user={user} setTab={setActiveTab} />}
          {activeTab === 'manage-team' && <HrManageEmployees user={user} usersDB={usersDB} setUsersDB={setUsersDB} />}
          {activeTab === 'marketplace' && <Marketplace activities={activities} user={user} />}
          {activeTab === 'custom' && <CustomRequest />}
          {activeTab === 'volunteering' && <HrVolunteering />}
          {activeTab === 'polling' && <TeamPolling role="hr" />}
          {activeTab === 'events' && <HrCompanyEvents />}
          {activeTab === 'history' && <HrHistory />}
        </div>
      </main>
    </div>
  );
}

function HrDashboard({ user, setTab }) {
  const [profile, setProfile] = useState(user);
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [vendorRatings, setVendorRatings] = useState([]);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const fetchDashboardFeedback = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setFeedbackMsg("");
      const response = await fetch(`${API_BASE_URL}/hr/feedback`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        setFeedbackMsg(data.message || "Failed to load employee feedback.");
        return;
      }

      setFeedbackItems(Array.isArray(data.feedback) ? data.feedback : []);
      setVendorRatings(Array.isArray(data.vendorRatings) ? data.vendorRatings : []);
    } catch (error) {
      console.error("Failed to refresh HR feedback:", error);
      setFeedbackMsg("Cannot load employee feedback from backend.");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${API_BASE_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.user) {
          setProfile(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        }
      })
      .catch((error) => console.error("Failed to refresh HR profile:", error));

    fetchDashboardFeedback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const cultureScore = profile.culturePoints || profile.cultureScore || 0;
  const volunteerImpact = profile.personalVolunteerHours || profile.volunteerHours || 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user.name.split(' ')[0]}</h1>
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
            <p className="text-3xl font-bold text-slate-800">{cultureScore}</p>
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +10 when HR and Vendor complete an event</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-xl"><Award className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Volunteer Impact</p>
            <p className="text-3xl font-bold text-slate-800">{volunteerImpact} <span className="text-lg text-slate-400">hrs</span></p>
            <p className="text-xs text-slate-500 mt-1">Completed volunteer hours</p>
          </div>
        </div>
      </div>

      <HrBookingDrilldown />

      <div className="mb-8">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4"><MessageSquare className="w-5 h-5 text-emerald-500" /> Recent Feedback</h2>
          <div className="flex-1 space-y-4">
            {feedbackMsg && (
              <div className="bg-red-50 text-red-700 p-3 rounded-xl border border-red-100 text-sm font-bold">
                {feedbackMsg}
              </div>
            )}

            {vendorRatings.length > 0 && (
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                <p className="text-xs font-black uppercase tracking-wider text-emerald-700 mb-2">Vendor Ratings</p>
                <div className="space-y-2">
                  {vendorRatings.slice(0, 3).map((vendor) => (
                    <div key={vendor.vendorId} className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-bold text-slate-700 truncate">{vendor.vendorCompany || "Vendor"}</span>
                      <span className="font-black text-emerald-700 whitespace-nowrap">{Number(vendor.averageRating || 0).toFixed(1)} / 5</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {feedbackItems.length === 0 && !feedbackMsg && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                <p className="text-sm font-bold text-slate-700">No feedback submitted yet.</p>
                <p className="text-xs text-slate-500 mt-1">Employee feedback will appear after completed events.</p>
              </div>
            )}

            {feedbackItems.slice(0, 3).map((feedback) => (
              <div key={feedback.id || feedback._id} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span className="text-xs font-bold text-slate-700 truncate">{feedback.employeeName || feedback.employeeUsername || "Employee"}</span>
                  <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map((score) => (
                      <Star key={score} className={`w-3 h-3 ${score <= Number(feedback.rating || 0) ? "fill-current" : "text-slate-300"}`} />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-500 mb-1">
                  <span>{feedback.vendorCompany || "Vendor"}</span> <span>-</span> <span>{feedback.eventTitle || "Completed Event"}</span>
                </p>
                <p className="text-sm text-slate-600 italic">"{feedback.comment || "No written comment."}"</p>
              </div>
            ))}
          </div>
          <button onClick={() => setTab('polling')} className="mt-4 w-full py-2 bg-sky-50 text-sky-700 text-sm font-medium rounded-lg hover:bg-sky-100 transition-colors">
            Ask for new feedback
          </button>
        </div>
      </div>
    </div>
  );
}


function HrBookingDrilldown() {
  const [bookings, setBookings] = useState([]);
  const [customRequests, setCustomRequests] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("confirmed");
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);

  const fetchBookings = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMsg("Error: HR token not found. Please login again.");
      return;
    }

    try {
      setIsLoading(true);
      setMsg("");
      const [bookingsResponse, requestsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/hr/bookings`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/hr/custom-requests`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const bookingsData = await bookingsResponse.json();
      const requestsData = await requestsResponse.json();

      if (!bookingsResponse.ok) {
        setMsg(`Error: ${bookingsData.message || "Failed to load booking overview."}`);
        return;
      }

      if (!requestsResponse.ok) {
        setMsg(`Error: ${requestsData.message || "Failed to load custom requests."}`);
        return;
      }

      setBookings(bookingsData.bookings || []);
      setCustomRequests(requestsData.customRequests || []);
    } catch (error) {
      console.error(error);
      setMsg("Error: Cannot load booking overview from backend.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteRejectedItem = async (item) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMsg("Error: HR token not found. Please login again.");
      return;
    }

    const endpoint =
      item.kind === "custom-request"
        ? `/hr/custom-requests/${item.id}`
        : `/hr/bookings/${item.id}`;

    try {
      setActionLoading(item.key);
      setMsg("");
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        setMsg(`Error: ${data.message || "Failed to delete rejected request."}`);
        return;
      }

      setMsg("Success: Rejected request deleted.");
      setConfirmAction(null);
      fetchBookings();
    } catch (error) {
      console.error(error);
      setMsg("Error: Cannot connect to backend. Rejected request was not deleted.");
    } finally {
      setActionLoading("");
    }
  };

  const customRequestByBookingId = new Map(
    customRequests
      .filter((request) => request.approvedBookingId)
      .map((request) => [String(request.approvedBookingId), request])
  );

  const bookingItems = bookings.map((booking) => {
    const relatedCustomRequest = customRequestByBookingId.get(String(booking._id));

    return {
      key: `booking-${booking._id}`,
      id: booking._id,
      kind: "booking",
      status: booking.status,
      title: booking.activityTitle,
      vendorCompany: booking.vendorCompany || relatedCustomRequest?.targetVendorCompany || "N/A",
      vendorEmail: booking.vendorEmail || relatedCustomRequest?.targetVendorEmail || "",
      vendorPhone: booking.vendorPhone || relatedCustomRequest?.targetVendorPhone || "",
      date: booking.eventDate,
      participants: booking.participants,
      source: relatedCustomRequest || booking.source === "custom-request" ? "Custom Request" : "Vendor Activity",
    };
  });

  const customRequestItems = customRequests
    .filter((request) => request.status !== "approved" || !request.approvedBookingId)
    .map((request) => ({
      key: `custom-request-${request._id}`,
      id: request._id,
      kind: "custom-request",
      status: request.status,
      title: request.title,
      vendorCompany: request.vendorCompany || request.targetVendorCompany || "N/A",
      vendorEmail: request.vendorEmail || request.targetVendorEmail || "",
      vendorPhone: request.vendorPhone || request.targetVendorPhone || "",
      date: request.targetDate,
      participants: request.participants,
      source: "Custom Request",
    }));

  const overviewItems = [...bookingItems, ...customRequestItems];
  const confirmed = overviewItems.filter((item) => ["confirmed", "approved"].includes(item.status));
  const pending = overviewItems.filter((item) => item.status === "pending");
  const rejected = overviewItems.filter((item) => item.status === "rejected");
  const visibleBookings = selectedStatus === "confirmed" ? confirmed : selectedStatus === "pending" ? pending : rejected;
  const visibleTitle = selectedStatus === "confirmed" ? "Approved Events" : selectedStatus === "pending" ? "Pending Requests" : "Rejected Requests";

  return (
    <section className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Calendar className="w-5 h-5 text-sky-500" /> Booking Drilldown</h2>
          <p className="text-sm text-slate-500">Click any counter to see the related bookings.</p>
        </div>
        <button onClick={fetchBookings} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm">
          Refresh
        </button>
      </div>

      {msg && <div className={`p-3 text-sm font-bold rounded-lg mb-4 ${msg.startsWith("Error") ? "bg-red-50 text-red-700" : "bg-sky-50 text-sky-700"}`}>{msg}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <button type="button" onClick={() => setSelectedStatus("confirmed")} className={`text-left p-4 rounded-2xl border transition-all ${selectedStatus === "confirmed" ? "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-100" : "bg-slate-50 border-slate-100 hover:border-emerald-200"}`}>
          <p className="text-xs uppercase font-bold text-slate-400">Approved</p>
          <p className="text-3xl font-black text-emerald-600 mt-1">{confirmed.length}</p>
        </button>
        <button type="button" onClick={() => setSelectedStatus("pending")} className={`text-left p-4 rounded-2xl border transition-all ${selectedStatus === "pending" ? "bg-amber-50 border-amber-300 ring-2 ring-amber-100" : "bg-slate-50 border-slate-100 hover:border-amber-200"}`}>
          <p className="text-xs uppercase font-bold text-slate-400">Pending</p>
          <p className="text-3xl font-black text-amber-600 mt-1">{pending.length}</p>
        </button>
        <button type="button" onClick={() => setSelectedStatus("rejected")} className={`text-left p-4 rounded-2xl border transition-all ${selectedStatus === "rejected" ? "bg-red-50 border-red-300 ring-2 ring-red-100" : "bg-slate-50 border-slate-100 hover:border-red-200"}`}>
          <p className="text-xs uppercase font-bold text-slate-400">Rejected</p>
          <p className="text-3xl font-black text-red-600 mt-1">{rejected.length}</p>
        </button>
      </div>

      {isLoading ? (
        <p className="text-slate-500 italic">Loading booking overview...</p>
      ) : visibleBookings.length === 0 ? (
        <p className="text-slate-500 italic">No {visibleTitle.toLowerCase()} found.</p>
      ) : (
        <div>
          <h3 className="font-bold text-slate-800 mb-3">{visibleTitle}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {visibleBookings.map((item) => (
              <div key={item.key} className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-800">{item.title}</p>
                    <p className="text-xs text-slate-500">Vendor: {item.vendorCompany}</p>
                    {(item.vendorEmail || item.vendorPhone) && (
                      <p className="text-xs text-slate-500">
                        {item.vendorEmail && <span className="break-all">{item.vendorEmail}</span>}
                        {item.vendorEmail && item.vendorPhone && <span> - </span>}
                        {item.vendorPhone && <span>{item.vendorPhone}</span>}
                      </p>
                    )}
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${item.source === "Custom Request" ? "bg-sky-100 text-sky-700" : "bg-emerald-100 text-emerald-700"}`}>
                    {item.source}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">Date: {item.date || "N/A"}</p>
                <p className="text-xs text-slate-500">Participants: {item.participants}</p>
                {item.status === "rejected" && (
                  <button
                    type="button"
                    onClick={() =>
                      setConfirmAction({
                        title: "Delete Rejected Request?",
                        message: "This rejected request will be removed from your drilldown view.",
                        confirmLabel: "Delete Request",
                        onConfirm: () => deleteRejectedItem(item),
                      })
                    }
                    disabled={actionLoading === item.key}
                    className="mt-3 px-3 py-2 bg-red-50 text-red-700 text-xs font-bold rounded-lg hover:bg-red-100 disabled:bg-slate-100 disabled:text-slate-400 transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      <ConfirmActionModal
        isOpen={Boolean(confirmAction)}
        title={confirmAction?.title}
        message={confirmAction?.message}
        confirmLabel={confirmAction?.confirmLabel}
        isProcessing={Boolean(actionLoading)}
        onCancel={() => setConfirmAction(null)}
        onConfirm={confirmAction?.onConfirm}
      />
    </section>
  );
}

function HrManageEmployees({ user, usersDB, setUsersDB }) {
  const { resetData, setResetData, resetError, handleResetPin } = usePinReset();
  const [team, setTeam] = useState([]);
  const [teamMsg, setTeamMsg] = useState("");
  const [isLoadingTeam, setIsLoadingTeam] = useState(false);
  const [teamSearch, setTeamSearch] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);
  const [processingEmployee, setProcessingEmployee] = useState("");

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

  const deleteEmployee = async (employee) => {
    const token = localStorage.getItem("token");
    const employeeId = employee?._id;

    if (!token) {
      setTeamMsg("Error: HR token not found. Please login again.");
      return;
    }

    if (!employeeId) {
      setTeamMsg("Error: Employee ID is missing.");
      return;
    }

    try {
      setProcessingEmployee(employeeId);
      const response = await fetch(`${API_BASE_URL}/hr/employees/${employeeId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        setTeamMsg(`Error: ${data.message || "Failed to delete employee."}`);
        return;
      }

      setTeamMsg("Success: Employee deleted from the system.");
      setTeam((currentTeam) => currentTeam.filter((emp) => emp._id !== employeeId));
      setUsersDB((prev) => prev.filter((u) => u._id !== employeeId));
    } catch (error) {
      console.error(error);
      setTeamMsg("Error: Cannot connect to backend. Employee was not deleted.");
    } finally {
      setProcessingEmployee("");
      setConfirmAction(null);
    }
  };

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
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => handleResetPin(emp.username)}
                    className="w-full py-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Key className="w-4 h-4" /> Reset PIN
                  </button>
                  <button
                    onClick={() =>
                      setConfirmAction({
                        title: "Delete Employee?",
                        message: "This employee will be deleted from your company and removed from related activities.",
                        confirmLabel: "Delete Employee",
                        onConfirm: () => deleteEmployee(emp),
                      })
                    }
                    disabled={processingEmployee === emp._id}
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

      <ResetPinModal resetData={resetData} onClose={() => setResetData(null)} />
      <ConfirmActionModal
        isOpen={Boolean(confirmAction)}
        title={confirmAction?.title}
        message={confirmAction?.message}
        confirmLabel={confirmAction?.confirmLabel}
        isProcessing={Boolean(processingEmployee)}
        onCancel={() => setConfirmAction(null)}
        onConfirm={confirmAction?.onConfirm}
      />
    </div>
  );
}

// ==========================================
// 2. VENDOR PORTAL
// ==========================================

function HrCompanyEvents() {
  const [bookings, setBookings] = useState([]);
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("confirmed");
  const [employeeCaps, setEmployeeCaps] = useState({});
  const [publishingId, setPublishingId] = useState("");

  const fetchHrBookings = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMsg("Error: HR token not found. Please login again.");
      return;
    }

    try {
      setIsLoading(true);
      setMsg("");

      const response = await fetch(`${API_BASE_URL}/hr/bookings`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        setMsg(`Error: ${data.message || "Failed to load events."}`);
        return;
      }

      setBookings(data.bookings || []);
    } catch (error) {
      console.error(error);
      setMsg("Error: Cannot load company events from backend.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHrBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getEmployeeEventInfo = (booking) => {
    const publishedEvent = booking.employeeEvent || booking.publishedEvent || booking.employeePublishedEvent || {};
    const participantList = Array.isArray(publishedEvent.participants)
      ? publishedEvent.participants
      : Array.isArray(booking.employeeParticipants)
      ? booking.employeeParticipants
      : [];
    const joinedCount = Number(
      publishedEvent.participantCount ??
      booking.employeeParticipantCount ??
      booking.joinedEmployeesCount ??
      participantList.length ??
      0
    );
    const maxParticipants = Number(
      publishedEvent.maxParticipants ??
      booking.employeeMaxParticipants ??
      booking.maxEmployeeParticipants ??
      booking.participants ??
      0
    );
    const isPublished = Boolean(
      booking.publishedToEmployees ||
      booking.isPublishedToEmployees ||
      booking.employeeEventId ||
      publishedEvent._id
    );
    const isClosed = Boolean(
      publishedEvent.status === "closed" ||
      booking.employeeEventStatus === "closed" ||
      (maxParticipants > 0 && joinedCount >= maxParticipants)
    );

    return { isPublished, isClosed, joinedCount, maxParticipants };
  };

  const publishBookingToEmployees = async (booking) => {
    const token = localStorage.getItem("token");
    const bookingId = booking._id || booking.id;
    const requestedParticipants = Number(booking.participants || 0);
    const maxParticipants = Number(employeeCaps[bookingId] || requestedParticipants);

    if (!token) {
      setMsg("Error: HR token not found. Please login again.");
      return;
    }

    if (!maxParticipants || maxParticipants <= 0) {
      setMsg("Error: Please enter a valid employee capacity.");
      return;
    }

    if (requestedParticipants > 0 && maxParticipants > requestedParticipants) {
      setMsg("Error: Employee capacity cannot exceed the requested participants.");
      return;
    }

    try {
      setPublishingId(bookingId);
      setMsg("");
      const response = await fetch(`${API_BASE_URL}/hr/bookings/${bookingId}/publish-to-employees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ maxParticipants }),
      });
      const data = await response.json();

      if (!response.ok) {
        setMsg(`Error: ${data.message || "Failed to publish event to employees."}`);
        return;
      }

      setMsg("Success: Event published to employees.");
      fetchHrBookings();
    } catch (error) {
      console.error(error);
      setMsg("Error: Cannot connect to backend. Event was not published to employees.");
    } finally {
      setPublishingId("");
    }
  };

  const updateBookingAction = async (booking, action) => {
    const token = localStorage.getItem("token");
    const bookingId = booking._id || booking.id;

    if (!token) {
      setMsg("Error: HR token not found. Please login again.");
      return;
    }

    try {
      setPublishingId(`${action}-${bookingId}`);
      setMsg("");
      const response = await fetch(`${API_BASE_URL}/hr/bookings/${bookingId}/${action}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        setMsg(`Error: ${data.message || `Failed to ${action} event.`}`);
        return;
      }

      setMsg(action === "complete" ? "Success: HR completion saved." : "Success: Event withdrawn from HR and employees.");
      fetchHrBookings();
    } catch (error) {
      console.error(error);
      setMsg(`Error: Cannot connect to backend. Event was not ${action === "complete" ? "completed" : "withdrawn"}.`);
    } finally {
      setPublishingId("");
    }
  };

  const confirmedBookings = bookings.filter((booking) => booking.status === "confirmed");
  const pendingBookings = bookings.filter((booking) => booking.status === "pending");
  const rejectedBookings = bookings.filter((booking) => booking.status === "rejected");
  const visibleBookings =
    selectedStatus === "confirmed"
      ? confirmedBookings
      : selectedStatus === "pending"
      ? pendingBookings
      : rejectedBookings;
  const visibleTitle =
    selectedStatus === "confirmed"
      ? "Active Events / Trips"
      : selectedStatus === "pending"
      ? "Pending Requests"
      : "Rejected Requests";

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Company Events</h1>
          <p className="text-slate-500 mt-1">Confirmed vendor-approved bookings become active events here.</p>
        </div>
        <button onClick={fetchHrBookings} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm">
          Refresh Events
        </button>
      </header>

      {msg && <div className={`p-3 text-sm font-bold rounded-lg ${msg.startsWith("Error") ? "bg-red-50 text-red-700" : "bg-sky-50 text-sky-700"}`}>{msg}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button type="button" onClick={() => setSelectedStatus("confirmed")} className={`text-left bg-white p-5 rounded-2xl border shadow-sm transition-all ${selectedStatus === "confirmed" ? "border-emerald-300 ring-2 ring-emerald-100" : "border-slate-100 hover:border-emerald-200"}`}>
          <p className="text-xs uppercase font-bold text-slate-400">Active Events / Trips</p>
          <p className="text-3xl font-black text-emerald-600 mt-2">{confirmedBookings.length}</p>
          <p className="text-xs text-slate-400 mt-1">Click to view approved bookings</p>
        </button>
        <button type="button" onClick={() => setSelectedStatus("pending")} className={`text-left bg-white p-5 rounded-2xl border shadow-sm transition-all ${selectedStatus === "pending" ? "border-amber-300 ring-2 ring-amber-100" : "border-slate-100 hover:border-amber-200"}`}>
          <p className="text-xs uppercase font-bold text-slate-400">Pending Requests</p>
          <p className="text-3xl font-black text-amber-600 mt-2">{pendingBookings.length}</p>
          <p className="text-xs text-slate-400 mt-1">Click to view pending requests</p>
        </button>
        <button type="button" onClick={() => setSelectedStatus("rejected")} className={`text-left bg-white p-5 rounded-2xl border shadow-sm transition-all ${selectedStatus === "rejected" ? "border-red-300 ring-2 ring-red-100" : "border-slate-100 hover:border-red-200"}`}>
          <p className="text-xs uppercase font-bold text-slate-400">Rejected Requests</p>
          <p className="text-3xl font-black text-red-600 mt-2">{rejectedBookings.length}</p>
          <p className="text-xs text-slate-400 mt-1">Rejected bookings are removed by default</p>
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 italic">Loading events...</p>
        </div>
      ) : visibleBookings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-700">No {visibleTitle}</h2>
          <p className="text-slate-500">Choose another counter above to drill down into a different status.</p>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-4">{visibleTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleBookings.map((booking) => (
            <div key={booking._id || booking.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-black text-lg text-slate-900">{booking.activityTitle}</h3>
                  <p className="text-sm text-slate-500">Vendor: {booking.vendorCompany}</p>
                  {(booking.vendorEmail || booking.vendorPhone) && (
                    <p className="text-xs text-slate-500">
                      {booking.vendorEmail && <span className="break-all">{booking.vendorEmail}</span>}
                      {booking.vendorEmail && booking.vendorPhone && <span> - </span>}
                      {booking.vendorPhone && <span>{booking.vendorPhone}</span>}
                    </p>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${booking.status === "confirmed" ? "bg-green-100 text-green-700" : booking.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{booking.status === "confirmed" ? "Active" : booking.status}</span>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-slate-600"><strong>Date:</strong> {booking.eventDate || "N/A"}</p>
                <p className="text-slate-600"><strong>Participants:</strong> {booking.participants}</p>
                <p className="text-slate-600"><strong>Status:</strong> {booking.status === "confirmed" ? "Confirmed by vendor" : booking.status === "pending" ? "Waiting for vendor response" : "Rejected by vendor"}</p>
              </div>
              {booking.status === "confirmed" && (() => {
                const bookingId = booking._id || booking.id;
                const employeeEventInfo = getEmployeeEventInfo(booking);
                const participantThresholdReached = employeeEventInfo.isPublished && employeeEventInfo.maxParticipants > 0 && employeeEventInfo.joinedCount >= employeeEventInfo.maxParticipants;
                const canComplete = isDateReached(booking.eventDate) && participantThresholdReached;
                const hrCompleted = Boolean(booking.hrCompletedAt);
                const vendorCompleted = Boolean(booking.vendorCompletedAt);
                return (
                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
                      <span className={`rounded-lg px-3 py-2 font-bold ${hrCompleted ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-500"}`}>
                        HR: {hrCompleted ? "Completed" : "Pending"}
                      </span>
                      <span className={`rounded-lg px-3 py-2 font-bold ${vendorCompleted ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-500"}`}>
                        Vendor: {vendorCompleted ? "Completed" : "Pending"}
                      </span>
                    </div>
                    {employeeEventInfo.isPublished ? (
                      <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-black text-emerald-800">Published to Employees</p>
                            <p className="text-xs text-emerald-700 mt-1">{employeeEventInfo.joinedCount}/{employeeEventInfo.maxParticipants} employees joined</p>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${employeeEventInfo.isClosed ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                            {employeeEventInfo.isClosed ? "Closed" : "Open"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 rounded-xl border border-sky-100 bg-sky-50 p-4">
                        <div>
                          <label className="mb-1 block text-xs font-black uppercase tracking-wide text-sky-700">Employee Capacity</label>
                          <input
                            type="number"
                            min="1"
                            max={booking.participants || undefined}
                            value={employeeCaps[bookingId] ?? booking.participants ?? ""}
                            onChange={(e) => setEmployeeCaps((prev) => ({ ...prev, [bookingId]: e.target.value }))}
                            className="w-full rounded-xl border border-sky-100 px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                          />
                          <p className="mt-1 text-xs text-slate-500">Maximum allowed: {booking.participants || "N/A"}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => publishBookingToEmployees(booking)}
                          disabled={publishingId === bookingId}
                          className="w-full rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-sky-100 transition-colors hover:bg-sky-700 disabled:bg-slate-300"
                        >
                          {publishingId === bookingId ? "Publishing..." : "Publish to Employees"}
                        </button>
                      </div>
                    )}
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => updateBookingAction(booking, "complete")}
                        disabled={!canComplete || hrCompleted || publishingId === `complete-${bookingId}`}
                        className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-100 transition-colors hover:bg-emerald-700 disabled:bg-slate-300"
                      >
                        {hrCompleted ? "Completed by HR" : canComplete ? "Completed" : !participantThresholdReached ? "Waiting for Participants" : "Available on Event Date"}
                      </button>
                      <button
                        type="button"
                        onClick={() => updateBookingAction(booking, "withdraw")}
                        disabled={publishingId === `withdraw-${bookingId}` || hrCompleted || vendorCompleted}
                        className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition-colors hover:bg-red-100 disabled:bg-slate-100 disabled:text-slate-400"
                      >
                        {publishingId === `withdraw-${bookingId}` ? "Withdrawing..." : "Withdraw"}
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BookingDetailsModal({ activity, user, onClose }) {
  const [participants, setParticipants] = useState("");
  const [bookingMsg, setBookingMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!activity) return null;

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      setBookingMsg("Error: HR token not found. Please login again.");
      return;
    }

    if (!participants || Number(participants) <= 0) {
      setBookingMsg("Error: Please enter a valid number of participants.");
      return;
    }

    try {
      setIsSubmitting(true);
      setBookingMsg("");

      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          activityId: activity._id || activity.id,
          participants: Number(participants),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setBookingMsg(`Error: ${data.message || "Failed to send booking request."}`);
        return;
      }

      setBookingMsg("Success: Booking request sent to the vendor.");
      setParticipants("");
    } catch (error) {
      console.error(error);
      setBookingMsg("Error: Cannot connect to backend. Booking was not sent.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-sky-600 mb-1">Activity Details</p>
            <h3 className="text-2xl font-black text-slate-900">{activity.title}</h3>
            <p className="text-sm text-slate-500 mt-1">Vendor: {activity.vendor}</p>
            {(activity.vendorEmail || activity.vendorPhone) && (
              <p className="text-xs text-slate-500 mt-1">
                {activity.vendorEmail && <span className="break-all">{activity.vendorEmail}</span>}
                {activity.vendorEmail && activity.vendorPhone && <span> - </span>}
                {activity.vendorPhone && <span>{activity.vendorPhone}</span>}
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmitBooking} className="p-6 space-y-6">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <h4 className="font-bold text-slate-800 mb-3">Auto-filled HR Contact Info</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="bg-white p-3 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-400 uppercase font-bold">Company</p>
                <p className="font-bold text-slate-800">{user.company || "N/A"}</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-400 uppercase font-bold">HR Contact</p>
                <p className="font-bold text-slate-800">{user.name || "N/A"}</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-400 uppercase font-bold">Email</p>
                <p className="font-medium text-slate-700 break-all">{user.email || "N/A"}</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-400 uppercase font-bold">Phone</p>
                <p className="font-medium text-slate-700">{user.phone || "N/A"}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-sky-50 p-4 rounded-2xl border border-sky-100">
              <p className="text-xs text-sky-700 uppercase font-bold mb-1">Estimated Cost</p>
              <p className="text-lg font-black text-slate-800">{activity.price}</p>
            </div>
            <div className="bg-sky-50 p-4 rounded-2xl border border-sky-100">
              <p className="text-xs text-sky-700 uppercase font-bold mb-1">Duration</p>
              <p className="text-lg font-black text-slate-800">{activity.duration || "N/A"}</p>
            </div>
            <div className="bg-sky-50 p-4 rounded-2xl border border-sky-100">
              <p className="text-xs text-sky-700 uppercase font-bold mb-1">Event Date</p>
              <p className="text-lg font-black text-slate-800">{activity.eventDate || "N/A"}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Number of Participants</label>
            <input
              type="number"
              min="1"
              required
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              placeholder="e.g. 35"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
            />
          </div>

          {bookingMsg && (
            <div className={`p-3 text-sm font-bold rounded-lg ${bookingMsg.startsWith("Error") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
              {bookingMsg}
            </div>
          )}

          <div className="flex flex-col md:flex-row justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">
              Close
            </button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-3 bg-sky-600 text-white font-bold rounded-xl hover:bg-sky-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              <Send className="w-5 h-5" /> {isSubmitting ? "Sending..." : "Send Booking Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Marketplace({ activities, user }) {
  const [filter, setFilter] = useState('all');
  const [selectedActivity, setSelectedActivity] = useState(null);
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
          <button onClick={() => setFilter('trips')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'trips' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Trips</button>
          <button onClick={() => setFilter('events')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'events' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Office Events</button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredActivities.map(activity => (
          <ActivityCard key={activity._id || activity.id} activity={activity} onDetails={() => setSelectedActivity(activity)} />
        ))}
      </div>
      <BookingDetailsModal activity={selectedActivity} user={user} onClose={() => setSelectedActivity(null)} />
    </div>
  );
}


function CustomRequest() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [msg, setMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myRequests, setMyRequests] = useState([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [isLoadingVendors, setIsLoadingVendors] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [deletingRequestId, setDeletingRequestId] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);

  const fetchMyCustomRequests = async () => {
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      setIsLoadingRequests(true);
      const response = await fetch(`${API_BASE_URL}/hr/custom-requests`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setMyRequests(data.customRequests || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const fetchVendors = async () => {
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      setIsLoadingVendors(true);
      const response = await fetch(`${API_BASE_URL}/hr/vendors`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (response.ok) {
        setVendors(data.vendors || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingVendors(false);
    }
  };

  useEffect(() => {
    fetchMyCustomRequests();
    fetchVendors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      setMsg("Error: HR token not found. Please login again.");
      return;
    }

    const form = e.target;
    const requestBody = {
      title: form.title.value.trim(),
      category: form.category.value,
      budget: form.budget.value.trim(),
      participants: Number(form.participants.value),
      targetDate: form.targetDate.value,
      requirements: form.requirements.value.trim(),
      targetVendorId: form.targetVendorId.value,
    };

    if (!requestBody.title || !requestBody.category || !requestBody.budget || !requestBody.participants || !requestBody.targetDate || !requestBody.requirements || !requestBody.targetVendorId) {
      setMsg("Error: Please fill all required fields.");
      return;
    }

    try {
      setIsSubmitting(true);
      setMsg("");

      const response = await fetch(editingRequest ? `${API_BASE_URL}/hr/custom-requests/${editingRequest._id}` : `${API_BASE_URL}/custom-requests`, {
        method: editingRequest ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        setMsg(`Error: ${data.message || "Failed to create custom request."}`);
        return;
      }

      setIsSubmitted(false);
      setIsFormOpen(false);
      setEditingRequest(null);
      setMsg(editingRequest ? "Success: Custom request updated." : "Success: Custom request sent to the selected vendor.");
      form.reset();
      fetchMyCustomRequests();
    } catch (error) {
      console.error(error);
      setMsg("Error: Cannot connect to backend. Custom request was not sent.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditRequest = (request) => {
    setEditingRequest(request);
    setIsFormOpen(true);
    setMsg("");
  };

  const deleteCustomRequest = async (request) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMsg("Error: HR token not found. Please login again.");
      return;
    }

    try {
      setDeletingRequestId(request._id);
      setMsg("");
      const response = await fetch(`${API_BASE_URL}/hr/custom-requests/${request._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        setMsg(`Error: ${data.message || "Failed to delete custom request."}`);
        return;
      }

      setMyRequests((currentRequests) => currentRequests.filter((item) => item._id !== request._id));
      setMsg("Success: Custom request deleted.");
      setConfirmAction(null);
      if (editingRequest?._id === request._id) {
        setEditingRequest(null);
        setIsFormOpen(false);
      }
    } catch (error) {
      console.error(error);
      setMsg("Error: Cannot connect to backend. Custom request was not deleted.");
    } finally {
      setDeletingRequestId("");
    }
  };

  const statusBadge = (status) => {
    if (status === "approved") return "bg-emerald-100 text-emerald-700";
    if (status === "rejected") return "bg-red-100 text-red-700";
    return "bg-amber-100 text-amber-700";
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-10 bg-white rounded-3xl border border-sky-100 shadow-xl text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Custom Request Sent!</h2>
        <p className="text-slate-500 mb-8 text-lg">
          Your custom activity request is now available for vendors to review. If a vendor approves it, it will appear in My Company Events.
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
    <div className="max-w-5xl mx-auto space-y-6">
      <header className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Custom Activity Request</h1>
          <p className="text-slate-500 mt-1">Design your own trip or event and send it to one selected vendor.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (isFormOpen) {
              setIsFormOpen(false);
              setEditingRequest(null);
            } else {
              setEditingRequest(null);
              setIsFormOpen(true);
            }
          }}
          className="px-5 py-3 bg-sky-600 text-white font-bold rounded-xl shadow-md shadow-sky-100 hover:bg-sky-700 transition-colors flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-4 h-4" /> {isFormOpen ? "Close Form" : "Add New Custom Request"}
        </button>
      </header>

      {msg && <div className={`p-3 text-sm font-bold rounded-lg ${msg.startsWith("Error") ? "bg-red-50 text-red-700" : msg.startsWith("Success") ? "bg-green-50 text-green-700" : "bg-sky-50 text-sky-700"}`}>{msg}</div>}

      {isFormOpen && (
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-8">
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">{editingRequest ? "Edit Custom Request" : "1. Activity Details"}</h3>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Activity Title / Concept</label>
            <input 
              name="title"
              type="text" 
              required
              defaultValue={editingRequest?.title || ""}
              placeholder="e.g., Tech Team Winter Survival Retreat"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Activity Category</label>
              <div className="relative">
                <MapIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <select name="category" defaultValue={editingRequest?.category || "trips"} className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all appearance-none bg-white">
                  <option value="trips">Company Trip / Retreat</option>
                  <option value="events">Office Event / Party</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Target Vendors</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <select name="targetVendorId" required defaultValue={editingRequest?.targetVendorId || ""} disabled={isLoadingVendors || vendors.length === 0} className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all appearance-none bg-white disabled:bg-slate-50 disabled:text-slate-400">
                  <option value="">{isLoadingVendors ? "Loading vendors..." : "Select Vendor"}</option>
                  {vendors.map((vendor) => (
                    <option key={vendor._id} value={vendor._id}>
                      {vendor.company || vendor.name || vendor.username}
                    </option>
                  ))}
                </select>
              </div>
              {vendors.length === 0 && !isLoadingVendors && <p className="mt-1 text-xs text-red-500 font-bold">No active vendors available.</p>}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">2. Logistics & Budget</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Expected Attendees</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input name="participants" type="number" min="1" required defaultValue={editingRequest?.participants || ""} placeholder="e.g., 50" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Estimated Budget</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input name="budget" type="text" required defaultValue={editingRequest?.budget || ""} placeholder="e.g., 150 JD / person" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Target Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input name="targetDate" type="date" required defaultValue={editingRequest?.targetDate || ""} className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">3. Detailed Requirements</h3>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Describe your requirements</label>
            <div className="relative">
              <AlignLeft className="absolute left-3 top-4 w-5 h-5 text-slate-400" />
              <textarea name="requirements" required rows="5" defaultValue={editingRequest?.requirements || ""} placeholder="Tell vendors about transportation, catering, equipment, location, goals, and any special requirements..." className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all resize-none" />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button disabled={isSubmitting} type="submit" className={`px-8 py-3 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 ${isSubmitting ? "bg-slate-400 cursor-not-allowed" : "bg-sky-600 shadow-sky-200 hover:bg-sky-700"}`}>
            <Send className="w-4 h-4" /> {isSubmitting ? "Saving..." : editingRequest ? "Save Custom Request" : "Submit Custom Request"}
          </button>
        </div>
      </form>
      )}

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-xl font-bold text-slate-800">My Custom Requests</h2>
          <button onClick={fetchMyCustomRequests} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm">Refresh</button>
        </div>

        {isLoadingRequests ? (
          <p className="text-slate-500 italic py-4">Loading your custom requests...</p>
        ) : myRequests.length === 0 ? (
          <p className="text-slate-500 italic py-4">No custom requests submitted yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myRequests.map((request) => (
              <div key={request._id} className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-bold text-slate-800">{request.title}</h3>
                    <p className="text-xs text-slate-500 capitalize">{request.category}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${statusBadge(request.status)}`}>
                    {request.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <p><strong>Budget:</strong> {request.budget}</p>
                  <p><strong>Participants:</strong> {request.participants}</p>
                  <p><strong>Date:</strong> {request.targetDate}</p>
                  <p><strong>Vendor:</strong> {request.vendorCompany || request.targetVendorCompany || "Pending"}</p>
                  {(request.vendorEmail || request.targetVendorEmail) && <p className="col-span-2"><strong>Vendor Email:</strong> <span className="break-all">{request.vendorEmail || request.targetVendorEmail}</span></p>}
                  {(request.vendorPhone || request.targetVendorPhone) && <p className="col-span-2"><strong>Vendor Phone:</strong> {request.vendorPhone || request.targetVendorPhone}</p>}
                  <p><strong>Source:</strong> Custom Request</p>
                </div>
                {request.status === "approved" && (
                  <p className="text-xs text-emerald-700 font-bold mt-3">Approved request is now available in My Company Events.</p>
                )}
                {request.status === "rejected" && (
                  <p className="text-xs text-red-700 font-bold mt-3">Rejected by the selected vendor.</p>
                )}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => openEditRequest(request)}
                    disabled={["approved", "processing"].includes(request.status)}
                    className="px-3 py-2 bg-sky-50 text-sky-700 text-xs font-bold rounded-lg hover:bg-sky-100 disabled:bg-slate-100 disabled:text-slate-400 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setConfirmAction({
                        title: "Delete Custom Request?",
                        message: "This custom request and its related booking/activity will be deleted where applicable.",
                        confirmLabel: "Delete Request",
                        onConfirm: () => deleteCustomRequest(request),
                      })
                    }
                    disabled={request.status === "processing" || deletingRequestId === request._id}
                    className="px-3 py-2 bg-red-50 text-red-700 text-xs font-bold rounded-lg hover:bg-red-100 disabled:bg-slate-100 disabled:text-slate-400 transition-colors"
                  >
                    {deletingRequestId === request._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmActionModal
        isOpen={Boolean(confirmAction)}
        title={confirmAction?.title}
        message={confirmAction?.message}
        confirmLabel={confirmAction?.confirmLabel}
        isProcessing={Boolean(deletingRequestId)}
        onCancel={() => setConfirmAction(null)}
        onConfirm={confirmAction?.onConfirm}
      />
    </div>
  );
}


function HrVolunteering() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState("");
  const [refreshSignal, setRefreshSignal] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      setMsg("Error: HR token not found. Please login again.");
      return;
    }

    const payload = {
      title: e.target.title.value.trim(),
      description: e.target.description.value.trim(),
      date: e.target.date.value,
      hours: Number(e.target.hours.value),
      maxParticipants: Number(e.target.maxParticipants.value),
    };

    if (!payload.title || !payload.description || !payload.date || !payload.hours || !payload.maxParticipants) {
      setMsg("Error: Please fill all required fields.");
      return;
    }

    try {
      setIsSubmitting(true);
      setMsg("");
      const response = await fetch(`${API_BASE_URL}/volunteer-opportunities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        setMsg(`Error: ${data.message || "Failed to create volunteer opportunity."}`);
        return;
      }

      e.target.reset();
      setIsFormOpen(false);
      setRefreshSignal((value) => value + 1);
      setMsg("Success: Volunteer opportunity created.");
    } catch (error) {
      console.error(error);
      setMsg("Error: Cannot connect to backend. Opportunity was not created.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Volunteering</h1>
          <p className="text-slate-500 mt-1">Create volunteer opportunities and manage active volunteers in one place.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsFormOpen((open) => !open)}
          className="px-5 py-3 bg-sky-600 text-white font-bold rounded-xl shadow-md shadow-sky-100 hover:bg-sky-700 transition-colors flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-4 h-4" /> {isFormOpen ? "Close Form" : "Add New Volunteering"}
        </button>
      </header>

      {msg && <div className={`p-3 text-sm font-bold rounded-lg ${msg.startsWith("Error") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>{msg}</div>}

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Opportunity Title</label>
            <input name="title" type="text" required placeholder="e.g., Local Beach Cleanup" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 outline-none" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Target Date</label>
              <input name="date" type="date" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Volunteer Hours</label>
              <input name="hours" type="number" min="1" required placeholder="4" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Max Participants</label>
              <input name="maxParticipants" type="number" min="1" required placeholder="20" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description & Requirements</label>
            <textarea name="description" required rows="4" placeholder="Describe the volunteer activity and any requirements..." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 outline-none resize-y"></textarea>
          </div>
          <div className="pt-4 flex justify-end">
            <button type="submit" disabled={isSubmitting} className="px-8 py-3.5 bg-sky-600 text-white font-bold rounded-xl shadow-md hover:bg-sky-700 disabled:bg-slate-300 transition-colors flex items-center gap-2">
              <Heart className="w-5 h-5" /> {isSubmitting ? "Publishing..." : "Publish Internal Opportunity"}
            </button>
          </div>
        </form>
      )}

      <HrVolunteerManagement embedded refreshSignal={refreshSignal} />
    </div>
  );
}

function HrCreateVolunteer({ setTab }) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      setMsg("Error: HR token not found. Please login again.");
      return;
    }

    const payload = {
      title: e.target.title.value.trim(),
      description: e.target.description.value.trim(),
      date: e.target.date.value,
      hours: Number(e.target.hours.value),
      maxParticipants: Number(e.target.maxParticipants.value),
    };

    if (!payload.title || !payload.description || !payload.date || !payload.hours || !payload.maxParticipants) {
      setMsg("Error: Please fill all required fields.");
      return;
    }

    try {
      setIsSubmitting(true);
      setMsg("");
      const response = await fetch(`${API_BASE_URL}/volunteer-opportunities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        setMsg(`Error: ${data.message || "Failed to create volunteer opportunity."}`);
        return;
      }
      setIsSubmitted(true);
    } catch (error) {
      console.error(error);
      setMsg("Error: Cannot connect to backend. Opportunity was not created.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-10 bg-white rounded-3xl border border-sky-100 shadow-xl text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Opportunity Created!</h2>
        <p className="text-slate-500 mb-8 text-lg">The volunteer opportunity is now visible to employees in your company only.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => setTab('active-volunteering')} className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl shadow-md hover:bg-emerald-700 transition-colors">Manage Active Volunteering</button>
          <button onClick={() => setTab('dashboard')} className="px-6 py-3 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors">Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Create Volunteer Opportunity</h1>
        <p className="text-slate-500 mt-1">Publish internal volunteer opportunities directly to employees in your company.</p>
      </header>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
        {msg && <div className={`p-3 text-sm font-bold rounded-lg ${msg.startsWith("Error") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>{msg}</div>}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Opportunity Title</label>
          <input name="title" type="text" required placeholder="e.g., Local Beach Cleanup" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 outline-none" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Target Date</label>
            <input name="date" type="date" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Volunteer Hours</label>
            <input name="hours" type="number" min="1" required placeholder="4" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Max Participants</label>
            <input name="maxParticipants" type="number" min="1" required placeholder="20" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description & Requirements</label>
          <textarea name="description" required rows="4" placeholder="Describe the volunteer activity and any requirements..." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 outline-none resize-y"></textarea>
        </div>
        <div className="pt-4 flex justify-end">
          <button type="submit" disabled={isSubmitting} className="px-8 py-3.5 bg-sky-600 text-white font-bold rounded-xl shadow-md hover:bg-sky-700 disabled:bg-slate-300 transition-colors flex items-center gap-2">
            <Heart className="w-5 h-5" /> {isSubmitting ? "Publishing..." : "Publish Internal Opportunity"}
          </button>
        </div>
      </form>
    </div>
  );
}

function HrVolunteerManagement({ embedded = false, refreshSignal = 0 } = {}) {
  const [opportunities, setOpportunities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [openId, setOpenId] = useState(null);
  const [actionLoading, setActionLoading] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);

  const fetchOpportunities = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMsg("Error: HR token not found. Please login again.");
      return;
    }

    try {
      setIsLoading(true);
      setMsg("");
      const response = await fetch(`${API_BASE_URL}/hr/volunteer-opportunities`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        setMsg(`Error: ${data.message || "Failed to load volunteer opportunities."}`);
        return;
      }
      setOpportunities(data.opportunities || []);
    } catch (error) {
      console.error(error);
      setMsg("Error: Cannot load volunteer opportunities from backend.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshSignal]);

  const markParticipant = async (opportunityId, employeeId, action) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMsg("Error: HR token not found. Please login again.");
      return;
    }

    try {
      setActionLoading(`${opportunityId}-${employeeId}-${action}`);
      setMsg("");
      const response = await fetch(`${API_BASE_URL}/hr/volunteer-opportunities/${opportunityId}/participants/${employeeId}/${action}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        setMsg(`Error: ${data.message || "Failed to update participant."}`);
        return;
      }
      setMsg(action === "complete" ? "Success: Participant completed. Volunteer hours were updated." : "Success: Participant marked as not completed.");
      fetchOpportunities();
    } catch (error) {
      console.error(error);
      setMsg("Error: Cannot connect to backend. Participant was not updated.");
    } finally {
      setActionLoading("");
    }
  };

  const completeOpportunity = async (opportunity) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMsg("Error: HR token not found. Please login again.");
      return;
    }

    const participants = opportunity.participants || [];
    const allParticipantsCompleted = participants.length > 0 && participants.every((participant) => participant.status === "completed");

    if (!allParticipantsCompleted) {
      setMsg("Error: Not all participants are complete.");
      return;
    }

    try {
      setActionLoading(`${opportunity._id}-complete-opportunity`);
      setMsg("");
      const response = await fetch(`${API_BASE_URL}/hr/volunteer-opportunities/${opportunity._id}/complete`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        setMsg(`Error: ${data.message || "Failed to complete volunteer opportunity."}`);
        return;
      }

      setMsg("Success: Volunteer opportunity completed. Volunteer Impact was updated.");
      fetchOpportunities();
    } catch (error) {
      console.error(error);
      setMsg("Error: Cannot connect to backend. Volunteer opportunity was not completed.");
    } finally {
      setActionLoading("");
    }
  };

  const deleteParticipant = async (opportunity, participant) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMsg("Error: HR token not found. Please login again.");
      return;
    }

    try {
      setActionLoading(`${opportunity._id}-${participant.employeeId}-delete`);
      setMsg("");
      const response = await fetch(`${API_BASE_URL}/hr/volunteer-opportunities/${opportunity._id}/participants/${participant.employeeId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        setMsg(`Error: ${data.message || "Failed to delete participant."}`);
        return;
      }

      setMsg("Success: Participant deleted from this volunteer opportunity.");
      setConfirmAction(null);
      fetchOpportunities();
    } catch (error) {
      console.error(error);
      setMsg("Error: Cannot connect to backend. Participant was not deleted.");
    } finally {
      setActionLoading("");
    }
  };

  const deleteOpportunity = async (opportunity) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMsg("Error: HR token not found. Please login again.");
      return;
    }

    try {
      setActionLoading(`${opportunity._id}-delete-opportunity`);
      setMsg("");
      const response = await fetch(`${API_BASE_URL}/hr/volunteer-opportunities/${opportunity._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        setMsg(`Error: ${data.message || "Failed to delete volunteer opportunity."}`);
        return;
      }

      setMsg("Success: Volunteer opportunity deleted from the system.");
      fetchOpportunities();
    } catch (error) {
      console.error(error);
      setMsg("Error: Cannot connect to backend. Volunteer opportunity was not deleted.");
    } finally {
      setActionLoading("");
      setConfirmAction(null);
    }
  };

  const participantStatusBadge = (status) => {
    if (status === "completed") return "bg-green-100 text-green-700";
    if (status === "not_completed") return "bg-red-100 text-red-700";
    return "bg-amber-100 text-amber-700";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <h1 className={embedded ? "text-2xl font-bold text-slate-900" : "text-3xl font-bold text-slate-900"}>{embedded ? "Active Volunteering" : "Active Volunteering"}</h1>
          <p className="text-slate-500 mt-1">Review volunteers and mark completion. Volunteer hours are awarded only after Complete.</p>
        </div>
        <button onClick={fetchOpportunities} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm">
          Refresh
        </button>
      </header>

      {msg && <div className={`p-3 text-sm font-bold rounded-lg ${msg.startsWith("Error") ? "bg-red-50 text-red-700" : msg.startsWith("Success") ? "bg-green-50 text-green-700" : "bg-sky-50 text-sky-700"}`}>{msg}</div>}

      {isLoading ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 italic">Loading volunteer opportunities...</p>
        </div>
      ) : opportunities.filter((opp) => opp.status !== "completed").length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-700">No Volunteer Opportunities Yet</h2>
          <p className="text-slate-500">Create a volunteer opportunity first.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {opportunities.filter((opp) => opp.status !== "completed").map((opp) => {
            const participantCount = (opp.participants || []).length;
            const thresholdReached = participantCount >= Number(opp.maxParticipants || 0);
            const volunteerDateReached = isDateReached(opp.date);
            const canCompleteOpportunity = thresholdReached && volunteerDateReached;
            return (
            <div key={opp._id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900">{opp.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{opp.description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${opp.status === "closed" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>{opp.status}</span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">{(opp.participants || []).length}/{opp.maxParticipants} Joined</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-sm">
                <div className="bg-slate-50 p-3 rounded-xl"><p className="text-xs text-slate-400 uppercase font-bold">Date</p><p className="font-bold text-slate-800">{opp.date}</p></div>
                <div className="bg-slate-50 p-3 rounded-xl"><p className="text-xs text-slate-400 uppercase font-bold">Hours</p><p className="font-bold text-slate-800">{opp.hours}</p></div>
                <div className="bg-slate-50 p-3 rounded-xl"><p className="text-xs text-slate-400 uppercase font-bold">Volunteer Hours</p><p className="font-bold text-slate-800"><span>{opp.hours}</span> <span>Volunteer hours per completed participant</span></p></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button onClick={() => setOpenId(openId === opp._id ? null : opp._id)} className="w-full py-3 bg-sky-50 text-sky-700 font-bold rounded-xl hover:bg-sky-100 transition-colors">
                  {openId === opp._id ? "Hide Participants" : "View Participants"}
                </button>
                <button
                  onClick={() => completeOpportunity(opp)}
                  disabled={!canCompleteOpportunity || actionLoading === `${opp._id}-complete-opportunity`}
                  className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:bg-slate-300 transition-colors"
                >
                  {canCompleteOpportunity ? "Completed" : "Complete when full and date arrives"}
                </button>
                <button
                  onClick={() =>
                    setConfirmAction({
                      title: "Delete Volunteer Opportunity?",
                      message: "This volunteer opportunity will be deleted from HR and Employee portals.",
                      confirmLabel: "Delete Opportunity",
                      onConfirm: () => deleteOpportunity(opp),
                    })
                  }
                  disabled={actionLoading === `${opp._id}-delete-opportunity`}
                  className="w-full py-3 bg-red-50 text-red-700 font-bold rounded-xl hover:bg-red-100 disabled:bg-slate-100 disabled:text-slate-400 transition-colors"
                >
                  Delete
                </button>
              </div>

              {openId === opp._id && (
                <div className="mt-4 border-t border-slate-100 pt-4">
                  {(opp.participants || []).length === 0 ? (
                    <p className="text-slate-500 italic text-sm">No participants yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {opp.participants.map((participant) => (
                        <div key={participant.employeeId} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div>
                            <p className="font-bold text-slate-800">{participant.name || participant.username}</p>
                            <p className="text-xs text-slate-500 font-mono">@{participant.username}</p>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${participantStatusBadge(participant.status)}`}>{participant.status}</span>
                            <button
                              onClick={() => markParticipant(opp._id, participant.employeeId, "complete")}
                              disabled={participant.status === "completed" || actionLoading === `${opp._id}-${participant.employeeId}-complete`}
                              className="px-3 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 disabled:bg-slate-300 transition-colors"
                            >
                              {actionLoading === `${opp._id}-${participant.employeeId}-complete` ? "Saving..." : "Complete"}
                            </button>
                            <button
                              onClick={() => markParticipant(opp._id, participant.employeeId, "not-complete")}
                              disabled={participant.status === "not_completed" || actionLoading === `${opp._id}-${participant.employeeId}-not-complete`}
                              className="px-3 py-2 bg-red-50 text-red-700 text-xs font-bold rounded-lg hover:bg-red-100 disabled:bg-slate-100 disabled:text-slate-400 transition-colors"
                            >
                              {actionLoading === `${opp._id}-${participant.employeeId}-not-complete` ? "Saving..." : "Not Complete"}
                            </button>
                            <button
                              onClick={() =>
                                setConfirmAction({
                                  title: "Delete Participant?",
                                  message: "This participant will be removed from this volunteer opportunity.",
                                  confirmLabel: "Delete Participant",
                                  onConfirm: () => deleteParticipant(opp, participant),
                                })
                              }
                              disabled={actionLoading === `${opp._id}-${participant.employeeId}-delete`}
                              className="px-3 py-2 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-300 disabled:bg-slate-100 disabled:text-slate-400 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );})}
        </div>
      )}
      <ConfirmActionModal
        isOpen={Boolean(confirmAction)}
        title={confirmAction?.title}
        message={confirmAction?.message}
        confirmLabel={confirmAction?.confirmLabel}
        isProcessing={actionLoading.includes("delete")}
        onCancel={() => setConfirmAction(null)}
        onConfirm={confirmAction?.onConfirm}
      />
    </div>
  );
}

function HrHistory() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const fetchHistory = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMsg("Error: HR token not found. Please login again.");
      return;
    }

    try {
      setIsLoading(true);
      setMsg("");
      const response = await fetch(`${API_BASE_URL}/hr/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        setMsg(`Error: ${data.message || "Failed to load history."}`);
        return;
      }

      setHistory(data.history || []);
    } catch (error) {
      console.error(error);
      setMsg("Error: Cannot load history from backend.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const deleteHistory = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMsg("Error: HR token not found. Please login again.");
      return;
    }

    try {
      setIsDeleting(true);
      setMsg("");
      const response = await fetch(`${API_BASE_URL}/hr/history`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        setMsg(`Error: ${data.message || "Failed to delete history."}`);
        return;
      }

      setHistory([]);
      setMsg("Success: History deleted.");
      setConfirmAction(null);
    } catch (error) {
      console.error(error);
      setMsg("Error: Cannot connect to backend. History was not deleted.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">History</h1>
          <p className="text-slate-500 mt-1">Completed events, trips, and volunteer activities for your company.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button onClick={fetchHistory} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm">
            Refresh History
          </button>
          <button
            onClick={() =>
              setConfirmAction({
                title: "Delete History?",
                message: "This will clear the completed activities from your history view.",
                confirmLabel: "Delete History",
                onConfirm: deleteHistory,
              })
            }
            disabled={history.length === 0 || isDeleting}
            className="px-4 py-2 bg-red-50 text-red-700 font-bold rounded-xl hover:bg-red-100 disabled:bg-slate-100 disabled:text-slate-400 transition-colors text-sm"
          >
            Delete History
          </button>
        </div>
      </header>

      {msg && <div className={`p-3 text-sm font-bold rounded-lg ${msg.startsWith("Error") ? "bg-red-50 text-red-700" : "bg-sky-50 text-sky-700"}`}>{msg}</div>}

      {isLoading ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 italic">Loading history...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <History className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-700">No History Yet</h2>
          <p className="text-slate-500">Completed company activities will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {history.map((item, index) => (
            <div key={`${item.type}-${item.title}-${index}`} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-sky-600">{item.type}</p>
                  <h3 className="font-black text-lg text-slate-900">{item.title}</h3>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">Completed</span>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                <p><strong>Date:</strong> {item.date || "N/A"}</p>
                {item.vendorCompany && <p><strong>Vendor:</strong> {item.vendorCompany}</p>}
                <p><strong>Participants:</strong> {item.participants || 0}</p>
                {item.culturePoints ? <p><strong>Culture Score:</strong> +{item.culturePoints}</p> : null}
                {item.volunteerHours ? <p><strong>Volunteer Impact:</strong> +{item.volunteerHours} hrs</p> : null}
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmActionModal
        isOpen={Boolean(confirmAction)}
        title={confirmAction?.title}
        message={confirmAction?.message}
        confirmLabel={confirmAction?.confirmLabel}
        isProcessing={isDeleting}
        onCancel={() => setConfirmAction(null)}
        onConfirm={confirmAction?.onConfirm}
      />
    </div>
  );
}


export { HrPortal, HrDashboard, HrBookingDrilldown, HrManageEmployees, HrCompanyEvents, Marketplace, CustomRequest, HrCreateVolunteer, HrVolunteerManagement, HrHistory };
