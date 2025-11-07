'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useEmails } from '../hooks/useEmails'
import { FileUpload } from '../components/FileUpload'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { parseCSV, parseTXT, parseDOCX, parseXLSX, isSupportedFileType } from '../utils/fileParsers'
import toast from 'react-hot-toast'
import './AddEmail.css'

export default function AddEmail() {
	const { addEmail, addBulkEmails } = useEmails()
	const [activeTab, setActiveTab] = useState('manual')
	const [emailInput, setEmailInput] = useState('')
	const [nicknameInput, setNicknameInput] = useState('')
	const [selectedFiles, setSelectedFiles] = useState([])
	const [isImporting, setIsImporting] = useState(false)
	const [importResults, setImportResults] = useState(null)

	const handleManualSubmit = (e) => {
		e.preventDefault()

		if (!emailInput.trim()) {
			toast.error('Please enter an email address')
			return
		}

		try {
			addEmail({
				email: emailInput,
				nickname: nicknameInput
			})
			toast.success('Contact added successfully!')
			setEmailInput('')
			setNicknameInput('')
		} catch (error) {
			toast.error(error.message)
		}
	}

	const handleFilesSelect = (files) => {
		setSelectedFiles(files)
		setImportResults(null)
	}

	const handleBulkImport = async () => {
		if (selectedFiles.length === 0) {
			toast.error('Please select files to import')
			return
		}

		setIsImporting(true)
		const allEmails = []
		const errors = []

		for (const file of selectedFiles) {
			try {
				if (!isSupportedFileType(file.name)) {
					errors.push(`Unsupported file type: ${file.name}`)
					continue
				}

				const extension = file.name.split('.').pop().toLowerCase()
				let parsedEmails = []

				switch (extension) {
					case 'csv':
						parsedEmails = await parseCSV(file)
						break
					case 'txt':
						parsedEmails = await parseTXT(file)
						break
					case 'docx':
					case 'doc':
						parsedEmails = await parseDOCX(file)
						break
					case 'xlsx':
					case 'xls':
						parsedEmails = await parseXLSX(file)
						break
				}

				allEmails.push(...parsedEmails)
			} catch (error) {
				errors.push(`Error processing ${file.name}: ${error.message}`)
			}
		}

		setIsImporting(false)

		if (errors.length > 0) {
			errors.forEach((error) => toast.error(error))
		}

		if (allEmails.length > 0) {
			setImportResults({
				total: allEmails.length,
				valid: allEmails.length
			})
			toast.success(`Found ${allEmails.length} valid emails!`)
		} else {
			toast.error('No valid emails found')
		}
	}

	const handleImportConfirm = () => {
		if (!importResults) return

		const importAll = async () => {
			setIsImporting(true)
			const allEmails = []

			for (const file of selectedFiles) {
				try {
					const extension = file.name.split('.').pop().toLowerCase()
					let parsedEmails = []

					switch (extension) {
						case 'csv':
							parsedEmails = await parseCSV(file)
							break
						case 'txt':
							parsedEmails = await parseTXT(file)
							break
						case 'docx':
						case 'doc':
							parsedEmails = await parseDOCX(file)
							break
						case 'xlsx':
						case 'xls':
							parsedEmails = await parseXLSX(file)
							break
					}

					allEmails.push(...parsedEmails)
				} catch (error) {
					console.error('Error re-parsing file:', error)
				}
			}

			if (allEmails.length > 0) {
				const addedEmails = addBulkEmails(allEmails)
				toast.success(`Imported ${addedEmails.length} contacts!`)
				setSelectedFiles([])
				setImportResults(null)
			}

			setIsImporting(false)
		}

		importAll()
	}

	return (
		<div className='add-email-simple'>
			{/* Header */}
			<header className='simple-header'>
				<div className='header-content'>
					<Link href='/' className='back-link'>
						← Back to Dashboard
					</Link>
					<h1 className='app-title'>Add Contacts</h1>
					<p className='app-subtitle'>Add email addresses with optional nicknames</p>
				</div>
			</header>

			<div className='add-email-content'>
				{/* Tab Selection */}
				<div className='tab-selection'>
					<button className={`tab-btn ${activeTab === 'manual' ? 'active' : ''}`} onClick={() => setActiveTab('manual')}>
						Single Contact
					</button>
					<button className={`tab-btn ${activeTab === 'bulk' ? 'active' : ''}`} onClick={() => setActiveTab('bulk')}>
						Bulk Import
					</button>
				</div>

				{/* Manual Entry */}
				{activeTab === 'manual' && (
					<div className='manual-entry'>
						<div className='input-card'>
							<h3 className='card-title'>Add New Contact</h3>
							<form onSubmit={handleManualSubmit} className='email-form'>
								<div className='form-group'>
									<label className='form-label'>
										Email Address <span className='required'>*</span>
									</label>
									<input type='email' value={emailInput} onChange={(e) => setEmailInput(e.target.value)} className='form-input' placeholder='Enter email address' required />
								</div>

								<div className='form-group'>
									<label className='form-label'>
										Nickname <span className='optional'>(Optional)</span>
									</label>
									<input type='text' value={nicknameInput} onChange={(e) => setNicknameInput(e.target.value)} className='form-input' placeholder='Enter a friendly name' maxLength='50' />
									<div className='input-helper'>{nicknameInput.length}/50 characters</div>
								</div>

								<button type='submit' className='submit-btn'>
									Add Contact
								</button>
							</form>
						</div>

						<div className='form-tips'>
							<h4 className='tips-title'>💡 Tips</h4>
							<ul className='tips-list'>
								<li>Nicknames help you identify contacts easily</li>
								<li>Use full names or descriptive identifiers</li>
								<li>Nicknames are optional but recommended</li>
							</ul>
						</div>
					</div>
				)}

				{/* Bulk Import */}
				{activeTab === 'bulk' && (
					<div className='bulk-import'>
						<div className='import-card'>
							<h3 className='card-title'>Import Multiple Contacts</h3>
							<p className='card-description'>Upload CSV, TXT, Excel, or Word files containing email addresses. Nicknames can be added later by editing contacts.</p>

							<FileUpload onFilesSelect={handleFilesSelect} acceptedFileTypes='.csv,.txt,.docx,.doc,.xlsx,.xls' />

							{selectedFiles.length > 0 && (
								<div className='import-actions'>
									<button onClick={handleBulkImport} disabled={isImporting} className='analyze-btn'>
										{isImporting ? (
											<>
												<LoadingSpinner size='small' />
												Processing Files...
											</>
										) : (
											'Analyze Files'
										)}
									</button>
								</div>
							)}

							{importResults && (
								<div className='import-results'>
									<h4 className='results-title'>Ready to Import</h4>
									<div className='results-info'>
										<div className='result-count'>
											<span className='count-number'>{importResults.valid}</span>
											<span className='count-label'>valid contacts found</span>
										</div>
										<button onClick={handleImportConfirm} disabled={isImporting} className='import-btn'>
											{isImporting ? (
												<>
													<LoadingSpinner size='small' />
													Importing...
												</>
											) : (
												`Import ${importResults.valid} Contacts`
											)}
										</button>
									</div>
								</div>
							)}
						</div>

						<div className='import-guide'>
							<h4 className='guide-title'>📋 Import Guide</h4>
							<div className='guide-steps'>
								<div className='guide-step'>
									<span className='step-number'>1</span>
									<span className='step-text'>Prepare your file with email addresses</span>
								</div>
								<div className='guide-step'>
									<span className='step-number'>2</span>
									<span className='step-text'>Upload using the drag & drop area</span>
								</div>
								<div className='guide-step'>
									<span className='step-number'>3</span>
									<span className='step-text'>Add nicknames later by editing contacts</span>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
