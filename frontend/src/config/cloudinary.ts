// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = 'dyr7qylh4';

// Helper function to generate optimized profile image URLs
export const getOptimizedImageUrl = (publicId: string, width = 400, height = 400) => {
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/c_fill,w_${width},h_${height},q_auto,f_auto/${publicId}`;
};

// Helper function for avatar thumbnails
export const getAvatarUrl = (publicId: string, size = 64) => {
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/c_fill,w_${size},h_${size},q_auto,f_auto/${publicId}`;
}; 