import React, { useState, useEffect } from 'react';
import { INITIAL_ACTIVITIES } from './utils/constants';
import { apiRequest } from './utils/api';
import { LanguageProvider } from './utils/i18n';
import LandingPage from './pages/LandingPage';
import { AdminPortal } from './features/admin/AdminFeatures';
import { HrPortal } from './features/hr/HrFeatures';
import { VendorPortal } from './features/vendor/VendorFeatures';
import { EmployeePortal } from './features/employee/EmployeeFeatures';

export default function App() {
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES);
  const [usersDB, setUsersDB] = useState([]);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) setUser(JSON.parse(savedUser));
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const { response, data } = await apiRequest("/activities");

        if (response.ok) {
          setActivities(data.activities || []);
        } else {
          console.error(data.message || "Failed to load activities.");
        }
      } catch (error) {
        console.error("Failed to load activities:", error);
      }
    };

    fetchActivities();
  }, []);

  const handleAuth = async (actionOrRole, payloadOrUsername, isRegisteringArg = false, companyCodeArg = "", pinArg = "", businessNameArg = "") => {
    let role = actionOrRole;
    let username = payloadOrUsername;
    let pin = pinArg;
    let isRegistering = isRegisteringArg;
    let companyCode = companyCodeArg;
    let businessName = businessNameArg;
    let email = "";
    let phone = "";
    let password = "";
    let adminPin = "";
    let portalRole = "";

    if (actionOrRole === "login" || actionOrRole === "register") {
      const payload = payloadOrUsername || {};
      isRegistering = actionOrRole === "register";
      role = payload.role;
      username = payload.username;
      pin = payload.pin;
      password = payload.password;
      adminPin = payload.adminPin;
      portalRole = payload.portalRole || payload.role;
      companyCode = payload.companyCode;
      businessName = payload.businessName;
      email = payload.email;
      phone = payload.phone;
    }

    username = (username || "").trim();
    pin = pin || "";
    companyCode = (companyCode || "").trim();
    businessName = (businessName || "").trim();
    email = (email || "").trim();
    phone = (phone || "").trim();
    password = password || "";
    adminPin = (adminPin || "").trim();
    portalRole = portalRole || role;

    if (isRegistering && (!username || !pin)) {
      return "Username and PIN are required.";
    }

    if (!isRegistering && portalRole === "admin" && (!username || !password || !adminPin)) {
      return "Username, password, and admin PIN are required.";
    }

    if (!isRegistering && portalRole !== "admin" && (!username || !pin)) {
      return "Username and PIN are required.";
    }

    let endpoint = "login";
    let requestBody = { username, pin, password, adminPin, portalRole };

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
          email,
          phone,
        };
      } else {
        return "HR and Admin accounts cannot be created from the signup page.";
      }
    }

    try {
      const { response, data } = await apiRequest(`/${endpoint}`, {
        method: "POST",
        body: requestBody,
      });

      if (!response.ok) {
        return data.message || "Something went wrong";
      }

      if (isRegistering) {
        if (role === "vendor") {
          return "Success: Vendor registration submitted successfully. Your account is pending admin approval.";
        }
        return "Success: Account created successfully! Please sign in now.";
      }

      if (data.user?.role === "vendor" && data.user?.status === "pending") {
        return "Your account is awaiting admin approval.";
      }

      if (portalRole && data.user?.role !== portalRole) {
        return "Please select the correct portal for your role.";
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

  let content = <LandingPage onAuth={handleAuth} />;

  if (user?.role === 'admin') {
    content = <AdminPortal user={user} onLogout={handleLogout} usersDB={usersDB} setUsersDB={setUsersDB} />;
  } else if (user?.role === 'hr') {
    content = <HrPortal user={user} onLogout={handleLogout} activities={activities} setActivities={setActivities} usersDB={usersDB} setUsersDB={setUsersDB} />;
  } else if (user?.role === 'vendor') {
    content = <VendorPortal user={user} onLogout={handleLogout} activities={activities} setActivities={setActivities} />;
  } else if (user?.role === 'employee') {
    content = <EmployeePortal user={user} setUser={setUser} onLogout={handleLogout} />;
  }

  return <LanguageProvider>{content}</LanguageProvider>;
}
