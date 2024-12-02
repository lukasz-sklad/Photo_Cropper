import React from 'react';
import ImageUploader from './components/ImageUploader';
import './App.css'; // Upewnij się, że masz ten plik w projekcie

function App() {
  return (
    <div className="App">
      <div className="container">
        <h1>📸 Photo Cropper 🖼️</h1>
        <p>Przytnij i zoptymalizuj swoje zdjęcia w mgnieniu oka! ✨</p>
        <ImageUploader />
      </div>
    </div>
  )
}

export default App;
