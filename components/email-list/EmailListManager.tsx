"use client";

import { useState, useEffect } from "react";
import {
  TrashIcon,
  UserIcon,
  EnvelopeIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import Cookies from "js-cookie";

interface EmailContact {
  id: string;
  email: string;
  nickname?: string;
  createdAt: string;
}
interface Notification {
  message: string;
  type: string;
}

// CORRECTED Timezone utility functions
const convertToCurrentTimezone = (utcDate: string | Date): Date => {
  const date = new Date(utcDate);
  // The Date object automatically converts to local timezone when displayed
  return date;
};

const formatDateTime = (
  date: string | Date,
  options: {
    date?: boolean;
    time?: boolean;
    format?: "default" | "iso-local" | "short" | "time" | "relative" | "raw";
    hour12?: boolean;
    showTimezone?: boolean;
  } = {}
): string => {
  const {
    date: showDate = true,
    time: showTime = true,
    format = "default",
    hour12 = true,
    showTimezone = false,
  } = options;

  const localDate = new Date(date);

  // For debugging - log the original and converted dates
  if (format === "raw") {
    return `UTC: ${date.toString()} | Local: ${localDate.toString()}`;
  }

  switch (format) {
    case "iso-local":
      const pad = (num: number) => String(num).padStart(2, "0");
      const dateStr = `${localDate.getFullYear()}-${pad(
        localDate.getMonth() + 1
      )}-${pad(localDate.getDate())}`;
      const timeStr = `${pad(localDate.getHours())}:${pad(
        localDate.getMinutes()
      )}`;
      return `${dateStr} ${timeStr}`;

    case "short":
      return localDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

    case "time":
      return localDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12,
      });

    case "relative":
      return getRelativeTime(date);

    case "default":
    default:
      if (showDate && showTime) {
        const formatted = localDate.toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12,
        });

        if (showTimezone) {
          const tz = getCurrentTimezone();
          return `${formatted} (${tz})`;
        }
        return formatted;
      } else if (showDate) {
        return localDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      } else {
        return localDate.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12,
        });
      }
  }
};

const getRelativeTime = (date: string | Date): string => {
  const localDate = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor(
    (now.getTime() - localDate.getTime()) / 1000
  );

  if (diffInSeconds < 60) return "just now";

  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      return count === 1
        ? `1 ${interval.label} ago`
        : `${count} ${interval.label}s ago`;
    }
  }

  return "just now";
};

const isToday = (date: string | Date): boolean => {
  const localDate = new Date(date);
  const today = new Date();

  return (
    localDate.getDate() === today.getDate() &&
    localDate.getMonth() === today.getMonth() &&
    localDate.getFullYear() === today.getFullYear()
  );
};

const isYesterday = (date: string | Date): boolean => {
  const localDate = new Date(date);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return (
    localDate.getDate() === yesterday.getDate() &&
    localDate.getMonth() === yesterday.getMonth() &&
    localDate.getFullYear() === yesterday.getFullYear()
  );
};

const getTimezoneOffsetString = (): string => {
  const offset = new Date().getTimezoneOffset();
  const sign = offset > 0 ? "-" : "+";
  const hours = Math.floor(Math.abs(offset) / 60);
  const minutes = Math.abs(offset) % 60;

  return `${sign}${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
};

const getCurrentTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    return `UTC${getTimezoneOffsetString()}`;
  }
};

// Timezone display component
interface DateTimeDisplayProps {
  date: string | Date;
  format?: "default" | "iso-local" | "short" | "time" | "relative" | "raw";
  showTimezone?: boolean;
  className?: string;
  asTooltip?: boolean;
  debug?: boolean;
}

const DateTimeDisplay: React.FC<DateTimeDisplayProps> = ({
  date,
  format = "default",
  showTimezone = false,
  className = "",
  asTooltip = false,
  debug = false,
}) => {
  const formattedDate = formatDateTime(date, { format, showTimezone });
  const timezone = getCurrentTimezone();
  const relativeTime = formatDateTime(date, { format: "relative" });

  // Handle special cases
  let displayText = formattedDate;
  if (isToday(date) && format === "default") {
    displayText = `Today, ${formatDateTime(date, { format: "time" })}`;
  } else if (isYesterday(date) && format === "default") {
    displayText = `Yesterday, ${formatDateTime(date, { format: "time" })}`;
  }

  if (debug) {
    return (
      <div className={`${className} text-xs text-gray-500`}>
        <div>Original: {date.toString()}</div>
        <div>Local: {new Date(date).toString()}</div>
        <div>Display: {displayText}</div>
        <div>Timezone: {timezone}</div>
      </div>
    );
  }

  if (asTooltip) {
    return (
      <div
        className={`${className} relative group cursor-help`}
        title={`UTC: ${new Date(date).toISOString()} | Local: ${new Date(
          date
        ).toString()}`}
      >
        <span>{displayText}</span>
        {showTimezone && (
          <span className="text-xs text-gray-500 ml-2">({timezone})</span>
        )}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
          {relativeTime}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800"></div>
        </div>
      </div>
    );
  }

  return (
    <span className={className}>
      {displayText}
      {showTimezone && (
        <span className="text-xs text-gray-500 ml-2">({timezone})</span>
      )}
    </span>
  );
};

export default function EmailListManager() {
  const [contacts, setContacts] = useState<EmailContact[]>([]);
  const [saved, setSaved] = useState<boolean>(false);
  const [newEmail, setNewEmail] = useState("");
  const [newNickname, setNewNickname] = useState("");
  const [notifications, setNotifications] = useState<Notification>({
    type: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showTimezone, setShowTimezone] = useState(false);
  const [dateFormat, setDateFormat] = useState<
    "default" | "relative" | "short" | "iso-local"
  >("default");
  const [debugMode, setDebugMode] = useState(false);

  const token = Cookies.get("UserToken");

  // Auto-remove notifications after 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      if (notifications.message) {
        setNotifications({ type: "", message: "" });
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [notifications]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const addEmail = async () => {
    if (!validateEmail(newEmail)) {
      setNotifications({ type: "error", message: "Invalid email" });
      return;
    }
    setIsLoading(true);

    try {
      const response = await axios.post(
        `http://localhost:3001/contacts`,
        {
          email: newEmail,
          nickname: newNickname.trim() || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.error) {
        setNotifications({ type: "error", message: response.data.error });
      } else {
        setNotifications({ type: "success", message: response.data.message });
        setNewEmail("");
        setNewNickname("");
        setSaved(true);
        // Refresh contacts list
        getContact();
      }
    } catch (error: any) {
      setNotifications({
        type: "error",
        message: error.response?.data?.error || "Failed to add contact",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeContact = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;

    setIsDeleting(id);
    try {
      await axios.delete(`http://localhost:3001/contacts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications({
        type: "success",
        message: "Contact deleted successfully",
      });
      setContacts(contacts.filter((contact) => contact.id !== id));
    } catch (error: any) {
      setNotifications({
        type: "error",
        message: error.response?.data?.error || "Failed to delete contact",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const getContact = async () => {
    try {
      const res = await axios.get("http://localhost:3001/contacts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Contacts data:", res.data.data); // Debug log
      setContacts(res.data.data || []);
    } catch (error: any) {
      console.error("Failed to fetch contacts:", error);
      setNotifications({
        type: "error",
        message: error.response?.data?.error || "Failed to fetch contacts",
      });
    }
  };

  useEffect(() => {
    getContact();
  }, []);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [".csv", ".txt", ".doc", ".docx"];
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();

    if (!validTypes.includes(fileExtension)) {
      setNotifications({
        type: "error",
        message:
          "Invalid file type. Please upload CSV, TXT, DOC, or DOCX files.",
      });
      event.target.value = "";
      return;
    }
    console.log(file)

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setNotifications({
        type: "error",
        message: "File size too large. Maximum size is 5MB.",
      });
      event.target.value = "";
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const emails = content.match(emailRegex) || [];

        if (emails.length === 0) {
          setNotifications({
            type: "error",
            message: "No valid email addresses found in the file.",
          });
          setIsLoading(false);
          return;
        }

        // Prepare contacts for import
        const contactsToImport = emails.map((email) => ({
          email,
          nickname: null,
        }));

        const response = await axios.post(
          `http://localhost:3001/contacts/import`,
          { contacts: contactsToImport },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.success) {
          setNotifications({
            type: "success",
            message: `Successfully imported ${response.data.data.imported} contacts. ${response.data.data.duplicates} duplicates skipped.`,
          });
          getContact(); // Refresh list
        } else {
          setNotifications({ type: "error", message: response.data.error });
        }
      } catch (error: any) {
        setNotifications({
          type: "error",
          message: error.response?.data?.error || "Failed to import contacts",
        });
      } finally {
        setIsLoading(false);
        event.target.value = "";
      }
    };

    reader.onerror = () => {
      setNotifications({ type: "error", message: "Failed to read file" });
      setIsLoading(false);
      event.target.value = "";
    };

    reader.readAsText(file);
  };

  // Handle Enter key press in form
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      addEmail();
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto relative">
      {notifications?.message !== "" && (
        <div className="fixed top-4 right-4 z-50 space-y-3 w-96 max-w-full">
          <div
            className={`p-4 rounded-lg shadow-lg border transform transition-all duration-300 ease-in-out ${
              notifications.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : notifications.type === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-blue-50 border-blue-200 text-blue-800"
            }`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {notifications.type === "success" ? (
                  <CheckCircleIcon className="h-6 w-6 text-green-500" />
                ) : notifications.type === "error" ? (
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
                ) : (
                  <ExclamationTriangleIcon className="h-6 w-6 text-blue-500" />
                )}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm mt-1">{notifications.message}</p>
              </div>
              <button
                onClick={() => setNotifications({ type: "", message: "" })}
                className="ml-4 flex-shrink-0"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Email List Management
            </h1>
            <p className="text-gray-600">
              Manage your email subscribers and contacts
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Timezone: {getCurrentTimezone()}
            </div>
          </div>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Email Contacts ({contacts.length})
          </h2>
          <button
            onClick={getContact}
            className="text-sm text-blue-600 hover:text-blue-700"
            disabled={isLoading}
          >
            Refresh
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">
                  Email
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">
                  Nickname
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">
                  Added
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {contacts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 px-6 text-center">
                    <div className="text-gray-400">
                      <EnvelopeIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">
                        No contacts yet. Add your first contact!
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                contacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {contact.email}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {contact.nickname ? (
                        <div className="flex items-center space-x-2">
                          <UserIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-700">
                            {contact.nickname}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <DateTimeDisplay
                        date={contact.createdAt}
                        format={dateFormat}
                        showTimezone={showTimezone}
                        asTooltip={dateFormat === "default"}
                        debug={debugMode}
                        className="text-sm text-gray-600"
                      />
                      {debugMode && (
                        <div className="text-xs text-gray-400 mt-1">
                          Raw: {contact.createdAt}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => removeContact(contact.id)}
                        disabled={isDeleting === contact.id}
                        className={`text-red-600 hover:text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                        title="Delete contact"
                      >
                        {isDeleting === contact.id ? (
                          <div className="h-5 w-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <TrashIcon className="h-5 w-5" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Email Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Add New Contact
        </h2>
        <div className="flex gap-4 mb-4" onKeyDown={handleKeyPress}>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Enter email address"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
              disabled={isLoading}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nickname (Optional)
            </label>
            <input
              type="text"
              value={newNickname}
              onChange={(e) => setNewNickname(e.target.value)}
              placeholder="Enter nickname"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
              disabled={isLoading}
            />
          </div>
        </div>
        <button
          onClick={addEmail}
          disabled={isLoading || !newEmail.trim()}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors ${
            isLoading || !newEmail.trim()
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Adding...
            </>
          ) : (
            "Add Contact"
          )}
        </button>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to add contact quickly
        </p>
      </div>

      {/* Bulk Upload */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Bulk Upload
        </h2>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <EnvelopeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Upload CSV, DOC, or TXT files</p>
          <p className="text-sm text-gray-500 mb-4">
            We'll automatically extract valid email addresses from your files
          </p>
          <input
            type="file"
            accept=".csv,.txt,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
            disabled={isLoading}
          />
          <label
            htmlFor="file-upload"
            className={`inline-block px-6 py-2 rounded-lg transition-colors ${
              isLoading
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
            }`}
          >
            {isLoading ? "Uploading..." : "Choose Files"}
          </label>
          <p className="text-xs text-gray-500 mt-3">Maximum file size: 5MB</p>
        </div>
      </div>
    </div>
  );
}
