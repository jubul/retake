import sharp from 'sharp';

export type ProcessedVariant = { data: Buffer; width: number; height: number };
export type ProcessedImage = { main: ProcessedVariant; thumb: ProcessedVariant };

async function variant(input: Buffer, size: number, quality: number): Promise<ProcessedVariant> {
  const { data, info } = await sharp(input, { failOn: 'none' })
    .rotate()
    .resize({ width: size, height: size, fit: 'inside', withoutEnlargement: true })
    .webp({ quality })
    .toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

/** Respeta EXIF (rotate); main 1600 máx q82, thumb 480 máx q75, ambos webp, sin agrandar. */
export async function processImage(input: Buffer): Promise<ProcessedImage> {
  const [main, thumb] = await Promise.all([variant(input, 1600, 82), variant(input, 480, 75)]);
  return { main, thumb };
}
