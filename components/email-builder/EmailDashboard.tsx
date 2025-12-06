// components/EmailDashboard.jsx
"use client";

import { useState } from "react";
import SendEmailModal from "./SendEmailModal";
import EmailHistory from "../email-list/EmailHistory";
import EmailAnalytics from "./EmailAnalytics";
import { emailApi } from "@/api/emailApi";

export default function EmailDashboard() {
  const [activeTab, setActiveTab] = useState("send");
  const [showSendModal, setShowSendModal] = useState(false);
  const [emailHtml, setEmailHtml] = useState("");
  const [emailSubject, setEmailSubject] = useState("");

  // Sample email template
  const sampleEmailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 28px;">Welcome Newsletter</h1>
        <p style="margin: 10px 0 0; opacity: 0.9;">Monthly updates and insights</p>
      </div>
      
      <div style="padding: 30px; background: white;">
        <h2 style="color: #333; margin-top: 0;">Latest Updates</h2>
        
        <div style="margin: 25px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #667eea;">
          <h3 style="color: #667eea; margin: 0 0 10px;">✨ New Features</h3>
          <p style="margin: 0; color: #555;">
            We've launched several new features to enhance your experience. Check them out!
          </p>
        </div>
        
        <div style="margin: 25px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #10b981;">
          <h3 style="color: #10b981; margin: 0 0 10px;">📈 Performance Tips</h3>
          <p style="margin: 0; color: #555;">
            Learn how to optimize your email campaigns for better engagement and results.
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="#" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            View All Updates
          </a>
        </div>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
        <p style="margin: 0 0 10px;">
          You're receiving this email because you subscribed to our newsletter.
        </p>
        <p style="margin: 0;">
          <a href="#" style="color: #667eea;">Unsubscribe</a> | 
          <a href="#" style="color: #667eea; margin-left: 10px;">Update Preferences</a>
        </p>
      </div>
    </div>
  `;

  const handleSendClick = () => {
    setEmailHtml(sampleEmailHtml);
    setEmailSubject("Monthly Newsletter - Latest Updates");
    setShowSendModal(true);
  };

  const handleEditorUpdate = (newHtml: string, newSubject: string) => {
    setEmailHtml(newHtml);
    setEmailSubject(newSubject);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Email Campaigns</h1>
          <p className="text-gray-600 mt-2">Manage your email campaigns, track performance, and analyze results</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">1,234</div>
            <div className="text-sm text-gray-600">Total Contacts</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">456</div>
            <div className="text-sm text-gray-600">Emails Sent Today</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-purple-600">34.5%</div>
            <div className="text-sm text-gray-600">Avg Open Rate</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-orange-600">12.8%</div>
            <div className="text-sm text-gray-600">Avg Click Rate</div>
          </div>
        </div>

        {/* Tabs and Actions */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("send")}
                className={`py-4 px-6 font-medium text-sm border-b-2 ${
                  activeTab === "send"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Send Email
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`py-4 px-6 font-medium text-sm border-b-2 ${
                  activeTab === "history"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                History
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`py-4 px-6 font-medium text-sm border-b-2 ${
                  activeTab === "analytics"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => setActiveTab("templates")}
                className={`py-4 px-6 font-medium text-sm border-b-2 ${
                  activeTab === "templates"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Templates
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "send" && (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="text-gray-400 mb-6">
                    <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Send Email Campaign</h3>
                  <p className="text-gray-600 mb-6">
                    Create and send email campaigns to your contacts. You can use templates or create new designs.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={handleSendClick}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                      Compose New Email
                    </button>
                    <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                      Use Template
                    </button>
                    <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                      Import CSV
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "history" && <EmailHistory />}
            {activeTab === "analytics" && <EmailAnalytics />}
            {activeTab === "templates" && (
              <div className="text-center py-12">
                <p className="text-gray-600">Email templates coming soon...</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setEmailHtml(sampleEmailHtml);
                  setEmailSubject("Test Email");
                  setShowSendModal(true);
                }}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200"
              >
                Send Test Email
              </button>
              <button className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200">
                Check SMTP Settings
              </button>
              <button className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200">
                Export Contacts
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm text-gray-900">Campaign sent to 250 contacts</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm text-gray-900">Test email delivered successfully</p>
                  <p className="text-xs text-gray-500">Yesterday</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm text-gray-900">15 contacts imported</p>
                  <p className="text-xs text-gray-500">2 days ago</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Sending Limits</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Hourly Limit</span>
                  <span>125/500</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Daily Limit</span>
                  <span>850/2000</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '42.5%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Monthly Limit</span>
                  <span>5,250/10,000</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '52.5%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Send Email Modal */}
      {showSendModal && (
        <SendEmailModal
          emailHtml={emailHtml}
          defaultSubject={emailSubject}
          onClose={() => setShowSendModal(false)}
        />
      )}
    </div>
  );
}