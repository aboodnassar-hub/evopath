import React, { useState, useEffect } from 'react';
import { Briefcase, Calendar, TrendingUp, Star, X, CheckCircle, PlusCircle, FileText, CheckSquare, Clock, Trash2, History, MessageSquare } from 'lucide-react';
import { API_BASE_URL } from '../../utils/constants';
import { Sidebar, MobileHeader, ConfirmActionModal } from '../../components/shared';

const isDateReached = (dateValue) => {
  if (!dateValue) return false;
  const eventDate = new Date(dateValue);
  if (Number.isNaN(eventDate.getTime())) return false;
  const today = new Date();
  eventDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return eventDate <= today;
};

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
          { id: 'bids', icon: <FileText />, label: "Custom Requests" },
          { id: 'bookings', icon: <CheckSquare />, label: "My Bookings" },
          { id: 'my-activities', icon: <Calendar />, label: "My Activities" },
          { id: 'create-listing', icon: <PlusCircle />, label: "Publish Activity" },
          { id: 'history', icon: <History />, label: "History" },
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
          {activeTab === 'bookings' && <VendorBookings />}
          {activeTab === 'my-activities' && <VendorActivities setActivities={setActivities} />}
          {activeTab === 'history' && <VendorHistory />}
          {activeTab === 'create-listing' && <VendorCreateListing user={user} setActivities={setActivities} setTab={setActiveTab} />}
        </div>
      </main>
    </div>
  );
}

function VendorBookings() {
  const [bookings, setBookings] = useState([]);
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const fetchVendorBookings = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMsg("Error: Vendor token not found. Please login again.");
      return;
    }

    try {
      setIsLoading(true);
      setMsg("");

      const response = await fetch(`${API_BASE_URL}/vendor/bookings`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setMsg(`Error: ${data.message || "Failed to load bookings."}`);
        return;
      }

      setBookings(data.bookings || []);
    } catch (error) {
      console.error(error);
      setMsg("Error: Cannot load bookings from backend.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateBookingStatus = async (bookingId, action) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMsg("Error: Vendor token not found. Please login again.");
      return;
    }

    try {
      setActionLoadingId(bookingId);
      setMsg("");

      const response = await fetch(`${API_BASE_URL}/vendor/bookings/${bookingId}/${action}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setMsg(`Error: ${data.message || `Failed to ${action} booking.`}`);
        return;
      }

      if (action === "reject") {
        setBookings((prev) =>
          prev.map((booking) =>
            booking._id === bookingId ? { ...booking, ...(data.booking || {}), status: "rejected" } : booking
          )
        );
        setMsg("Success: Booking rejected. HR can delete it from rejected requests.");
      } else {
        setBookings((prev) =>
          prev.map((booking) =>
            booking._id === bookingId ? { ...booking, ...(data.booking || {}), status: data.booking?.status || "confirmed" } : booking
          )
        );
        setMsg(action === "complete" ? "Success: Vendor completion saved." : "Success: Booking approved.");
      }
    } catch (error) {
      console.error(error);
      setMsg("Error: Cannot connect to backend. Booking was not updated.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const deleteCompletedBooking = async (booking) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMsg("Error: Vendor token not found. Please login again.");
      return;
    }

    try {
      setActionLoadingId(`delete-${booking._id}`);
      setMsg("");
      const response = await fetch(`${API_BASE_URL}/vendor/bookings/${booking._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        setMsg(`Error: ${data.message || "Failed to delete completed booking."}`);
        return;
      }

      setBookings((prev) => prev.filter((item) => item._id !== booking._id));
      setMsg("Success: Completed booking deleted.");
      setConfirmAction(null);
    } catch (error) {
      console.error(error);
      setMsg("Error: Cannot connect to backend. Completed booking was not deleted.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const statusBadge = (status) => {
    if (status === "completed") return "bg-emerald-100 text-emerald-700";
    if (status === "confirmed") return "bg-green-100 text-green-700";
    if (status === "rejected") return "bg-red-100 text-red-700";
    return "bg-amber-100 text-amber-700";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Bookings</h1>
          <p className="text-slate-500 mt-1">Approve or reject HR booking requests for your activities.</p>
        </div>
        <button onClick={fetchVendorBookings} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm">
          Refresh Bookings
        </button>
      </header>

      {msg && <div className={`p-3 text-sm font-bold rounded-lg ${msg.startsWith("Error") ? "bg-red-50 text-red-700" : msg.startsWith("Success") ? "bg-green-50 text-green-700" : "bg-sky-50 text-sky-700"}`}>{msg}</div>}

      {isLoading ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 italic">Loading bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-700">No Booking Requests Yet</h2>
          <p className="text-slate-500">New HR booking requests will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {bookings.map((booking) => (
            <div key={booking._id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-black text-lg text-slate-900">{booking.activityTitle}</h3>
                  <p className="text-sm text-slate-500">Requested by {booking.hrCompany}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${statusBadge(booking.status)}`}>
                  {booking.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-xs text-slate-400 uppercase font-bold">HR Contact</p>
                  <p className="font-bold text-slate-800">{booking.hrName}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-xs text-slate-400 uppercase font-bold">Participants</p>
                  <p className="font-bold text-slate-800">{booking.participants}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-xs text-slate-400 uppercase font-bold">Event Date</p>
                  <p className="font-bold text-slate-800">{booking.eventDate || "N/A"}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-xs text-slate-400 uppercase font-bold">Email</p>
                  <p className="font-medium text-slate-700 break-all">{booking.hrEmail}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-xs text-slate-400 uppercase font-bold">Phone</p>
                  <p className="font-medium text-slate-700">{booking.hrPhone}</p>
                </div>
              </div>

              {booking.status === "pending" && (
                <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => updateBookingStatus(booking._id, "approve")}
                    disabled={actionLoadingId === booking._id}
                    className="py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:bg-slate-300 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" /> {actionLoadingId === booking._id ? "Updating..." : "Approve"}
                  </button>
                  <button
                    onClick={() => updateBookingStatus(booking._id, "reject")}
                    disabled={actionLoadingId === booking._id}
                    className="py-2.5 bg-red-50 text-red-700 font-bold rounded-xl hover:bg-red-100 disabled:bg-slate-100 disabled:text-slate-400 transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" /> Reject
                  </button>
                </div>
              )}
              {booking.status === "confirmed" && (
                <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
                  {(() => {
                    const joinedCount = Number(booking.employeeParticipantCount || booking.employeeEvent?.participantCount || 0);
                    const maxParticipants = Number(booking.employeeMaxParticipants || booking.employeeEvent?.maxParticipants || booking.participants || 0);
                    const participantThresholdReached = maxParticipants > 0 && joinedCount >= maxParticipants;
                    const canComplete = isDateReached(booking.eventDate) && participantThresholdReached;
                    return (
                      <>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <span className={`rounded-lg px-3 py-2 font-bold ${booking.hrCompletedAt ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-500"}`}>
                      HR: {booking.hrCompletedAt ? "Completed" : "Pending"}
                    </span>
                    <span className={`rounded-lg px-3 py-2 font-bold ${booking.vendorCompletedAt ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-500"}`}>
                      Vendor: {booking.vendorCompletedAt ? "Completed" : "Pending"}
                    </span>
                  </div>
                  <button
                    onClick={() => updateBookingStatus(booking._id, "complete")}
                    disabled={!canComplete || booking.vendorCompletedAt || actionLoadingId === booking._id}
                    className="w-full py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:bg-slate-300 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {booking.vendorCompletedAt ? "Completed by Vendor" : canComplete ? "Completed" : !participantThresholdReached ? "Waiting for Participants" : "Available on Event Date"}
                  </button>
                      </>
                    );
                  })()}
                </div>
              )}
              {booking.status === "completed" && (
                <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
                  <div className="rounded-xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
                    Completed on both HR and Vendor sides.
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setConfirmAction({
                        title: "Delete Completed Booking?",
                        message: "This completed event or trip will be removed from vendor bookings and related employee records.",
                        confirmLabel: "Delete Booking",
                        onConfirm: () => deleteCompletedBooking(booking),
                      })
                    }
                    disabled={actionLoadingId === `delete-${booking._id}`}
                    className="w-full py-2.5 bg-red-50 text-red-700 font-bold rounded-xl hover:bg-red-100 disabled:bg-slate-100 disabled:text-slate-400 transition-colors"
                  >
                    {actionLoadingId === `delete-${booking._id}` ? "Deleting..." : "Delete"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <ConfirmActionModal
        isOpen={Boolean(confirmAction)}
        title={confirmAction?.title}
        message={confirmAction?.message}
        confirmLabel={confirmAction?.confirmLabel}
        isProcessing={Boolean(actionLoadingId && String(actionLoadingId).startsWith("delete-"))}
        onCancel={() => setConfirmAction(null)}
        onConfirm={confirmAction?.onConfirm}
      />
    </div>
  );
}

function VendorHistory() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [msg, setMsg] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);

  const fetchHistory = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMsg("Error: Vendor token not found. Please login again.");
      return;
    }

    try {
      setIsLoading(true);
      setMsg("");
      const response = await fetch(`${API_BASE_URL}/vendor/history`, {
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
      setMsg("Error: Vendor token not found. Please login again.");
      return;
    }

    try {
      setIsDeleting(true);
      setMsg("");
      const response = await fetch(`${API_BASE_URL}/vendor/history`, {
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
          <p className="text-slate-500 mt-1">Completed events and trips delivered by your vendor account.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button onClick={fetchHistory} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm">
            Refresh History
          </button>
          <button
            onClick={() =>
              setConfirmAction({
                title: "Delete History?",
                message: "This will clear completed activities from your vendor history view.",
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
          <p className="text-slate-500">Completed vendor events will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {history.map((item) => (
            <div key={item.key} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">{item.source === "custom-request" ? "Custom Request" : "Vendor Activity"}</p>
                  <h3 className="font-black text-lg text-slate-900">{item.title}</h3>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">Completed</span>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                <p><strong>Date:</strong> {item.date || "N/A"}</p>
                <p><strong>HR Company:</strong> {item.hrCompany || item.company || "N/A"}</p>
                <p><strong>Participants:</strong> {item.participants || 0}</p>
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


function VendorActivities({ setActivities }) {
  const [myActivities, setMyActivities] = useState([]);
  const [editingActivity, setEditingActivity] = useState(null);
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [deletingActivityId, setDeletingActivityId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const refreshMarketplaceActivities = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/activities`);
      const data = await response.json();
      if (response.ok) {
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error("Failed to refresh marketplace activities:", error);
    }
  };

  const fetchMyActivities = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMsg("Error: Vendor token not found. Please login again.");
      return;
    }

    try {
      setIsLoading(true);
      setMsg("");

      const response = await fetch(`${API_BASE_URL}/vendor/activities`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        setMsg(`Error: ${data.message || "Failed to load activities."}`);
        return;
      }

      setMyActivities(data.activities || []);
    } catch (error) {
      console.error(error);
      setMsg("Error: Cannot load your activities from backend.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeleteActivity = async (activityId) => {
    const token = localStorage.getItem("token");
    if (!token) return setMsg("Error: Vendor token not found. Please login again.");

    try {
      setDeletingActivityId(activityId);
      setMsg("");
      const response = await fetch(`${API_BASE_URL}/activities/${activityId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        setMsg(`Error: ${data.message || "Failed to delete activity."}`);
        return;
      }

      setMyActivities((prev) => prev.filter((activity) => activity._id !== activityId));
      setActivities((prev) => prev.filter((activity) => activity._id !== activityId));
      await refreshMarketplaceActivities();
      setMsg("Success: Activity deleted everywhere.");
    } catch (error) {
      console.error(error);
      setMsg("Error: Cannot connect to backend. Activity was not deleted.");
    } finally {
      setDeletingActivityId("");
      setConfirmAction(null);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return setMsg("Error: Vendor token not found. Please login again.");

    const requestBody = {
      title: e.target.title.value.trim(),
      category: e.target.category.value,
      price: e.target.price.value.trim(),
      duration: e.target.duration.value.trim(),
      eventDate: e.target.eventDate.value,
      image: e.target.image.value.trim(),
      description: e.target.description.value.trim(),
    };

    try {
      setIsSaving(true);
      setMsg("");

      const response = await fetch(`${API_BASE_URL}/activities/${editingActivity._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        setMsg(`Error: ${data.message || "Failed to update activity."}`);
        return;
      }

      const updatedActivity = data.activity;
      setMyActivities((prev) => prev.map((activity) => activity._id === updatedActivity._id ? updatedActivity : activity));
      setActivities((prev) => prev.map((activity) => activity._id === updatedActivity._id ? updatedActivity : activity));
      await refreshMarketplaceActivities();
      await fetchMyActivities();
      setEditingActivity(null);
      setMsg("Success: Activity updated everywhere.");
    } catch (error) {
      console.error(error);
      setMsg("Error: Cannot connect to backend. Activity was not updated.");
    } finally {
      setIsSaving(false);
    }
  };

  const customRequestActivities = myActivities.filter((activity) => activity.source === "custom-request" || activity.customRequestId);
  const vendorActivities = myActivities.filter((activity) => !(activity.source === "custom-request" || activity.customRequestId));

  const renderActivityCard = (activity) => {
    const isCustomRequest = activity.source === "custom-request" || activity.customRequestId;

    return (
      <div key={activity._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <img src={activity.image || "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=80"} alt={activity.title} className="w-full h-40 object-cover" />
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-black text-lg text-slate-900">{activity.title}</h3>
            {isCustomRequest && <span className="px-2 py-1 text-xs font-black rounded-full bg-sky-100 text-sky-700">Custom</span>}
          </div>
          <p className="text-sm text-slate-500 mb-1">Date: {activity.eventDate || "N/A"}</p>
          <p className="text-sm text-slate-500 mb-1">Duration: {activity.duration}</p>
          <p className="text-sm text-slate-500 mb-3">Price: {activity.price}</p>
          <p className="text-sm text-slate-600 line-clamp-3 mb-4">{activity.description}</p>
          {isCustomRequest ? (
            <div className="mt-auto rounded-xl bg-sky-50 border border-sky-100 p-3 text-xs font-bold text-sky-700">
              Custom request activities are managed from the HR custom request only.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 mt-auto">
              <button onClick={() => setEditingActivity(activity)} className="py-2 bg-emerald-50 text-emerald-700 font-bold rounded-xl hover:bg-emerald-100 transition-colors text-sm">
                Edit
              </button>
              <button
                onClick={() =>
                  setConfirmAction({
                    title: "Delete Activity?",
                    message: "This activity and every related HR booking and employee registration will be deleted.",
                    confirmLabel: "Delete Activity",
                    onConfirm: () => handleDeleteActivity(activity._id),
                  })
                }
                disabled={deletingActivityId === activity._id}
                className="py-2 bg-red-50 text-red-700 font-bold rounded-xl hover:bg-red-100 transition-colors text-sm flex items-center justify-center gap-1 disabled:opacity-60"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Activities</h1>
          <p className="text-slate-500 mt-1">Manage the activities you published to the HR marketplace.</p>
        </div>
        <button onClick={fetchMyActivities} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm">
          Refresh Activities
        </button>
      </header>

      {msg && <div className={`p-3 text-sm font-bold rounded-lg ${msg.startsWith("Error") ? "bg-red-50 text-red-700" : msg.startsWith("Success") ? "bg-green-50 text-green-700" : "bg-sky-50 text-sky-700"}`}>{msg}</div>}

      {isLoading ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 italic">Loading activities...</p>
        </div>
      ) : myActivities.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-700">No Activities Yet</h2>
          <p className="text-slate-500">Published activities will appear here so you can edit them.</p>
        </div>
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">Vendor Activities</h2>
            {vendorActivities.length === 0 ? (
              <p className="text-slate-500 italic bg-white rounded-2xl border border-slate-100 p-5">No vendor activities yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {vendorActivities.map(renderActivityCard)}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">Custom Requests</h2>
            {customRequestActivities.length === 0 ? (
              <p className="text-slate-500 italic bg-white rounded-2xl border border-slate-100 p-5">No custom request activities yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {customRequestActivities.map(renderActivityCard)}
              </div>
            )}
          </section>
        </div>
      )}

      <ConfirmActionModal
        isOpen={Boolean(confirmAction)}
        title={confirmAction?.title}
        message={confirmAction?.message}
        confirmLabel={confirmAction?.confirmLabel}
        isProcessing={Boolean(deletingActivityId)}
        onCancel={() => setConfirmAction(null)}
        onConfirm={confirmAction?.onConfirm}
      />

      {editingActivity && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <form onSubmit={handleEditSubmit} className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-auto">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Edit Activity</h3>
                <p className="text-slate-500 text-sm">Update details shown in the HR marketplace.</p>
              </div>
              <button type="button" onClick={() => setEditingActivity(null)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input name="title" defaultValue={editingActivity.title} required className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select name="category" defaultValue={editingActivity.category} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 bg-white">
                  <option value="trips">Company Trip</option>
                  <option value="events">Office Event</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Price</label>
                <input name="price" defaultValue={editingActivity.price} required className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Duration</label>
                <input name="duration" defaultValue={editingActivity.duration} required className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Event Date</label>
                <input name="eventDate" type="date" defaultValue={editingActivity.eventDate || ""} required className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
                <input name="image" type="url" defaultValue={editingActivity.image || ""} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea name="description" defaultValue={editingActivity.description} required rows="4" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 resize-y" />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setEditingActivity(null)} className="px-5 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={isSaving} className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:bg-slate-300 transition-colors">
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function VendorDashboard({ user, setTab }) {
  const [stats, setStats] = useState({
    confirmedBookings: 0,
    pendingBookings: 0,
    pendingCustomRequests: 0,
    activityCount: 0,
    averageRating: 0,
    ratingCount: 0,
    recentFeedback: [],
    nextEventDate: "",
  });
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [statsMsg, setStatsMsg] = useState("");

  const fetchDashboardStats = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setStatsMsg("Error: Vendor token not found. Please login again.");
      return;
    }

    try {
      setIsLoadingStats(true);
      setStatsMsg("");

      const [bookingsResponse, requestsResponse, activitiesResponse, feedbackResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/vendor/bookings`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/vendor/custom-requests`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/vendor/activities`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/vendor/feedback`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const bookingsData = await bookingsResponse.json();
      const requestsData = await requestsResponse.json();
      const activitiesData = await activitiesResponse.json();
      const feedbackData = await feedbackResponse.json();

      if (!bookingsResponse.ok) {
        setStatsMsg(`Error: ${bookingsData.message || "Failed to load booking stats."}`);
        return;
      }

      if (!requestsResponse.ok) {
        setStatsMsg(`Error: ${requestsData.message || "Failed to load custom request stats."}`);
        return;
      }

      if (!activitiesResponse.ok) {
        setStatsMsg(`Error: ${activitiesData.message || "Failed to load activity stats."}`);
        return;
      }

      if (!feedbackResponse.ok) {
        setStatsMsg(`Error: ${feedbackData.message || "Failed to load vendor feedback."}`);
        return;
      }

      const bookings = bookingsData.bookings || [];
      const customRequests = requestsData.customRequests || [];
      const activities = activitiesData.activities || [];
      const feedback = feedbackData.feedback || [];
      const confirmedBookings = bookings.filter((booking) => booking.status === "confirmed");
      const pendingBookings = bookings.filter((booking) => booking.status === "pending");
      const averageRating = Number(feedbackData.averageRating || 0);
      const nextEvent = confirmedBookings
        .filter((booking) => booking.eventDate)
        .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))[0];

      setStats({
        confirmedBookings: confirmedBookings.length,
        pendingBookings: pendingBookings.length,
        pendingCustomRequests: customRequests.length,
        activityCount: activities.length,
        averageRating,
        ratingCount: Number(feedbackData.ratingCount || feedback.length || 0),
        recentFeedback: feedback.slice(0, 3),
        nextEventDate: nextEvent?.eventDate || "",
      });
    } catch (error) {
      console.error(error);
      setStatsMsg("Error: Cannot load vendor dashboard stats from backend.");
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <header className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Partner Dashboard</h1>
          <p className="text-slate-500 mt-1"><span>{user.company}</span> <span>Analytics</span></p>
        </div>
        <button onClick={fetchDashboardStats} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm">
          Refresh Dashboard
        </button>
      </header>

      {statsMsg && (
        <div className={`p-3 text-sm font-bold rounded-lg ${statsMsg.startsWith("Error") ? "bg-red-50 text-red-700" : "bg-sky-50 text-sky-700"}`}>
          {statsMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-700">Confirmed Bookings</h3>
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Calendar className="w-5 h-5" /></div>
          </div>
          <p className="text-4xl font-black text-slate-800">{isLoadingStats ? "..." : stats.confirmedBookings}</p>
          <p className="text-sm text-emerald-600 font-medium mt-2">
            {stats.nextEventDate ? `Next event: ${stats.nextEventDate}` : "No confirmed events yet"}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-700">Pending Bookings</h3>
            <div className="p-2 bg-sky-100 text-sky-600 rounded-lg"><CheckSquare className="w-5 h-5" /></div>
          </div>
          <p className="text-4xl font-black text-slate-800">{isLoadingStats ? "..." : stats.pendingBookings}</p>
          <button onClick={() => setTab('bookings')} className="text-sm text-sky-600 font-medium mt-2 text-left hover:underline">Review bookings</button>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-700">Pending Custom Requests</h3>
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><FileText className="w-5 h-5" /></div>
          </div>
          <p className="text-4xl font-black text-slate-800">{isLoadingStats ? "..." : stats.pendingCustomRequests}</p>
          <button onClick={() => setTab('bids')} className="text-sm text-amber-600 font-medium mt-2 text-left hover:underline">Review custom requests</button>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-700">Average Rating</h3>
            <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg"><Star className="w-5 h-5 fill-current" /></div>
          </div>
          <p className="text-4xl font-black text-slate-800">{isLoadingStats ? "..." : stats.ratingCount ? stats.averageRating.toFixed(1) : "N/A"}</p>
          <p className="text-sm text-slate-500 font-medium mt-2">Based on employee feedback</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-800">Published Activities</h3>
            <p className="text-sm text-slate-500 mt-1">Activities currently visible to HR managers.</p>
          </div>
          <p className="text-3xl font-black text-emerald-600">{isLoadingStats ? "..." : stats.activityCount}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-5">
          <div>
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-emerald-500" /> Employee Feedback</h3>
            <p className="text-sm text-slate-500 mt-1">Latest feedback from employees after completed events.</p>
          </div>
          <p className="text-sm font-bold text-slate-500"><span>{stats.ratingCount}</span> <span>employee feedback</span></p>
        </div>

        {stats.recentFeedback.length === 0 ? (
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-5 text-center">
            <p className="font-bold text-slate-700">No feedback submitted yet.</p>
            <p className="text-sm text-slate-500 mt-1">Your rating will appear after employees submit feedback.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {stats.recentFeedback.map((feedback) => (
              <div key={feedback.id || feedback._id} className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 truncate">{feedback.hrCompany || "HR Company"}</span>
                  <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map((score) => (
                      <Star key={score} className={`w-3.5 h-3.5 ${score <= Number(feedback.rating || 0) ? "fill-current" : "text-slate-300"}`} />
                    ))}
                  </div>
                </div>
                <h4 className="font-bold text-slate-800 text-sm">{feedback.eventTitle || "Completed Event"}</h4>
                <p className="text-xs text-slate-500 mt-1">{feedback.employeeName || feedback.employeeUsername || "Employee"}</p>
                <p className="text-sm text-slate-600 mt-3 italic">"{feedback.comment || "No written comment."}"</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


function VendorBids({ user }) {
  const isPending = user?.status === 'pending';
  const [customRequests, setCustomRequests] = useState([]);
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchCustomRequests = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMsg("Error: Vendor token not found. Please login again.");
      return;
    }

    try {
      setIsLoading(true);
      setMsg("");

      const response = await fetch(`${API_BASE_URL}/vendor/custom-requests`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        setMsg(`Error: ${data.message || "Failed to load custom requests."}`);
        return;
      }

      setCustomRequests(data.customRequests || []);
    } catch (error) {
      console.error(error);
      setMsg("Error: Cannot load custom requests from backend.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCustomRequestAction = async (requestId, action) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMsg("Error: Vendor token not found. Please login again.");
      return;
    }

    if (isPending) {
      setMsg("Error: Your vendor account must be approved before responding to custom requests.");
      return;
    }

    try {
      setActionLoadingId(requestId);
      setMsg("");

      const response = await fetch(`${API_BASE_URL}/vendor/custom-requests/${requestId}/${action}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        setMsg(`Error: ${data.message || `Failed to ${action} custom request.`}`);
        return;
      }

      setCustomRequests((prev) => prev.filter((request) => request._id !== requestId));
      setMsg(
        action === "approve"
          ? "Success: Custom request approved. It was added to My Activities and to HR My Company Events."
          : "Success: Custom request rejected and removed from the system."
      );
    } catch (error) {
      console.error(error);
      setMsg("Error: Cannot connect to backend. Custom request was not updated.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Custom Requests</h1>
          <p className="text-slate-500 mt-1">Review HR custom activity requests and approve or reject them.</p>
        </div>
        <button onClick={fetchCustomRequests} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm">
          Refresh Requests
        </button>
      </header>

      {isPending && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm font-medium">
          Your vendor account is pending approval. You can view custom requests, but you cannot approve or reject them until an Admin approves your account.
        </div>
      )}

      {msg && <div className={`p-3 text-sm font-bold rounded-lg ${msg.startsWith("Error") ? "bg-red-50 text-red-700" : msg.startsWith("Success") ? "bg-green-50 text-green-700" : "bg-sky-50 text-sky-700"}`}>{msg}</div>}

      {isLoading ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 italic">Loading custom requests...</p>
        </div>
      ) : customRequests.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-700">No Custom Requests Yet</h2>
          <p className="text-slate-500">New HR custom requests will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {customRequests.map((request) => (
            <div key={request._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-4 gap-4">
                <div>
                  <span className="inline-block px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full mb-2 uppercase tracking-wide">
                    Pending Custom Request
                  </span>
                  <h3 className="text-xl font-bold text-slate-800">{request.title}</h3>
                  <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                    <Briefcase className="w-4 h-4" /> {request.hrCompany}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-slate-700">Budget</p>
                  <p className="text-xl font-black text-emerald-600">{request.budget}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Category</p>
                  <p className="font-medium text-slate-800 capitalize">{request.category}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Attendees</p>
                  <p className="font-medium text-slate-800">{request.participants}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Target Date</p>
                  <p className="font-medium text-slate-800">{request.targetDate}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Status</p>
                  <p className="font-medium text-amber-600 capitalize">{request.status}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">HR Contact</p>
                  <p className="font-bold text-slate-800">{request.hrName}</p>
                  <p className="text-xs text-slate-500 break-all">{request.hrEmail}</p>
                  <p className="text-xs text-slate-500">{request.hrPhone}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Request ID</p>
                  <p className="font-mono text-xs text-slate-500 break-all">{request._id}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-700 mb-2">Detailed Requirements:</p>
                <p className="text-slate-600 text-sm bg-slate-50 p-4 rounded-lg whitespace-pre-wrap">
                  {request.requirements}
                </p>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  disabled={isPending || actionLoadingId === request._id}
                  onClick={() => handleCustomRequestAction(request._id, "approve")}
                  className={`px-5 py-2.5 font-bold rounded-xl transition-colors ${
                    isPending || actionLoadingId === request._id
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                >
                  {actionLoadingId === request._id ? "Processing..." : "Approve Request"}
                </button>
                <button
                  disabled={isPending || actionLoadingId === request._id}
                  onClick={() => handleCustomRequestAction(request._id, "reject")}
                  className={`px-5 py-2.5 font-bold rounded-xl transition-colors ${
                    isPending || actionLoadingId === request._id
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                      : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-100"
                  }`}
                >
                  Reject Request
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==========================================
// 3. EMPLOYEE PORTAL
// ==========================================

function VendorCreateListing({ user, setActivities, setTab }) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [msg, setMsg] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const isPending = user?.status === 'pending';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isPending) {
      setMsg("Your vendor account must be approved before publishing activities.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setMsg("Session expired. Please login again.");
      return;
    }

    const requestBody = {
      title: e.target.title.value.trim(),
      category: e.target.category.value,
      price: e.target.price.value.trim(),
      duration: e.target.duration.value.trim(),
      eventDate: e.target.eventDate.value,
      image: e.target.image?.value?.trim() || "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=80",
      description: e.target.description.value.trim(),
    };

    try {
      setIsPublishing(true);
      setMsg("");

      const response = await fetch(`${API_BASE_URL}/activities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        setMsg(data.message || "Failed to publish activity.");
        return;
      }

      setActivities((prev) => [data.activity, ...prev]);
      setIsSubmitted(true);
      e.target.reset();
    } catch (error) {
      console.error(error);
      setMsg("Cannot connect to backend. Activity was not published.");
    } finally {
      setIsPublishing(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-10 bg-white rounded-3xl border border-emerald-100 shadow-xl text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Activity Published!</h2>
        <p className="text-slate-500 mb-8 text-lg">Your activity was saved in MongoDB and is now visible to HR managers in the Activity Marketplace.</p>
        <button onClick={() => setTab('dashboard')} className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl shadow-md hover:bg-emerald-700 transition-colors">Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Publish New Activity</h1>
        <p className="text-slate-500 mt-1">Create a trip or event to be saved in MongoDB and featured in the HR Activity Marketplace.</p>
      </header>

      {isPending && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm font-medium">
          Your vendor account is pending approval. Publishing activities is disabled until Admin approval.
        </div>
      )}

      {msg && (
        <div className="p-3 text-sm font-bold rounded-lg bg-red-50 text-red-700">
          {msg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Activity Title</label>
          <input name="title" type="text" required disabled={isPending || isPublishing} placeholder="e.g., Mountain Yoga Retreat" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select name="category" disabled={isPending || isPublishing} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 outline-none appearance-none bg-white disabled:bg-slate-100 disabled:cursor-not-allowed">
              <option value="trips">Company Trip</option>
              <option value="events">Office Event</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Price (e.g., $50/person)</label>
            <input name="price" type="text" required disabled={isPending || isPublishing} placeholder="$50 / person" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Duration (e.g., 1 Day)</label>
            <input name="duration" type="text" required disabled={isPending || isPublishing} placeholder="1 Day" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Event Date</label>
            <input name="eventDate" type="date" required disabled={isPending || isPublishing} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Image URL (optional)</label>
          <input name="image" type="url" disabled={isPending || isPublishing} placeholder="https://example.com/activity-image.jpg" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea name="description" required rows="4" disabled={isPending || isPublishing} placeholder="Describe the activity..." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 outline-none resize-y disabled:bg-slate-100 disabled:cursor-not-allowed"></textarea>
        </div>
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isPending || isPublishing}
            className={`px-8 py-3.5 font-bold rounded-xl shadow-md transition-colors flex items-center gap-2 ${
              isPending || isPublishing
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            <PlusCircle className="w-5 h-5" /> {isPending ? 'Approval Required' : isPublishing ? 'Publishing...' : 'Publish to Marketplace'}
          </button>
        </div>
      </form>
    </div>
  );
}


export { VendorPortal, VendorBookings, VendorHistory, VendorActivities, VendorDashboard, VendorBids, VendorCreateListing };
