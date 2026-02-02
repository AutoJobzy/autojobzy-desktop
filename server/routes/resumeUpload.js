/**
 * ======================== RESUME UPLOAD API ROUTES ========================
 * Handles resume file uploads to AWS S3
 * Stores resume metadata in database
 */

import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth.js';
import { uploadResumeToS3, deleteResumeFromS3, isS3Configured } from '../services/s3Service.js';
import JobSettings from '../models/JobSettings.js';

const router = express.Router();

// Configure multer for memory storage (we'll upload to S3 directly)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only PDF, DOC, DOCX files
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'));
    }
  },
});

/**
 * POST /api/resume/upload
 * Upload resume to S3 and save metadata to database
 * Requires authentication
 */
router.post('/upload', authenticateToken, upload.single('resume'), async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    // Check if S3 is configured
    if (!isS3Configured()) {
      console.warn('⚠️  S3 not configured. Resume upload will save filename only.');

      // Save just the filename to database (fallback mode)
      const jobSettings = await JobSettings.findOne({
        where: { userId: req.userId },
      });

      if (jobSettings) {
        await jobSettings.update({
          resumeFileName: req.file.originalname,
        });
      }

      return res.json({
        success: true,
        message: 'Resume uploaded (S3 not configured - filename saved only)',
        data: {
          fileName: req.file.originalname,
          fileSize: req.file.size,
          s3Url: null,
          s3Key: null,
        },
      });
    }

    // Upload to S3
    const s3Result = await uploadResumeToS3(
      req.file.buffer,
      req.file.originalname,
      req.userId,
      req.file.mimetype
    );

    // Update job settings with S3 URL and filename
    const jobSettings = await JobSettings.findOne({
      where: { userId: req.userId },
    });

    if (jobSettings) {
      // Delete old resume from S3 if exists
      if (jobSettings.resumeS3Key) {
        try {
          await deleteResumeFromS3(jobSettings.resumeS3Key);
        } catch (error) {
          console.warn('⚠️  Failed to delete old resume from S3:', error.message);
        }
      }

      // Update with new resume data
      await jobSettings.update({
        resumeFileName: req.file.originalname,
        resumeS3Url: s3Result.url,
        resumeS3Key: s3Result.key,
      });
    } else {
      // Create new job settings if doesn't exist
      await JobSettings.create({
        userId: req.userId,
        resumeFileName: req.file.originalname,
        resumeS3Url: s3Result.url,
        resumeS3Key: s3Result.key,
      });
    }

    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      data: {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        s3Url: s3Result.url,
        s3Key: s3Result.key,
      },
    });
  } catch (error) {
    console.error('Resume upload error:', error);

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload resume',
    });
  }
});

/**
 * GET /api/resume/view
 * Get resume metadata and presigned URL for viewing
 * Requires authentication
 */
router.get('/view', authenticateToken, async (req, res) => {
  try {
    const jobSettings = await JobSettings.findOne({
      where: { userId: req.userId },
    });

    if (!jobSettings || !jobSettings.resumeS3Key) {
      return res.status(404).json({
        success: false,
        error: 'No resume found',
      });
    }

    // Generate presigned URL for viewing (valid for 1 hour)
    let viewUrl = jobSettings.resumeS3Url;

    if (isS3Configured() && jobSettings.resumeS3Key) {
      try {
        const { getPresignedUrl } = await import('../services/s3Service.js');
        viewUrl = await getPresignedUrl(jobSettings.resumeS3Key, 3600); // 1 hour
      } catch (error) {
        console.warn('⚠️  Failed to generate presigned URL:', error.message);
      }
    }

    res.json({
      success: true,
      data: {
        fileName: jobSettings.resumeFileName,
        s3Url: viewUrl,
        uploadedAt: jobSettings.updatedAt,
      },
    });
  } catch (error) {
    console.error('Resume view error:', error);

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get resume details',
    });
  }
});

/**
 * GET /api/resume/download
 * Generate presigned URL for downloading resume
 * Requires authentication
 */
router.get('/download', authenticateToken, async (req, res) => {
  try {
    const jobSettings = await JobSettings.findOne({
      where: { userId: req.userId },
    });

    if (!jobSettings || !jobSettings.resumeS3Key) {
      return res.status(404).json({
        success: false,
        error: 'No resume found',
      });
    }

    // Generate presigned URL for downloading (valid for 15 minutes)
    let downloadUrl = jobSettings.resumeS3Url;

    if (isS3Configured() && jobSettings.resumeS3Key) {
      try {
        const { getPresignedUrl } = await import('../services/s3Service.js');
        downloadUrl = await getPresignedUrl(jobSettings.resumeS3Key, 900); // 15 minutes
      } catch (error) {
        console.warn('⚠️  Failed to generate presigned URL:', error.message);
      }
    }

    res.json({
      success: true,
      data: {
        fileName: jobSettings.resumeFileName,
        downloadUrl: downloadUrl,
      },
    });
  } catch (error) {
    console.error('Resume download error:', error);

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate download URL',
    });
  }
});

/**
 * DELETE /api/resume/delete
 * Delete resume from S3 and database
 * Requires authentication
 */
router.delete('/delete', authenticateToken, async (req, res) => {
  try {
    const jobSettings = await JobSettings.findOne({
      where: { userId: req.userId },
    });

    if (!jobSettings || !jobSettings.resumeS3Key) {
      return res.status(404).json({
        success: false,
        error: 'No resume found',
      });
    }

    // Delete from S3
    if (isS3Configured()) {
      try {
        await deleteResumeFromS3(jobSettings.resumeS3Key);
      } catch (error) {
        console.warn('⚠️  Failed to delete from S3:', error.message);
      }
    }

    // Update database
    await jobSettings.update({
      resumeFileName: null,
      resumeS3Url: null,
      resumeS3Key: null,
    });

    res.json({
      success: true,
      message: 'Resume deleted successfully',
    });
  } catch (error) {
    console.error('Resume delete error:', error);

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete resume',
    });
  }
});

export default router;
