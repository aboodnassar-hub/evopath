import React, { useState, useEffect } from 'react';
import { Heart, Calendar, TrendingUp, Award, Sparkles, Vote, Clock, Users, CheckCircle, History, MessageSquare, Star } from 'lucide-react';
import { API_BASE_URL } from '../../utils/constants';
import { Sidebar, MobileHeader, TeamPolling, ConfirmActionModal } from '../../components/shared';

function EmployeePortal({ user, setUser, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const refreshProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok && data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
      }
    } catch (error) {
      console.error("Failed to refresh employee profile:", error);
    }
  };

  useEffect(() => {
    refreshProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
      <Sidebar 
        user={user} isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout}
        portalType="Employee Hub"
        themeColor="purple"
        navItems={[
          { id: 'dashboard', icon: <TrendingUp />, label: "My Impact" },
          { id: 'opportunities', icon: <Heart />, label: "Volunteer Op." },
          { id: 'active-events', icon: <Calendar />, label: "My Activities" },
          { id: 'polling', icon: <Vote />, label: "Have Your Say (Polls)" },
          { id: 'history', icon: <History />, label: "History" }
        ]}
      />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <MobileHeader setIsOpen={setIsMobileMenuOpen} />
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {activeTab === 'dashboard' && <EmployeeDashboard user={user} setTab={setActiveTab} onRefreshProfile={refreshProfile} />}
          {activeTab === 'opportunities' && <EmployeeOpportunities onRefreshProfile={refreshProfile} />}
          {activeTab === 'active-events' && <EmployeeActiveEvents />}
          {activeTab === 'history' && <EmployeeHistory />}
          {activeTab === 'polling' && <TeamPolling role="employee" onProfileUpdate={refreshProfile} />}
        </div>
      </main>
    </div>
  );
}

function EmployeeDashboard({ user, setTab, onRefreshProfile }) {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Welcome, {user.name.split(' ')[0]}!</h1>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p className="text-slate-500 mt-1">Track your impact and engage with {user.company}'s culture.</p>
          {onRefreshProfile && (
            <button onClick={onRefreshProfile} className="px-4 py-2 bg-purple-50 text-purple-700 font-bold rounded-xl hover:bg-purple-100 transition-colors text-sm">Refresh Impact</button>
          )}
        </div>
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
            <p className="text-4xl font-black">{user.culturePoints || 0}</p>
            <p className="text-sm text-indigo-200 mt-1">Top 15% in the company. Keep participating!</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between min-h-[160px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-700">Personal Volunteer Hours</h3>
            <div className="p-2 bg-rose-100 text-rose-600 rounded-lg"><Heart className="w-5 h-5" /></div>
          </div>
          <div>
            <p className="text-4xl font-black text-slate-800">{user.personalVolunteerHours || 0} <span className="text-lg text-slate-400 font-normal">hrs</span></p>
            <p className="text-sm text-slate-500 font-medium mt-1">Goal: 20 hours / year</p>
          </div>
        </div>
      </div>

      <EmployeeActionRecord setTab={setTab} />
    </div>
  );
}

function EmployeeActionRecord({ setTab }) {
  const [actions, setActions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const fetchActionRecord = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMsg("Error: Employee token not found. Please login again.");
      return;
    }

    try {
      setIsLoading(true);
      setMsg("");
      const response = await fetch(`${API_BASE_URL}/employee/action-record`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        setMsg(`Error: ${data.message || "Failed to load action record."}`);
        return;
      }

      setActions(Array.isArray(data.actions) ? data.actions : []);
    } catch (error) {
      console.error(error);
      setMsg("Error: Cannot load action record from backend.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActionRecord();
  }, []);

  const sortedActions = [...actions].sort((a, b) => {
    const priorityA = a.status === "pending" ? 0 : 1;
    const priorityB = b.status === "pending" ? 0 : 1;
    return priorityA - priorityB;
  });

  return (
    <section className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Action Record</h2>
          <p className="text-sm text-slate-500 mt-1">Polls and feedback requests assigned to you.</p>
        </div>
        <button onClick={fetchActionRecord} className="px-4 py-2 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-sm">
          Refresh Record
        </button>
      </div>

      {msg && (
        <div className={`p-3 text-sm font-bold rounded-lg ${msg.startsWith("Error") ? "bg-red-50 text-red-700" : "bg-sky-50 text-sky-700"}`}>
          {msg}
        </div>
      )}

      {isLoading && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center text-slate-500">
          Loading action record...
        </div>
      )}

      {!isLoading && sortedActions.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center">
          <CheckCircle className="w-10 h-10 text-emerald-300 mx-auto mb-2" />
          <h3 className="font-bold text-slate-800">No pending poll or feedback actions.</h3>
          <p className="text-sm text-slate-500 mt-1">New polls and completed-event feedback requests will appear here.</p>
        </div>
      )}

      {!isLoading && sortedActions.length > 0 && (
        <div className="grid gap-3">
          {sortedActions.map((action) => {
            const isFeedback = action.type === "feedback";
            const isPending = action.status === "pending";
            const key = `${action.type}:${action.employeeEventId || action.id}`;
            const Icon = isFeedback ? MessageSquare : Vote;
            const title = isFeedback
              ? `Feedback: ${action.eventTitle || "Completed Event"}`
              : action.title || action.poll?.question || "Team Poll";
            const detail = isFeedback
              ? `Vendor: ${action.vendorCompany || "Vendor"}`
              : isPending
                ? "Vote on active poll"
                : action.poll?.status === "completed"
                  ? "Poll completed"
                  : "Vote submitted";

            return (
              <div key={key} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isFeedback ? "bg-purple-100 text-purple-600" : "bg-sky-100 text-sky-600"}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-800">{title}</h3>
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${isPending ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {isPending ? "Pending" : "Completed"}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">{detail}</p>
                    {isFeedback && action.feedback && (
                      <div className="flex items-center gap-1 mt-2 text-yellow-400">
                        {[1, 2, 3, 4, 5].map((score) => (
                          <Star key={score} className={`w-4 h-4 ${score <= Number(action.feedback.rating || 0) ? "fill-current" : "text-slate-300"}`} />
                        ))}
                        <span className="text-xs font-bold text-slate-500 ml-1">Feedback submitted; you can edit it</span>
                      </div>
                    )}
                    {isFeedback && !action.feedback && (
                      <p className="text-xs font-bold text-purple-600 mt-2">+5 Culture Points after first feedback</p>
                    )}
                  </div>
                </div>
                <button onClick={() => setTab('polling')} className={`px-4 py-2 font-bold rounded-xl transition-colors whitespace-nowrap ${isFeedback ? "bg-purple-50 text-purple-700 hover:bg-purple-100" : "bg-sky-50 text-sky-700 hover:bg-sky-100"}`}>
                  {isFeedback ? (action.feedback?.canEdit ? "Edit Feedback" : action.feedback ? "View Feedback" : "Give Feedback") : (isPending ? "Vote Now" : "View Polls")}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function EmployeeOpportunities({ onRefreshProfile }) {
  const [opportunities, setOpportunities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [joiningId, setJoiningId] = useState(null);
  const [withdrawingId, setWithdrawingId] = useState(null);

  const fetchOpportunities = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMsg("Error: Employee token not found. Please login again.");
      return;
    }

    try {
      setIsLoading(true);
      setMsg("");
      const response = await fetch(`${API_BASE_URL}/employee/volunteer-opportunities`, {
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
  }, []);

  const joinOpportunity = async (opportunityId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMsg("Error: Employee token not found. Please login again.");
      return;
    }

    try {
      setJoiningId(opportunityId);
      setMsg("");
      const response = await fetch(`${API_BASE_URL}/volunteer-opportunities/${opportunityId}/join`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        setMsg(`Error: ${data.message || "Failed to join opportunity."}`);
        return;
      }
      setMsg("Success: You joined this volunteer opportunity. Volunteer hours will be added only after HR marks you as completed.");
      fetchOpportunities();
      if (onRefreshProfile) onRefreshProfile();
    } catch (error) {
      console.error(error);
      setMsg("Error: Cannot connect to backend. Join request failed.");
    } finally {
      setJoiningId(null);
    }
  };

  const withdrawOpportunity = async (opportunityId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMsg("Error: Employee token not found. Please login again.");
      return;
    }

    try {
      setWithdrawingId(opportunityId);
      setMsg("");
      const response = await fetch(`${API_BASE_URL}/volunteer-opportunities/${opportunityId}/withdraw`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        setMsg(`Error: ${data.message || "Failed to withdraw."}`);
        return;
      }
      setMsg("Success: You withdrew from this volunteer opportunity.");
      fetchOpportunities();
      if (onRefreshProfile) onRefreshProfile();
    } catch (error) {
      console.error(error);
      setMsg("Error: Cannot connect to backend. Withdrawal failed.");
    } finally {
      setWithdrawingId(null);
    }
  };

  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
  })();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Volunteer Opportunities</h1>
          <p className="text-slate-500 mt-1">Discover and join internal company volunteer opportunities.</p>
        </div>
        <button onClick={fetchOpportunities} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm">
          Refresh
        </button>
      </header>

      {msg && (
        <div className={`p-3 text-sm font-bold rounded-lg ${msg.startsWith("Error") ? "bg-red-50 text-red-700" : msg.startsWith("Success") ? "bg-green-50 text-green-700" : "bg-sky-50 text-sky-700"}`}>
          {msg}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 italic">Loading volunteer opportunities...</p>
        </div>
      ) : opportunities.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-700">No Opportunities Yet</h2>
          <p className="text-slate-500">Check back later for new company-sponsored volunteer opportunities.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map((opp) => {
            const joined = (opp.participants || []).some((participant) => String(participant.employeeId) === String(currentUser._id));
            const isFull = (opp.participants || []).length >= Number(opp.maxParticipants || 0) || opp.status === "closed";
            const isBusy = joiningId === opp._id || withdrawingId === opp._id;
            return (
              <div key={opp._id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-black text-lg text-slate-900">{opp.title}</h3>
                    <p className="text-xs text-slate-500">{opp.company}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${opp.status === "closed" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                    {opp.status}
                  </span>
                </div>
                <p className="text-sm text-slate-600 line-clamp-3 mb-4">{opp.description}</p>
                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <p className="text-xs text-slate-400 uppercase font-bold">Date</p>
                    <p className="font-bold text-slate-800">{opp.date}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <p className="text-xs text-slate-400 uppercase font-bold">Hours</p>
                    <p className="font-bold text-slate-800">{opp.hours}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl col-span-2">
                    <p className="text-xs text-slate-400 uppercase font-bold">Participants</p>
                    <p className="font-bold text-slate-800">{(opp.participants || []).length}/{opp.maxParticipants}</p>
                  </div>
                </div>
                <button
                  onClick={() => (joined ? withdrawOpportunity(opp._id) : joinOpportunity(opp._id))}
                  disabled={(!joined && isFull) || isBusy}
                  className={`mt-auto w-full py-3 rounded-xl font-bold transition-colors ${
                    joined
                      ? "bg-red-50 text-red-700 hover:bg-red-100 disabled:bg-slate-100 disabled:text-slate-400"
                      : isFull
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "bg-purple-600 text-white hover:bg-purple-700"
                  }`}
                >
                  {joined ? (withdrawingId === opp._id ? "Withdrawing..." : "Withdraw Registration") : isFull ? "Closed" : joiningId === opp._id ? "Joining..." : "Join Opportunity"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EmployeeActiveEvents() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [joiningId, setJoiningId] = useState("");
  const [withdrawingId, setWithdrawingId] = useState("");

  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
  })();

  const getParticipantEmployeeId = (participant) => {
    const employeeId = participant.employeeId;
    if (employeeId && typeof employeeId === "object") {
      return employeeId._id || employeeId.id;
    }

    return employeeId || participant._id || participant.id;
  };

  const isCurrentEmployeeParticipant = (participant) => {
    const participantId = getParticipantEmployeeId(participant);
    const currentUserId = currentUser._id || currentUser.id;

    return (
      (participantId && currentUserId && String(participantId) === String(currentUserId)) ||
      (participant.username && currentUser.username && participant.username === currentUser.username)
    );
  };

  const fetchActiveEvents = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMsg("Error: Employee token not found. Please login again.");
      return;
    }

    try {
      setIsLoading(true);
      setMsg("");
      const [eventsResponse, volunteerResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/employee/events`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/employee/volunteer-opportunities`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const eventsData = await eventsResponse.json();
      const volunteerData = await volunteerResponse.json();

      if (!eventsResponse.ok) {
        setMsg(`Error: ${eventsData.message || "Failed to load active trips and events."}`);
        return;
      }

      if (!volunteerResponse.ok) {
        setMsg(`Error: ${volunteerData.message || "Failed to load volunteer registrations."}`);
        return;
      }

      const publishedEvents = (eventsData.events || eventsData.employeeEvents || []).map((event) => ({
        ...event,
        activityKind: "event",
        activityKey: `event-${event._id || event.id || event.employeeEventId || event.bookingId}`,
      }));
      const joinedVolunteerOps = (volunteerData.opportunities || [])
        .filter((opportunity) => (opportunity.participants || []).some(isCurrentEmployeeParticipant))
        .map((opportunity) => ({
          ...opportunity,
          activityKind: "volunteer",
          activityKey: `volunteer-${opportunity._id || opportunity.id}`,
        }));

      setEvents([...publishedEvents, ...joinedVolunteerOps]);
    } catch (error) {
      console.error(error);
      setMsg("Error: Cannot load your activities from backend.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getEventInfo = (event) => {
    const participantList = Array.isArray(event.participants)
      ? event.participants
      : Array.isArray(event.employeeParticipants)
      ? event.employeeParticipants
      : [];
    const joinedCount = Number(event.participantCount ?? event.joinedCount ?? participantList.length ?? 0);
    const maxParticipants = Number(event.maxParticipants ?? event.requiredParticipants ?? event.capacity ?? event.bookingParticipants ?? 0);
    const joined = participantList.some(isCurrentEmployeeParticipant) || Boolean(event.hasJoined || event.joined);
    const isClosed = event.status === "closed" || event.employeeEventStatus === "closed" || (maxParticipants > 0 && joinedCount >= maxParticipants);

    return { participantList, joinedCount, maxParticipants, joined, isClosed };
  };

  const joinEvent = async (event) => {
    const token = localStorage.getItem("token");
    const eventId = event._id || event.id || event.employeeEventId || event.bookingId;

    if (!token) {
      setMsg("Error: Employee token not found. Please login again.");
      return;
    }

    if (!eventId) {
      setMsg("Error: Event ID is missing.");
      return;
    }

    try {
      setJoiningId(eventId);
      setMsg("");
      const response = await fetch(`${API_BASE_URL}/employee/events/${eventId}/join`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        setMsg(`Error: ${data.message || "Failed to join event."}`);
        return;
      }

      setMsg("Success: You joined this trip or event.");
      fetchActiveEvents();
    } catch (error) {
      console.error(error);
      setMsg("Error: Cannot connect to backend. Event join failed.");
    } finally {
      setJoiningId("");
    }
  };

  const withdrawEvent = async (event) => {
    const token = localStorage.getItem("token");
    const eventId = event._id || event.id || event.employeeEventId || event.bookingId;
    const isVolunteerActivity = event.activityKind === "volunteer";

    if (!token) {
      setMsg("Error: Employee token not found. Please login again.");
      return;
    }

    if (!eventId) {
      setMsg("Error: Event ID is missing.");
      return;
    }

    try {
      setWithdrawingId(eventId);
      setMsg("");
      const endpoint = isVolunteerActivity
        ? `/volunteer-opportunities/${eventId}/withdraw`
        : `/employee/events/${eventId}/withdraw`;
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        setMsg(`Error: ${data.message || "Failed to withdraw."}`);
        return;
      }

      setMsg(isVolunteerActivity ? "Success: You withdrew from this volunteer opportunity." : "Success: You withdrew from this trip or event.");
      fetchActiveEvents();
    } catch (error) {
      console.error(error);
      setMsg("Error: Cannot connect to backend. Withdrawal failed.");
    } finally {
      setWithdrawingId("");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Activities</h1>
          <p className="text-slate-500 mt-1">Track your trips, events, and registered volunteer activities in one place.</p>
        </div>
        <button onClick={fetchActiveEvents} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm">
          Refresh Activities
        </button>
      </header>

      {msg && (
        <div className={`p-3 text-sm font-bold rounded-lg ${msg.startsWith("Error") ? "bg-red-50 text-red-700" : msg.startsWith("Success") ? "bg-green-50 text-green-700" : "bg-sky-50 text-sky-700"}`}>
          {msg}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 italic">Loading your activities...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-700">No Activities Yet</h2>
          <p className="text-slate-500">Published events and volunteer opportunities you register for will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const eventId = event._id || event.id || event.employeeEventId || event.bookingId;
            const activityKey = event.activityKey || `${event.activityKind || "activity"}-${eventId}`;
            const isVolunteerActivity = event.activityKind === "volunteer";
            const eventInfo = getEventInfo(event);
            const isJoining = joiningId === eventId;
            const isWithdrawing = withdrawingId === eventId;
            return (
              <div key={activityKey} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-black text-lg text-slate-900">{event.title || event.activityTitle}</h3>
                    <p className="text-xs text-slate-500">{event.vendorCompany || event.vendor || event.company || (isVolunteerActivity ? "Company Volunteer" : "Vendor")}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${isVolunteerActivity ? "bg-rose-100 text-rose-700" : eventInfo.isClosed ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                    {isVolunteerActivity ? "Volunteer" : eventInfo.isClosed ? "Closed" : "Open"}
                  </span>
                </div>

                <p className="text-sm text-slate-600 line-clamp-3 mb-4">{event.description || event.requirements || "Published company event."}</p>

                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <p className="text-xs text-slate-400 uppercase font-bold">Date</p>
                    <p className="font-bold text-slate-800">{event.eventDate || event.targetDate || event.date || "N/A"}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <p className="text-xs text-slate-400 uppercase font-bold">Type</p>
                    <p className="font-bold text-slate-800 capitalize">{isVolunteerActivity ? "volunteer" : event.category || event.type || "event"}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl col-span-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-slate-400 uppercase font-bold">Participants</p>
                      <Users className="w-4 h-4 text-slate-400" />
                    </div>
                    <p className="font-bold text-slate-800">{eventInfo.joinedCount}/{eventInfo.maxParticipants || "N/A"}</p>
                    {eventInfo.maxParticipants > 0 && (
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={`h-full rounded-full ${eventInfo.isClosed ? "bg-red-500" : "bg-purple-500"}`}
                          style={{ width: `${Math.min(100, Math.round((eventInfo.joinedCount / eventInfo.maxParticipants) * 100))}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => (eventInfo.joined ? withdrawEvent(event) : joinEvent(event))}
                  disabled={eventInfo.joined ? isWithdrawing : eventInfo.isClosed || isJoining}
                  className={`mt-auto w-full py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 ${
                    eventInfo.joined
                      ? "bg-red-50 text-red-700 hover:bg-red-100 disabled:bg-slate-100 disabled:text-slate-400"
                      : eventInfo.isClosed
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "bg-purple-600 text-white hover:bg-purple-700"
                  }`}
                >
                  {eventInfo.joined ? <CheckCircle className="w-4 h-4" /> : null}
                  {eventInfo.joined ? (isWithdrawing ? "Withdrawing..." : "Withdraw Participation") : eventInfo.isClosed ? "Closed" : isJoining ? "Joining..." : "Join Event"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EmployeeHistory() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [msg, setMsg] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);

  const fetchHistory = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMsg("Error: Employee token not found. Please login again.");
      return;
    }

    try {
      setIsLoading(true);
      setMsg("");
      const response = await fetch(`${API_BASE_URL}/employee/history`, {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteHistory = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMsg("Error: Employee token not found. Please login again.");
      return;
    }

    try {
      setIsDeleting(true);
      setMsg("");
      const response = await fetch(`${API_BASE_URL}/employee/history`, {
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
          <p className="text-slate-500 mt-1">Completed events, trips, and volunteer activities you joined.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button onClick={fetchHistory} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm">
            Refresh History
          </button>
          <button
            onClick={() =>
              setConfirmAction({
                title: "Delete History?",
                message: "This will clear completed activities from your employee history view.",
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

      {msg && <div className={`p-3 text-sm font-bold rounded-lg ${msg.startsWith("Error") ? "bg-red-50 text-red-700" : msg.startsWith("Success") ? "bg-green-50 text-green-700" : "bg-sky-50 text-sky-700"}`}>{msg}</div>}

      {isLoading ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 italic">Loading history...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <History className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-700">No History Yet</h2>
          <p className="text-slate-500">Completed activities you joined will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {history.map((item) => (
            <div key={item.key} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-purple-600">{item.type}</p>
                  <h3 className="font-black text-lg text-slate-900">{item.title}</h3>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">Completed</span>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                <p><strong>Date:</strong> {item.date || "N/A"}</p>
                {item.vendorCompany && <p><strong>Vendor:</strong> {item.vendorCompany}</p>}
                <p><strong>Participants:</strong> {item.participants || 0}</p>
                {item.volunteerHours ? <p><strong>Volunteer Hours:</strong> +{item.volunteerHours} hrs</p> : null}
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

// ==========================================
// SHARED COMPONENTS
// ==========================================

export { EmployeePortal, EmployeeDashboard, EmployeeOpportunities, EmployeeActiveEvents, EmployeeHistory };
