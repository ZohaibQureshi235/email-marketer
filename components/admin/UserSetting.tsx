// components/admin/UserSettings.tsx - Updated with localStorage
'use client'

import React, { useState, useEffect } from 'react';
import { UserSettingsData, FormErrors } from '@/types/admin';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiSave, FiEye, FiEyeOff, FiCheck, FiArrowRight } from 'react-icons/fi';

interface UserSettingsProps {
  settings: UserSettingsData;
  onSave: (data: UserSettingsData) => void;
  onShowEmailSettings?: () => void; // New prop to trigger email settings
}

const UserSettings: React.FC<UserSettingsProps> = ({ 
  settings, 
  onSave, 
  onShowEmailSettings 
}) => {
  const [formData, setFormData] = useState<UserSettingsData>({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [shouldRedirect, setShouldRedirect] = useState<boolean>(false);

  // Load from localStorage on initial render
  useEffect(() => {
    const savedUserData = localStorage.getItem('userSettings');
    if (savedUserData) {
      try {
        const parsedData = JSON.parse(savedUserData);
        setFormData(parsedData);
        // Also update parent component
        onSave(parsedData);
      } catch (error) {
        console.error('Failed to parse saved user settings:', error);
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
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (formData.password && !/(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Include uppercase letter and number';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length === 0) {
      setIsSaving(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Save to localStorage
      localStorage.setItem('userSettings', JSON.stringify(formData));
      
      // Call parent save function
      onSave(formData);
      setIsSaving(false);
      setShowSuccess(true);
      
      // Automatically redirect to email settings after 1.5 seconds
      setTimeout(() => {
        setShouldRedirect(true);
        if (onShowEmailSettings) {
          onShowEmailSettings();
        }
      }, 1500);
      
      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      setErrors(validationErrors);
    }
  };

  const formItems = [
    {
      id: 'email',
      label: 'Email Address',
      type: 'email',
      icon: FiMail,
      placeholder: 'your.email@company.com',
      description: 'Primary contact email for notifications'
    },
    {
      id: 'password',
      label: 'New Password',
      type: showPassword ? 'text' : 'password',
      icon: FiLock,
      placeholder: '••••••••',
      description: 'At least 8 characters with uppercase and number',
      showToggle: true,
      toggleState: showPassword,
      toggleAction: () => setShowPassword(!showPassword)
    },
    {
      id: 'confirmPassword',
      label: 'Confirm Password',
      type: showConfirmPassword ? 'text' : 'password',
      icon: FiLock,
      placeholder: '••••••••',
      description: 'Re-enter your new password',
      showToggle: true,
      toggleState: showConfirmPassword,
      toggleAction: () => setShowConfirmPassword(!showConfirmPassword)
    }
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center">
              <FiUser className="text-purple-400" />
            </div>
            User Profile
          </h2>
          <p className="text-white/60 text-sm mt-1">Set up your account credentials first</p>
        </div>
        
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
      </div>

      {/* Auto-redirect Notification */}
      {shouldRedirect && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <FiArrowRight className="text-blue-400 text-xl" />
            <div>
              <p className="text-white font-medium">User credentials saved!</p>
              <p className="text-white/60 text-sm">Now configure your email settings...</p>
            </div>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {formItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <label className="block text-sm font-medium text-white/80 mb-3 ml-1">
              {item.label}
              <span className="text-red-400 ml-1">*</span>
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <item.icon className={`h-5 w-5 ${
                  errors[item.id] 
                    ? 'text-red-400' 
                    : 'text-white/40 group-focus-within:text-purple-400'
                } transition-colors`} />
              </div>
              
              <input
                id={item.id}
                name={item.id}
                type={item.type}
                value={formData[item.id as keyof UserSettingsData]}
                onChange={handleChange}
                className={`block w-full pl-12 pr-12 py-3.5 bg-white/5 border ${
                  errors[item.id] 
                    ? 'border-red-400/30' 
                    : 'border-white/10 group-focus-within:border-purple-500/50'
                } rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all duration-200`}
                placeholder={item.placeholder}
              />
              
              {item.showToggle && (
                <button
                  type="button"
                  onClick={item.toggleAction}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {item.toggleState ? (
                    <FiEyeOff className="h-5 w-5 text-white/40 hover:text-white/60 transition-colors" />
                  ) : (
                    <FiEye className="h-5 w-5 text-white/40 hover:text-white/60 transition-colors" />
                  )}
                </button>
              )}
              
              <div className={`absolute inset-0 rounded-xl transition-all duration-300 pointer-events-none ${
                errors[item.id]
                  ? 'bg-red-500/5'
                  : 'bg-gradient-to-r from-purple-500/0 to-pink-500/0 group-focus-within:from-purple-500/10 group-focus-within:to-pink-500/10'
              }`} />
            </div>
            
            {errors[item.id] ? (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-red-400 ml-1"
              >
                {errors[item.id]}
              </motion.p>
            ) : (
              <p className="mt-2 text-sm text-white/40 ml-1">
                {item.description}
              </p>
            )}
          </motion.div>
        ))}

        {/* Password Strength Indicator */}
        {formData.password && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-white/5 rounded-xl p-4 border border-white/10"
          >
            <p className="text-white/80 text-sm mb-2">Password Strength</p>
            <div className="flex gap-2 mb-2">
              {[1, 2, 3, 4].map((level) => {
                let color = 'bg-white/10';
                if (formData.password.length >= 2 * level) {
                  if (formData.password.length >= 8 && /(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
                    color = 'bg-green-500';
                  } else if (formData.password.length >= 6) {
                    color = 'bg-yellow-500';
                  } else {
                    color = 'bg-red-500';
                  }
                }
                return (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${color}`}
                  />
                );
              })}
            </div>
            <p className="text-white/40 text-xs">
              {formData.password.length < 6 ? 'Weak' : 
               formData.password.length >= 8 && /(?=.*[A-Z])(?=.*\d)/.test(formData.password) ? 'Strong' : 
               'Medium'}
            </p>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-between pt-6 border-t border-white/10"
        >
          <button
            type="button"
            className="px-6 py-3 text-white/60 hover:text-white border border-white/20 hover:border-white/30 rounded-xl transition-all duration-200"
            onClick={() => {
              setFormData(settings);
              setErrors({});
            }}
          >
            Reset Changes
          </button>
          
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={isSaving}
              className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium px-8 py-3.5 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
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
                    Save & Continue
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>
        </motion.div>
      </form>

      {/* Progress Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-8 pt-6 border-t border-white/10"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/60 text-sm">Setup Progress</span>
          <span className="text-white/80 text-sm">Step 1 of 2</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: '0%' }}
            animate={{ width: shouldRedirect ? '100%' : '50%' }}
            transition={{ duration: 0.8 }}
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-white/40 text-xs">
          <span>User Credentials</span>
          <span>Email Settings</span>
        </div>
      </motion.div>
    </div>
  );
};

export default UserSettings;