/**
 * Client-side image compression utility
 * Compresses images before upload to reduce file size and improve upload reliability
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeMB?: number;
}

/**
 * Compresses an image file using canvas API
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Promise<File> - Compressed image file
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.85,
    maxSizeMB = 2
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }
        
        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Use high-quality image rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Draw image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }
            
            // Check if compressed size is acceptable
            const sizeMB = blob.size / (1024 * 1024);
            
            if (sizeMB > maxSizeMB) {
              // If still too large, reduce quality further
              const reducedQuality = Math.max(0.5, quality - 0.1);
              canvas.toBlob(
                (reducedBlob) => {
                  if (!reducedBlob) {
                    reject(new Error('Failed to compress image'));
                    return;
                  }
                  
                  // Create new file with compressed blob
                  const compressedFile = new File(
                    [reducedBlob],
                    file.name,
                    {
                      type: 'image/jpeg',
                      lastModified: Date.now()
                    }
                  );
                  
                  resolve(compressedFile);
                },
                'image/jpeg',
                reducedQuality
              );
            } else {
              // Create new file with compressed blob
              const compressedFile = new File(
                [blob],
                file.name,
                {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                }
              );
              
              resolve(compressedFile);
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Validates file size and type
 * @param file - File to validate
 * @param maxSizeMB - Maximum file size in MB (default: 10MB)
 * @returns Object with isValid and error message
 */
export function validateImageFile(
  file: File,
  maxSizeMB: number = 10
): { isValid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return {
      isValid: false,
      error: 'Alleen afbeeldingen zijn toegestaan'
    };
  }
  
  // Check file size
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > maxSizeMB) {
    return {
      isValid: false,
      error: `Bestand is te groot (${sizeMB.toFixed(1)}MB). Maximum is ${maxSizeMB}MB. De foto wordt automatisch gecomprimeerd.`
    };
  }
  
  return { isValid: true };
}



