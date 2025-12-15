import { v2 as cloudinary } from 'cloudinary';

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  // Cloudinary will throw helpful errors if these are missing at runtime; we surface a clear early error in development.
  console.warn('Cloudinary environment variables are missing. Uploads will fail until they are set.');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadToCloudinary = async (filePath: string) => {
  return cloudinary.uploader.upload(filePath);
};
