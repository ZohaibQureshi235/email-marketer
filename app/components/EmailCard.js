'use client'

import { useState, useRef, useEffect } from 'react'
import gsap from 'gsap'
import './EmailCard.css'

export function EmailCard({ email, onEdit, onDelete, onSend, isSending = false }) {
	const [isEditing, setIsEditing] = useState(false)
	const [editedData, setEditedData] = useState(email)
	const cardRef = useRef()

	// Fix GSAP usage
	useEffect(() => {
		if (cardRef.current) {
			gsap.fromTo(cardRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' })
		}
	}, [email.id])

	const handleSave = () => {
		onEdit(editedData)
		setIsEditing(false)
	}

	const handleCancel = () => {
		setEditedData(email)
		setIsEditing(false)
	}

	const messagePreview = email.message.length > 100 ? email.message.substring(0, 100) + '...' : email.message

	return (
		<div ref={cardRef} className='email-card'>
			<div className='email-card-header'>
				{isEditing ? <input type='email' value={editedData.recipient} onChange={(e) => setEditedData((prev) => ({ ...prev, recipient: e.target.value }))} className='email-input' placeholder='Recipient email' /> : <h3 className='email-recipient'>{email.recipient}</h3>}
				<div className='email-actions'>
					{isEditing ? (
						<>
							<button onClick={handleSave} className='action-button save'>
								Save
							</button>
							<button onClick={handleCancel} className='action-button cancel'>
								Cancel
							</button>
						</>
					) : (
						<>
							<button onClick={() => setIsEditing(true)} className='action-button edit' disabled={isSending}>
								Edit
							</button>
							<button onClick={() => onSend(email)} className='action-button send' disabled={isSending}>
								{isSending ? 'Sending...' : 'Send'}
							</button>
							<button onClick={() => onDelete(email.id)} className='action-button delete' disabled={isSending}>
								Delete
							</button>
						</>
					)}
				</div>
			</div>

			<div className='email-card-content'>
				{isEditing ? <input value={editedData.subject} onChange={(e) => setEditedData((prev) => ({ ...prev, subject: e.target.value }))} className='email-input subject' placeholder='Email subject' /> : <h4 className='email-subject'>{email.subject}</h4>}

				{isEditing ? <textarea value={editedData.message} onChange={(e) => setEditedData((prev) => ({ ...prev, message: e.target.value }))} className='email-textarea' placeholder='Email message' rows='4' /> : <p className='email-preview'>{messagePreview}</p>}
			</div>

			<div className='email-card-footer'>
				<span className='email-date'>Created: {new Date(email.createdAt).toLocaleDateString()}</span>
				<span className={`email-status ${email.status}`}>{email.status}</span>
			</div>
		</div>
	)
}
