import React, { useCallback, useEffect, useState } from 'react';
import { Calendar, LogOut, Star, Shield, ChevronRight, Menu, X, Vote, CheckCircle, PlusCircle, Trash2, Key } from 'lucide-react';
import { apiRequest, getAuthToken } from '../utils/api';
import { LanguageToggle, showSystemMessage } from '../utils/i18n';

const EvoPathLogo = ({ className = "w-8 h-8", imgUrl }) => (
  <div data-no-translate dir="ltr" className={`relative shrink-0 rounded-lg overflow-hidden shadow-sm border border-sky-100 group bg-white ${className}`}>
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
  <div data-no-translate dir="ltr" className="flex items-center cursor-pointer group" style={{ perspective: '500px' }}>
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
    const token = getAuthToken();
    setResetError("");

    if (!token) {
      setResetError("Session expired. Please login again.");
      return;
    }

    try {
      const { response, data } = await apiRequest("/reset-pin", {
        method: "POST",
        token,
        body: { username: String(username || "").trim() },
      });
      
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

function ConfirmActionModal({
  isOpen,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  tone = "red",
  isProcessing = false,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  const toneStyles =
    tone === "emerald"
      ? {
          iconBg: "bg-emerald-50",
          iconText: "text-emerald-600",
          button: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100",
        }
      : {
          iconBg: "bg-red-50",
          iconText: "text-red-600",
          button: "bg-red-600 hover:bg-red-700 shadow-red-100",
        };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95">
        <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${toneStyles.iconBg} ${toneStyles.iconText}`}>
          <Trash2 className="h-7 w-7" />
        </div>
        <h3 className="mb-2 text-center text-2xl font-black text-slate-900">{title}</h3>
        <p className="mb-2 text-center text-sm text-slate-600">{message}</p>
        <p className="mb-6 text-center text-xs font-bold uppercase tracking-wide text-red-500">This action cannot be undone.</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className={`rounded-xl px-4 py-3 text-sm font-bold text-white shadow-md transition-colors disabled:opacity-60 ${toneStyles.button}`}
          >
            {isProcessing ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ user, isOpen, setIsOpen, activeTab, setActiveTab, onLogout, portalType, themeColor = 'sky', navItems }) {
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const getThemeColors = () => {
    if (themeColor === 'indigo') return { bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-700', activeBg: 'bg-indigo-600', activeShadow: 'shadow-indigo-200' };
    if (themeColor === 'emerald') return { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', activeBg: 'bg-emerald-600', activeShadow: 'shadow-emerald-200' };
    if (themeColor === 'purple') return { bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-700', activeBg: 'bg-purple-600', activeShadow: 'shadow-purple-200' };
    return { bg: 'bg-sky-50', border: 'border-sky-100', text: 'text-sky-700', activeBg: 'bg-sky-600', activeShadow: 'shadow-sky-200' };
  };
  const theme = getThemeColors();

  return (
    <>
    <aside className={`fixed inset-y-0 left-0 bg-white w-64 border-r border-slate-200 z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static flex flex-col z-50`}>
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 shrink-0">
        <div data-no-translate dir="ltr" className="flex items-center gap-2 text-slate-800 font-bold text-xl tracking-tight">
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
        <LanguageToggle className="mb-3 w-full justify-center" />
        <button onClick={() => setIsLogoutConfirmOpen(true)} className="flex items-center gap-3 px-3 py-2 w-full text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
          <LogOut className="w-5 h-5" /> <span className="font-medium">Sign Out</span>
        </button>
      </div>

    </aside>

    {isLogoutConfirmOpen && (
      <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <LogOut className="h-6 w-6" />
          </div>
          <h3 className="mb-2 text-center text-xl font-black text-slate-900">Log out?</h3>
          <p className="mb-6 text-center text-sm text-slate-500">Are you sure you want to sign out of EvoPath?</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIsLogoutConfirmOpen(false)}
              className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200"
            >
              No
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogoutConfirmOpen(false);
                onLogout();
              }}
              className="rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-red-100 transition-colors hover:bg-red-700"
            >
              Yes
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

function MobileHeader({ setIsOpen }) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:hidden shrink-0 z-50 relative">
      <div data-no-translate dir="ltr" className="flex items-center gap-2 text-slate-800 font-bold text-lg tracking-tight">
        <EvoPathLogo className="w-6 h-6" /> <AnimatedBrandText />
      </div>
      <div className="flex items-center gap-2">
        <LanguageToggle compact />
        <button onClick={() => setIsOpen(true)}><Menu className="w-6 h-6 text-slate-600" /></button>
      </div>
    </header>
  );
}

const TEAM_POLL_OPTION_COLORS = ["bg-emerald-500", "bg-sky-500", "bg-amber-400", "bg-purple-500", "bg-rose-500"];

function TeamPolling({ role = "hr", onProfileUpdate }) {
  const [polls, setPolls] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newOptions, setNewOptions] = useState(["", ""]);
  const [saving, setSaving] = useState(false);
  const [busyPollId, setBusyPollId] = useState(null);
  const [feedbackActions, setFeedbackActions] = useState([]);
  const [feedbackDrafts, setFeedbackDrafts] = useState({});
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [busyFeedbackId, setBusyFeedbackId] = useState(null);

  const normalizePoll = useCallback((poll) => {
    const options = Array.isArray(poll.options) ? poll.options : [];
    const totalVotes = Number(
      poll.totalVotes ?? poll.votes ?? options.reduce((sum, option) => sum + Number(option.votes || 0), 0)
    );

    return {
      ...poll,
      id: poll._id || poll.id,
      votes: totalVotes,
      options: options.map((option, index) => ({
        ...option,
        text: option.text || "",
        votes: Number(option.votes || 0),
        color: TEAM_POLL_OPTION_COLORS[index % TEAM_POLL_OPTION_COLORS.length],
      })),
    };
  }, []);

  const fetchPolls = useCallback(async () => {
    const token = getAuthToken();

    if (!token) {
      setMsg(`Error: ${role === "hr" ? "HR token not found. Please login again." : "Employee token not found. Please login again."}`);
      return;
    }

    try {
      setIsLoading(true);
      setMsg("");
      const { response, data } = await apiRequest(role === "hr" ? "/hr/team-polls" : "/employee/team-polls", {
        method: "GET",
        token,
      });

      if (!response.ok) {
        setMsg(`Error: ${data.message || "Failed to load team polls."}`);
        return;
      }

      setPolls((data.polls || []).map(normalizePoll));
    } catch (error) {
      console.error(error);
      setMsg("Error: Cannot load team polls from backend.");
    } finally {
      setIsLoading(false);
    }
  }, [normalizePoll, role]);

  const normalizeFeedbackAction = useCallback((action) => {
    const employeeEventId = action.employeeEventId || action.id || action._id;

    return {
      ...action,
      id: employeeEventId,
      employeeEventId,
      status: action.status || (action.feedback ? "submitted" : "pending"),
      feedback: action.feedback || null,
    };
  }, []);

  const applyFeedbackActions = useCallback((actions = []) => {
    const normalizedActions = actions.map(normalizeFeedbackAction).filter((action) => action.employeeEventId);
    setFeedbackActions(normalizedActions);
    setFeedbackDrafts((currentDrafts) => {
      const nextDrafts = { ...currentDrafts };

      normalizedActions.forEach((action) => {
        const id = String(action.employeeEventId);
        const savedFeedback = action.feedback;

        if (!nextDrafts[id] || savedFeedback) {
          nextDrafts[id] = {
            rating: Number(savedFeedback?.rating || nextDrafts[id]?.rating || 5),
            comment: savedFeedback?.comment ?? nextDrafts[id]?.comment ?? "",
          };
        }
      });

      return nextDrafts;
    });
  }, [normalizeFeedbackAction]);

  const fetchFeedbackActions = useCallback(async () => {
    if (role !== "employee") return;

    const token = getAuthToken();

    if (!token) {
      setMsg("Error: Employee token not found. Please login again.");
      return;
    }

    try {
      setIsLoadingFeedback(true);
      const { response, data } = await apiRequest("/employee/feedback-actions", {
        method: "GET",
        token,
      });

      if (!response.ok) {
        setMsg(`Error: ${data.message || "Failed to load feedback actions."}`);
        return;
      }

      applyFeedbackActions(data.feedbackActions || []);
    } catch (error) {
      console.error(error);
      setMsg("Error: Cannot load feedback actions from backend.");
    } finally {
      setIsLoadingFeedback(false);
    }
  }, [applyFeedbackActions, role]);

  useEffect(() => {
    fetchPolls();
    if (role === "employee") {
      fetchFeedbackActions();
    }
  }, [fetchFeedbackActions, fetchPolls, role]);

  useEffect(() => {
    if (role !== "employee") return undefined;

    const intervalId = window.setInterval(fetchFeedbackActions, 30000);
    return () => window.clearInterval(intervalId);
  }, [fetchFeedbackActions, role]);

  const handleRefresh = () => {
    fetchPolls();
    if (role === "employee") {
      fetchFeedbackActions();
    }
  };

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

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    const cleanedOptions = newOptions.map((option) => option.trim()).filter(Boolean);

    if (!newQuestion.trim() || cleanedOptions.length < 2) {
      showSystemMessage({
        tone: "error",
        title: "Action needed",
        message: "Please enter a question and at least two options.",
      });
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setMsg("Error: HR token not found. Please login again.");
      return;
    }

    try {
      setSaving(true);
      setMsg("");
      const { response, data } = await apiRequest("/hr/team-polls", {
        method: "POST",
        token,
        body: {
          question: newQuestion.trim(),
          options: cleanedOptions,
        },
      });

      if (!response.ok) {
        setMsg(`Error: ${data.message || "Failed to publish poll."}`);
        return;
      }

      setPolls((currentPolls) => [normalizePoll(data.poll), ...currentPolls]);
      setIsCreating(false);
      setNewQuestion("");
      setNewOptions(["", ""]);
      setMsg("Success: Poll published to employees.");
    } catch (error) {
      console.error(error);
      setMsg("Error: Cannot connect to backend. Poll was not published.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePoll = async (id) => {
    const token = getAuthToken();
    if (!token) {
      setMsg("Error: HR token not found. Please login again.");
      return;
    }

    try {
      setBusyPollId(`delete-${id}`);
      setMsg("");
      const { response, data } = await apiRequest(`/hr/team-polls/${id}`, {
        method: "DELETE",
        token,
      });

      if (!response.ok) {
        setMsg(`Error: ${data.message || "Failed to delete poll."}`);
        return;
      }

      setPolls((currentPolls) => currentPolls.filter((poll) => poll.id !== id));
      setMsg("Success: Poll deleted.");
    } catch (error) {
      console.error(error);
      setMsg("Error: Cannot connect to backend. Poll was not deleted.");
    } finally {
      setBusyPollId(null);
    }
  };

  const handleCompletePoll = async (id) => {
    const token = getAuthToken();
    if (!token) {
      setMsg("Error: HR token not found. Please login again.");
      return;
    }

    try {
      setBusyPollId(`complete-${id}`);
      setMsg("");
      const { response, data } = await apiRequest(`/hr/team-polls/${id}/complete`, {
        method: "POST",
        token,
      });

      if (!response.ok) {
        setMsg(`Error: ${data.message || "Failed to close poll."}`);
        return;
      }

      setPolls((currentPolls) => currentPolls.map((poll) => (poll.id === id ? normalizePoll(data.poll) : poll)));
      setMsg("Success: Poll closed. Use the winning option to make the HR decision.");
    } catch (error) {
      console.error(error);
      setMsg("Error: Cannot connect to backend. Poll was not closed.");
    } finally {
      setBusyPollId(null);
    }
  };

  const handleVote = async (poll, optionIndex) => {
    if (role !== "employee" || poll.status !== "active" || poll.hasVoted) {
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setMsg("Error: Employee token not found. Please login again.");
      return;
    }

    try {
      setBusyPollId(`vote-${poll.id}`);
      setMsg("");
      const { response, data } = await apiRequest(`/employee/team-polls/${poll.id}/vote`, {
        method: "POST",
        token,
        body: { optionIndex },
      });

      if (!response.ok) {
        setMsg(`Error: ${data.message || "Failed to vote."}`);
        return;
      }

      setPolls((currentPolls) => currentPolls.map((currentPoll) => (currentPoll.id === poll.id ? normalizePoll(data.poll) : currentPoll)));
      setMsg("Success: Thank you for voting!");
    } catch (error) {
      console.error(error);
      setMsg("Error: Cannot connect to backend. Vote was not saved.");
    } finally {
      setBusyPollId(null);
    }
  };

  const handleFeedbackDraftChange = (eventId, field, value) => {
    setFeedbackDrafts((currentDrafts) => ({
      ...currentDrafts,
      [String(eventId)]: {
        ...currentDrafts[String(eventId)],
        [field]: field === "rating" ? Number(value) : value,
      },
    }));
  };

  const handleSubmitFeedback = async (action) => {
    const eventId = String(action.employeeEventId);
    const draft = feedbackDrafts[eventId] || {
      rating: Number(action.feedback?.rating || 5),
      comment: action.feedback?.comment || "",
    };
    const rating = Number(draft.rating);

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      setMsg("Error: Feedback rating must be between 1 and 5.");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setMsg("Error: Employee token not found. Please login again.");
      return;
    }

    try {
      setBusyFeedbackId(eventId);
      setMsg("");
      const { response, data } = await apiRequest(`/employee/feedback/${eventId}`, {
        method: "POST",
        token,
        body: {
          rating,
          comment: draft.comment || "",
        },
      });

      if (!response.ok) {
        setMsg(`Error: ${data.message || "Failed to save feedback."}`);
        return;
      }

      applyFeedbackActions(data.feedbackActions || []);

      if (data.employee) {
        localStorage.setItem("user", JSON.stringify(data.employee));
      }

      if (onProfileUpdate) {
        onProfileUpdate(data.employee);
      }

      setMsg(data.pointsAwarded ? "Success: Feedback submitted. 5 Culture Points awarded." : "Success: Feedback updated.");
    } catch (error) {
      console.error(error);
      setMsg("Error: Cannot connect to backend. Feedback was not saved.");
    } finally {
      setBusyFeedbackId(null);
    }
  };

  const isError = msg.startsWith("Error:");

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{role === 'employee' ? 'Have Your Say' : 'Team Polling'}</h1>
          <p className="text-slate-500 mt-1">
            {role === 'employee' ? 'Vote on upcoming activities and shape the company culture.' : 'Let your employees vote on upcoming activities and events.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleRefresh}
            className="px-4 py-2.5 bg-white text-slate-700 font-medium rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            {role === "employee" ? "Refresh Polls & Feedback" : "Refresh Polls"}
          </button>
          {role === 'hr' && !isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              className="px-5 py-2.5 bg-sky-600 text-white font-medium rounded-xl shadow-md shadow-sky-200 hover:bg-sky-700 transition-colors flex items-center gap-2"
            >
              <Vote className="w-4 h-4" /> Create New Poll
            </button>
          )}
        </div>
      </div>

      {msg && (
        <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${isError ? "bg-red-50 text-red-700 border-red-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"}`}>
          {msg}
        </div>
      )}

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
              disabled={saving}
              className="px-6 py-2.5 bg-sky-600 text-white rounded-xl shadow-md hover:bg-sky-700 font-bold transition-colors disabled:opacity-60"
            >
              {saving ? "Publishing..." : "Publish Poll"}
            </button>
          </div>
        </form>
      )}

      {isLoading && (
        <div className="bg-white rounded-2xl p-10 border border-slate-100 shadow-sm text-center text-slate-500">
          Loading team polls...
        </div>
      )}

      {!isLoading && polls.length === 0 && (
        <div className="bg-white rounded-2xl p-12 border border-slate-100 shadow-sm text-center">
          <Vote className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-800">No Team Polls Yet</h2>
          <p className="text-slate-500 mt-1">
            {role === "hr" ? "Create a poll to publish it to your employees." : "Published polls will appear here."}
          </p>
        </div>
      )}

      <div className="grid gap-6">
        {polls.map((poll) => {
          const winner = poll.winningOption && poll.votes > 0 ? poll.winningOption : null;
          return (
            <div key={poll.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {poll.status === 'active' ? (
                      <span className="px-2.5 py-1 text-xs font-bold bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> Active
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 text-xs font-bold bg-slate-100 text-slate-600 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Completed
                      </span>
                    )}
                    <span className="text-xs font-medium text-slate-400">{poll.votes} <span>total votes</span></span>
                    {role === "employee" && poll.hasVoted && (
                      <span className="px-2.5 py-1 text-xs font-bold bg-sky-100 text-sky-700 rounded-full">
                        You have already voted
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 pr-0 md:pr-8">{poll.question}</h3>
                </div>
                
                {role === 'hr' && (
                  <div className="flex items-center gap-2 shrink-0">
                    {poll.status === "active" && (
                      <button
                        onClick={() => handleCompletePoll(poll.id)}
                        disabled={busyPollId === `complete-${poll.id}`}
                        className="px-3 py-2 text-sm font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors disabled:opacity-60"
                      >
                        Close Poll
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeletePoll(poll.id)}
                      disabled={busyPollId === `delete-${poll.id}`}
                      className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors disabled:opacity-60"
                      title="Delete Poll"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {poll.options.map((opt, i) => {
                  const percentage = poll.votes === 0 ? 0 : Math.round((opt.votes / poll.votes) * 100);
                  const canVote = role === 'employee' && poll.status === 'active' && !poll.hasVoted && busyPollId !== `vote-${poll.id}`;
                  const isSelectedVote = role === "employee" && poll.votedOptionIndex === i;

                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={!canVote}
                      onClick={() => handleVote(poll, i)}
                      className={`block w-full text-left relative rounded-xl p-2 -m-2 transition-colors ${canVote ? 'cursor-pointer group hover:bg-sky-50' : 'cursor-default'}`}
                    >
                      <div className="flex justify-between gap-3 text-sm font-medium text-slate-700 mb-1.5">
                        <span className={`${canVote ? 'group-hover:text-sky-600' : ''}`}>
                          {opt.text}
                          {isSelectedVote && <span className="ml-2 text-xs font-bold text-sky-600">Your vote</span>}
                        </span>
                        <span className="text-slate-500 whitespace-nowrap">{percentage}% ({opt.votes} <span>votes</span>)</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${opt.color} rounded-full transition-all duration-1000 ${canVote ? 'group-hover:opacity-80' : ''}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {role === 'hr' && (
                <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                      {poll.status === "completed" ? "Winning choice" : "Leading choice"}
                    </p>
                    <p className="text-sm font-bold text-slate-700">{winner ? `${winner.text} (${winner.votes} votes)` : "No votes yet"}</p>
                  </div>
                  {poll.status === 'completed' && (
                    <button className="text-sky-600 font-medium text-sm flex items-center gap-1 hover:underline">
                      Book Winning Activity <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {role === "employee" && (
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Vendor Feedback</h2>
              <p className="text-sm text-slate-500 mt-1">Share feedback after completed events. First feedback submission awards 5 Culture Points.</p>
            </div>
            <button
              type="button"
              onClick={fetchFeedbackActions}
              className="px-4 py-2.5 bg-white text-slate-700 font-medium rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Refresh Feedback
            </button>
          </div>

          {isLoadingFeedback && (
            <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm text-center text-slate-500">
              Loading feedback actions...
            </div>
          )}

          {!isLoadingFeedback && feedbackActions.length === 0 && (
            <div className="bg-white rounded-2xl p-10 border border-slate-100 shadow-sm text-center">
              <Star className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-slate-800">No Feedback Actions Yet</h3>
              <p className="text-slate-500 mt-1">Completed events that need vendor feedback will appear here.</p>
            </div>
          )}

          {!isLoadingFeedback && feedbackActions.length > 0 && (
            <div className="grid gap-4">
              {feedbackActions.map((action) => {
                const eventId = String(action.employeeEventId);
                const draft = feedbackDrafts[eventId] || {
                  rating: Number(action.feedback?.rating || 5),
                  comment: action.feedback?.comment || "",
                };
                const selectedRating = Number(draft.rating || 5);
                const isSubmitted = action.status === "submitted" || Boolean(action.feedback);
                const canEditFeedback = !isSubmitted || action.feedback?.canEdit;

                return (
                  <div key={eventId} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-5">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${isSubmitted ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                            {isSubmitted ? "Submitted" : "Pending Feedback"}
                          </span>
                          <span className="text-xs font-bold text-slate-400">{action.eventDate || "No date"}</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">{action.eventTitle || "Completed Event"}</h3>
                        <p className="text-sm text-slate-500 mt-1">
                          <span>Vendor:</span> <span className="font-semibold text-slate-700">{action.vendorCompany || "Vendor"}</span>
                        </p>
                      </div>
                      <p className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 border border-purple-100 px-3 py-2 rounded-xl">
                        {isSubmitted ? (canEditFeedback ? "Feedback can be edited once within 5 minutes." : "Feedback edit is closed.") : "+5 Culture Points for first feedback submission"}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Rate the vendor</label>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((score) => (
                            <button
                              key={score}
                              type="button"
                              onClick={() => handleFeedbackDraftChange(eventId, "rating", score)}
                              className="p-1 rounded-lg hover:bg-yellow-50 transition-colors"
                              title={`${score} star`}
                            >
                              <Star className={`w-6 h-6 ${score <= selectedRating ? "text-yellow-400 fill-current" : "text-slate-300"}`} />
                            </button>
                          ))}
                          <span className="ml-2 text-sm font-black text-slate-700">{selectedRating.toFixed(1)}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Your feedback</label>
                        <textarea
                          value={draft.comment}
                          onChange={(event) => handleFeedbackDraftChange(eventId, "comment", event.target.value)}
                          rows="4"
                          placeholder="Share what worked well or what could improve."
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 resize-y"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleSubmitFeedback(action)}
                          disabled={busyFeedbackId === eventId || !canEditFeedback}
                          className="px-5 py-2.5 bg-purple-600 text-white font-bold rounded-xl shadow-md shadow-purple-100 hover:bg-purple-700 transition-colors disabled:opacity-60"
                        >
                          {busyFeedbackId === eventId ? "Saving..." : isSubmitted ? "Update Feedback" : "Submit Feedback"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}



function ActivityCard({ activity, onDetails }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 group flex flex-col">
      <div className="relative h-48 overflow-hidden">
        <img src={activity.image || "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=80"} alt={activity.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 text-sm font-bold text-slate-800 shadow-sm"><Star className="w-4 h-4 text-yellow-500 fill-current" />{activity.rating || 5}</div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-lg text-slate-900 mb-1 leading-tight group-hover:text-sky-600 transition-colors">{activity.title}</h3>
        <p className="text-sm text-slate-500 flex items-center gap-1.5 mb-2"><Shield className="w-4 h-4 text-slate-400" /> Vendor: {activity.vendor}</p>
        {(activity.vendorEmail || activity.vendorPhone) && (
          <p className="text-xs text-slate-500 mb-2">
            {activity.vendorEmail && <span className="break-all">{activity.vendorEmail}</span>}
            {activity.vendorEmail && activity.vendorPhone && <span> - </span>}
            {activity.vendorPhone && <span>{activity.vendorPhone}</span>}
          </p>
        )}
        <p className="text-sm text-slate-500 flex items-center gap-1.5 mb-3"><Calendar className="w-4 h-4 text-slate-400" /> Event Date: {activity.eventDate || "N/A"}</p>
        <p className="text-sm text-slate-600 mb-4 line-clamp-3">{activity.description}</p>
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
          <div><span className="block text-xs text-slate-400 uppercase tracking-wider">Est. Cost</span><span className="font-bold text-slate-800">{activity.price}</span></div>
          <button onClick={onDetails} className="px-4 py-2 bg-sky-50 text-sky-700 font-medium rounded-lg hover:bg-sky-600 hover:text-white transition-colors text-sm">Details</button>
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

export { EvoPathLogo, AnimatedBrandText, usePinReset, ResetPinModal, ConfirmActionModal, Sidebar, MobileHeader, TeamPolling, ActivityCard, EventsPlaceholder };
