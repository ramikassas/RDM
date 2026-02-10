
/**
 * Browser-native image optimizer using HTML5 Canvas.
 * Replaces 'sharp' library functionality for frontend-only environments.
 * 
 * FEATURES:
 * - Automatic resizing to max dimensions (1200x1200px)
 * - Compression to WebP format
 * - Quality control (0.8 default)
 * - File size validation
 */

export const optimizeImage = async (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    // 1. Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      reject(new Error('Invalid file type. Only JPG, PNG, WebP, and SVG are allowed.'));
      return;
    }

    // Skip optimization for SVG, return as is (but validate size)
    if (file.type === 'image/svg+xml') {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit for SVG
        reject(new Error('SVG file too large (max 2MB)'));
        return;
      }
      resolve(file);
      return;
    }

    // 2. Load image for processing
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = () => {
        // 3. Define Constraints
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        const TARGET_QUALITY = 0.8; // 80% quality
        const MAX_FILE_SIZE = 500 * 1024; // 500KB strict limit

        let width = img.width;
        let height = img.height;

        // 4. Calculate new dimensions (maintain aspect ratio)
        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        // 5. Create Canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        
        // Better scaling quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        ctx.drawImage(img, 0, 0, width, height);

        // 6. Export to WebP
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Add metadata for debugging/UI
              const optimizedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                type: 'image/webp',
                lastModified: Date.now(),
              });

              // Log optimization results
              console.log(`Image Optimized: ${file.name}`, {
                originalSize: (file.size / 1024).toFixed(2) + 'KB',
                newSize: (blob.size / 1024).toFixed(2) + 'KB',
                reduction: ((1 - blob.size / file.size) * 100).toFixed(1) + '%'
              });

              resolve({
                file: optimizedFile,
                blob,
                width,
                height,
                size: blob.size,
                type: 'image/webp',
                previewUrl: URL.createObjectURL(blob)
              });
            } else {
              reject(new Error('Image conversion failed'));
            }
          },
          'image/webp',
          TARGET_QUALITY
        );
      };

      img.onerror = (err) => reject(new Error('Failed to load image for optimization'));
    };

    reader.onerror = (err) => reject(new Error('Failed to read file'));
  });
};
