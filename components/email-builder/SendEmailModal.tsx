'use client';

import { useState } from 'react';

interface SendEmailModalProps {
  emailHtml: string;
  onClose: () => void;
}

interface EmailContact {
  id: string;
  email: string;
  name: string;
}

export default function SendEmailModal({ emailHtml, onClose }: SendEmailModalProps) {
  const [recipients, setRecipients] = useState('');
  const [subject, setSubject] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [savedContacts, setSavedContacts] = useState<EmailContact[]>([]);
  const [selectedContact, setSelectedContact] = useState('');

  // Load saved contacts from localStorage
  useState(() => {
    const saved = localStorage.getItem('email-contacts');
    if (saved) {
      try {
        setSavedContacts(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading contacts:', error);
      }
    }
  });

  const handleSend = async () => {
    if (!recipients.trim() || !subject.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSending(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Save to sent emails history
      const sentEmails = JSON.parse(localStorage.getItem('sent-emails') || '[]');
      sentEmails.push({
        id: `email-${Date.now()}`,
        recipients: recipients.split(',').map(email => email.trim()),
        subject,
        html: emailHtml,
        sentAt: new Date().toISOString(),
        status: 'sent'
      });
      localStorage.setItem('sent-emails', JSON.stringify(sentEmails));
      
      alert('Email sent successfully!');
      onClose();
    } catch (error) {
      alert('Failed to send email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleAddContact = () => {
    const email = recipients.trim();
    if (email && isValidEmail(email)) {
      const newContact: EmailContact = {
        id: `contact-${Date.now()}`,
        email,
        name: email.split('@')[0] // Default name from email
      };
      
      const updatedContacts = [...savedContacts, newContact];
      setSavedContacts(updatedContacts);
      localStorage.setItem('email-contacts', JSON.stringify(updatedContacts));
      alert('Contact saved!');
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleContactSelect = (contact: EmailContact) => {
    if (recipients) {
      setRecipients(prev => `${prev}, ${contact.email}`);
    } else {
      setRecipients(contact.email);
    }
  };

  const getEmailCount = () => {
    return recipients.split(',')
      .filter(email => email.trim())
      .filter(email => isValidEmail(email.trim()))
      .length;
  };

  const validEmailCount = getEmailCount();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Send Email</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            disabled={isSending}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
          {/* Recipients Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Recipients *
              </label>
              <span className="text-xs text-gray-500">
                {validEmailCount} {validEmailCount === 1 ? 'recipient' : 'recipients'}
              </span>
            </div>
            <textarea
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              placeholder="Enter email addresses separated by commas"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={3}
              disabled={isSending}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                Separate multiple emails with commas
              </p>
              <button
                onClick={handleAddContact}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                type="button"
              >
                Save as Contact
              </button>
            </div>
          </div>

          {/* Saved Contacts */}
          {savedContacts.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Saved Contacts
              </label>
              <div className="flex flex-wrap gap-2">
                {savedContacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => handleContactSelect(contact)}
                    className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                    type="button"
                    disabled={isSending}
                  >
                    <UserIcon className="h-3 w-3 mr-1" />
                    {contact.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject *
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSending}
            />
          </div>

          {/* Preview Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preview
            </label>
            <div className="border border-gray-300 rounded-lg p-4 max-h-60 overflow-auto bg-gray-50">
              <div 
                className="bg-white p-4 rounded border"
                dangerouslySetInnerHTML={{ __html: emailHtml }} 
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              This is how your email will appear to recipients
            </p>
          </div>

          {/* Sending Options */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Sending Information</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Emails will be sent immediately to all recipients. Please review the content and recipients before sending.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Ready to send to {validEmailCount} {validEmailCount === 1 ? 'recipient' : 'recipients'}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                disabled={isSending}
              >
                Cancel
              </button>
              <button 
                onClick={handleSend}
                disabled={isSending || !recipients.trim() || !subject.trim() || validEmailCount === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSending ? (
                  <>
                    <SpinnerIcon className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                    Send Email
                  </>
                )}
              </button>
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
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function PaperAirplaneIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  );
}

function ExclamationTriangleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  );
}

function SpinnerIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}