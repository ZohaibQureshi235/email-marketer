'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import './ConfirmDialog.css'

export function ConfirmDialog({ isOpen, onConfirm, onCancel, title = 'Confirm Action', message = 'Are you sure you want to proceed?', confirmText = 'Confirm', cancelText = 'Cancel' }) {
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden'
		} else {
			document.body.style.overflow = 'unset'
		}

		return () => {
			document.body.style.overflow = 'unset'
		}
	}, [isOpen])

	if (!isOpen) return null

	return createPortal(
		<div className='confirm-dialog-overlay'>
			<div className='confirm-dialog'>
				<div className='confirm-dialog-content'>
					<h3 className='confirm-dialog-title'>{title}</h3>
					<p className='confirm-dialog-message'>{message}</p>
					<div className='confirm-dialog-actions'>
						<button onClick={onCancel} className='confirm-dialog-button cancel'>
							{cancelText}
						</button>
						<button onClick={onConfirm} className='confirm-dialog-button confirm'>
							{confirmText}
						</button>
					</div>
				</div>
			</div>
		</div>,
		document.body
	)
}
