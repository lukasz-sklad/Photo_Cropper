import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { exec } from 'child_process';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
const processImage = async (inputPath, outputPath) => {
  let image = sharp(inputPath);
  const metadata = await image.metadata();

  let width = metadata.width;
  let height = metadata.height;

  // Kadrowanie do zawartości dla mniejszych obrazów
  if (width <= 3000 && height <= 3600) {
    image = image.trim();
  } else {
    // Dla większych obrazów, zachowaj logikę skalowania
    if (height > 3600) {
      height = 3600;
      width = Math.round((3600 / metadata.height) * metadata.width);
    }
    if (width > 3000) {
      width = 3000;
      height = Math.round((3000 / metadata.width) * metadata.height);
    }
    image = image.resize(width, height, { fit: 'inside' });
  }

  // Usuwanie warstwy alpha i dodawanie białego tła
  image = image.flatten({ background: { r: 255, g: 255, b: 255 } });

  // Konwersja do formatu JPEG progresywnego
  await image
    .jpeg({
      quality: 98,
      progressive: true,
      optimizeScans: true
    })
    .toFile(outputPath);
};

app.post('/upload', upload.array('images'), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  const uploadDir = path.join(__dirname, 'uploads');
  const outputDir = path.join(__dirname, 'output');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  // Przetwarzanie obrazów
  for (const file of req.files) {
    const oldPath = path.join(uploadDir, file.filename);
    const newPath = path.join(outputDir, `${path.parse(file.originalname).name}.jpg`);
    await processImage(oldPath, newPath);
    fs.unlinkSync(oldPath); // Usunięcie oryginalnego pliku
  }

  // Pakowanie plików do ZIP
  const zipFilePath = path.join(__dirname, 'output.zip');
  exec(`zip -j ${zipFilePath} ${outputDir}/*`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).send('Error creating zip file');
    }

    res.download(zipFilePath, 'processed_images.zip', err => {
      if (err) {
        console.error('Error sending file:', err);
      }

      // Czyszczenie plików po wysłaniu
      fs.unlinkSync(zipFilePath);
      fs.readdirSync(outputDir).forEach(file => {
        fs.unlinkSync(path.join(outputDir, file));
      });
      fs.rmdirSync(outputDir);
    });
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
