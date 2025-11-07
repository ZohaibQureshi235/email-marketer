export function validateEmail(email) {
	if (!email || typeof email !== 'string') return false

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	return emailRegex.test(email.trim())
}

export function validateEmailTemplate(template) {
	const errors = []

	if (!template.subject || !template.subject.trim()) {
		errors.push('Subject is required')
	}

	if (!template.message || !template.message.trim()) {
		errors.push('Message is required')
	}

	return errors
}
