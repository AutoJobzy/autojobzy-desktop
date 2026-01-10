/**
 * ======================== AWS S3 SERVICE ========================
 * Handles file uploads to AWS S3 bucket
 * Used for storing user resumes
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'autojobzy-resumes';

/**
 * Upload a file to S3
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - Original file name
 * @param {string} userId - User ID for folder organization
 * @param {string} mimeType - File MIME type
 * @returns {Promise<string>} S3 file URL
 */
export async function uploadResumeToS3(fileBuffer, fileName, userId, mimeType) {
  try {
    // Generate unique file name: resumes/{userId}/{timestamp}_{originalName}
    const timestamp = Date.now();
    const fileExtension = path.extname(fileName);
    const cleanFileName = path.basename(fileName, fileExtension).replace(/[^a-zA-Z0-9]/g, '_');
    const s3Key = `resumes/${userId}/${timestamp}_${cleanFileName}${fileExtension}`;

    // Upload to S3
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: fileBuffer,
        ContentType: mimeType,
        // Make file publicly readable (optional - can use presigned URLs instead)
        // ACL: 'public-read',
      },
    });

    await upload.done();

    // Return S3 URL
    const s3Url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    console.log(`✅ Resume uploaded to S3: ${s3Url}`);

    return {
      url: s3Url,
      key: s3Key,
      bucket: BUCKET_NAME,
    };
  } catch (error) {
    console.error('❌ S3 upload failed:', error);
    throw new Error(`Failed to upload resume to S3: ${error.message}`);
  }
}

/**
 * Delete a file from S3
 * @param {string} s3Key - S3 object key
 * @returns {Promise<void>}
 */
export async function deleteResumeFromS3(s3Key) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
    });

    await s3Client.send(command);
    console.log(`✅ Resume deleted from S3: ${s3Key}`);
  } catch (error) {
    console.error('❌ S3 delete failed:', error);
    throw new Error(`Failed to delete resume from S3: ${error.message}`);
  }
}

/**
 * Generate a presigned URL for secure file access
 * @param {string} s3Key - S3 object key
 * @param {number} expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns {Promise<string>} Presigned URL
 */
export async function getPresignedUrl(s3Key, expiresIn = 3600) {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error('❌ Presigned URL generation failed:', error);
    throw new Error(`Failed to generate presigned URL: ${error.message}`);
  }
}

/**
 * Check if S3 is configured
 * @returns {boolean}
 */
export function isS3Configured() {
  return !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.S3_BUCKET_NAME &&
    process.env.AWS_REGION &&
    process.env.AWS_ACCESS_KEY_ID !== 'your_access_key_here'
  );
}

export default {
  uploadResumeToS3,
  deleteResumeFromS3,
  getPresignedUrl,
  isS3Configured,
};
