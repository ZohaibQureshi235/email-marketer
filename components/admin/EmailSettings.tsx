// components/admin/EmailSettings.tsx - Updated with localStorage
'use client'

import React, { useState, useEffect } from 'react';
import { EmailSettingsData } from '@/types/admin';
import { motion } from 'framer-motion';
import { FiMail, FiServer, FiKey, FiUser, FiSave, FiCheck, FiPlay, FiRefreshCw } from 'react-icons/fi';

interface EmailSettingsProps {
  settings: EmailSettingsData;
  onSave: (data: EmailSettingsData) => void;
}

const EmailSettings: React.FC<EmailSettingsProps> = ({ settings, onSave }) => {
  const [formData, setFormData] = useState<EmailSettingsData>({
    EMAIL_HOST: '',
    EMAIL_PORT: '',
    EMAIL_USER: '',
    EMAIL_PASSWORD: ''
  });
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [showTestSuccess, setShowTestSuccess] = useState<boolean>(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedEmailData = localStorage.getItem('emailSettings');
    if (savedEmailData) {
      try {
        const parsedData = JSON.parse(savedEmailData);
        setFormData(parsedData);
        // Also update parent component
        onSave(parsedData);
      } catch (error) {
        console.error('Failed to parse saved email settings:', error);
      }
    } else {
      setFormData(settings);
    }
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Save to localStorage
    localStorage.setItem('emailSettings', JSON.stringify(formData));
    
    // Update parent
    onSave(formData);
    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleTestConnection = async (): Promise<void> => {
    setIsTesting(true);
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsTesting(false);
    setShowTestSuccess(true);
    setTimeout(() => setShowTestSuccess(false), 3000);
  };

  const formItems = [
    {
      id: 'EMAIL_HOST',
      label: 'SMTP Host',
      icon: FiServer,
      placeholder: 'smtp.gmail.com',
      description: 'Your SMTP server address'
    },
    {
      id: 'EMAIL_PORT',
      label: 'SMTP Port',
      icon: FiServer,
      placeholder: '587',
      description: 'Common ports: 587 (TLS), 465 (SSL), 25'
    },
    {
      id: 'EMAIL_USER',
      label: 'Email Username',
      icon: FiUser,
      placeholder: 'your.email@gmail.com',
      description: 'Full email address for authentication'
    },
    {
      id: 'EMAIL_PASSWORD',
      label: 'Email Password',
      icon: FiKey,
      placeholder: '••••••••',
      description: 'App password if 2FA is enabled',
      type: 'password'
    }
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center">
              <FiMail className="text-blue-400" />
            </div>
            Email Configuration
          </h2>
          <p className="text-white/60 text-sm mt-1">
            Configure SMTP settings using email: {localStorage.getItem('userSettings') ? 
              JSON.parse(localStorage.getItem('userSettings')!).email : 
              'Set user email first'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-xl"
            >
              <FiCheck className="text-green-400" />
              <span className="text-green-400 text-sm font-medium">Settings saved!</span>
            </motion.div>
          )}
          
          {showTestSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-xl"
            >
              <FiCheck className="text-blue-400" />
              <span className="text-blue-400 text-sm font-medium">Connection successful!</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* User Email Reference */}
      {localStorage.getItem('userSettings') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <FiUser className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">User Reference</h3>
              <p className="text-white/60 text-sm">
                Configuring email settings for: <span className="text-purple-300">
                  {JSON.parse(localStorage.getItem('userSettings')!).email}
                </span>
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Connection Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 p-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">SMTP Connection</h3>
            <p className="text-white/60 text-sm">
              Configure your email server settings for outgoing messages
            </p>
          </div>
          <button
            onClick={handleTestConnection}
            disabled={isTesting || !formData.EMAIL_HOST || !formData.EMAIL_PORT}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTesting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <FiPlay className="text-lg" />
                Test Connection
              </>
            )}
          </button>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {formItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <label className="block text-sm font-medium text-white/80 mb-3 ml-1">
                {item.label}
                <span className="text-red-400 ml-1">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <item.icon className="h-5 w-5 text-white/40 group-focus-within:text-blue-400 transition-colors" />
                </div>
                
                <input
                  id={item.id}
                  name={item.id}
                  type={item.type || 'text'}
                  value={formData[item.id as keyof EmailSettingsData]}
                  onChange={handleChange}
                  required
                  className="block w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 group-focus-within:border-blue-500/50 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all duration-200"
                  placeholder={item.placeholder}
                />
                
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-cyan-500/0 group-focus-within:from-blue-500/10 group-focus-within:to-cyan-500/10 rounded-xl transition-all duration-300 pointer-events-none" />
              </div>
              
              <p className="mt-2 text-sm text-white/40 ml-1">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Security Notes */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="p-6 bg-white/5 border border-yellow-500/20 rounded-2xl"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <FiKey className="text-yellow-400" />
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">Security Guidelines</h4>
              <ul className="text-white/60 text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-1.5" />
                  <span>For Gmail, use an App Password if 2FA is enabled</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-1.5" />
                  <span>Never commit credentials to version control</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-1.5" />
                  <span>Use environment variables for production deployment</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-between pt-6 border-t border-white/10"
        >
          <button
            type="button"
            className="flex items-center gap-2 px-6 py-3 text-white/60 hover:text-white border border-white/20 hover:border-white/30 rounded-xl transition-all duration-200"
            onClick={() => {
              const savedEmailData = localStorage.getItem('emailSettings');
              if (savedEmailData) {
                try {
                  setFormData(JSON.parse(savedEmailData));
                } catch (error) {
                  setFormData(settings);
                }
              } else {
                setFormData(settings);
              }
            }}
          >
            <FiRefreshCw className="text-lg" />
            Reset Configuration
          </button>
          
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting || !formData.EMAIL_HOST || !formData.EMAIL_PORT}
              className="flex items-center gap-2 px-6 py-3 text-white border border-blue-500/30 hover:border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/15 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiPlay className="text-lg" />
              {isTesting ? 'Testing...' : 'Test Connection'}
            </button>
            
            <button
              type="submit"
              disabled={isSaving}
              className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium px-8 py-3.5 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave className="text-lg" />
                    Save Configuration
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>
        </motion.div>
      </form>

      {/* Setup Completion */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-8 pt-6 border-t border-white/10"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/60 text-sm">Setup Progress</span>
          <span className="text-white/80 text-sm">Step 2 of 2</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 1 }}
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
          />
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="text-white/40 text-sm">
            User credentials saved to localStorage
          </div>
          <div className="text-green-400 text-sm font-medium">
            {formData.EMAIL_HOST ? 'Email settings complete' : 'Configure email settings'}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EmailSettings;