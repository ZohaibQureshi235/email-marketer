// components/TestEmailModal.tsx
"use client";

import { useState } from "react";
import { emailApi } from "@/api/emailApi";
import { XMarkIcon, PaperAirplaneIcon, CheckCircleIcon, ExclamationCircleIcon, EyeIcon, SparklesIcon } from "@heroicons/react/24/outline";

interface TestEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSubject?: string;
  defaultHtml?: string;
}

export default function TestEmailModal({
  isOpen,
  onClose,
  defaultSubject = "",
  defaultHtml = "",
}: TestEmailModalProps) {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(defaultSubject);
  const [html, setHtml] = useState(defaultHtml);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"compose" | "preview">("compose");

  const handleSendTest = async () => {
    if (!email || !subject || !html) {
      setMessage({ type: 'error', text: 'All fields are required' });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }

    setIsSending(true);
    setMessage(null);

    try {
      const response = await emailApi.sendTestEmail({
        toEmail: email,
        subject,
        html,
      });

      if (response.success) {
        setMessage({ type: 'success', text: 'Test email sent successfully! Check your inbox.' });
        setEmail("");
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to send test email' });
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || error.message || 'Failed to send test email'
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl w-full max-w-2xl shadow-2xl shadow-gray-900/20 border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <SparklesIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Send Test Email</h2>
                <p className="text-sm text-gray-600 mt-1">Preview and test your email before sending</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isSending}
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Message Alert */}
          {message && (
            <div className={`mb-6 p-4 rounded-xl border ${message.type === 'success' ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'} animate-in slide-in-from-top duration-300`}>
              <div className="flex items-center">
                {message.type === 'success' ? (
                  <CheckCircleIcon className="h-5 w-5 text-emerald-600 mr-3" />
                ) : (
                  <ExclamationCircleIcon className="h-5 w-5 text-rose-600 mr-3" />
                )}
                <span className="text-sm font-medium">{message.text}</span>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab("compose")}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === "compose" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            >
              Compose
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === "preview" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            >
              <div className="flex items-center justify-center">
                <EyeIcon className="h-4 w-4 mr-2" />
                Preview
              </div>
            </button>
          </div>

          {activeTab === "compose" ? (
            <div className="space-y-5">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">
                  <span className="text-rose-500">*</span> Recipient Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">@</span>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="recipient@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/50 backdrop-blur-sm"
                    disabled={isSending}
                  />
                </div>
              </div>

              {/* Subject Input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">
                  <span className="text-rose-500">*</span> Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter email subject"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/50 backdrop-blur-sm"
                  disabled={isSending}
                />
              </div>

              {/* HTML Content */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-gray-900">
                    <span className="text-rose-500">*</span> HTML Content
                  </label>
                  <span className="text-xs text-gray-500">{html.length} characters</span>
                </div>
                <textarea
                  value={html}
                  onChange={(e) => setHtml(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/50 backdrop-blur-sm font-mono text-sm resize-none"
                  disabled={isSending}
                  placeholder="Enter HTML content here..."
                />
              </div>
            </div>
          ) : (
            /* Preview Tab */
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <EyeIcon className="h-4 w-4 mr-2" />
                  Live Preview
                </h4>
                <div className="bg-white p-6 rounded-lg shadow-inner border max-h-96 overflow-auto">
                  <div className="border-b border-gray-200 pb-3 mb-4">
                    <div className="text-sm text-gray-500 mb-1">Subject: {subject || "(No subject)"}</div>
                    <div className="text-xs text-gray-400">To: {email || "recipient@example.com"}</div>
                  </div>
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: html || '<p class="text-gray-400 italic">Email content will appear here</p>' }} 
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 font-medium"
              disabled={isSending}
            >
              Cancel
            </button>
            <button
              onClick={handleSendTest}
              disabled={isSending || !email || !subject || !html}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center shadow-lg shadow-blue-600/20"
            >
              {isSending ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                  Send Test Email
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}