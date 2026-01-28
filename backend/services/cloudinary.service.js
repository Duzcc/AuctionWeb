import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload avatar image to Cloudinary
 * @param {Buffer} fileBuffer - Image file buffer from multer
 * @param {String} userId - User ID for folder organization
 * @returns {Promise<String>} - Cloudinary secure URL
 */
export const uploadAvatar = async (fileBuffer, userId) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: `auctions_db/avatars`,
                public_id: `avatar_${userId}_${Date.now()}`,
                transformation: [
                    { width: 400, height: 400, crop: 'fill', gravity: 'face' },
                    { quality: 'auto:good' },
                    { fetch_format: 'auto' }
                ],
                resource_type: 'image',
            },
            (error, result) => {
                if (error) {
                    console.error('❌ Cloudinary upload error:', error);
                    reject(new Error('Failed to upload avatar to Cloudinary'));
                } else {
                    console.log('✅ Avatar uploaded to Cloudinary:', result.secure_url);
                    resolve(result.secure_url);
                }
            }
        );

        uploadStream.end(fileBuffer);
    });
};

/**
 * Delete avatar from Cloudinary
 * @param {String} publicId - Cloudinary public ID of the image
 * @returns {Promise<Object>} - Deletion result
 */
export const deleteAvatar = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        console.log('🗑️  Avatar deleted from Cloudinary:', publicId);
        return result;
    } catch (error) {
        console.error('❌ Cloudinary delete error:', error);
        throw new Error('Failed to delete avatar from Cloudinary');
    }
};

/**
 * Extract public ID from Cloudinary URL
 * @param {String} url - Cloudinary secure URL
 * @returns {String} - Public ID
 */
export const getPublicIdFromURL = (url) => {
    if (!url || !url.includes('cloudinary.com')) {
        return null;
    }

    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    const publicId = filename.split('.')[0];

    // Include folder path
    const folderIndex = parts.indexOf('auctions_db');
    if (folderIndex !== -1) {
        return parts.slice(folderIndex).join('/').replace(/\.[^/.]+$/, '');
    }

    return publicId;
};

export default {
    uploadAvatar,
    deleteAvatar,
    getPublicIdFromURL,
};
