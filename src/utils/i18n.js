import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle, Info, Languages, X } from 'lucide-react';

const LANGUAGE_STORAGE_KEY = "evopath-language";
const textNodeOriginals = new WeakMap();

export function showSystemMessage({ message, title, tone = "info" }) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent("evopath:system-message", {
      detail: { message, title, tone },
    })
  );
}

const AR_TRANSLATIONS = {
  "Active Trips / Events": "الرحلات / الفعاليات النشطة",
  "History": "السجل",
  "Refresh History": "تحديث السجل",
  "Delete History": "حذف السجل",
  "Delete History?": "حذف السجل؟",
  "No History Yet": "لا يوجد سجل بعد",
  "Completed events, trips, and volunteer activities for your company.": "الفعاليات والرحلات وأنشطة التطوع المكتملة لشركتك.",
  "Completed company activities will appear here.": "ستظهر أنشطة الشركة المكتملة هنا.",
  "Completed events and trips delivered by your vendor account.": "الفعاليات والرحلات المكتملة التي قدمها حساب المزود الخاص بك.",
  "Completed vendor events will appear here.": "ستظهر فعاليات المزود المكتملة هنا.",
  "Completed events, trips, and volunteer activities you joined.": "الفعاليات والرحلات وأنشطة التطوع المكتملة التي شاركت بها.",
  "Completed activities you joined will appear here.": "ستظهر الأنشطة المكتملة التي شاركت بها هنا.",
  "This will clear the completed activities from your history view.": "سيؤدي هذا إلى مسح الأنشطة المكتملة من عرض السجل لديك.",
  "This will clear completed activities from your vendor history view.": "سيؤدي هذا إلى مسح الأنشطة المكتملة من سجل المزود لديك.",
  "This will clear completed activities from your employee history view.": "سيؤدي هذا إلى مسح الأنشطة المكتملة من سجل الموظف لديك.",
  "History deleted.": "تم حذف السجل.",
  "Success: History deleted.": "نجاح: تم حذف السجل.",
  "Failed to delete history.": "فشل حذف السجل.",
  "Error: Failed to delete history.": "خطأ: فشل حذف السجل.",
  "Cannot connect to backend. History was not deleted.": "لا يمكن الاتصال بالخادم. لم يتم حذف السجل.",
  "Error: Cannot connect to backend. History was not deleted.": "خطأ: لا يمكن الاتصال بالخادم. لم يتم حذف السجل.",
  "Completed": "مكتمل",
  "Completed by HR": "مكتمل من HR",
  "Completed by Vendor": "مكتمل من المزوّد",
  "Available on Event Date": "متاح في تاريخ الفعالية",
  "Withdraw": "انسحاب",
  "Withdrawing...": "جارٍ الانسحاب...",
  "Withdraw Registration": "سحب التسجيل",
  "Withdraw Participation": "سحب المشاركة",
  "You withdrew from this volunteer opportunity.": "تم سحب تسجيلك من فرصة التطوع هذه.",
  "Success: You withdrew from this volunteer opportunity.": "نجاح: تم سحب تسجيلك من فرصة التطوع هذه.",
  "You withdrew from this trip or event.": "تم سحب مشاركتك من هذه الرحلة أو الفعالية.",
  "Success: You withdrew from this trip or event.": "نجاح: تم سحب مشاركتك من هذه الرحلة أو الفعالية.",
  "Failed to withdraw.": "فشل سحب المشاركة.",
  "Error: Failed to withdraw.": "خطأ: فشل سحب المشاركة.",
  "Cannot connect to backend. Withdrawal failed.": "لا يمكن الاتصال بالخادم. فشل سحب المشاركة.",
  "Error: Cannot connect to backend. Withdrawal failed.": "خطأ: لا يمكن الاتصال بالخادم. فشل سحب المشاركة.",
  "Completed events cannot be withdrawn": "لا يمكن الانسحاب من الفعاليات المكتملة",
  "Completed volunteer opportunities cannot be withdrawn": "لا يمكن الانسحاب من فرص التطوع المكتملة",
  "Completed volunteer participation cannot be withdrawn": "لا يمكن الانسحاب من مشاركة تطوعية مكتملة",
  "You are not registered for this event": "أنت غير مسجل في هذه الفعالية",
  "You are not registered for this volunteer opportunity": "أنت غير مسجل في فرصة التطوع هذه",
  "Event withdrawn from HR and employees.": "تم سحب الفعالية من HR والموظفين.",
  "HR completion saved.": "تم حفظ إكمال HR.",
  "Vendor completion saved.": "تم حفظ إكمال المزوّد.",
  "Culture Score:": "مؤشر الثقافة:",
  "Volunteer Impact:": "أثر التطوع:",
  "Volunteer Hours:": "ساعات التطوع:",
  "HR Company:": "شركة HR:",
  "Vendor Activity": "نشاط المزود",
  "Publish to Employees": "نشر للموظفين",
  "Employee Capacity": "سعة الموظفين",
  "Maximum allowed:": "الحد الأقصى المسموح:",
  "Published to Employees": "منشور للموظفين",
  "employees joined": "موظفاً انضموا",
  "Open": "مفتوح",
  "Events, Trips & Volunteer": "الفعاليات والرحلات والتطوع",
  "Failed to publish event to employees.": "فشل نشر الفعالية للموظفين.",
  "Event published to employees.": "تم نشر الفعالية للموظفين.",
  "Please enter a valid employee capacity.": "يرجى إدخال سعة موظفين صحيحة.",
  "Employee capacity cannot exceed the requested participants.": "لا يمكن أن تتجاوز سعة الموظفين عدد المشاركين المطلوب.",
  "Cannot connect to backend. Event was not published to employees.": "لا يمكن الاتصال بالخادم. لم يتم نشر الفعالية للموظفين.",
  "Join HR-published trips and events before participant capacity closes.": "انضم إلى الرحلات والفعاليات التي ينشرها HR قبل إغلاق السعة.",
  "Join HR-published trips, events, and company experiences before participant capacity closes.": "انضم إلى الرحلات والفعاليات والتجارب التي ينشرها HR قبل إغلاق السعة.",
  "Loading active trips and events...": "جارٍ تحميل الرحلات والفعاليات النشطة...",
  "No Active Trips or Events Yet": "لا توجد رحلات أو فعاليات نشطة بعد",
  "No Events, Trips or Volunteer Activities Yet": "لا توجد فعاليات أو رحلات أو أنشطة تطوع بعد",
  "When HR publishes approved vendor events, they will appear here.": "عندما ينشر HR الفعاليات المعتمدة من المزوّدين، ستظهر هنا.",
  "When HR publishes approved activities, they will appear here.": "عندما ينشر HR الأنشطة المعتمدة، ستظهر هنا.",
  "Refresh Events": "تحديث الفعاليات",
  "Track your trips, events, and registered volunteer activities in one place.": "تابع رحلاتك وفعالياتك وأنشطة التطوع التي سجلت فيها في مكان واحد.",
  "Refresh Activities": "تحديث أنشطتي",
  "Loading your activities...": "جارٍ تحميل أنشطتك...",
  "Published events and volunteer opportunities you register for will appear here.": "ستظهر هنا الفعاليات المنشورة وفرص التطوع التي تسجل فيها.",
  "Company Volunteer": "تطوع الشركة",
  "Volunteer": "تطوع",
  "Registered": "مسجل",
  "Create and manage HR accounts from MongoDB, so data appears on every device.": "قم بإنشاء وإدارة حسابات الشركات من MongoDB، بحيث تظهر البيانات على كل جهاز.",
  "Failed to load volunteer registrations.": "فشل تحميل تسجيلات التطوع.",
  "Cannot load your activities from backend.": "لا يمكن تحميل أنشطتك من الخادم.",
  "Failed to load active trips and events.": "فشل تحميل الرحلات والفعاليات النشطة.",
  "Cannot load active trips and events from backend.": "لا يمكن تحميل الرحلات والفعاليات النشطة من الخادم.",
  "Failed to join event.": "فشل الانضمام إلى الفعالية.",
  "You joined this trip or event.": "لقد انضممت إلى هذه الرحلة أو الفعالية.",
  "Cannot connect to backend. Event join failed.": "لا يمكن الاتصال بالخادم. فشل الانضمام إلى الفعالية.",
  "Join Event": "الانضمام للفعالية",
  "Type": "النوع",
  "Published company event.": "فعالية منشورة من الشركة.",
  "Trips and events you joined will appear here once the backend itinerary endpoint is available.": "ستظهر الرحلات والفعاليات التي انضممت إليها هنا عند توفر endpoint الجدول في الخادم.",
  "System Admin": "مدير النظام",
  "For Companies": "للشركات",
  "For Vendors": "للمزوّدين",
  "For Employees": "للموظفين",
  "The New Standard in Corporate Culture": "المعيار الجديد في ثقافة الشركات",
  "Create Unforgettable": "اصنع تجارب لا تُنسى",
  "Team Experiences": "لروح الفريق",
  "The ultimate ecosystem connecting companies with top-rated coordination vendors, while giving employees a voice in their company culture.": "منصة متكاملة تربط الشركات بأفضل مزوّدي الفعاليات، وتمنح الموظفين صوتاً في ثقافة شركتهم.",
  "Sign In": "تسجيل الدخول",
  "Success": "نجاح",
  "Action needed": "يلزم إجراء",
  "Required field": "حقل مطلوب",
  "System message": "رسالة النظام",
  "Close message": "إغلاق الرسالة",
  "Please fill this field.": "يرجى تعبئة هذا الحقل.",
  "Please complete the highlighted field.": "يرجى إكمال الحقل المحدد.",
  "Please enter a valid email address.": "يرجى إدخال بريد إلكتروني صحيح.",
  "Please enter a valid value.": "يرجى إدخال قيمة صحيحة.",
  "Username is required": "اسم المستخدم مطلوب",
  "Username and PIN are required.": "اسم المستخدم ورمز PIN مطلوبان.",
  "Username, PIN, and company code are required": "اسم المستخدم ورمز PIN ورمز الشركة مطلوبة",
  "Username, PIN, company, email, and phone are required": "اسم المستخدم ورمز PIN والشركة والبريد الإلكتروني ورقم الهاتف مطلوبة",
  "Username already exists": "اسم المستخدم موجود مسبقاً",
  "PIN must be at least 4 digits.": "يجب أن يتكون رمز PIN من 4 أرقام على الأقل.",
  "PIN must contain numbers only.": "يجب أن يحتوي رمز PIN على أرقام فقط.",
  "Username must use English letters, numbers, dots, underscores, or hyphens only.": "يجب أن يحتوي اسم المستخدم على أحرف إنجليزية أو أرقام أو نقاط أو شرطات سفلية أو شرطات فقط.",
  "Username cannot be only digits.": "لا يمكن أن يكون اسم المستخدم أرقاماً فقط.",
  "Username cannot start with a special character.": "لا يمكن أن يبدأ اسم المستخدم برمز خاص.",
  "Invalid credentials": "بيانات الدخول غير صحيحة",
  "Error: Invalid credentials": "خطأ: بيانات الدخول غير صحيحة",
  "Self-Registration": "تسجيل ذاتي",
  "Select your portal to continue.": "اختر البوابة للمتابعة.",
  "Enter your details and provided company code.": "أدخل بياناتك ورمز الشركة المزوّد لك.",
  "Enter your business details to partner with us.": "أدخل بيانات شركتك للشراكة معنا.",
  "Admin": "الأدمن",
  "HR Admin": "مسؤول",
  "Vendor": "المزوّد",
  "Employee": "الموظف",
  "Username": "اسم المستخدم",
  "Password": "كلمة المرور",
  "Enter admin password": "أدخل كلمة مرور المدير",
  "Admin Portal PIN": "رمز بوابة المدير",
  "Admin Security PIN": "رمز أمان المدير",
  "Admin portal PIN: 147862": "رمز بوابة المدير: 147862",
  "Enter admin portal PIN": "أدخل رمز بوابة المدير",
  "Enter admin PIN to continue.": "أدخل رمز المدير للمتابعة.",
  "Admin credentials:": "بيانات دخول المدير:",
  "Unlock Admin Portal": "فتح بوابة المدير",
  "Username, password, and admin PIN are required.": "اسم المستخدم وكلمة المرور ورمز المدير مطلوبة.",
  "Please select your portal before login.": "يرجى اختيار البوابة قبل تسجيل الدخول.",
  "Error: Please select your portal before login.": "خطأ: يرجى اختيار البوابة قبل تسجيل الدخول.",
  "Please select the correct portal for your role.": "يرجى اختيار البوابة الصحيحة لدورك.",
  "Invalid admin portal PIN": "رمز بوابة المدير غير صحيح",
  "Error: Invalid admin portal PIN": "خطأ: رمز بوابة المدير غير صحيح",
  "Error: Please select the correct portal for your role.": "خطأ: يرجى اختيار البوابة الصحيحة لدورك.",
  "Secure PIN": "رمز PIN الآمن",
  "Business Name": "اسم النشاط التجاري",
  "Business Email": "البريد الإلكتروني للنشاط",
  "Business Phone": "هاتف النشاط التجاري",
  "Company Code": "رمز الشركة",
  "Register Account": "تسجيل الحساب",
  "Access Portal": "الدخول للبوابة",
  "Vendor registration submitted successfully. Your account is pending admin approval.": "تم إرسال تسجيل المزوّد بنجاح. حسابك بانتظار موافقة الأدمن.",
  "Success: Vendor registration submitted successfully. Your account is pending admin approval.": "نجاح: تم إرسال تسجيل المزوّد بنجاح. حسابك بانتظار موافقة الأدمن.",
  "Account created successfully! Please sign in now.": "تم إنشاء الحساب بنجاح! يرجى تسجيل الدخول الآن.",
  "Success: Account created successfully! Please sign in now.": "نجاح: تم إنشاء الحساب بنجاح! يرجى تسجيل الدخول الآن.",
  "Already have an account?": "لديك حساب بالفعل؟",
  "Don't have an account?": "ليس لديك حساب؟",
  "Self-Register": "تسجيل ذاتي",
  "Enter username": "أدخل اسم المستخدم",
  "4-6 digit PIN": "رمز من 4 إلى 6 أرقام",
  "e.g., Desert Horizons Coordination": "مثال: Desert Horizons Coordination",
  "e.g., contact@vendor.com": "مثال: contact@vendor.com",
  "e.g., +962790000000": "مثال: +962790000000",
  "e.g., TECH-2026": "مثال: TECH-2026",

  "Overview": "نظرة عامة",
  "Manage Companies (HR)": "إدارة الشركات (HR)",
  "Manage Vendors": "إدارة المزوّدين",
  "Dashboard": "لوحة التحكم",
  "Manage Team": "إدارة الفريق",
  "Activity Marketplace": "سوق الأنشطة",
  "Custom Request": "طلب مخصص",
  "Add New Custom Request": "إضافة طلب مخصص جديد",
  "Close Form": "إغلاق النموذج",
  "Design your own trip or event and send it to one selected vendor.": "صمم رحلتك أو فعاليتك وأرسلها إلى مزود محدد.",
  "Select Vendor": "اختر المزود",
  "Loading vendors...": "جارٍ تحميل المزودين...",
  "No active vendors available.": "لا يوجد مزودون نشطون متاحون.",
  "Custom request sent to the selected vendor.": "تم إرسال الطلب المخصص إلى المزود المحدد.",
  "Success: Custom request sent to the selected vendor.": "نجاح: تم إرسال الطلب المخصص إلى المزود المحدد.",
  "Rejected by the selected vendor.": "تم الرفض من المزود المحدد.",
  "Source:": "المصدر:",
  "Delete Rejected Request?": "حذف الطلب المرفوض؟",
  "This rejected request will be removed from your drilldown view.": "سيتم حذف هذا الطلب المرفوض من عرض التفاصيل.",
  "Delete Request": "حذف الطلب",
  "Rejected request deleted.": "تم حذف الطلب المرفوض.",
  "Success: Rejected request deleted.": "نجاح: تم حذف الطلب المرفوض.",
  "Failed to delete rejected request.": "فشل حذف الطلب المرفوض.",
  "Error: Failed to delete rejected request.": "خطأ: فشل حذف الطلب المرفوض.",
  "Cannot connect to backend. Rejected request was not deleted.": "لا يمكن الاتصال بالخادم. لم يتم حذف الطلب المرفوض.",
  "Error: Cannot connect to backend. Rejected request was not deleted.": "خطأ: لا يمكن الاتصال بالخادم. لم يتم حذف الطلب المرفوض.",
  "Create Volunteer Op": "إنشاء فرصة تطوع",
  "Active Volunteering": "التطوع النشط",
  "Team Polling": "تصويت الفريق",
  "My Company Events": "فعاليات شركتي",
  "Vendor Partner Portal": "بوابة شريك مزوّد",
  "Custom Requests": "الطلبات المخصصة",
  "My Bookings": "حجوزاتي",
  "My Activities": "أنشطتي",
  "Publish Activity": "نشر نشاط",
  "Employee Hub": "بوابة الموظف",
  "My Impact": "أثري",
  "Volunteer Opportunities": "فرص التطوع",
  "Volunteer Op.": "فرص التطوع",
  "Complete when full and date arrives": "أكمل عند اكتمال العدد ووصول التاريخ",
  "Not all participants are complete.": "لم يكتمل جميع المشاركين.",
  "Error: Not all participants are complete.": "خطأ: لم يكتمل جميع المشاركين.",
  "Volunteer hours were updated.": "تم تحديث ساعات التطوع.",
  "Success: Participant completed. Volunteer hours were updated.": "نجاح: تم إكمال المشارك وتحديث ساعات التطوع.",
  "Volunteer hours are awarded only after Complete.": "تضاف ساعات التطوع فقط بعد وضع علامة مكتمل.",
  "Review volunteers and mark completion. Volunteer hours are awarded only after Complete.": "راجع المتطوعين وحدد حالة الإكمال. تضاف ساعات التطوع فقط بعد وضع علامة مكتمل.",
  "Volunteer hours per completed participant": "ساعات تطوع لكل مشارك مكتمل",
  "Delete Participant?": "حذف المشارك؟",
  "This participant will be removed from this volunteer opportunity.": "سيتم حذف هذا المشارك من فرصة التطوع.",
  "Delete Participant": "حذف المشارك",
  "Participant deleted from this volunteer opportunity.": "تم حذف المشارك من فرصة التطوع.",
  "Success: Participant deleted from this volunteer opportunity.": "نجاح: تم حذف المشارك من فرصة التطوع.",
  "Failed to delete participant.": "فشل حذف المشارك.",
  "Error: Failed to delete participant.": "خطأ: فشل حذف المشارك.",
  "Cannot connect to backend. Participant was not deleted.": "لا يمكن الاتصال بالخادم. لم يتم حذف المشارك.",
  "Error: Cannot connect to backend. Participant was not deleted.": "خطأ: لا يمكن الاتصال بالخادم. لم يتم حذف المشارك.",
  "Volunteer opportunity completed. Volunteer Impact was updated.": "تم إكمال فرصة التطوع وتحديث أثر التطوع.",
  "Failed to complete volunteer opportunity.": "فشل إكمال فرصة التطوع.",
  "Cannot connect to backend. Volunteer opportunity was not completed.": "لا يمكن الاتصال بالخادم. لم يتم إكمال فرصة التطوع.",
  "Delete Volunteer Opportunity?": "حذف فرصة التطوع؟",
  "Delete Opportunity": "حذف الفرصة",
  "This volunteer opportunity will be deleted from HR and Employee portals.": "سيتم حذف فرصة التطوع هذه من بوابتي HR والموظفين.",
  "Volunteer opportunity deleted from the system.": "تم حذف فرصة التطوع من النظام.",
  "Failed to delete volunteer opportunity.": "فشل حذف فرصة التطوع.",
  "Cannot connect to backend. Volunteer opportunity was not deleted.": "لا يمكن الاتصال بالخادم. لم يتم حذف فرصة التطوع.",
  "Have Your Say (Polls)": "شارك رأيك (التصويت)",
  "Upcoming Events": "الفعاليات القادمة",
  "Sign Out": "تسجيل الخروج",
  "Log out?": "تسجيل الخروج؟",
  "Are you sure you want to sign out of EvoPath?": "هل أنت متأكد أنك تريد تسجيل الخروج من EvoPath؟",
  "Yes": "نعم",
  "No": "لا",
  "EvoPath Central": "مركز EvoPath",

  "PIN Reset Successful": "تمت إعادة تعيين الرمز بنجاح",
  "A new secure PIN has been generated for": "تم إنشاء رمز PIN آمن جديد لـ",
  "Important Security Notice": "تنبيه أمني مهم",
  "Please copy this new PIN immediately. For security reasons, it will not be displayed again.": "يرجى نسخ رمز PIN الجديد فوراً. لأسباب أمنية، لن يتم عرضه مرة أخرى.",
  "I have copied the PIN": "نسخت رمز PIN",
  "Session expired. Please login again.": "انتهت الجلسة. يرجى تسجيل الدخول مرة أخرى.",
  "Failed to reset PIN": "فشلت إعادة تعيين رمز PIN",
  "Cannot connect to backend. The PIN was not changed.": "لا يمكن الاتصال بالخادم. لم يتم تغيير رمز PIN.",

  "System Dashboard": "لوحة تحكم النظام",
  "Platform overview and real MongoDB user statistics.": "نظرة عامة على المنصة وإحصاءات المستخدمين من MongoDB.",
  "Refresh Stats": "تحديث الإحصاءات",
  "Total Companies (HR)": "إجمالي الشركات (HR)",
  "Active Vendors": "المزوّدون النشطون",
  "Pending Vendors": "المزوّدون بانتظار الموافقة",
  "Total Employees": "إجمالي الموظفين",
  "Generate New HR Account": "إنشاء حساب HR جديد",
  "Generated HR Credentials": "بيانات حساب HR التي تم إنشاؤها",
  "PIN": "رمز PIN",
  "HR Representative Name": "اسم ممثل الموارد الشركة",
  "Company Name": "اسم الشركة",
  "HR Email": "بريد HR الإلكتروني",
  "HR Phone": "هاتف HR",
  "Generate HR Account": "إنشاء حساب HR",
  "Active Companies": "الشركات النشطة",
  "Search company, HR, username, code...": "ابحث عن الشركة، HR، اسم المستخدم، الرمز...",
  "Refresh": "تحديث",
  "Loading companies...": "جارٍ تحميل الشركات...",
  "No companies found.": "لا توجد شركات.",
  "Reset PIN": "إعادة تعيين رمز PIN",
  "Vendor Management": "إدارة المزوّدين",
  "Review pending requests and manage active vendors from MongoDB.": "راجع الطلبات المعلقة وأدر المزوّدين النشطين من MongoDB.",
  "Pending Approvals": "الموافقات المعلقة",
  "No pending vendors at this time.": "لا يوجد مزوّدون بانتظار الموافقة حالياً.",
  "Approve Vendor": "الموافقة على المزوّد",
  "Reject Vendor": "رفض المزوّد",
  "Reject Vendor?": "رفض المزوّد؟",
  "Delete Vendor": "حذف المزوّد",
  "Delete Vendor?": "حذف المزوّد؟",
  "This active vendor and its related activities/bookings will be deleted from the system.": "سيتم حذف هذا المزوّد النشط والأنشطة/الحجوزات المرتبطة به من النظام.",
  "This pending vendor account will be deleted from the system.": "سيتم حذف حساب هذا المزوّد المعلّق من النظام.",
  "Reject this vendor? This will delete the vendor account from the system.": "هل تريد رفض هذا المزوّد؟ سيتم حذف حساب المزوّد من النظام.",
  "Search vendor, contact, username...": "ابحث عن المزوّد، جهة الاتصال، اسم المستخدم...",
  "No active vendors found.": "لا يوجد مزوّدون نشطون.",
  "No active vendors match your search.": "لا يوجد مزوّدون مطابقون للبحث.",
  "Analytics": "التحليلات",
  "Admin token not found. Please login again.": "رمز الأدمن غير موجود. يرجى تسجيل الدخول مرة أخرى.",
  "Failed to load dashboard stats.": "فشل تحميل إحصاءات لوحة التحكم.",
  "Cannot load dashboard stats from backend.": "لا يمكن تحميل إحصاءات لوحة التحكم من الخادم.",
  "Failed to load active companies.": "فشل تحميل الشركات النشطة.",
  "Cannot load companies from backend.": "لا يمكن تحميل الشركات من الخادم.",
  "HR name, company name, email, and phone are required.": "اسم HR واسم الشركة والبريد الإلكتروني والهاتف مطلوبة.",
  "Failed to create HR account.": "فشل إنشاء حساب HR.",
  "Failed to load pending vendors.": "فشل تحميل المزوّدين المعلقين.",
  "Failed to load active vendors.": "فشل تحميل المزوّدين النشطين.",
  "Cannot load vendors from backend.": "لا يمكن تحميل المزوّدين من الخادم.",
  "Vendor approved successfully.": "تمت الموافقة على المزوّد بنجاح.",
  "Failed to approve vendor.": "فشلت الموافقة على المزوّد.",
  "Cannot connect to backend. Vendor was not approved.": "لا يمكن الاتصال بالخادم. لم تتم الموافقة على المزوّد.",
  "Vendor rejected and deleted from the system.": "تم رفض المزوّد وحذفه من النظام.",
  "Failed to reject vendor.": "فشل رفض المزوّد.",
  "Cannot connect to backend. Vendor was not rejected.": "لا يمكن الاتصال بالخادم. لم يتم رفض المزوّد.",
  "Vendor deleted from the system.": "تم حذف المزوّد من النظام.",
  "Failed to delete vendor.": "فشل حذف المزوّد.",
  "Cannot connect to backend. Vendor was not deleted.": "لا يمكن الاتصال بالخادم. لم يتم حذف المزوّد.",
  "Delete HR Company?": "حذف شركة HR؟",
  "Delete Company": "حذف الشركة",
  "This HR company and all its employees will be deleted from the system.": "سيتم حذف شركة HR هذه وجميع موظفيها من النظام.",
  "HR company deleted from the system.": "تم حذف شركة HR من النظام.",
  "Failed to delete HR company.": "فشل حذف شركة HR.",
  "Cannot connect to backend. HR company was not deleted.": "لا يمكن الاتصال بالخادم. لم يتم حذف شركة HR.",

  "Welcome back,": "مرحباً بعودتك،",
  "Here is": "هذه نظرة على",
  "culture overview.": "ثقافة الشركة.",
  "Culture Score": "مؤشر الثقافة",
  "Volunteer Impact": "أثر التطوع",
  "Top 20% in your industry": "ضمن أفضل 20% في قطاعك",
  "Culture ROI Insights": "رؤى عائد الاستثمار الثقافي",
  "Employee Engagement Score after EvoPath Activities": "مؤشر تفاعل الموظفين بعد أنشطة EvoPath",
  "Recent Feedback": "آخر الملاحظات",
  "Engineering Team": "فريق الهندسة",
  "\"The escape room was exactly what we needed to break the ice with the new hires!\"": "\"كانت غرفة الهروب بالضبط ما احتجناه لكسر الحاجز مع الموظفين الجدد!\"",
  "Ask for new feedback": "اطلب ملاحظات جديدة",
  "Booking Drilldown": "تفاصيل الحجوزات",
  "Click any counter to see the related bookings.": "اضغط على أي عداد لرؤية الحجوزات المرتبطة.",
  "Approved": "تمت الموافقة",
  "Pending": "قيد الانتظار",
  "Rejected": "مرفوض",
  "Approved Events": "الفعاليات المعتمدة",
  "Pending Requests": "الطلبات المعلقة",
  "Rejected Requests": "الطلبات المرفوضة",
  "No approved events found.": "لا توجد فعاليات معتمدة.",
  "No pending requests found.": "لا توجد طلبات معلقة.",
  "No rejected requests found.": "لا توجد طلبات مرفوضة.",
  "View employees registered under company code": "اعرض الموظفين المسجلين تحت رمز الشركة",
  "and manage their access.": "وأدر صلاحياتهم.",
  "Refresh Team": "تحديث الفريق",
  "Delete Employee": "حذف الموظف",
  "Delete Employee?": "حذف الموظف؟",
  "This employee will be deleted from your company and removed from related activities.": "سيتم حذف هذا الموظف من شركتك وإزالته من الأنشطة المرتبطة.",
  "Employee deleted from the system.": "تم حذف الموظف من النظام.",
  "Failed to delete employee.": "فشل حذف الموظف.",
  "Cannot connect to backend. Employee was not deleted.": "لا يمكن الاتصال بالخادم. لم يتم حذف الموظف.",
  "Team Members": "أعضاء الفريق",
  "Search employee, username, code...": "ابحث عن الموظف، اسم المستخدم، الرمز...",
  "Loading employees...": "جارٍ تحميل الموظفين...",
  "No employees have registered with your company code yet.": "لم يسجل أي موظف باستخدام رمز شركتك بعد.",
  "No employees match your search.": "لا يوجد موظفون مطابقون للبحث.",
  "No Volunteer Opportunities Yet": "لا توجد فرص تطوع بعد",
  "Create a volunteer opportunity first.": "أنشئ فرصة تطوع أولاً.",
  "Create Volunteer Opportunity": "إنشاء فرصة تطوع",
  "Publish internal volunteer opportunities directly to employees in your company.": "انشر فرص التطوع الداخلية مباشرة لموظفي شركتك.",
  "Opportunity Created!": "تم إنشاء الفرصة!",
  "The volunteer opportunity is now visible to employees in your company only.": "أصبحت فرصة التطوع ظاهرة فقط لموظفي شركتك.",
  "Manage Active Volunteering": "إدارة التطوع النشط",
  "Back to Dashboard": "العودة إلى لوحة التحكم",
  "Opportunity Title": "عنوان الفرصة",
  "Target Date": "التاريخ المستهدف",
  "Volunteer Hours": "ساعات التطوع",
  "Max Participants": "الحد الأقصى للمشاركين",
  "Description & Requirements": "الوصف والمتطلبات",
  "Publish Internal Opportunity": "نشر فرصة داخلية",
  "Review volunteers and mark completion. Points and hours are awarded only after Complete.": "راجع المتطوعين وحدد الإكمال. تُمنح النقاط والساعات فقط بعد وضع علامة مكتمل.",
  "Hide Participants": "إخفاء المشاركين",
  "View Participants": "عرض المشاركين",
  "No participants yet.": "لا يوجد مشاركون بعد.",
  "Complete": "مكتمل",
  "Not Complete": "غير مكتمل",
  "Saving...": "جارٍ الحفظ...",
  "Loading volunteer opportunities...": "جارٍ تحميل فرص التطوع...",
  "No Opportunities Yet": "لا توجد فرص بعد",
  "Check back later for new company-sponsored volunteer opportunities.": "تحقق لاحقاً من فرص التطوع الجديدة التي ترعاها الشركة.",
  "Join Opportunity": "الانضمام للفرصة",
  "You joined this volunteer opportunity. Volunteer hours will be added only after HR marks you as completed.": "انضممت إلى فرصة التطوع هذه. ستتم إضافة ساعات التطوع فقط بعد أن يضع HR علامة مكتمل.",
  "Success: You joined this volunteer opportunity. Volunteer hours will be added only after HR marks you as completed.": "نجاح: انضممت إلى فرصة التطوع هذه. ستتم إضافة ساعات التطوع فقط بعد أن يضع HR علامة مكتمل.",
  "Joining...": "جارٍ الانضمام...",
  "Joined": "تم الانضمام",
  "Closed": "مغلق",

  "Discover and book verified corporate experiences.": "اكتشف واحجز تجارب شركات موثوقة.",
  "All": "الكل",
  "Trips": "الرحلات",
  "Office Events": "فعاليات المكتب",
  "Details": "التفاصيل",
  "Activity Details": "تفاصيل النشاط",
  "Related Activity": "النشاط المرتبط",
  "Activity Name": "اسم النشاط",
  "Activity Description": "وصف النشاط",
  "Auto-filled HR Contact Info": "معلومات HR المعبأة تلقائياً",
  "Estimated Cost": "التكلفة التقديرية",
  "Duration": "المدة",
  "Event Date": "تاريخ الفعالية",
  "Number of Participants": "عدد المشاركين",
  "Send Booking Request": "إرسال طلب الحجز",
  "Sending...": "جارٍ الإرسال...",
  "Close": "إغلاق",
  "Submit Custom Request": "إرسال طلب مخصص",
  "My Custom Requests": "طلباتي المخصصة",
  "Custom Request Sent!": "تم إرسال الطلب المخصص!",
  "Your custom activity request is now available for vendors to review. If a vendor approves it, it will appear in My Company Events.": "أصبح طلب النشاط المخصص متاحاً للمزوّدين للمراجعة. إذا وافق عليه أحد المزوّدين، سيظهر في فعاليات شركتي.",
  "Custom Activity Request": "طلب نشاط مخصص",
  "Design your own trip, event, or volunteering initiative and send it to vendors.": "صمم رحلتك أو فعاليتك أو مبادرتك التطوعية وأرسلها إلى المزوّدين.",
  "Design your own trip or event and send it to vendors.": "صمم رحلتك أو فعاليتك وأرسلها إلى المزوّدين.",
  "1. Activity Details": "1. تفاصيل النشاط",
  "Activity Title / Concept": "عنوان النشاط / الفكرة",
  "e.g., Tech Team Winter Survival Retreat": "مثال: رحلة بقاء شتوية لفريق التقنية",
  "Activity Category": "فئة النشاط",
  "Company Trip / Retreat": "رحلة شركة / مخيم",
  "Office Event / Party": "فعالية مكتبية / حفلة",
  "Target Vendors": "المزوّدون المستهدفون",
  "Broadcast to All Vendors": "إرسال إلى كل المزوّدين",
  "2. Logistics & Budget": "2. التفاصيل اللوجستية والميزانية",
  "Expected Attendees": "عدد الحضور المتوقع",
  "Estimated Budget": "الميزانية التقديرية",
  "e.g., 150 JD / person": "مثال: 150 دينار / شخص",
  "3. Detailed Requirements": "3. المتطلبات التفصيلية",
  "Describe your requirements": "صف متطلباتك",
  "Tell vendors about transportation, catering, equipment, location, goals, and any special requirements...": "أخبر المزوّدين عن النقل، الضيافة، المعدات، الموقع، الأهداف، وأي متطلبات خاصة...",
  "Loading your custom requests...": "جارٍ تحميل طلباتك المخصصة...",
  "No custom requests submitted yet.": "لم يتم إرسال طلبات مخصصة بعد.",
  "Approved request is now available in My Company Events.": "الطلب المعتمد متاح الآن في فعاليات شركتي.",
  "Pending Custom Request": "طلب مخصص معلق",
  "Detailed Requirements:": "المتطلبات التفصيلية:",
  "Approve Request": "الموافقة على الطلب",
  "Reject Request": "رفض الطلب",
  "Processing...": "جارٍ المعالجة...",

  "Account Pending Approval": "الحساب بانتظار الموافقة",
  "Your vendor account is under review by EvoPath administrators. You can browse open bids, but quoting is restricted until approved.": "حساب المزوّد الخاص بك قيد المراجعة من مسؤولي EvoPath. يمكنك تصفح الطلبات المفتوحة، لكن تقديم العروض مقيد حتى تتم الموافقة.",
  "Approve or reject HR booking requests for your activities.": "وافق أو ارفض طلبات الحجز من HR لأنشطتك.",
  "Refresh Bookings": "تحديث الحجوزات",
  "Loading bookings...": "جارٍ تحميل الحجوزات...",
  "No Booking Requests Yet": "لا توجد طلبات حجز بعد",
  "New HR booking requests will appear here.": "ستظهر طلبات الحجز الجديدة من HR هنا.",
  "Booking rejected and removed from the system.": "تم رفض الحجز وحذفه من النظام.",
  "Booking rejected. HR can delete it from rejected requests.": "تم رفض الحجز. يمكن لـ HR حذفه من الطلبات المرفوضة.",
  "Success: Booking rejected. HR can delete it from rejected requests.": "نجاح: تم رفض الحجز. يمكن لـ HR حذفه من الطلبات المرفوضة.",
  "Booking approved.": "تمت الموافقة على الحجز.",
  "Partner Dashboard": "لوحة تحكم الشريك",
  "Refresh Dashboard": "تحديث لوحة التحكم",
  "Confirmed Bookings": "الحجوزات المؤكدة",
  "Pending Bookings": "الحجوزات المعلقة",
  "Pending Custom Requests": "الطلبات المخصصة المعلقة",
  "Average Rating": "متوسط التقييم",
  "No confirmed events yet": "لا توجد فعاليات مؤكدة بعد",
  "Review bookings": "مراجعة الحجوزات",
  "Review custom requests": "مراجعة الطلبات المخصصة",
  "Based on published activities": "بناءً على الأنشطة المنشورة",
  "Published Activities": "الأنشطة المنشورة",
  "Activities currently visible to HR managers.": "الأنشطة الظاهرة حالياً لمديري HR.",
  "Failed to load booking stats.": "فشل تحميل إحصاءات الحجوزات.",
  "Failed to load custom request stats.": "فشل تحميل إحصاءات الطلبات المخصصة.",
  "Failed to load activity stats.": "فشل تحميل إحصاءات الأنشطة.",
  "Cannot load vendor dashboard stats from backend.": "لا يمكن تحميل إحصاءات لوحة تحكم المزوّد من الخادم.",
  "Review HR custom activity requests and approve or reject them.": "راجع طلبات الأنشطة المخصصة من HR ووافق عليها أو ارفضها.",
  "Refresh Requests": "تحديث الطلبات",
  "Your vendor account is pending approval. You can view custom requests, but you cannot approve or reject them until an Admin approves your account.": "حساب المزوّد الخاص بك بانتظار الموافقة. يمكنك عرض الطلبات المخصصة، لكن لا يمكنك قبولها أو رفضها حتى يوافق الأدمن على حسابك.",
  "Loading custom requests...": "جارٍ تحميل الطلبات المخصصة...",
  "No Custom Requests Yet": "لا توجد طلبات مخصصة بعد",
  "New HR custom requests will appear here.": "ستظهر طلبات HR المخصصة الجديدة هنا.",
  "Publish a new team experience to the HR marketplace.": "انشر تجربة فريق جديدة في سوق HR.",
  "Activity Published!": "تم نشر النشاط!",
  "Your activity is now available in the HR marketplace.": "أصبح نشاطك متاحاً الآن في سوق HR.",
  "Your activity was saved in MongoDB and is now visible to HR managers in the Activity Marketplace.": "تم حفظ النشاط في MongoDB وأصبح ظاهراً لمديري HR في سوق الأنشطة.",
  "Publish Another Activity": "نشر نشاط آخر",
  "Publish New Activity": "نشر نشاط جديد",
  "Create a trip or event to be saved in MongoDB and featured in the HR Activity Marketplace.": "أنشئ رحلة أو فعالية ليتم حفظها في MongoDB وعرضها في سوق أنشطة HR.",
  "Your vendor account is pending approval. Publishing activities is disabled until Admin approval.": "حساب المزوّد الخاص بك بانتظار الموافقة. نشر الأنشطة معطل حتى موافقة الأدمن.",
  "Your vendor account must be approved before publishing activities.": "يجب الموافقة على حساب المزوّد قبل نشر الأنشطة.",
  "Activity Title": "عنوان النشاط",
  "e.g., Mountain Yoga Retreat": "مثال: مخيم يوغا في الجبال",
  "Category": "الفئة",
  "Price": "السعر",
  "Price (e.g., $50/person)": "السعر (مثال: 50 دولار / شخص)",
  "$50 / person": "50 دولار / شخص",
  "Duration (e.g., 1 Day)": "المدة (مثال: يوم واحد)",
  "1 Day": "يوم واحد",
  "Image URL": "رابط الصورة",
  "Image URL (optional)": "رابط الصورة (اختياري)",
  "https://example.com/activity-image.jpg": "https://example.com/activity-image.jpg",
  "Description": "الوصف",
  "Describe the activity...": "صف النشاط...",
  "Approval Required": "الموافقة مطلوبة",
  "Publishing...": "جارٍ النشر...",
  "Publish to Marketplace": "نشر في السوق",
  "Failed to publish activity.": "فشل نشر النشاط.",
  "Cannot connect to backend. Activity was not published.": "لا يمكن الاتصال بالخادم. لم يتم نشر النشاط.",
  "Manage the activities you published to the HR marketplace.": "أدر الأنشطة التي نشرتها في سوق HR.",
  "No Activities Yet": "لا توجد أنشطة بعد",
  "Published activities will appear here so you can edit them.": "ستظهر الأنشطة المنشورة هنا حتى تتمكن من تعديلها.",
  "Delete": "حذف",
  "This action cannot be undone.": "لا يمكن التراجع عن هذا الإجراء.",
  "Delete Activity?": "حذف النشاط؟",
  "Delete Activity": "حذف النشاط",
  "This activity will be deleted if it has no pending or confirmed bookings.": "سيتم حذف هذا النشاط إذا لم تكن لديه حجوزات معلّقة أو مؤكدة.",
  "Company Trip": "رحلة شركة",
  "Office Event": "فعالية مكتبية",

  "Welcome,": "مرحباً،",
  "Track your impact and engage with": "تابع أثرك وتفاعل مع",
  "culture.": "ثقافة الشركة.",
  "Refresh Impact": "تحديث الأثر",
  "Culture Points": "نقاط الثقافة",
  "Top 15% in the company. Keep participating!": "ضمن أفضل 15% في الشركة. استمر بالمشاركة!",
  "Personal Volunteer Hours": "ساعات التطوع الشخصية",
  "Goal: 20 hours / year": "الهدف: 20 ساعة / سنة",
  "Action Required": "إجراء مطلوب",
  "New Poll: Q3 Team Activity": "تصويت جديد: نشاط الفريق للربع الثالث",
  "HR has requested your input for the upcoming company retreat.": "طلب HR رأيك بخصوص رحلة الشركة القادمة.",
  "Vote Now": "صوّت الآن",
  "Discover and join internal company volunteer opportunities.": "اكتشف وانضم إلى فرص التطوع الداخلية للشركة.",
  "Your upcoming booked company events will show up here.": "ستظهر هنا فعاليات الشركة المحجوزة القادمة.",
  "My Itinerary": "جدولي",

  "Have Your Say": "شارك رأيك",
  "Vote on upcoming activities and shape the company culture.": "صوّت على الأنشطة القادمة وساهم في تشكيل ثقافة الشركة.",
  "Let your employees vote on upcoming activities and events.": "اسمح لموظفيك بالتصويت على الأنشطة والفعاليات القادمة.",
  "Create New Poll": "إنشاء تصويت جديد",
  "Create a New Poll": "إنشاء تصويت جديد",
  "Publish a new poll directly to the employee feed.": "انشر تصويتاً جديداً مباشرة في موجز الموظفين.",
  "Poll Question": "سؤال التصويت",
  "Poll Options": "خيارات التصويت",
  "Add another option": "إضافة خيار آخر",
  "Cancel": "إلغاء",
  "Publish Poll": "نشر التصويت",
  "Active": "نشط",
  "total votes": "إجمالي الأصوات",
  "Book Winning Activity": "حجز النشاط الفائز",
  "What should our Q3 Team Building Activity be?": "ما نشاط بناء الفريق المناسب للربع الثالث؟",
  "Which CSR (Volunteering) initiative do you prefer for next month?": "أي مبادرة مسؤولية مجتمعية/تطوع تفضل للشهر القادم؟",
  "Wadi Rum Desert Retreat": "رحلة وادي رم",
  "Tech-Free Forest Hiking": "مشي في الغابة بدون أجهزة",
  "In-Office Escape Room": "غرفة هروب داخل المكتب",
  "Local Orphanage Renovation": "ترميم دار أيتام محلية",
  "Tree Planting": "زراعة الأشجار",
  "Please enter a question and all options.": "يرجى إدخال السؤال وكل الخيارات.",
  "Please enter a question and at least two options.": "يرجى إدخال سؤال وخيارين على الأقل.",
  "Thank you for voting!": "شكراً لتصويتك!",
  "Refresh Polls": "تحديث التصويتات",
  "Poll published to employees.": "تم نشر التصويت للموظفين.",
  "Failed to publish poll.": "فشل نشر التصويت.",
  "Cannot connect to backend. Poll was not published.": "لا يمكن الاتصال بالخادم. لم يتم نشر التصويت.",
  "Failed to load team polls.": "فشل تحميل تصويتات الفريق.",
  "Cannot load team polls from backend.": "لا يمكن تحميل تصويتات الفريق من الخادم.",
  "Poll deleted.": "تم حذف التصويت.",
  "Failed to delete poll.": "فشل حذف التصويت.",
  "Cannot connect to backend. Poll was not deleted.": "لا يمكن الاتصال بالخادم. لم يتم حذف التصويت.",
  "Poll closed. Use the winning option to make the HR decision.": "تم إغلاق التصويت. استخدم الخيار الفائز لاتخاذ قرار HR.",
  "Failed to close poll.": "فشل إغلاق التصويت.",
  "Cannot connect to backend. Poll was not closed.": "لا يمكن الاتصال بالخادم. لم يتم إغلاق التصويت.",
  "Failed to vote.": "فشل حفظ التصويت.",
  "Cannot connect to backend. Vote was not saved.": "لا يمكن الاتصال بالخادم. لم يتم حفظ التصويت.",
  "You have already voted": "لقد صوّت مسبقاً",
  "Your vote": "تصويتك",
  "Close Poll": "إغلاق التصويت",
  "Delete Poll": "حذف التصويت",
  "Loading team polls...": "جارٍ تحميل تصويتات الفريق...",
  "No Team Polls Yet": "لا توجد تصويتات للفريق بعد",
  "Create a poll to publish it to your employees.": "أنشئ تصويتاً لنشره لموظفيك.",
  "Published polls will appear here.": "ستظهر التصويتات المنشورة هنا.",
  "Winning choice": "الخيار الفائز",
  "Leading choice": "الخيار المتصدر",
  "No votes yet": "لا توجد أصوات بعد",
  "Use the winning option to make the HR decision.": "استخدم الخيار الفائز لاتخاذ قرار HR.",
  "votes": "أصوات",
  "Refresh Polls & Feedback": "تحديث التصويتات والملاحظات",
  "Vendor Feedback": "ملاحظات المزوّد",
  "Share feedback after completed events. First feedback submission awards 5 Culture Points.": "شارك ملاحظاتك بعد الفعاليات المكتملة. أول ملاحظة تمنحك 5 نقاط ثقافة.",
  "Refresh Feedback": "تحديث الملاحظات",
  "Loading feedback actions...": "جارٍ تحميل إجراءات الملاحظات...",
  "No Feedback Actions Yet": "لا توجد إجراءات ملاحظات بعد",
  "Completed events that need vendor feedback will appear here.": "ستظهر هنا الفعاليات المكتملة التي تحتاج إلى تقييم المزوّد.",
  "Submitted": "تم الإرسال",
  "Pending Feedback": "ملاحظات معلّقة",
  "No date": "لا يوجد تاريخ",
  "Completed Event": "فعالية مكتملة",
  "Feedback already submitted. You can edit it anytime.": "تم إرسال الملاحظات مسبقًا. يمكنك تعديلها في أي وقت.",
  "+5 Culture Points for first feedback submission": "+5 نقاط ثقافة لأول ملاحظة",
  "Rate the vendor": "قيّم المزوّد",
  "Your feedback": "ملاحظاتك",
  "Share what worked well or what could improve.": "شارك ما نجح جيدًا أو ما يمكن تحسينه.",
  "Update Feedback": "تحديث الملاحظات",
  "Submit Feedback": "إرسال الملاحظات",
  "Feedback rating must be between 1 and 5.": "يجب أن يكون تقييم الملاحظات بين 1 و5.",
  "Failed to load feedback actions.": "فشل تحميل إجراءات الملاحظات.",
  "Cannot load feedback actions from backend.": "لا يمكن تحميل إجراءات الملاحظات من الخادم.",
  "Failed to save feedback.": "فشل حفظ الملاحظات.",
  "Cannot connect to backend. Feedback was not saved.": "لا يمكن الاتصال بالخادم. لم يتم حفظ الملاحظات.",
  "Feedback submitted. 5 Culture Points awarded.": "تم إرسال الملاحظات. تمت إضافة 5 نقاط ثقافة.",
  "Feedback updated.": "تم تحديث الملاحظات.",
  "Success: Feedback submitted. 5 Culture Points awarded.": "نجاح: تم إرسال الملاحظات. تمت إضافة 5 نقاط ثقافة.",
  "Success: Feedback updated.": "نجاح: تم تحديث الملاحظات.",
  "Error: Feedback rating must be between 1 and 5.": "خطأ: يجب أن يكون تقييم الملاحظات بين 1 و5.",
  "Error: Failed to load feedback actions.": "خطأ: فشل تحميل إجراءات الملاحظات.",
  "Error: Cannot load feedback actions from backend.": "خطأ: لا يمكن تحميل إجراءات الملاحظات من الخادم.",
  "Error: Failed to save feedback.": "خطأ: فشل حفظ الملاحظات.",
  "Error: Cannot connect to backend. Feedback was not saved.": "خطأ: لا يمكن الاتصال بالخادم. لم يتم حفظ الملاحظات.",
  "Action Record": "سجل الإجراءات",
  "Polls and feedback requests assigned to you.": "التصويتات وطلبات الملاحظات المخصصة لك.",
  "Refresh Record": "تحديث السجل",
  "Failed to load action record.": "فشل تحميل سجل الإجراءات.",
  "Cannot load action record from backend.": "لا يمكن تحميل سجل الإجراءات من الخادم.",
  "Error: Failed to load action record.": "خطأ: فشل تحميل سجل الإجراءات.",
  "Error: Cannot load action record from backend.": "خطأ: لا يمكن تحميل سجل الإجراءات من الخادم.",
  "Loading action record...": "جارٍ تحميل سجل الإجراءات...",
  "No pending poll or feedback actions.": "لا توجد تصويتات أو ملاحظات معلّقة.",
  "New polls and completed-event feedback requests will appear here.": "ستظهر هنا التصويتات الجديدة وطلبات ملاحظات الفعاليات المكتملة.",
  "Poll completed": "اكتمل التصويت",
  "Vote on active poll": "صوّت على التصويت النشط",
  "Vote submitted": "تم إرسال التصويت",
  "Feedback submitted; you can edit it": "تم إرسال الملاحظات؛ يمكنك تعديلها",
  "+5 Culture Points after first feedback": "+5 نقاط ثقافة بعد أول ملاحظة",
  "Give Feedback": "إضافة ملاحظات",
  "Edit Feedback": "تعديل الملاحظات",
  "View Polls": "عرض التصويتات",
  "Failed to load employee feedback.": "فشل تحميل ملاحظات الموظفين.",
  "Cannot load employee feedback from backend.": "لا يمكن تحميل ملاحظات الموظفين من الخادم.",
  "Error: Failed to load employee feedback.": "خطأ: فشل تحميل ملاحظات الموظفين.",
  "Error: Cannot load employee feedback from backend.": "خطأ: لا يمكن تحميل ملاحظات الموظفين من الخادم.",
  "Vendor Ratings": "تقييمات المزوّدين",
  "Recent Vendor Feedback": "أحدث ملاحظات المزوّدين",
  "Current vendor rating summary from employee feedback.": "ملخص تقييمات المزوّدين الحالي بناءً على ملاحظات الموظفين.",
  "Latest employee comments across the platform.": "أحدث تعليقات الموظفين على مستوى المنصة.",
  "No vendor ratings yet.": "لا توجد تقييمات للمزوّدين بعد.",
  "No recent feedback yet.": "لا توجد ملاحظات حديثة بعد.",
  "Vendor Email": "بريد المزوّد",
  "Vendor Phone": "هاتف المزوّد",
  "No feedback submitted yet.": "لم يتم إرسال ملاحظات بعد.",
  "Employee feedback will appear after completed events.": "ستظهر ملاحظات الموظفين بعد الفعاليات المكتملة.",
  "No written comment.": "لا يوجد تعليق مكتوب.",
  "Employee Feedback": "ملاحظات الموظفين",
  "Based on employee feedback": "بناءً على ملاحظات الموظفين",
  "employee feedback": "ملاحظات الموظفين",
  "Latest feedback from employees after completed events.": "آخر ملاحظات الموظفين بعد الفعاليات المكتملة.",
  "Your rating will appear after employees submit feedback.": "سيظهر تقييمك بعد أن يرسل الموظفون ملاحظاتهم.",
  "Failed to load vendor feedback.": "فشل تحميل ملاحظات المزوّد.",
  "Error: Failed to load vendor feedback.": "خطأ: فشل تحميل ملاحظات المزوّد.",
  "Feedback can be edited once within 5 minutes.": "يمكن تعديل الملاحظات مرة واحدة خلال 5 دقائق.",
  "Feedback edit is closed.": "تم إغلاق تعديل الملاحظات.",
  "Feedback edit window has expired": "انتهت مدة تعديل الملاحظات",
  "Feedback can only be edited once within 5 minutes": "يمكن تعديل الملاحظات مرة واحدة فقط خلال 5 دقائق",
  "View Feedback": "عرض الملاحظات",
  "Volunteering": "التطوع",
  "Add New Volunteering": "إضافة تطوع جديد",
  "Create volunteer opportunities and manage active volunteers in one place.": "أنشئ فرص التطوع وأدر المتطوعين النشطين في مكان واحد.",
  "Success: Volunteer opportunity created.": "نجاح: تم إنشاء فرصة التطوع.",
  "Edit Custom Request": "تعديل الطلب المخصص",
  "Save Custom Request": "حفظ الطلب المخصص",
  "Success: Custom request updated.": "نجاح: تم تحديث الطلب المخصص.",
  "Success: Custom request deleted.": "نجاح: تم حذف الطلب المخصص.",
  "Failed to delete custom request.": "فشل حذف الطلب المخصص.",
  "Error: Failed to delete custom request.": "خطأ: فشل حذف الطلب المخصص.",
  "Cannot connect to backend. Custom request was not deleted.": "لا يمكن الاتصال بالخادم. لم يتم حذف الطلب المخصص.",
  "Error: Cannot connect to backend. Custom request was not deleted.": "خطأ: لا يمكن الاتصال بالخادم. لم يتم حذف الطلب المخصص.",
  "Delete Custom Request?": "حذف الطلب المخصص؟",
  "This custom request and its related booking/activity will be deleted where applicable.": "سيتم حذف هذا الطلب المخصص والحجز/النشاط المرتبط به عند وجوده.",
  "Vendor Email:": "بريد المزوّد:",
  "Vendor Phone:": "هاتف المزوّد:",
  "Waiting for Participants": "بانتظار اكتمال المشاركين",
  "Delete Completed Booking?": "حذف الحجز المكتمل؟",
  "This completed event or trip will be removed from vendor bookings and related employee records.": "ستتم إزالة هذه الفعالية أو الرحلة المكتملة من حجوزات المزوّد وسجلات الموظفين المرتبطة.",
  "Delete Booking": "حذف الحجز",
  "Completed booking deleted.": "تم حذف الحجز المكتمل.",
  "Success: Completed booking deleted.": "نجاح: تم حذف الحجز المكتمل.",
  "Failed to delete completed booking.": "فشل حذف الحجز المكتمل.",
  "Cannot connect to backend. Completed booking was not deleted.": "لا يمكن الاتصال بالخادم. لم يتم حذف الحجز المكتمل.",
  "Activity Created from Finder": "الأنشطة المنشأة من الباحث",
  "No finder activities yet.": "لا توجد أنشطة من الباحث بعد.",
  "Vendor Activities": "أنشطة المزوّد",
  "No vendor activities yet.": "لا توجد أنشطة للمزوّد بعد.",
  "You already submitted a request for this activity": "لقد أرسلت طلبًا لهذا النشاط مسبقًا",
  "Error: You already submitted a request for this activity": "خطأ: لقد أرسلت طلبًا لهذا النشاط مسبقًا",
  "No custom request activities yet.": "لا توجد أنشطة طلبات مخصصة بعد.",
  "Custom request activities are managed from the HR custom request only.": "تتم إدارة أنشطة الطلبات المخصصة من طلبات HR المخصصة فقط.",
  "This activity and every related HR booking and employee registration will be deleted.": "سيتم حذف هذا النشاط وكل حجز HR وتسجيل موظفين مرتبط به.",

  "Company Calendar": "تقويم الشركة",
  "Your upcoming private events and activities will appear here.": "ستظهر هنا فعالياتك وأنشطتك الخاصة القادمة.",
  "Est. Cost": "التكلفة المتوقعة",
  "Event Date:": "تاريخ الفعالية:",
  "Vendor:": "المزوّد:",
  "N/A": "غير متاح",
  "Free (Donation Optional)": "مجاني (التبرع اختياري)",
  "Custom Quote": "عرض سعر مخصص",
};

const PREFIX_TRANSLATIONS = [
  ["Error:", "خطأ:"],
  ["Success:", "نجاح:"],
  ["Feedback:", "ملاحظات:"],
  ["Admin credentials:", "بيانات دخول المدير:"],
  ["Vendor:", "المزوّد:"],
  ["Contact:", "جهة الاتصال:"],
  ["Rep:", "المسؤول:"],
  ["Email:", "البريد الإلكتروني:"],
  ["Phone:", "الهاتف:"],
  ["Status:", "الحالة:"],
  ["Company Code:", "رمز الشركة:"],
  ["Company:", "الشركة:"],
  ["Date:", "التاريخ:"],
  ["Budget:", "الميزانية:"],
  ["Participants:", "المشاركون:"],
  ["Attendees:", "الحضور:"],
  ["Duration:", "المدة:"],
  ["Hours:", "الساعات:"],
  ["Reward:", "المكافأة:"],
  ["Request ID:", "رقم الطلب:"],
  ["Option", "الخيار"],
  ["Loading", "جارٍ تحميل"],
];

function hasArabic(text) {
  return /[\u0600-\u06FF]/.test(text);
}

function shouldSkipElement(element) {
  return Boolean(element?.closest?.("[data-no-translate], script, style, code, pre"));
}

function preserveWhitespace(original, translated) {
  const leading = original.match(/^\s*/)?.[0] || "";
  const trailing = original.match(/\s*$/)?.[0] || "";
  return `${leading}${translated}${trailing}`;
}

export function translateText(text, language = "ar") {
  if (language !== "ar" || !text || hasArabic(text)) return text;

  const key = text.replace(/\s+/g, " ").trim();
  if (!key || key.length < 2) return text;

  if (AR_TRANSLATIONS[key]) {
    return preserveWhitespace(text, AR_TRANSLATIONS[key]);
  }

  for (const [prefix, translatedPrefix] of PREFIX_TRANSLATIONS) {
    if (key.startsWith(prefix)) {
      const rest = key.slice(prefix.length).trim();
      return preserveWhitespace(text, rest ? `${translatedPrefix} ${rest}` : translatedPrefix);
    }
  }

  return text;
}

export function getStoredLanguage() {
  try {
    return localStorage.getItem(LANGUAGE_STORAGE_KEY) || "en";
  } catch {
    return "en";
  }
}

export function translateForCurrentLanguage(text) {
  return translateText(text, getStoredLanguage());
}

function translateTextNode(node, language) {
  const parent = node.parentElement;
  if (!parent || shouldSkipElement(parent) || !node.nodeValue.trim()) return;

  const currentText = node.nodeValue;
  let originalText = textNodeOriginals.get(node);

  if (language === "en") {
    if (originalText && currentText !== originalText) node.nodeValue = originalText;
    return;
  }

  if (!originalText || (!hasArabic(currentText) && currentText !== translateText(originalText, "ar"))) {
    originalText = currentText;
    textNodeOriginals.set(node, originalText);
  }

  const translatedText = translateText(originalText, language);
  if (translatedText !== currentText) node.nodeValue = translatedText;
}

function translateElementAttributes(element, language) {
  if (!(element instanceof HTMLElement) || shouldSkipElement(element)) return;

  ["placeholder", "title", "aria-label", "alt"].forEach((attr) => {
    if (!element.hasAttribute(attr)) return;

    const storageAttr = `data-i18n-original-${attr.replace(/[^a-z]/g, "-")}`;
    const currentValue = element.getAttribute(attr);
    const storedValue = element.getAttribute(storageAttr);

    if (language === "en") {
      if (storedValue && currentValue !== storedValue) element.setAttribute(attr, storedValue);
      return;
    }

    const originalValue = storedValue || currentValue;
    if (!storedValue && currentValue && !hasArabic(currentValue)) {
      element.setAttribute(storageAttr, currentValue);
    }

    const translatedValue = translateText(originalValue, language);
    if (translatedValue !== currentValue) element.setAttribute(attr, translatedValue);
  });
}

function translateNode(node, language) {
  if (!node) return;

  if (node.nodeType === Node.TEXT_NODE) {
    translateTextNode(node, language);
    return;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return;

  translateElementAttributes(node, language);
  node.childNodes.forEach((child) => translateNode(child, language));
}

function getValidationMessage(element) {
  if (element?.validity?.typeMismatch && element.type === "email") {
    return "Please enter a valid email address.";
  }

  if (element?.validity?.valueMissing) {
    return "Please fill this field.";
  }

  return "Please enter a valid value.";
}

function getValidationMessageTarget(element) {
  return element.closest(".relative") || element;
}

function clearFieldValidationMessage(element) {
  if (!element) return;

  element.classList.remove("border-red-300", "ring-2", "ring-red-100");
  element.removeAttribute("aria-invalid");

  const target = getValidationMessageTarget(element);
  const message = target?.parentElement?.querySelector?.(`[data-field-error-for="${element.name || element.id || "field"}"]`);

  if (message) message.remove();
}

function showFieldValidationMessage(element, message) {
  if (!element) return;

  clearFieldValidationMessage(element);

  const target = getValidationMessageTarget(element);
  const parent = target?.parentElement;
  const messageId = element.name || element.id || "field";
  const translatedMessage = translateText(message, getStoredLanguage());

  element.classList.add("border-red-300", "ring-2", "ring-red-100");
  element.setAttribute("aria-invalid", "true");

  if (!parent) return;

  const messageElement = document.createElement("div");
  messageElement.setAttribute("data-field-error-for", messageId);
  messageElement.className = "mt-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 shadow-sm";
  messageElement.textContent = translatedMessage;

  target.insertAdjacentElement("afterend", messageElement);
}

function SystemMessageToast({ message, onClose }) {
  if (!message) return null;

  const tone = message.tone || "info";
  const isSuccess = tone === "success";
  const isError = tone === "error";
  const Icon = isSuccess ? CheckCircle : isError ? AlertCircle : Info;
  const styles = isSuccess
    ? {
        shell: "border-emerald-100 bg-emerald-50 text-emerald-900 shadow-emerald-100",
        iconBox: "bg-white text-emerald-600",
        close: "text-emerald-700 hover:bg-emerald-100",
      }
    : isError
    ? {
        shell: "border-red-100 bg-red-50 text-red-900 shadow-red-100",
        iconBox: "bg-white text-red-600",
        close: "text-red-700 hover:bg-red-100",
      }
    : {
        shell: "border-sky-100 bg-sky-50 text-sky-900 shadow-sky-100",
        iconBox: "bg-white text-sky-600",
        close: "text-sky-700 hover:bg-sky-100",
      };

  return (
    <div className="fixed right-4 top-4 z-[200] w-[calc(100vw-2rem)] max-w-md">
      <div className={`rounded-2xl border p-4 shadow-xl backdrop-blur-sm ${styles.shell}`}>
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 rounded-xl p-2 ${styles.iconBox}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black">{message.title || (isError ? "Action needed" : isSuccess ? "Success" : "System message")}</p>
            <p className="mt-1 text-sm font-semibold leading-relaxed">{message.message}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-lg p-1.5 transition-colors ${styles.close}`}
            aria-label="Close message"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

const LanguageContext = createContext({
  language: "en",
  setLanguage: () => {},
  isArabic: false,
});

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(getStoredLanguage);
  const [systemMessage, setSystemMessage] = useState(null);

  const setLanguage = useCallback((nextLanguage) => {
    setLanguageState(nextLanguage);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
  }, []);

  const pushSystemMessage = useCallback((message) => {
    setSystemMessage({
      tone: message?.tone || "info",
      title: message?.title || "",
      message: message?.message || "",
    });
  }, []);

  useEffect(() => {
    let invalidHandled = false;

    const handleSystemMessage = (event) => {
      const detail = event.detail || {};
      if (!detail.message) return;
      pushSystemMessage(detail);
    };

    const handleInvalid = (event) => {
      const element = event.target;
      if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement)) return;
      if (element.closest("[data-custom-validation='landing']")) return;

      event.preventDefault();
      if (invalidHandled) return;

      invalidHandled = true;
      window.setTimeout(() => {
        invalidHandled = false;
      }, 0);

      element.focus({ preventScroll: false });
      showFieldValidationMessage(element, getValidationMessage(element));
    };

    const handleFieldInput = (event) => {
      const element = event.target;
      if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement)) return;
      if (element.closest("[data-custom-validation='landing']")) return;

      if (element.checkValidity()) {
        clearFieldValidationMessage(element);
      }
    };

    window.addEventListener("evopath:system-message", handleSystemMessage);
    document.addEventListener("invalid", handleInvalid, true);
    document.addEventListener("input", handleFieldInput, true);
    document.addEventListener("change", handleFieldInput, true);

    return () => {
      window.removeEventListener("evopath:system-message", handleSystemMessage);
      document.removeEventListener("invalid", handleInvalid, true);
      document.removeEventListener("input", handleFieldInput, true);
      document.removeEventListener("change", handleFieldInput, true);
    };
  }, [pushSystemMessage]);

  useEffect(() => {
    if (!systemMessage) return undefined;

    const timeoutId = window.setTimeout(() => setSystemMessage(null), 5000);
    return () => window.clearTimeout(timeoutId);
  }, [systemMessage]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.body.dir = language === "ar" ? "rtl" : "ltr";

    translateNode(document.body, language);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "characterData") {
          translateNode(mutation.target, language);
          return;
        }

        if (mutation.type === "attributes") {
          translateNode(mutation.target, language);
          return;
        }

        mutation.addedNodes.forEach((node) => translateNode(node, language));
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["placeholder", "title", "aria-label", "alt"],
    });

    return () => observer.disconnect();
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage, isArabic: language === "ar" }), [language, setLanguage]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
      <SystemMessageToast message={systemMessage} onClose={() => setSystemMessage(null)} />
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageToggle({ compact = false, className = "" }) {
  const { language, setLanguage } = useLanguage();
  const options = [
    { id: "en", label: compact ? "EN" : "English" },
    { id: "ar", label: compact ? "AR" : "العربية" },
  ];

  return (
    <div data-no-translate className={`inline-flex items-center gap-1 rounded-xl border border-sky-100 bg-sky-50/70 p-1 shadow-sm shadow-sky-100/60 ${className}`}>
      <Languages className="ml-1 h-4 w-4 text-emerald-600" />
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => setLanguage(option.id)}
          aria-pressed={language === option.id}
          className={`rounded-lg px-3 py-1.5 text-xs font-black transition-colors ${
            language === option.id
              ? "bg-gradient-to-r from-emerald-600 to-sky-600 text-white shadow-sm"
              : "text-slate-500 hover:bg-white hover:text-sky-700"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
