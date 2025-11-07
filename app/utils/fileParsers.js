import Papa from 'papaparse'
import mammoth from 'mammoth'
import * as XLSX from 'xlsx'
import { validateEmail } from './emailValidation'

export async function parseCSV(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()

		reader.onload = (e) => {
			try {
				const content = e.target.result
				Papa.parse(content, {
					complete: (results) => {
						if (results.errors.length > 0) {
							reject(new Error('CSV parsing error: ' + results.errors[0].message))
							return
						}

						const emails = results.data
							.filter((row) => row && row.length >= 1 && row[0] && validateEmail(row[0]))
							.map((row, index) => ({
								recipient: row[0]?.toString().trim() || '',
								subject: row[1]?.toString().trim() || 'Imported Email',
								message: row[2]?.toString().trim() || 'This email was imported from a CSV file.'
							}))
							.filter((email) => email.recipient && validateEmail(email.recipient))

						resolve(emails)
					},
					error: (error) => {
						reject(error)
					}
				})
			} catch (error) {
				reject(new Error('Failed to read CSV file: ' + error.message))
			}
		}

		reader.onerror = () => reject(new Error('Failed to read CSV file'))
		reader.readAsText(file)
	})
}

export async function parseTXT(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()

		reader.onload = (e) => {
			try {
				const content = e.target.result
				const lines = content.split('\n')

				const emails = lines
					.map((line) => line.trim())
					.filter((line) => line && validateEmail(line))
					.map((email) => ({
						recipient: email,
						subject: 'Imported Email',
						message: 'This email was imported from a text file.'
					}))

				resolve(emails)
			} catch (error) {
				reject(new Error('Failed to parse text file: ' + error.message))
			}
		}

		reader.onerror = () => reject(new Error('Failed to read text file'))
		reader.readAsText(file)
	})
}

export async function parseDOCX(file) {
	try {
		const arrayBuffer = await file.arrayBuffer()
		const result = await mammoth.extractRawText({ arrayBuffer })
		const content = result.value

		if (!content) {
			throw new Error('No text content found in document')
		}

		// Extract emails using regex
		const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+/g
		const emails = content.match(emailRegex) || []

		const validEmails = emails
			.filter((email) => validateEmail(email))
			.map((email) => ({
				recipient: email,
				subject: 'Imported from DOCX',
				message: 'This email was imported from a Word document.'
			}))

		return validEmails
	} catch (error) {
		throw new Error('Failed to parse DOCX file: ' + error.message)
	}
}

export async function parseXLSX(file) {
	try {
		const arrayBuffer = await file.arrayBuffer()
		const workbook = XLSX.read(arrayBuffer, { type: 'array' })

		if (!workbook.SheetNames.length) {
			throw new Error('No sheets found in Excel file')
		}

		const firstSheetName = workbook.SheetNames[0]
		const worksheet = workbook.Sheets[firstSheetName]
		const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

		const emails = data
			.filter((row) => row && row.length >= 1 && row[0] && validateEmail(row[0].toString()))
			.map((row, index) => ({
				recipient: row[0]?.toString().trim() || '',
				subject: row[1]?.toString().trim() || 'Imported from Excel',
				message: row[2]?.toString().trim() || 'This email was imported from an Excel file.'
			}))
			.filter((email) => email.recipient && validateEmail(email.recipient))

		return emails
	} catch (error) {
		throw new Error('Failed to parse Excel file: ' + error.message)
	}
}

export function getFileExtension(filename) {
	return filename.split('.').pop().toLowerCase()
}

export function isSupportedFileType(filename) {
	const extension = getFileExtension(filename)
	const supportedTypes = ['csv', 'txt', 'docx', 'doc', 'xlsx', 'xls']
	return supportedTypes.includes(extension)
}

export async function parseFile(file) {
	if (!isSupportedFileType(file.name)) {
		throw new Error(`Unsupported file type: ${file.name.split('.').pop()}`)
	}

	const extension = getFileExtension(file.name)

	switch (extension) {
		case 'csv':
			return await parseCSV(file)
		case 'txt':
			return await parseTXT(file)
		case 'docx':
		case 'doc':
			return await parseDOCX(file)
		case 'xlsx':
		case 'xls':
			return await parseXLSX(file)
		default:
			throw new Error(`Unsupported file type: ${extension}`)
	}
}
