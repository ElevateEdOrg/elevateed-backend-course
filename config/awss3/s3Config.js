const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const path = require("path");
require("dotenv").config();

// Create an S3 client instance
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.BUCKET_NAME;

// Function to determine the upload folder based on MIME type
const getUploadFolder = (mimetype) => {
  if (mimetype.startsWith("image/")) return "uploads/images";
  if (mimetype.startsWith("video/")) return "uploads/videos";
  if (mimetype === "application/pdf") return "uploads/documents";
  throw new Error("Invalid mimetype")
};

// Function to upload file to S3
const uploadFileToS3 = async (file) => {
  const folder = getUploadFolder(file.mimetype);
  const fileKey = `${folder}/${Date.now()}-${file.originalname}`;

  const params = {
    Bucket: BUCKET_NAME,
    Key: fileKey,
    Body: file.buffer,
    ContentType: file.mimetype
  };

  // Upload using AWS SDK v3
  await s3.send(new PutObjectCommand(params));

  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
}

module.exports = {uploadFileToS3};
