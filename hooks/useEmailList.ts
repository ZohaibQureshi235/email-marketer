import { useState, useCallback } from 'react';
import { EmailContact } from '@/types';
import { EmailParser } from '@/utils/emailParser';
import { generateId } from '@/utils';

export const useEmailList = (initialContacts: EmailContact[] = []) => {
  const [contacts, setContacts] = useState<EmailContact[]>(initialContacts);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const addContact = useCallback((email: string, nickname?: string) => {
    const newContact: EmailContact = {
      id: generateId('contact'),
      email: email.toLowerCase(),
      nickname,
      tags: ['manual'],
      status: 'active',
      addedAt: new Date(),
    };

    setContacts(prev => {
      // Check for duplicate email
      const exists = prev.some(contact => contact.email === newContact.email);
      if (exists) return prev;
      return [...prev, newContact];
    });
  }, []);

  const addMultipleContacts = useCallback((emails: string[]) => {
    const newContacts = EmailParser.createContactsFromEmails(emails);
    
    setContacts(prev => {
      const existingEmails = new Set(prev.map(contact => contact.email));
      const uniqueNewContacts = newContacts.filter(contact => !existingEmails.has(contact.email));
      return [...prev, ...uniqueNewContacts];
    });
  }, []);

  const removeContact = useCallback((id: string) => {
    setContacts(prev => prev.filter(contact => contact.id !== id));
    setSelectedContacts(prev => {
      const newSelected = new Set(prev);
      newSelected.delete(id);
      return newSelected;
    });
  }, []);

  const removeMultipleContacts = useCallback((ids: string[]) => {
    setContacts(prev => prev.filter(contact => !ids.includes(contact.id)));
    setSelectedContacts(prev => {
      const newSelected = new Set(prev);
      ids.forEach(id => newSelected.delete(id));
      return newSelected;
    });
  }, []);

  const updateContact = useCallback((id: string, updates: Partial<EmailContact>) => {
    setContacts(prev =>
      prev.map(contact =>
        contact.id === id ? { ...contact, ...updates } : contact
      )
    );
  }, []);

  const toggleContactSelection = useCallback((id: string) => {
    setSelectedContacts(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return newSelected;
    });
  }, []);

  const selectAllContacts = useCallback(() => {
    setSelectedContacts(new Set(contacts.map(contact => contact.id)));
  }, [contacts]);

  const clearSelection = useCallback(() => {
    setSelectedContacts(new Set());
  }, []);

  const importFromFiles = useCallback(async (files: File[]) => {
    setIsLoading(true);
    try {
      const { emails } = await EmailParser.parseMultipleFiles(files);
      addMultipleContacts(emails);
      return emails.length;
    } catch (error) {
      console.error('Error importing files:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [addMultipleContacts]);

  const exportContacts = useCallback(() => {
    const csvContent = [
      'Email,Nickname,Status,Added At',
      ...contacts.map(contact => 
        `"${contact.email}","${contact.nickname || ''}","${contact.status}","${contact.addedAt.toISOString()}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `contacts-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [contacts]);

  const getContactsByStatus = useCallback((status: EmailContact['status']) => {
    return contacts.filter(contact => contact.status === status);
  }, [contacts]);

  const getContactsByTag = useCallback((tag: string) => {
    return contacts.filter(contact => contact.tags.includes(tag));
  }, [contacts]);

  return {
    contacts,
    selectedContacts,
    isLoading,
    addContact,
    addMultipleContacts,
    removeContact,
    removeMultipleContacts,
    updateContact,
    toggleContactSelection,
    selectAllContacts,
    clearSelection,
    importFromFiles,
    exportContacts,
    getContactsByStatus,
    getContactsByTag,
  };
};