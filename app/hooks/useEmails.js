'use client'

import { useLocalStorage } from './useLocalStorage'

export function useEmails() {
	// Store email objects with optional nickname
	const [emails, setEmails] = useLocalStorage('email-marketing-emails', [])

	// Store the email template (subject + message)
	const [emailTemplate, setEmailTemplate] = useLocalStorage('email-template', {
		subject: '',
		message: ''
	})

	// Store selected emails
	const [selectedEmails, setSelectedEmails] = useLocalStorage('selected-emails', [])

	const addEmail = (emailData) => {
		const { email, nickname = '' } = emailData

		if (!email || !validateEmail(email)) {
			throw new Error('Invalid email address')
		}

		const normalizedEmail = email.toLowerCase().trim()
		const normalizedNickname = nickname.trim()

		// Check for duplicates
		if (emails.some((contact) => contact.email === normalizedEmail)) {
			throw new Error('Email already exists')
		}

		const newContact = {
			id: Date.now().toString(),
			email: normalizedEmail,
			nickname: normalizedNickname,
			createdAt: new Date().toISOString()
		}

		setEmails((prev) => [...prev, newContact])
		return newContact
	}

	const addBulkEmails = (emailList) => {
		const validEmails = emailList
			.map((email) => ({
				email: email.toLowerCase().trim(),
				nickname: '',
				id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
				createdAt: new Date().toISOString()
			}))
			.filter((contact) => validateEmail(contact.email))

		// Remove duplicates
		const uniqueEmails = validEmails.filter((contact, index, self) => index === self.findIndex((t) => t.email === contact.email))

		// Filter out existing emails
		const newEmails = uniqueEmails.filter((contact) => !emails.some((existing) => existing.email === contact.email))

		setEmails((prev) => [...prev, ...newEmails])
		return newEmails
	}

	const deleteEmail = (emailToDelete) => {
		setEmails((prev) => prev.filter((contact) => contact.email !== emailToDelete))
		// Also remove from selected emails if it was selected
		setSelectedEmails((prev) => prev.filter((email) => email !== emailToDelete))
	}

	const updateEmail = (oldEmail, updatedData) => {
		const { email: newEmail, nickname = '' } = updatedData

		if (!newEmail || !validateEmail(newEmail)) {
			throw new Error('Invalid email address')
		}

		const normalizedNewEmail = newEmail.toLowerCase().trim()
		const normalizedNickname = nickname.trim()

		// Check for duplicates (excluding the current email being updated)
		if (emails.some((contact) => contact.email !== oldEmail && contact.email === normalizedNewEmail)) {
			throw new Error('Email already exists')
		}

		setEmails((prev) => prev.map((contact) => (contact.email === oldEmail ? { ...contact, email: normalizedNewEmail, nickname: normalizedNickname } : contact)))

		// Update selected emails if the email was changed
		if (oldEmail !== normalizedNewEmail) {
			setSelectedEmails((prev) => prev.map((email) => (email === oldEmail ? normalizedNewEmail : email)))
		}
	}

	const clearAllEmails = () => {
		setEmails([])
		setSelectedEmails([])
	}

	// Selection functions
	const toggleEmailSelection = (email) => {
		setSelectedEmails((prev) => (prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]))
	}

	const selectAllEmails = () => {
		setSelectedEmails(emails.map((contact) => contact.email))
	}

	const deselectAllEmails = () => {
		setSelectedEmails([])
	}

	const isEmailSelected = (email) => {
		return selectedEmails.includes(email)
	}

	const getSelectedCount = () => {
		return selectedEmails.length
	}

	const updateEmailTemplate = (template) => {
		setEmailTemplate(template)
	}

	const getEmailTemplate = () => {
		return emailTemplate
	}

	// Validate email function
	const validateEmail = (email) => {
		if (!email || typeof email !== 'string') return false
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		return emailRegex.test(email)
	}

	return {
		emails,
		emailTemplate,
		selectedEmails,
		addEmail,
		addBulkEmails,
		deleteEmail,
		updateEmail,
		clearAllEmails,
		toggleEmailSelection,
		selectAllEmails,
		deselectAllEmails,
		isEmailSelected,
		getSelectedCount,
		updateEmailTemplate,
		getEmailTemplate
	}
}
