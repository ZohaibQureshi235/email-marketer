'use client'

import { useState, useRef } from 'react'
import './FileUpload.css'

export function FileUpload({ onFilesSelect, acceptedFileTypes = '.csv,.txt,.docx,.doc,.xlsx,.xls' }) {
	const [isDragging, setIsDragging] = useState(false)
	const [selectedFiles, setSelectedFiles] = useState([])
	const fileInputRef = useRef()

	const handleDragOver = (e) => {
		e.preventDefault()
		setIsDragging(true)
	}

	const handleDragLeave = (e) => {
		e.preventDefault()
		setIsDragging(false)
	}

	const handleDrop = (e) => {
		e.preventDefault()
		setIsDragging(false)
		const files = Array.from(e.dataTransfer.files)
		handleFiles(files)
	}

	const handleFileInput = (e) => {
		const files = Array.from(e.target.files)
		handleFiles(files)
	}

	const handleFiles = (files) => {
		const validFiles = files.filter((file) => {
			const extension = file.name.split('.').pop().toLowerCase()
			const isValid = ['csv', 'txt', 'docx', 'doc', 'xlsx', 'xls'].includes(extension)
			return isValid
		})

		setSelectedFiles(validFiles)
		onFilesSelect(validFiles)
	}

	const removeFile = (index) => {
		const newFiles = selectedFiles.filter((_, i) => i !== index)
		setSelectedFiles(newFiles)
		onFilesSelect(newFiles)
	}

	const triggerFileInput = () => {
		fileInputRef.current?.click()
	}

	return (
		<div className='file-upload-container'>
			<div className={`file-upload-area ${isDragging ? 'dragging' : ''}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={triggerFileInput}>
				<div className='file-upload-content'>
					<div className='upload-icon'>📁</div>
					<h3 className='upload-title'>Drop files here or click to upload</h3>
					<p className='upload-subtitle'>Supports CSV, TXT, DOCX, DOC, XLSX files</p>
				</div>
				<input ref={fileInputRef} type='file' multiple accept={acceptedFileTypes} onChange={handleFileInput} className='file-input' />
			</div>

			{selectedFiles.length > 0 && (
				<div className='selected-files'>
					<h4 className='selected-files-title'>Selected Files:</h4>
					<div className='files-list'>
						{selectedFiles.map((file, index) => (
							<div key={index} className='file-item'>
								<span className='file-name'>{file.name}</span>
								<span className='file-size'>({(file.size / 1024).toFixed(1)} KB)</span>
								<button
									onClick={(e) => {
										e.stopPropagation()
										removeFile(index)
									}}
									className='remove-file-button'
								>
									×
								</button>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	)
}
