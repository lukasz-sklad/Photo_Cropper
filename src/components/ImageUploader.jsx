import React, { useState } from 'react'

const ImageUploader = () => {
	const [downloadLink, setDownloadLink] = useState(null)

	const handleSubmit = async event => {
		event.preventDefault()
		const fileInput = event.target.elements['file-input']
		if (!fileInput.files.length) {
			alert('Proszę wybrać zdjęcia!')
			return
		}

		const formData = new FormData()
		Array.from(fileInput.files).forEach(file => formData.append('images', file))

		try {
			const response = await fetch('http://localhost:3000/upload', {
				method: 'POST',
				body: formData,
			})

			if (response.ok) {
				const blob = await response.blob()
				const url = URL.createObjectURL(blob)
				setDownloadLink({
					url,
					filename: 'cropped_images.zip',
				})
			} else {
				alert('Wystąpił błąd podczas przetwarzania zdjęć.')
			}
		} catch (error) {
			console.error('Błąd:', error)
			alert('Nie udało się połączyć z serwerem.')
		}
	}

	return (
		<div>
			<form id='upload-form' onSubmit={handleSubmit}>
				<input type='file' id='file-input' multiple />
				<button type='submit'>Wyślij zdjęcia</button>
			</form>
			{downloadLink && (
				<a
					href={downloadLink.url}
					download={downloadLink.filename}
					style={{ display: 'inline-block', marginTop: '10px' }}>
					Pobierz spakowane zdjęcia
				</a>
			)}
		</div>
	)
}

export default ImageUploader
