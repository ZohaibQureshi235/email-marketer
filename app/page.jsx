'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useEmails } from './hooks/useEmails'
import { useRateLimit } from './hooks/useRateLimit'
import { ConfirmDialog } from './components/ConfirmDialog'
import { LoadingSpinner } from './components/LoadingSpinner'
import { validateEmailTemplate } from './utils/emailValidation'
import toast from 'react-hot-toast'
import './page.css'

export default function Dashboard() {
	const { emails, deleteEmail, updateEmailTemplate, getEmailTemplate, clearAllEmails, updateEmail, selectedEmails, toggleEmailSelection, selectAllEmails, deselectAllEmails, isEmailSelected, getSelectedCount } = useEmails()

	const { sentCount, canSend, incrementSent, getTimeUntilReset } = useRateLimit()

	const [deleteConfirm, setDeleteConfirm] = useState(null)
	const [clearAllConfirm, setClearAllConfirm] = useState(false)
	const [isSending, setIsSending] = useState(false)
	const [emailTemplate, setEmailTemplate] = useState({ subject: '', message: '' })
	const [editingEmail, setEditingEmail] = useState(null)
	const [editValue, setEditValue] = useState('')
	const [editNickname, setEditNickname] = useState('')

	useEffect(() => {
		const savedTemplate = getEmailTemplate()
		setEmailTemplate(savedTemplate)
	}, [getEmailTemplate])

	const handleTemplateChange = (field, value) => {
		const updatedTemplate = { ...emailTemplate, [field]: value }
		setEmailTemplate(updatedTemplate)
		updateEmailTemplate(updatedTemplate)
	}

	const handleSendToSelected = async () => {
		// Check if any emails are selected
		if (getSelectedCount() === 0) {
			toast.error('Please select at least one email to send to')
			return
		}

		const errors = validateEmailTemplate(emailTemplate)
		if (errors.length > 0) {
			errors.forEach((error) => toast.error(error))
			return
		}

		// Check rate limit for selected emails
		if (!canSend(getSelectedCount())) {
			toast.error(`Cannot send ${getSelectedCount()} emails. You can only send ${500 - sentCount} more emails this hour.`)
			return
		}

		setIsSending(true)

		try {
			toast.loading(`Sending to ${getSelectedCount()} selected contacts...`, {
				id: 'sending-progress'
			})

			// Simulate sending to selected emails
			for (let i = 0; i < selectedEmails.length; i++) {
				await new Promise((resolve) => setTimeout(resolve, 50))
			}

			incrementSent(getSelectedCount())
			toast.success(`✅ Sent to ${getSelectedCount()} selected contacts!`, {
				id: 'sending-progress',
				duration: 5000
			})

			// Deselect all after sending
			deselectAllEmails()
		} catch (error) {
			toast.error('Failed to send emails', {
				id: 'sending-progress'
			})
		} finally {
			setIsSending(false)
		}
	}

	const handleSendToAll = async () => {
		const errors = validateEmailTemplate(emailTemplate)
		if (errors.length > 0) {
			errors.forEach((error) => toast.error(error))
			return
		}

		if (emails.length === 0) {
			toast.error('No email addresses to send to')
			return
		}

		if (!canSend(emails.length)) {
			toast.error(`Cannot send ${emails.length} emails. You can only send ${500 - sentCount} more emails this hour.`)
			return
		}

		setIsSending(true)

		try {
			toast.loading(`Sending to all ${emails.length} contacts...`, {
				id: 'sending-progress'
			})

			// Simulate sending to all emails
			for (let i = 0; i < emails.length; i++) {
				await new Promise((resolve) => setTimeout(resolve, 50))
			}

			incrementSent(emails.length)
			toast.success(`✅ Sent to all ${emails.length} contacts!`, {
				id: 'sending-progress',
				duration: 5000
			})
		} catch (error) {
			toast.error('Failed to send emails', {
				id: 'sending-progress'
			})
		} finally {
			setIsSending(false)
		}
	}

	const handleDeleteClick = (email) => {
		setDeleteConfirm(email)
	}

	const confirmDelete = () => {
		if (deleteConfirm) {
			deleteEmail(deleteConfirm)
			toast.success('Contact deleted')
			setDeleteConfirm(null)
		}
	}

	const cancelDelete = () => {
		setDeleteConfirm(null)
	}

	const handleClearAll = () => {
		setClearAllConfirm(true)
	}

	const confirmClearAll = () => {
		clearAllEmails()
		toast.success('All contacts cleared')
		setClearAllConfirm(false)
	}

	const cancelClearAll = () => {
		setClearAllConfirm(false)
	}

	const handleEditClick = (contact) => {
		setEditingEmail(contact.email)
		setEditValue(contact.email)
		setEditNickname(contact.nickname || '')
	}

	const handleEditSave = () => {
		if (!editValue.trim()) {
			toast.error('Email cannot be empty')
			return
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (!emailRegex.test(editValue)) {
			toast.error('Please enter a valid email address')
			return
		}

		// Check for duplicates (excluding the current email being edited)
		if (emails.some((contact) => contact.email !== editingEmail && contact.email === editValue)) {
			toast.error('This email already exists in your contacts')
			return
		}

		updateEmail(editingEmail, {
			email: editValue,
			nickname: editNickname
		})
		toast.success('Contact updated successfully')
		setEditingEmail(null)
		setEditValue('')
		setEditNickname('')
	}

	const handleEditCancel = () => {
		setEditingEmail(null)
		setEditValue('')
		setEditNickname('')
	}

	const handleKeyPress = (e) => {
		if (e.key === 'Enter') {
			handleEditSave()
		} else if (e.key === 'Escape') {
			handleEditCancel()
		}
	}

	const getRemainingEmails = () => 500 - sentCount

	const canSelectMore = () => {
		return getSelectedCount() < 500
	}

	return (
		<div className='dashboard-simple'>
			{/* Header */}
			<header className='simple-header'>
				<div className='header-content'>
					<h1 className='app-title'>Email Campaign</h1>
					<p className='app-subtitle'>Send beautiful emails to your contacts</p>
				</div>
				<Link href='/add-email' className='add-contact-btn'>
					+ Add Contacts
				</Link>
			</header>

			<div className='dashboard-content'>
				{/* Left Side - Compose Email */}
				<div className='compose-section'>
					<div className='compose-card'>
						<h2 className='section-title'>Compose Email</h2>

						<div className='form-group'>
							<label className='form-label'>Subject</label>
							<input type='text' value={emailTemplate.subject} onChange={(e) => handleTemplateChange('subject', e.target.value)} className='form-input' placeholder='Enter your subject line...' />
						</div>

						<div className='form-group'>
							<label className='form-label'>Message</label>
							<textarea value={emailTemplate.message} onChange={(e) => handleTemplateChange('message', e.target.value)} className='form-textarea' placeholder='Write your email message here...' rows='8' />
						</div>

						<div className='send-options'>
							<button onClick={handleSendToSelected} disabled={isSending || getSelectedCount() === 0 || !emailTemplate.subject || !emailTemplate.message} className='send-button primary'>
								{isSending ? (
									<>
										<LoadingSpinner size='small' />
										Sending to {getSelectedCount()}...
									</>
								) : (
									`Send to Selected (${getSelectedCount()})`
								)}
							</button>

							<button onClick={handleSendToAll} disabled={isSending || emails.length === 0 || !emailTemplate.subject || !emailTemplate.message} className='send-button secondary'>
								Send to All ({emails.length})
							</button>
						</div>
					</div>

					{/* Rate Limit Info */}
					<div className='rate-limit-card'>
						<h3 className='card-title'>Sending Limit</h3>
						<div className='limit-info'>
							<div className='limit-text'>
								<span className='sent-count'>{sentCount}</span>
								<span className='limit-total'>/ 500 emails this hour</span>
							</div>
							<div className='progress-bar'>
								<div className='progress-fill' style={{ width: `${(sentCount / 500) * 100}%` }}></div>
							</div>
							<div className='remaining-text'>{getRemainingEmails()} emails remaining</div>
							{getSelectedCount() > 0 && <div className='selected-info'>{getSelectedCount()} selected • Max 500 per send</div>}
						</div>
					</div>
				</div>

				{/* Right Side - Contact List */}
				<div className='contacts-section'>
					<div className='contacts-header'>
						<div className='contacts-title'>
							<h2 className='section-title'>Contacts ({emails.length})</h2>
							{getSelectedCount() > 0 && <span className='selected-count'>{getSelectedCount()} selected</span>}
						</div>
						<div className='contacts-actions'>
							{emails.length > 0 && (
								<>
									{getSelectedCount() > 0 ? (
										<button onClick={deselectAllEmails} className='deselect-all-btn'>
											Deselect All
										</button>
									) : (
										<button onClick={selectAllEmails} className='select-all-btn'>
											Select All
										</button>
									)}
									<button onClick={handleClearAll} className='clear-all-btn'>
										Clear All
									</button>
								</>
							)}
						</div>
					</div>

					{emails.length === 0 ? (
						<div className='empty-state'>
							<div className='empty-icon'>📧</div>
							<h3 className='empty-title'>No contacts yet</h3>
							<p className='empty-description'>Add email addresses to start sending campaigns</p>
							<Link href='/add-email' className='empty-action-btn'>
								Add Contacts
							</Link>
						</div>
					) : (
						<div className='contacts-list premium-contacts'>
							{emails.map((contact, index) => (
								<div
									key={contact.id}
									className={`contact-item premium-contact ${isEmailSelected(contact.email) ? 'selected' : ''}`}
									onClick={(e) => {
										// Only toggle selection if not clicking on action buttons
										if (!e.target.closest('.contact-actions') && !e.target.closest('.edit-mode')) {
											toggleEmailSelection(contact.email)
										}
									}}
								>
									{editingEmail === contact.email ? (
										<div className='edit-mode premium-edit'>
											<div className='edit-header'>
												<span className='edit-label'>Editing Contact</span>
												<div className='edit-actions'>
													<button onClick={handleEditSave} className='save-btn premium-save' title='Save changes'>
														<span className='btn-icon'>✓</span>
														Save
													</button>
													<button onClick={handleEditCancel} className='cancel-btn premium-cancel' title='Cancel editing'>
														<span className='btn-icon'>✕</span>
														Cancel
													</button>
												</div>
											</div>
											<div className='edit-form'>
												<div className='form-group'>
													<label className='form-label'>Email Address *</label>
													<input type='email' value={editValue} onChange={(e) => setEditValue(e.target.value)} onKeyDown={handleKeyPress} className='edit-input premium-input' placeholder='Enter valid email address...' autoFocus />
												</div>
												<div className='form-group'>
													<label className='form-label'>
														Nickname <span className='optional'>(Optional)</span>
													</label>
													<input type='text' value={editNickname} onChange={(e) => setEditNickname(e.target.value)} className='edit-input premium-input' placeholder='Enter a friendly name...' maxLength='50' />
													<div className='input-helper'>{editNickname.length}/50 characters</div>
												</div>
											</div>
											<div className='edit-help'>Press Enter to save • Escape to cancel</div>
										</div>
									) : (
										<>
											<div className='contact-main'>
												<div className='contact-selector'>
													<input type='checkbox' checked={isEmailSelected(contact.email)} onChange={() => toggleEmailSelection(contact.email)} className='email-checkbox' onClick={(e) => e.stopPropagation()} />
												</div>
												<div className={`contact-avatar ${contact.nickname ? 'has-nickname' : 'no-nickname'}`}>{contact.nickname ? contact.nickname.charAt(0).toUpperCase() : contact.email.charAt(0).toUpperCase()}</div>
												<div className='contact-info'>
													{contact.nickname && <span className='contact-nickname'>{contact.nickname}</span>}
													<span className='contact-email premium-email'>{contact.email}</span>
													<span className='contact-status'>{contact.nickname ? 'Named Contact' : 'Active Subscriber'}</span>
												</div>
											</div>
											<div className='contact-actions premium-actions'>
												<button onClick={() => handleEditClick(contact)} className='edit-btn premium-edit-btn' title='Edit contact'>
													<span className='action-icon'>✏️</span>
													<span className='action-text'>Edit</span>
												</button>
												<button onClick={() => handleDeleteClick(contact.email)} className='delete-btn premium-delete-btn' title='Delete contact'>
													<span className='action-icon'>🗑️</span>
													<span className='action-text'>Delete</span>
												</button>
											</div>
										</>
									)}
								</div>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Delete Single Email Confirmation */}
			<ConfirmDialog isOpen={!!deleteConfirm} onConfirm={confirmDelete} onCancel={cancelDelete} title='Delete Contact' message={`Are you sure you want to delete ${deleteConfirm}?`} confirmText='Delete' cancelText='Cancel' />

			{/* Clear All Confirmation */}
			<ConfirmDialog isOpen={clearAllConfirm} onConfirm={confirmClearAll} onCancel={cancelClearAll} title='Clear All Contacts' message={`Are you sure you want to delete all ${emails.length} contacts? This action cannot be undone.`} confirmText='Clear All' cancelText='Cancel' />
		</div>
	)
}
