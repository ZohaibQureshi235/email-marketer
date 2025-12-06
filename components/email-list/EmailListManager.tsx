"use client";

import { useState, useEffect, useRef } from "react";
import {
  TrashIcon,
  UserIcon,
  EnvelopeIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  CheckIcon,
  XCircleIcon,
  ArrowPathIcon,
  FolderIcon,
  ArchiveBoxIcon,
  ArrowUturnLeftIcon,
  DocumentArrowUpIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import Cookies from "js-cookie";

interface EmailContact {
  id: string;
  email: string;
  nickname?: string;
  createdAt: string;
  deletedAt?: string;
  isDeleted?: boolean;
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

// Delete Confirmation Modal Component
interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedCount: number;
  isBulkDelete: boolean;
  singleEmail?: string;
  isLoading: boolean;
  isPermanentDelete?: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  selectedCount,
  isBulkDelete,
  singleEmail,
  isLoading,
  isPermanentDelete = false,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setIsClosing(false);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        handleClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node) && !isLoading) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, isLoading]);

  const handleClose = () => {
    if (isLoading) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  const handleConfirm = async () => {
    await onConfirm();
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
      {/* Backdrop with blur effect */}
      <div 
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 ${
          isClosing ? 'scale-95 opacity-0 translate-y-4' : 'scale-100 opacity-100 translate-y-0'
        }`}
      >
        {/* Modal Header */}
        <div className="relative p-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-inner ${
              isPermanentDelete 
                ? "bg-gradient-to-br from-red-100 to-red-50" 
                : "bg-gradient-to-br from-orange-100 to-orange-50"
            }`}>
              <ExclamationTriangleIcon className={`h-6 w-6 ${
                isPermanentDelete ? "text-red-600" : "text-orange-600"
              }`} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">
                {isPermanentDelete ? "Permanent Delete" : "Move to Trash"}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {isPermanentDelete ? "This action cannot be undone" : "Contact can be restored from trash"}
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="h-8 w-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <XMarkIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <div className="mb-6">
            {isBulkDelete ? (
              <div className="space-y-3">
                <div className={`flex items-center justify-center h-16 w-16 mx-auto rounded-2xl mb-4 shadow-inner ${
                  isPermanentDelete
                    ? "bg-gradient-to-br from-red-50 to-white"
                    : "bg-gradient-to-br from-orange-50 to-white"
                }`}>
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-lg ${
                    isPermanentDelete
                      ? "bg-gradient-to-br from-red-500 to-red-600"
                      : "bg-gradient-to-br from-orange-500 to-orange-600"
                  }`}>
                    <span className="text-white font-bold text-lg">
                      {selectedCount}
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 text-center text-lg font-medium">
                  {isPermanentDelete ? "Permanently delete" : "Move to trash"} {selectedCount} contact{selectedCount > 1 ? "s" : ""}?
                </p>
                <p className="text-sm text-gray-500 text-center">
                  {isPermanentDelete 
                    ? "This will permanently remove selected contacts. This action cannot be undone."
                    : "Selected contacts will be moved to trash and can be restored later."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`flex items-center justify-center h-16 w-16 mx-auto rounded-2xl mb-4 shadow-inner ${
                  isPermanentDelete
                    ? "bg-gradient-to-br from-red-50 to-white"
                    : "bg-gradient-to-br from-orange-50 to-white"
                }`}>
                  <EnvelopeIcon className={`h-8 w-8 ${
                    isPermanentDelete ? "text-red-600" : "text-orange-600"
                  }`} />
                </div>
                <p className="text-gray-700 text-center font-medium">
                  {isPermanentDelete ? "Permanently delete" : "Move to trash"} this contact?
                </p>
                <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-100 shadow-inner">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center shadow ${
                      isPermanentDelete
                        ? "bg-gradient-to-br from-red-500 to-red-600"
                        : "bg-gradient-to-br from-orange-500 to-orange-600"
                    }`}>
                      <UserIcon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {singleEmail}
                      </p>
                      <p className="text-sm text-gray-500">
                        {isPermanentDelete ? "Deleted contact" : "Active contact"}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 text-center">
                  {isPermanentDelete
                    ? "This contact will be permanently removed from your database."
                    : "This contact will be moved to trash and can be restored later."}
                </p>
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 hover:border-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-3 text-white rounded-xl hover:shadow-xl transition-all duration-200 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group relative overflow-hidden ${
                isPermanentDelete
                  ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                  : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              }`}
            >
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                isPermanentDelete
                  ? "bg-gradient-to-r from-red-600 to-red-700"
                  : "bg-gradient-to-r from-orange-600 to-orange-700"
              }`} />
              <span className="relative z-10 flex items-center gap-2">
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {isPermanentDelete ? "Deleting..." : "Moving..."}
                  </>
                ) : (
                  <>
                    <TrashIcon className="h-5 w-5" />
                    {isPermanentDelete ? "Delete Permanently" : "Move to Trash"}
                  </>
                )}
              </span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0" />
            <span>
              {isPermanentDelete 
                ? "Permanent deletion cannot be recovered"
                : "Contacts in trash are automatically deleted after 30 days"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Restore Confirmation Modal Component
interface RestoreConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedCount: number;
  isBulkRestore: boolean;
  singleEmail?: string;
  isLoading: boolean;
}

const RestoreConfirmationModal: React.FC<RestoreConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  selectedCount,
  isBulkRestore,
  singleEmail,
  isLoading,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setIsClosing(false);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        handleClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node) && !isLoading) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, isLoading]);

  const handleClose = () => {
    if (isLoading) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
      <div 
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        onClick={handleClose}
      />
      
      <div 
        ref={modalRef}
        className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 ${
          isClosing ? 'scale-95 opacity-0 translate-y-4' : 'scale-100 opacity-100 translate-y-0'
        }`}
      >
        <div className="relative p-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-gradient-to-br from-green-100 to-green-50 rounded-xl flex items-center justify-center shadow-inner">
              <ArrowUturnLeftIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">
                Restore Contact{selectedCount > 1 ? "s" : ""}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Move back to active contacts
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="h-8 w-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <XMarkIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            {isBulkRestore ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center h-16 w-16 mx-auto bg-gradient-to-br from-green-50 to-white rounded-2xl mb-4 shadow-inner">
                  <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">
                      {selectedCount}
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 text-center text-lg font-medium">
                  Restore {selectedCount} contact{selectedCount > 1 ? "s" : ""}?
                </p>
                <p className="text-sm text-gray-500 text-center">
                  These contacts will be moved back to your active contacts list.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center h-16 w-16 mx-auto bg-gradient-to-br from-green-50 to-white rounded-2xl mb-4 shadow-inner">
                  <EnvelopeIcon className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-gray-700 text-center font-medium">
                  Restore this contact?
                </p>
                <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-100 shadow-inner">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow">
                      <UserIcon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {singleEmail}
                      </p>
                      <p className="text-sm text-gray-500">Deleted contact</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 hover:border-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <span className="relative z-10 flex items-center gap-2">
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Restoring...
                  </>
                ) : (
                  <>
                    <ArrowUturnLeftIcon className="h-5 w-5" />
                    Restore
                  </>
                )}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Edit Contact Modal Component
interface EditContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: EmailContact | null;
  onSave: (id: string, updates: { email?: string; nickname?: string }) => Promise<void>;
  isLoading: boolean;
}

const EditContactModal: React.FC<EditContactModalProps> = ({
  isOpen,
  onClose,
  contact,
  onSave,
  isLoading,
}) => {
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [errors, setErrors] = useState<{ email?: string }>({});
  const modalRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (contact) {
      setEmail(contact.email);
      setNickname(contact.nickname || "");
      setErrors({});
    }
  }, [contact]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setIsClosing(false);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        handleClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node) && !isLoading) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, isLoading]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleClose = () => {
    if (isLoading) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setErrors({});
    }, 300);
  };

  const handleSave = async () => {
    if (!contact) return;

    // Validate email
    if (!validateEmail(email)) {
      setErrors({ email: "Please enter a valid email address" });
      return;
    }

    setErrors({});
    await onSave(contact.id, { email, nickname });
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
      {/* Backdrop with blur effect */}
      <div 
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all duration-300 ${
          isClosing ? 'scale-95 opacity-0 translate-y-4' : 'scale-100 opacity-100 translate-y-0'
        }`}
      >
        {/* Modal Header */}
        <div className="relative p-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center shadow-inner">
              <PencilIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">
                Edit Contact
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Update contact information
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="h-8 w-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <XMarkIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Contact Preview */}
            {contact && (
              <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-100 shadow-inner">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <UserIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {contact.email}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {contact.nickname || "No nickname"}
                    </p>
                  </div>
                  <div className="text-xs text-gray-400">
                    ID: {contact.id.slice(-8)}
                  </div>
                </div>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <EnvelopeIcon className="h-4 w-4" />
                    Email Address
                  </span>
                  <span className="text-xs text-red-500 ml-6">* Required</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({});
                    }}
                    className={`w-full px-4 py-3 pl-11 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      errors.email 
                        ? "border-red-300 bg-red-50" 
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    disabled={isLoading}
                    placeholder="contact@example.com"
                  />
                  <EnvelopeIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                    errors.email ? "text-red-400" : "text-gray-400"
                  }`} />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    Nickname
                  </span>
                  <span className="text-xs text-gray-500 ml-6">Optional</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    disabled={isLoading}
                    placeholder="Enter a nickname (optional)"
                  />
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Add a friendly name to easily identify this contact
                </p>
              </div>
            </div>

            {/* Validation Tips */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 p-4 rounded-xl border border-blue-100">
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-900">
                    Email Requirements
                  </p>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      Must contain @ symbol
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      Must have a valid domain (e.g., gmail.com)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      No spaces allowed
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-6 border-t border-gray-100">
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 hover:border-gray-300 flex items-center justify-center gap-2"
            >
              <XCircleIcon className="h-5 w-5" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading || !email.trim()}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <span className="relative z-10 flex items-center gap-2">
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-5 w-5" />
                    Save Changes
                  </>
                )}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component - USER VIEW (Only shows non-deleted contacts)
export default function EmailListManager() {
  const [contacts, setContacts] = useState<EmailContact[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [newNickname, setNewNickname] = useState("");
  const [notifications, setNotifications] = useState<Notification>({
    type: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [contactToEdit, setContactToEdit] = useState<EmailContact | null>(null);
  const [deleteMode, setDeleteMode] = useState<"single" | "bulk">("single");
  const [contactToDelete, setContactToDelete] = useState<{
    id: string;
    email: string;
  } | null>(null);
  const [isSelectAll, setIsSelectAll] = useState(false);

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

  // Update select all checkbox when contacts change
  useEffect(() => {
    if (contacts.length > 0 && selectedContacts.length === contacts.length) {
      setIsSelectAll(true);
    } else {
      setIsSelectAll(false);
    }
  }, [selectedContacts, contacts]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const addEmail = async () => {
    if (!validateEmail(newEmail)) {
      setNotifications({ type: "error", message: "Invalid email address" });
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
        setNotifications({ type: "success", message: "Contact added successfully" });
        setNewEmail("");
        setNewNickname("");
        getContacts(); // Refresh contacts list
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

  const getContacts = async () => {
    try {
      const res = await axios.get("http://localhost:3001/contacts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Backend should already filter out deleted contacts with isDeleted: false
      setContacts(res.data.data || []);
      setSelectedContacts([]);
    } catch (error: any) {
      console.error("Failed to fetch contacts:", error);
      setNotifications({
        type: "error",
        message: error.response?.data?.error || "Failed to fetch contacts",
      });
    }
  };

  useEffect(() => {
    getContacts();
  }, []);

  const handleSingleDelete = (contact: EmailContact) => {
    setContactToDelete({ id: contact.id, email: contact.email });
    setDeleteMode("single");
    setShowDeleteModal(true);
  };

  const handleBulkDelete = () => {
    if (selectedContacts.length === 0) {
      setNotifications({
        type: "error",
        message: "Please select at least one contact to delete",
      });
      return;
    }
    setDeleteMode("bulk");
    setShowDeleteModal(true);
  };

  const handleEdit = (contact: EmailContact) => {
    setContactToEdit(contact);
    setShowEditModal(true);
  };

  const updateContact = async (id: string, updates: { email?: string; nickname?: string }) => {
    setIsLoading(true);
    try {
      const response = await axios.put(
        `http://localhost:3001/contacts/${id}`,
        updates,
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
        setNotifications({ type: "success", message: "Contact updated successfully" });
        setContacts(contacts.map(contact => 
          contact.id === id ? { ...contact, ...response.data.data } : contact
        ));
        setShowEditModal(false);
        setContactToEdit(null);
      }
    } catch (error: any) {
      setNotifications({
        type: "error",
        message: error.response?.data?.error || "Failed to update contact",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    setIsLoading(true);
    try {
      if (deleteMode === "single" && contactToDelete) {
        await axios.delete(`http://localhost:3001/contacts/${contactToDelete.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setNotifications({
          type: "success",
          message: "Contact deleted successfully",
        });
        // Remove from contacts list (soft delete - user won't see it anymore)
        setContacts(contacts.filter((contact) => contact.id !== contactToDelete.id));
        setSelectedContacts(selectedContacts.filter(id => id !== contactToDelete.id));
      } else {
        await axios.delete('http://localhost:3001/contacts/bulk', {
          data: { contactIds: selectedContacts },
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        setNotifications({
          type: "success",
          message: `${selectedContacts.length} contacts deleted successfully`,
        });
        // Remove selected contacts from list (soft delete)
        setContacts(contacts.filter((contact) => !selectedContacts.includes(contact.id)));
        setSelectedContacts([]);
      }
    } catch (error: any) {
      setNotifications({
        type: "error",
        message: error.response?.data?.error || "Failed to delete contact(s)",
      });
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
      setContactToDelete(null);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = [".csv", ".txt", ".doc", ".docx"];
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();

    if (!validTypes.includes(fileExtension)) {
      setNotifications({
        type: "error",
        message: "Invalid file type. Please upload CSV, TXT, DOC, or DOCX files.",
      });
      event.target.value = "";
      return;
    }

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
          getContacts(); // Refresh contacts list
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      addEmail();
    }
  };

  const toggleContactSelection = (id: string) => {
    setSelectedContacts(prev =>
      prev.includes(id)
        ? prev.filter(contactId => contactId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (isSelectAll) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map(contact => contact.id));
    }
    setIsSelectAll(!isSelectAll);
  };

  const clearAllSelections = () => {
    setSelectedContacts([]);
    setIsSelectAll(false);
  };

  const refreshData = () => {
    getContacts();
    clearAllSelections();
  };

  const getSelectedCount = () => {
    return selectedContacts.length;
  };

  const getSelectedEmails = () => {
    return contacts
      .filter(contact => selectedContacts.includes(contact.id))
      .map(contact => contact.email);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-4 md:p-8">
      {/* Notifications */}
      {notifications?.message && (
        <div className="fixed top-4 right-4 z-50 w-96 max-w-full">
          <div
            className={`p-4 rounded-xl shadow-lg border transform transition-all duration-300 ${
              notifications.type === "success"
                ? "bg-gradient-to-r from-green-50 to-green-100 border-green-200"
                : notifications.type === "error"
                ? "bg-gradient-to-r from-red-50 to-red-100 border-red-200"
                : "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200"
            }`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {notifications.type === "success" ? (
                  <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow">
                    <CheckCircleIcon className="h-6 w-6 text-white" />
                  </div>
                ) : (
                  <div className="h-10 w-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow">
                    <ExclamationTriangleIcon className="h-6 w-6 text-white" />
                  </div>
                )}
              </div>
              <div className="ml-4 flex-1">
                <p className={`font-medium ${
                  notifications.type === "success" 
                    ? "text-green-800" 
                    : "text-red-800"
                }`}>
                  {notifications.type === "success" ? "Success" : "Error"}
                </p>
                <p className={`text-sm mt-1 ${
                  notifications.type === "success" 
                    ? "text-green-700" 
                    : "text-red-700"
                }`}>
                  {notifications.message}
                </p>
              </div>
              <button
                onClick={() => setNotifications({ type: "", message: "" })}
                className="ml-4 h-8 w-8 rounded-lg hover:bg-white/50 flex items-center justify-center transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setContactToDelete(null);
        }}
        onConfirm={confirmDelete}
        selectedCount={deleteMode === "bulk" ? getSelectedCount() : 1}
        isBulkDelete={deleteMode === "bulk"}
        singleEmail={contactToDelete?.email}
        isLoading={isLoading}
        isPermanentDelete={false} // For users, it's always soft delete
      />

      <EditContactModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setContactToEdit(null);
        }}
        contact={contactToEdit}
        onSave={updateContact}
        isLoading={isLoading}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Email Contacts Manager
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your email subscribers and contacts
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={refreshData}
                disabled={isLoading}
                className="px-4 py-2 text-gray-600 hover:text-gray-700 font-medium hover:bg-gray-50 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <div className="px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm">
                <span className="text-sm text-gray-600">Timezone: </span>
                <span className="text-sm font-medium text-gray-900">{getCurrentTimezone()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        {selectedContacts.length > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border border-blue-200 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow">
                  <FolderIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-blue-900">
                    {getSelectedCount()} contact{getSelectedCount() > 1 ? 's' : ''} selected
                  </p>
                  <p className="text-sm text-blue-700">
                    {getSelectedEmails().slice(0, 3).join(', ')}
                    {getSelectedEmails().length > 3 && ` and ${getSelectedEmails().length - 3} more`}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleBulkDelete}
                  disabled={isLoading}
                  className="px-4 py-2 text-red-600 hover:text-red-700 font-medium hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 border border-red-200"
                >
                  <TrashIcon className="h-4 w-4" />
                  Delete Selected
                </button>
                <button
                  onClick={clearAllSelections}
                  className="px-4 py-2 text-gray-600 hover:text-gray-700 font-medium hover:bg-gray-50 rounded-xl transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contacts Table Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 mb-8 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow">
                <UserIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Active Contacts
                </h2>
                <p className="text-sm text-gray-500">
                  {contacts.length} total contacts
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={refreshData}
                disabled={isLoading}
                className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium hover:bg-blue-50 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-4 px-6">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isSelectAll}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </div>
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Nickname
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Added
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {contacts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 px-6 text-center">
                      <div className="max-w-sm mx-auto">
                        <div className="h-20 w-20 mx-auto bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                          <EnvelopeIcon className="h-10 w-10 text-blue-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No contacts yet
                        </h3>
                        <p className="text-gray-500">
                          Add your first contact to get started
                        </p>
                        <button
                          onClick={() => document.getElementById('add-contact-form')?.scrollIntoView({ behavior: 'smooth' })}
                          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Add Contact
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  contacts.map((contact) => (
                    <tr
                      key={contact.id}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="py-4 px-6">
                        <input
                          type="checkbox"
                          checked={selectedContacts.includes(contact.id)}
                          onChange={() => toggleContactSelection(contact.id)}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center shadow-inner">
                            <EnvelopeIcon className="h-4 w-4 text-blue-600" />
                          </div>
                          <span className="font-medium text-gray-900">
                            {contact.email}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {contact.nickname ? (
                          <div className="flex items-center space-x-2">
                            <UserIcon className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-700 font-medium">
                              {contact.nickname}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">—</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-600">
                          <DateTimeDisplay
                            date={contact.createdAt}
                            format="relative"
                            className="text-sm text-gray-600"
                          />
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(contact)}
                            disabled={isLoading}
                            className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 flex items-center justify-center hover:from-blue-100 hover:to-blue-200 transition-all duration-200 group/edit disabled:opacity-50"
                            title="Edit contact"
                          >
                            <PencilIcon className="h-4 w-4 text-blue-600 group-hover/edit:text-blue-700" />
                          </button>
                          <button
                            onClick={() => handleSingleDelete(contact)}
                            disabled={isLoading}
                            className="h-9 w-9 rounded-lg bg-gradient-to-br from-red-50 to-red-100 border border-red-200 flex items-center justify-center hover:from-red-100 hover:to-red-200 transition-all duration-200 group/delete disabled:opacity-50"
                            title="Delete contact"
                          >
                            <TrashIcon className="h-4 w-4 text-red-600 group-hover/delete:text-red-700" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Contact Form Card */}
        <div id="add-contact-form" className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Add New Contact
            </h2>
            <div className="flex items-center gap-2">
              <PlusIcon className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-500">Quick Add</span>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4 mb-6" onKeyDown={handleKeyPress}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="contact@example.com"
                  className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  disabled={isLoading}
                />
                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nickname (Optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                  placeholder="Enter nickname"
                  className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  disabled={isLoading}
                />
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <button
              onClick={addEmail}
              disabled={isLoading || !newEmail.trim()}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                isLoading || !newEmail.trim()
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <PlusIcon className="h-4 w-4" />
                  Add Contact
                </div>
              )}
            </button>
            <p className="text-xs text-gray-500">
              Press Enter to add contact quickly
            </p>
          </div>
        </div>

        {/* Bulk Upload Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Bulk Upload
            </h2>
            <DocumentArrowUpIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center bg-gradient-to-br from-gray-50 to-gray-100/50">
            <div className="h-16 w-16 mx-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <DocumentArrowUpIcon className="h-8 w-8 text-white" />
            </div>
            <p className="text-gray-700 font-medium mb-2">
              Upload contact files
            </p>
            <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
              Upload CSV, DOC, or TXT files. We'll automatically extract valid email addresses.
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
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                isLoading
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-900 hover:to-black shadow-lg hover:shadow-xl cursor-pointer"
              }`}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <DocumentArrowUpIcon className="h-4 w-4" />
                  Choose Files
                </>
              )}
            </label>
            <p className="text-xs text-gray-500 mt-4">
              Maximum file size: 5MB • Supports: CSV, TXT, DOC, DOCX
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}