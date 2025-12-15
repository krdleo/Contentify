import fs from 'fs/promises';
import multer from 'multer';
import os from 'os';
import path from 'path';
import { Request, Response } from 'express';
import { failure, success } from '../../utils/response';
import { uploadToCloudinary } from '../../utils/cloudinary';

const upload = multer({ dest: path.join(os.tmpdir()) });

export const uploadMiddleware = upload.single('file');

export const uploadFile = async (req: Request, res: Response) => {
  if (!req.file) {
    return failure(res, 'VALIDATION_ERROR', 'No file provided', undefined, 400);
  }

  try {
    const result = await uploadToCloudinary(req.file.path);
    await fs.unlink(req.file.path).catch(() => {});
    return success(res, { url: result.secure_url }, 201);
  } catch (error) {
    await fs.unlink(req.file.path).catch(() => {});
    return failure(res, 'UPLOAD_FAILED', 'Unable to upload file', undefined, 500);
  }
};
