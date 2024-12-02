import React, { useState, useRef } from 'react'

const ImageUploader = () => {
    const [downloadLink, setDownloadLink] = useState(null)
    const [baseFileName, setBaseFileName] = useState('')
    const fileInputRef = useRef(null)

    const handleClipboardPaste = async () => {
        try {
            const text = await navigator.clipboard.readText()
            setBaseFileName(normalizeFileName(text))
        } catch (err) {
            console.error('Failed to read clipboard contents: ', err)
        }
    }

    const normalizeFileName = (name) => {
        return name
					.replace(/\s+/g, '-')
					.replace(/ą/g, 'a')
					.replace(/ć/g, 'c')
					.replace(/ę/g, 'e')
					.replace(/ł/g, 'l')
					.replace(/ń/g, 'n')
					.replace(/ó/g, 'o')
					.replace(/ś/g, 's')
					.replace(/ź/g, 'z')
					.replace(/ż/g, 'z')
					.replace(/Ą/g, 'A')
					.replace(/Ć/g, 'C')
					.replace(/Ę/g, 'E')
					.replace(/Ł/g, 'L')
					.replace(/Ń/g, 'N')
					.replace(/Ó/g, 'O')
					.replace(/Ś/g, 'S')
					.replace(/Ź/g, 'Z')
					.replace(/Ż/g, 'Z')
					.replace(/\(/g, '')
					.replace(/\)/g, '')
					.replace(/,/g, '')
    }

    const handleSubmit = async event => {
        event.preventDefault()
        const fileInput = fileInputRef.current
        if (!fileInput.files.length) {
            alert('Proszę wybrać zdjęcia!')
            return
        }

        const formData = new FormData()
        Array.from(fileInput.files).forEach((file, index) => {
            const newFileName = baseFileName 
                ? `${baseFileName}-${index + 1}.jpg` 
                : `${normalizeFileName(file.name.split('.')[0])}-${index + 1}.jpg`
            formData.append('images', file, newFileName)
        })

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
                    filename: 'processed_images.zip',
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
					<input
						type='text'
						value={baseFileName}
						onChange={e => setBaseFileName(normalizeFileName(e.target.value))}
						onMouseEnter={handleClipboardPaste}
						placeholder='Skopiuj z Pimu => najedź, aby wkleić nazwę bazową'
					/>
					<input type='file' ref={fileInputRef} multiple />
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
