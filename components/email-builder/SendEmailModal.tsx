// components/SendEmailModal.tsx
"use client";

import { useState, useEffect } from "react";
import { emailApi } from "@/api/emailApi";
import TestEmailModal from "./TestEmailModal";
import {
  XMarkIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  UserGroupIcon,
  EnvelopeIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  ExclamationCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SparklesIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

interface SendEmailModalProps {
  emailHtml: string;
  defaultSubject?: string;
  onClose: () => void;
}

interface EmailContact {
  id: string;
  email: string;
  nickname: string;
  alreadySent?: boolean;
}

interface EmailLimits {
  limit: number;
  sentThisHour: number;
  remaining: number;
}

export default function SendEmailModal({
  emailHtml,
  defaultSubject = "",
  onClose,
}: SendEmailModalProps) {
  const [subject, setSubject] = useState(defaultSubject);
  const [contacts, setContacts] = useState<EmailContact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(
    new Set()
  );
  const [limits, setLimits] = useState<EmailLimits>({
    limit: 500,
    sentThisHour: 0,
    remaining: 500,
  });
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showTestModal, setShowTestModal] = useState(false);
  const [fromName, setFromName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    selected: 0,
    sent: 0,
  });

  // Load data
  const loadData = async (pageNum = 1) => {
    try {
      setLoading(true);
      const [contactsResponse, limitsResponse] = await Promise.all([
        emailApi.getContacts({ page: pageNum, limit: 50, search: searchTerm }),
        emailApi.getLimits(),
      ]);

      if (contactsResponse.success) {
        const contactsData = contactsResponse.data;
        setContacts(contactsData);
        setTotalPages(contactsResponse.pagination.pages);

        // Calculate stats
        const available = contactsData.filter(
          (c: any) => !c.alreadySent
        ).length;
        const sent = contactsData.filter((c: any) => c.alreadySent).length;
        setStats({
          total: contactsData.length,
          available,
          selected: selectedContacts.size,
          sent,
        });
      }

      if (limitsResponse.success) {
        setLimits(limitsResponse.data);
      }
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const loadUserSettings = async () => {
    try {
      const savedFromName = localStorage.getItem("email-from-name") || "";
      const savedFromEmail = localStorage.getItem("email-from-email") || "";
      setFromName(savedFromName);
      setFromEmail(savedFromEmail);
    } catch (error) {
      console.error("Failed to load user settings:", error);
    }
  };

  useEffect(() => {
    loadData();
    loadUserSettings();
  }, [searchTerm, page]);

  useEffect(() => {
    // Update selected count in stats
    setStats((prev) => ({
      ...prev,
      selected: selectedContacts.size,
    }));
  }, [selectedContacts]);

  const availableContacts = contacts.filter((contact) => !contact.alreadySent);
  const alreadySentContacts = contacts.filter((contact) => contact.alreadySent);
  const selectedContactList = contacts.filter((contact) =>
    selectedContacts.has(contact.id)
  );

  const handleSelectContact = (contactId: string) => {
    const newSet = new Set(selectedContacts);
    if (newSet.has(contactId)) {
      newSet.delete(contactId);
    } else {
      if (newSet.size >= limits.remaining) {
        setError(
          `Limit reached. You can only select ${limits.remaining} more contacts this hour.`
        );
        setTimeout(() => setError(null), 3000);
        return;
      }
      newSet.add(contactId);
    }
    setSelectedContacts(newSet);
  };

  const handleSelectAll = () => {
    const selectableContacts = availableContacts.filter(
      (contact) => !selectedContacts.has(contact.id)
    );
    const maxToSelect = Math.min(limits.remaining, selectableContacts.length);

    const newSelected = new Set(selectedContacts);
    selectableContacts.slice(0, maxToSelect).forEach((contact) => {
      newSelected.add(contact.id);
    });

    setSelectedContacts(newSelected);
  };

  const handleDeselectAll = () => {
    setSelectedContacts(new Set());
  };

  const handleSend = async () => {
    if (selectedContactList.length === 0) {
      setError("Please select at least one contact");
      return;
    }

    if (!subject.trim()) {
      setError("Please enter a subject");
      return;
    }

    if (!emailHtml || !emailHtml.trim()) {
      setError("Email content is empty. Please build an email first.");
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const response = await emailApi.sendBulkEmail({
        contactIds: Array.from(selectedContacts),
        subject,
        html: emailHtml,
        fromName,
        fromEmail,
      });

      if (response.success) {
        // Show success message
        const successMessage = `Success! Email sent to ${response.data.successful} contacts`;
        setError(null);
        alert(successMessage);

        // Reset and reload
        setSelectedContacts(new Set());
        setSubject("");
        await loadData();

        setTimeout(() => onClose(), 1500);
      } else {
        setError(response.error || response.message || "Failed to send email");
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to send email";
      setError(errorMsg);
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="h-16 w-16 border-4 border-blue-100 rounded-full"></div>
              <div className="absolute top-0 left-0 h-16 w-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="mt-6 text-gray-600 font-medium">
              Loading contacts...
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Preparing your email campaign
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl w-full max-w-7xl max-h-[95vh] overflow-hidden shadow-2xl shadow-gray-900/20 border border-gray-200">
          {/* Header */}
          <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                  <EnvelopeIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Send Email Campaign
                  </h1>
                  <div className="flex items-center space-x-6 mt-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <ClockIcon className="h-4 w-4 mr-1.5" />
                      <span className="font-medium">{limits.remaining}</span>
                      &nbsp;emails remaining this hour
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <UserGroupIcon className="h-4 w-4 mr-1.5" />
                      <span className="font-medium">{stats.total}</span>&nbsp;total
                      contacts
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowTestModal(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all hover:scale-[1.02] active:scale-[0.98] font-medium flex items-center border border-gray-300"
                >
                  <SparklesIcon className="h-4 w-4 mr-2" />
                  Send Test
                </button>
                <button
                  onClick={onClose}
                  className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
                  disabled={isSending}
                >
                  <XMarkIcon className="h-6 w-6 text-gray-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-4 bg-gradient-to-r from-rose-50 to-rose-100 border-b border-rose-200 animate-in slide-in-from-top duration-300">
              <div className="flex justify-between items-center max-w-6xl mx-auto">
                <div className="flex items-center">
                  <ExclamationCircleIcon className="h-5 w-5 text-rose-600 mr-3" />
                  <span className="font-medium text-rose-800">{error}</span>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-rose-600 hover:text-rose-800"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex flex-col h-[calc(95vh-120px)]">
            {/* Three Column Layout */}
            <div className="grid grid-cols-3 gap-8 p-8 flex-1 overflow-hidden bg-gradient-to-b from-white to-gray-50/50">
              {/* Left Column - Available Contacts */}
              <div className="flex flex-col space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">
                    Available Contacts
                    <span className="ml-2 px-2.5 py-0.5 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      {stats.available}
                    </span>
                  </h3>
                  <button
                    onClick={handleSelectAll}
                    disabled={limits.remaining === 0}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors"
                  >
                    Select All
                  </button>
                </div>

                {/* Search */}
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search contacts by name or email..."
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    disabled={isSending}
                  />
                </div>

                {/* Contacts List */}
                <div className="flex-1 overflow-y-auto rounded-xl border border-gray-300 bg-white/50 backdrop-blur-sm">
                  {availableContacts.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="p-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl inline-block mb-4">
                        <UserGroupIcon className="h-12 w-12 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">
                        No contacts available
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        All contacts have been emailed this hour
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {availableContacts.map((contact) => (
                        <div
                          key={contact.id}
                          onClick={() => handleSelectContact(contact.id)}
                          className={`p-4 cursor-pointer transition-all hover:bg-gray-50/80 ${
                            selectedContacts.has(contact.id)
                              ? "bg-gradient-to-r from-blue-50 to-blue-100/50 border-l-4 border-blue-500"
                              : ""
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div
                                className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                  selectedContacts.has(contact.id)
                                    ? "bg-blue-100 text-blue-600"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {contact.nickname.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {contact.nickname}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {contact.email}
                                </div>
                              </div>
                            </div>
                            <div
                              className={`h-5 w-5 rounded border ${
                                selectedContacts.has(contact.id)
                                  ? "bg-blue-600 border-blue-600"
                                  : "border-gray-300"
                              } flex items-center justify-center`}
                            >
                              {selectedContacts.has(contact.id) && (
                                <CheckCircleIcon className="h-4 w-4 text-white" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Middle Column - Selected Contacts & Subject */}
              <div className="flex flex-col space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">
                    Selected Contacts
                    <span className="ml-2 px-2.5 py-0.5 bg-gradient-to-r from-green-100 to-emerald-100 text-emerald-800 text-sm font-medium rounded-full">
                      {stats.selected}
                    </span>
                  </h3>
                  <button
                    onClick={handleDeselectAll}
                    disabled={stats.selected === 0}
                    className="text-sm font-medium text-rose-600 hover:text-rose-700 disabled:opacity-50 transition-colors"
                  >
                    Clear All
                  </button>
                </div>

                {/* Subject Input */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-900">
                    Email Subject
                    <span className="text-rose-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                    placeholder="Enter your email subject..."
                    disabled={isSending}
                  />
                </div>

                {/* Selected Contacts List */}
                <div className="flex-1 overflow-y-auto rounded-xl border border-gray-300 bg-white/50 backdrop-blur-sm">
                  {selectedContactList.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="p-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl inline-block mb-4">
                        <EnvelopeIcon className="h-12 w-12 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">
                        No contacts selected
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        Select contacts from the left panel
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {selectedContactList.map((contact) => (
                        <div
                          key={contact.id}
                          className="p-4 hover:bg-gray-50/80 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-medium">
                                {contact.nickname.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {contact.nickname}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {contact.email}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleSelectContact(contact.id)}
                              className="p-2 hover:bg-rose-50 rounded-lg transition-colors"
                              disabled={isSending}
                            >
                              <XMarkIcon className="h-4 w-4 text-rose-500" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Already Sent & Preview */}
              <div className="flex flex-col space-y-6">
                <h3 className="text-lg font-bold text-gray-900">
                  Already Sent
                  <span className="ml-2 px-2.5 py-0.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 text-sm font-medium rounded-full">
                    {stats.sent}
                  </span>
                </h3>

                {/* Already Sent List */}
                <div className="flex-1 overflow-y-auto rounded-xl border border-gray-300 bg-white/50 backdrop-blur-sm">
                  {alreadySentContacts.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="p-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl inline-block mb-4">
                        <CheckCircleIcon className="h-12 w-12 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">
                        No contacts sent this hour
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        All contacts are available for selection
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {alreadySentContacts.map((contact) => (
                        <div key={contact.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 flex items-center justify-center text-emerald-600 font-medium">
                                {contact.nickname.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {contact.nickname}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {contact.email}
                                </div>
                              </div>
                            </div>
                            <span className="px-3 py-1 bg-gradient-to-r from-green-50 to-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200">
                              Sent
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Email Preview */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Email Preview</h4>
                  <div className="rounded-xl border border-gray-300 bg-white/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-lg border border-gray-200 shadow-inner overflow-hidden">
                      <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <div className="text-sm font-medium text-gray-700">
                          Subject: {subject || "(No subject)"}
                        </div>
                      </div>
                      <div className="p-4 max-h-60 overflow-auto">
                        <div
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{
                            __html:
                              emailHtml ||
                              '<p class="text-gray-400 italic">No email content available</p>',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-gray-200 bg-gradient-to-r from-white to-gray-50">
              <div className="flex justify-between items-center">
                {/* Stats */}
                <div className="flex items-center space-x-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {stats.selected}
                    </div>
                    <div className="text-sm text-gray-600">Selected</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">
                      {stats.sent}
                    </div>
                    <div className="text-sm text-gray-600">Already Sent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">
                      {limits.remaining - stats.selected}
                    </div>
                    <div className="text-sm text-gray-600">More Available</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleDeselectAll}
                    disabled={stats.selected === 0 || isSending}
                    className="px-6 py-3 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 font-medium"
                  >
                    Clear Selection
                  </button>
                  <button
                    onClick={onClose}
                    className="px-6 py-3 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 font-medium"
                    disabled={isSending}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={
                      isSending ||
                      stats.selected === 0 ||
                      !subject.trim() ||
                      !emailHtml.trim()
                    }
                    className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center shadow-lg shadow-blue-600/20"
                  >
                    {isSending ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                        Send to {stats.selected} Contacts
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Test Email Modal */}
      {showTestModal && (
        <TestEmailModal
          isOpen={showTestModal}
          onClose={() => setShowTestModal(false)}
          defaultSubject={subject}
          defaultHtml={emailHtml}
        />
      )}
    </>
  );
}
