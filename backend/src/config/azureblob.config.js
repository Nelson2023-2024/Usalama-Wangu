import { BlobServiceClient } from "@azure/storage-blob";
import { ENV } from "./env.config.js";

// Initialize Azure Blob Service Client
const blobServiceClient = BlobServiceClient.fromConnectionString(
  `BlobEndpoint=https://${ENV.STORAGE_ACCOUNT_NAME}.blob.core.windows.net;SharedAccessSignature=${ENV.SAS_TOKEN}`
);

const containerClient = blobServiceClient.getContainerClient(ENV.CONTAINER_NAME);

/**
 * Upload file to Azure Blob Storage
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {string} fileName - Name for the blob
 * @param {string} mimeType - MIME type of the file
 * @returns {Promise<{url: string, blobName: string}>}
 */
export const uploadToAzure = async (fileBuffer, fileName, mimeType) => {
  try {
    // Generate unique blob name with timestamp
    const timestamp = Date.now();
    const blobName = `${timestamp}-${fileName.replace(/\s+/g, "-")}`;
    
    // Get block blob client
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    // Upload buffer to Azure
    await blockBlobClient.uploadData(fileBuffer, {
      blobHTTPHeaders: {
        blobContentType: mimeType,
      },
    });
    
    // Return the blob URL
    const url = blockBlobClient.url;
    
    return {
      url,
      blobName,
      success: true
    };
  } catch (error) {
    console.error("Azure upload error:", error);
    throw new Error(`Failed to upload to Azure: ${error.message}`);
  }
};

/**
 * Delete file from Azure Blob Storage
 * @param {string} blobName - Name of the blob to delete
 * @returns {Promise<boolean>}
 */
export const deleteFromAzure = async (blobName) => {
  try {
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.delete();
    return true;
  } catch (error) {
    console.error("Azure delete error:", error);
    throw new Error(`Failed to delete from Azure: ${error.message}`);
  }
};
