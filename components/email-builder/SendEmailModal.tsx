"use client";

import { useState, useEffect } from "react";

interface SendEmailModalProps {
  emailHtml: string;
  onClose: () => void;
}

interface EmailContact {
  id: string;
  email: string;
  name: string;
  lastSent?: string;
}

interface SentEmailRecord {
  id: string;
  recipients: string[];
  subject: string;
  html: string;
  sentAt: string;
  status: string;
  contactIds: string[];
}

export default function SendEmailModal({
  emailHtml,
  onClose,
}: SendEmailModalProps) {
  const [recipients, setRecipients] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [savedContacts, setSavedContacts] = useState<EmailContact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [sentThisHour, setSentThisHour] = useState<SentEmailRecord[]>([]);
  const [filterText, setFilterText] = useState("");

  // Load saved contacts and sent emails from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("email-contacts");
    if (saved) {
      try {
        setSavedContacts(JSON.parse(saved));
      } catch (error) {
        console.error("Error loading contacts:", error);
      }
    }

    const sentEmails = JSON.parse(localStorage.getItem("sent-emails") || "[]");
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentSends = sentEmails.filter((email: SentEmailRecord) => 
      new Date(email.sentAt) > oneHourAgo
    );
    setSentThisHour(recentSends);
  }, []);

  // Get contacts already sent to in the last hour
  const getSentContactsThisHour = (): Set<string> => {
    const sentContacts = new Set<string>();
    sentThisHour.forEach(email => {
      email.contactIds?.forEach(id => sentContacts.add(id));
    });
    return sentContacts;
  };

  // Filter contacts based on selection and hourly limit
  const availableContacts = savedContacts.filter(contact => {
    // Filter by search text if any
    if (filterText && !contact.email.toLowerCase().includes(filterText.toLowerCase()) && 
        !contact.name.toLowerCase().includes(filterText.toLowerCase())) {
      return false;
    }
    
    // Check if already selected
    if (selectedContacts.has(contact.id)) {
      return false;
    }
    
    // Check if sent in last hour
    const sentContacts = getSentContactsThisHour();
    return !sentContacts.has(contact.id);
  });

  const alreadySentContacts = savedContacts.filter(contact => {
    const sentContacts = getSentContactsThisHour();
    return sentContacts.has(contact.id) && !selectedContacts.has(contact.id);
  });

  const selectedContactList = savedContacts.filter(contact => 
    selectedContacts.has(contact.id)
  );

  // Calculate remaining contacts that can be selected
  const maxContactsPerHour = 500;
  const sentCount = getSentContactsThisHour().size;
  const remainingSlots = Math.max(0, maxContactsPerHour - sentCount);
  const canSelectMore = selectedContactList.length < remainingSlots;

  const handleSelectContact = (contact: EmailContact) => {
    if (!canSelectMore && !selectedContacts.has(contact.id)) {
      alert(`You can only select ${remainingSlots} more contacts this hour. ${sentCount} already sent.`);
      return;
    }
    
    setSelectedContacts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(contact.id)) {
        newSet.delete(contact.id);
      } else {
        newSet.add(contact.id);
      }
      return newSet;
    });
  };

  const handleSelectAllAvailable = () => {
    const toSelect = Math.min(remainingSlots, availableContacts.length);
    const newSelected = new Set(selectedContacts);
    
    availableContacts.slice(0, toSelect).forEach(contact => {
      newSelected.add(contact.id);
    });
    
    setSelectedContacts(newSelected);
  };

  const handleDeselectAll = () => {
    setSelectedContacts(new Set());
  };

  const handleSend = async () => {
    if (selectedContactList.length === 0) {
      alert("Please select at least one contact to send to");
      return;
    }

    if (!subject.trim()) {
      alert("Please enter a subject");
      return;
    }

    setIsSending(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Save to sent emails history
      const sentEmails = JSON.parse(
        localStorage.getItem("sent-emails") || "[]"
      );
      const newSentEmail: SentEmailRecord = {
        id: `email-${Date.now()}`,
        recipients: selectedContactList.map(c => c.email),
        subject,
        html: emailHtml,
        sentAt: new Date().toISOString(),
        status: "sent",
        contactIds: Array.from(selectedContacts),
      };
      sentEmails.push(newSentEmail);
      localStorage.setItem("sent-emails", JSON.stringify(sentEmails));

      // Update sent this hour
      setSentThisHour(prev => [...prev, newSentEmail]);

      alert(`Email sent successfully to ${selectedContactList.length} contacts!`);
      
      // Clear selection after sending
      setSelectedContacts(new Set());
      setSubject("");
      
    } catch (error) {
      alert("Failed to send email. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleAddContact = () => {
    // Simple contact addition from input (optional feature)
    const email = prompt("Enter email address to add to contacts:");
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const newContact: EmailContact = {
        id: `contact-${Date.now()}`,
        email,
        name: email.split("@")[0],
      };

      const updatedContacts = [...savedContacts, newContact];
      setSavedContacts(updatedContacts);
      localStorage.setItem("email-contacts", JSON.stringify(updatedContacts));
      alert("Contact saved!");
    } else if (email) {
      alert("Please enter a valid email address");
    }
  };

  // Handle key events for inputs
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
  };

  const getContactCount = () => {
    return savedContacts.length;
  };

  const getSentCountThisHour = () => {
    return getSentContactsThisHour().size;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Send Email to Contacts</h2>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Total Contacts: {getContactCount()} | 
              Sent this hour: {getSentCountThisHour()}/500
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              disabled={isSending}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="flex flex-col h-[calc(90vh-120px)]">
          <div className="grid grid-cols-3 gap-6 p-6 flex-1 overflow-hidden">
            {/* Left Column: Available Contacts */}
            <div className="space-y-4 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Available Contacts ({availableContacts.length})
                </h3>
                <div className="text-sm text-gray-500">
                  Can select: {remainingSlots - selectedContactList.length} more
                </div>
              </div>
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  placeholder="Search contacts..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <button
                  onClick={handleSelectAllAvailable}
                  disabled={!canSelectMore || availableContacts.length === 0}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Select All
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
                {availableContacts.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <UserGroupIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No contacts available for selection</p>
                    <p className="text-sm mt-2">
                      {filterText ? "Try a different search term" : "All contacts have been sent to or selected"}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {availableContacts.map((contact) => (
                      <div
                        key={contact.id}
                        onClick={() => handleSelectContact(contact)}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedContacts.has(contact.id) ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">{contact.name}</div>
                            <div className="text-sm text-gray-500">{contact.email}</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={selectedContacts.has(contact.id)}
                            onChange={() => handleSelectContact(contact)}
                            onClick={(e) => e.stopPropagation()}
                            className="h-4 w-4 text-blue-600 rounded"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Middle Column: Selected Contacts */}
            <div className="space-y-4 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Selected Contacts ({selectedContactList.length})
                </h3>
                <button
                  onClick={handleDeselectAll}
                  disabled={selectedContactList.length === 0}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                  Deselect All
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    placeholder="Enter email subject"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isSending}
                  />
                </div>

                <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
                  {selectedContactList.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <UsersIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No contacts selected</p>
                      <p className="text-sm mt-2">Select contacts from the left panel</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {selectedContactList.map((contact) => (
                        <div
                          key={contact.id}
                          className="p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900">{contact.name}</div>
                              <div className="text-sm text-gray-500">{contact.email}</div>
                            </div>
                            <button
                              onClick={() => handleSelectContact(contact)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Already Sent & Preview */}
            <div className="space-y-4 overflow-hidden flex flex-col">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Already Sent This Hour ({alreadySentContacts.length})
                </h3>
                <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
                  {alreadySentContacts.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <CheckCircleIcon className="h-12 w-12 mx-auto mb-4 text-green-300" />
                      <p>No contacts sent this hour</p>
                      <p className="text-sm mt-2">All contacts are available for selection</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {alreadySentContacts.map((contact) => (
                        <div key={contact.id} className="p-4">
                          <div className="flex items-center">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{contact.name}</div>
                              <div className="text-sm text-gray-500">{contact.email}</div>
                            </div>
                            <div className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                              Sent
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Preview Section */}
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Preview</h3>
                <div className="border border-gray-300 rounded-lg p-4 max-h-60 overflow-auto bg-gray-50">
                  <div
                    className="bg-white p-4 rounded border"
                    dangerouslySetInnerHTML={{ __html: emailHtml }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <div className="flex items-center space-x-4">
                  <div>
                    <span className="font-medium">{selectedContactList.length}</span> selected
                  </div>
                  <div>
                    <span className="font-medium">{alreadySentContacts.length}</span> already sent this hour
                  </div>
                  <div>
                    <span className="font-medium">{remainingSlots - selectedContactList.length}</span> more available
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleAddContact}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                  type="button"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Contact
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  disabled={isSending}
                  onKeyDown={handleInputKeyDown}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={
                    isSending ||
                    selectedContactList.length === 0 ||
                    !subject.trim()
                  }
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  onKeyDown={handleInputKeyDown}
                >
                  {isSending ? (
                    <>
                      <SpinnerIcon className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                      Send to {selectedContactList.length} Contacts
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Icon Components
function XMarkIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

function UserGroupIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  );
}

function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-5.195v1a6 6 0 01-3 5.197"
      />
    </svg>
  );
}

function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4v16m8-8H4"
      />
    </svg>
  );
}

function PaperAirplaneIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
      />
    </svg>
  );
}

function SpinnerIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
}