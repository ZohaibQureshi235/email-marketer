'use client'

import { Toaster } from 'react-hot-toast'

export function ToastProvider({ children }) {
	return (
		<>
			{children}
			<Toaster
				position='top-right'
				toastOptions={{
					duration: 4000,
					style: {
						background: '#ffffff',
						color: '#1e293b',
						border: '1px solid #e2e8f0',
						borderRadius: '12px',
						boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
						padding: '16px',
						fontSize: '14px',
						fontWeight: '500'
					},
					success: {
						iconTheme: {
							primary: '#10b981',
							secondary: '#ffffff'
						},
						style: {
							borderLeft: '4px solid #10b981'
						}
					},
					error: {
						iconTheme: {
							primary: '#ef4444',
							secondary: '#ffffff'
						},
						style: {
							borderLeft: '4px solid #ef4444'
						}
					},
					loading: {
						iconTheme: {
							primary: '#3b82f6',
							secondary: '#ffffff'
						},
						style: {
							borderLeft: '4px solid #3b82f6'
						}
					}
				}}
			/>
		</>
	)
}
