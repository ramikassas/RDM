
/**
 * Browser-native image optimizer using HTML5 Canvas.
 * Replaces 'sharp' library functionality for frontend-only environments.
 */

export const optimizeImage = async (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      reject(new Error('Invalid file type. Only JPG, PNG, and WebP are allowed.'));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = () => {
        const maxWidth = 500;
        const maxHeight = 500;
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP with 0.8 quality
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({
                blob,
                width,
                height,
                size: blob.size,
                type: 'image/webp'
              });
            } else {
              reject(new Error('Image conversion failed'));
            }
          },
          'image/webp',
          0.8
        );
      };

      img.onerror = (err) => reject(new Error('Failed to load image for optimization'));
    };

    reader.onerror = (err) => reject(new Error('Failed to read file'));
  });
};
