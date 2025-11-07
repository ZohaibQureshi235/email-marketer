'use client'

import { useState, useEffect } from 'react'
import './RateLimitIndicator.css'

export function RateLimitIndicator({ sentCount, getTimeUntilReset }) {
	const [timeLeft, setTimeLeft] = useState(getTimeUntilReset())

	useEffect(() => {
		const interval = setInterval(() => {
			setTimeLeft(getTimeUntilReset())
		}, 1000)

		return () => clearInterval(interval)
	}, [getTimeUntilReset])

	const percentage = (sentCount / 500) * 100
	const minutes = Math.floor(timeLeft / (1000 * 60))
	const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000)

	const getProgressColor = () => {
		if (percentage < 70) return '#10b981'
		if (percentage < 90) return '#f59e0b'
		return '#ef4444'
	}

	return (
		<div className='rate-limit-indicator'>
			<div className='rate-limit-header'>
				<h3 className='rate-limit-title'>Sending Rate Limit</h3>
				<span className='rate-limit-count'>{sentCount} / 500 emails this hour</span>
			</div>

			<div className='progress-bar-container'>
				<div
					className='progress-bar'
					style={{
						width: `${Math.min(percentage, 100)}%`,
						backgroundColor: getProgressColor()
					}}
				/>
			</div>

			<div className='rate-limit-footer'>
				<span className='reset-time'>
					Resets in: {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
				</span>
				{sentCount >= 500 && <span className='limit-reached'>Limit reached</span>}
			</div>
		</div>
	)
}
