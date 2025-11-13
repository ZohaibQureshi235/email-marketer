'use client';

import { useState } from 'react';
import { TrashIcon, UserIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

interface EmailContact {
  id: string;
  email: string;
  nickname?: string;
  addedAt: Date;
}

export default function EmailListManager() {
  const [contacts, setContacts] = useState<EmailContact[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newNickname, setNewNickname] = useState('');

  const addEmail = () => {
    if (!newEmail) return;

    const newContact: EmailContact = {
      id: `contact-${Date.now()}`,
      email: newEmail,
      nickname: newNickname || undefined,
      addedAt: new Date(),
    };

    setContacts([...contacts, newContact]);
    setNewEmail('');
    setNewNickname('');
  };

  const removeContact = (id: string) => {
    setContacts(contacts.filter(contact => contact.id !== id));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      // Simple email extraction regex
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const emails = content.match(emailRegex) || [];

      const newContacts = emails.map(email => ({
        id: `contact-${Date.now()}-${Math.random()}`,
        email,
        addedAt: new Date(),
      }));

      setContacts([...contacts, ...newContacts]);
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Email List Management</h1>
        <p className="text-gray-600">Manage your email subscribers and contacts</p>
      </div>

      {/* Add Email Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Contact</h2>
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Enter email address"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <button
          onClick={addEmail}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Contact
        </button>
      </div>

      {/* Bulk Upload */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Bulk Upload</h2>
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
          />
          <label
            htmlFor="file-upload"
            className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Choose Files
          </label>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Email Contacts ({contacts.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Email</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Nickname</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Added</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{contact.email}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {contact.nickname ? (
                      <div className="flex items-center space-x-2">
                        <UserIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{contact.nickname}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {contact.addedAt.toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => removeContact(contact.id)}
                      className="text-red-600 hover:text-red-700 transition-colors"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}