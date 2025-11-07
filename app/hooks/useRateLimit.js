'use client'

import { useLocalStorage } from './useLocalStorage'
import { useEffect, useState } from 'react'

export function useRateLimit() {
	const [rateLimit, setRateLimit] = useLocalStorage('email-rate-limit', {
		sentCount: 0,
		resetTime: new Date(Date.now() + 60 * 60 * 1000).toISOString()
	})

	const [timeUntilReset, setTimeUntilReset] = useState(0)

	useEffect(() => {
		const checkReset = () => {
			const now = new Date()
			const resetTime = new Date(rateLimit.resetTime)

			if (now >= resetTime) {
				setRateLimit({
					sentCount: 0,
					resetTime: new Date(now.getTime() + 60 * 60 * 1000).toISOString()
				})
			}

			setTimeUntilReset(Math.max(0, resetTime - now))
		}

		checkReset()
		const interval = setInterval(checkReset, 1000)
		return () => clearInterval(interval)
	}, [rateLimit.resetTime, setRateLimit])

	const canSend = (count = 1) => {
		return rateLimit.sentCount + count <= 500
	}

	const incrementSent = (count = 1) => {
		setRateLimit((prev) => ({
			...prev,
			sentCount: prev.sentCount + count
		}))
	}

	const getTimeUntilReset = () => {
		const now = new Date()
		const reset = new Date(rateLimit.resetTime)
		return Math.max(0, reset - now)
	}

	const getUsagePercentage = () => {
		return (rateLimit.sentCount / 500) * 100
	}

	return {
		sentCount: rateLimit.sentCount,
		resetTime: rateLimit.resetTime,
		timeUntilReset,
		canSend,
		incrementSent,
		getTimeUntilReset,
		getUsagePercentage
	}
}
