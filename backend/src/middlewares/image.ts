// src/controllers/image.ts
import sharp from 'sharp';
import fs from 'fs/promises';

export async function processProfileImage(tmpPath: string, finalPath: string) {
  const meta = await sharp(tmpPath).metadata();

  if (!meta.width || !meta.height) {
    await fs.unlink(tmpPath);
    throw new Error('Neuspešno čitanje slike');
  }
  if (meta.width < 100 || meta.height < 100) {
    await fs.unlink(tmpPath);
    throw new Error('Slika mora biti najmanje 100x100px');
  }

  await sharp(tmpPath)
    .rotate() // poštuj EXIF orijentaciju
    .resize({ width: 300, height: 300, fit: 'inside', withoutEnlargement: true })
    .png()
    .toFile(finalPath);

  await fs.unlink(tmpPath); // obavezno obriši privremeni fajl
}
