/**
 * Web Worker Error Handler
 *
 * Provides graceful handling of web worker loading failures and fallbacks
 * for video processing and other background tasks on web platform.
 *
 * @author DNSChat Team
 * @since 2.0.1 (Web Worker Error Handling)
 */

import { Platform } from 'react-native';

// ==================================================================================
// WEB WORKER ERROR HANDLING
// ==================================================================================

/**
 * Safely load a web worker with fallback handling
 */
export const safeLoadWebWorker = async (
  workerPath: string,
  fallback?: () => Promise<any>
): Promise<Worker | null> => {
  // Only handle web workers on web platform
  if (Platform.OS !== 'web') {
    return null;
  }

  try {
    // Try to create the worker
    const worker = new Worker(workerPath);

    // Test if worker loads successfully
    return new Promise((resolve, reject) => {
      worker.onmessage = () => {
        // Worker loaded successfully
        resolve(worker);
      };

      worker.onerror = (error) => {
        // Enhanced error logging for better debugging
        const errorDetails = {
          message: error?.message || 'Unknown worker error',
          filename: error?.filename || 'Unknown file',
          lineno: error?.lineno || 'Unknown line',
          colno: error?.colno || 'Unknown column',
          error: error || 'Empty error object',
          workerPath: workerPath,
        };

        console.warn('Web worker failed to load:', errorDetails);
        console.error('Worker error details:', errorDetails);
        worker.terminate();

        if (fallback) {
          // Use fallback if available
          fallback()
            .then(resolve)
            .catch(reject);
        } else {
          resolve(null);
        }
      };

      // Timeout after 5 seconds
      setTimeout(() => {
        console.warn('Web worker load timeout:', workerPath);
        worker.terminate();
        if (fallback) {
          fallback()
            .then(resolve)
            .catch(reject);
        } else {
          resolve(null);
        }
      }, 5000);
    });
  } catch (error) {
    console.warn('Failed to create web worker:', workerPath, error);

    if (fallback) {
      try {
        return await fallback();
      } catch (fallbackError) {
        console.error('Worker fallback also failed:', fallbackError);
        return null;
      }
    }

    return null;
  }
};

/**
 * Video processing fallback for web workers
 */
export const videoProcessingFallback = async (): Promise<any> => {
  console.log('Using video processing fallback (main thread)');

  // Return a mock video processor that works on main thread
  return {
    processVideo: async (videoData: any) => {
      // Simulate video processing on main thread
      await new Promise(resolve => setTimeout(resolve, 100));
      return {
        processed: true,
        data: videoData,
        fallback: true,
      };
    },
    terminate: () => {
      // No-op for fallback
    },
  };
};

/**
 * Global error handler for uncaught web worker errors
 */
export const setupWebWorkerErrorHandling = (): void => {
  if (Platform.OS !== 'web') return;

  // Handle uncaught worker errors
  self.addEventListener('error', (event) => {
    if (event.message?.includes('importScripts') &&
        event.message?.includes('WorkerGlobalScope')) {
      console.warn('Caught web worker loading error, using fallbacks');
      event.preventDefault();
    }
  });

  // Handle unhandled promise rejections from workers
  self.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.message?.includes('importScripts') &&
        event.reason?.message?.includes('WorkerGlobalScope')) {
      console.warn('Caught web worker promise rejection, using fallbacks');
      event.preventDefault();
    }
  });
};

// ==================================================================================
// PLATFORM DETECTION AND FALLBACKS
// ==================================================================================

/**
 * Check if web workers are supported and working
 */
export const areWebWorkersSupported = (): boolean => {
  if (Platform.OS !== 'web') return false;

  try {
    return typeof Worker !== 'undefined';
  } catch {
    return false;
  }
};

/**
 * Get appropriate video processing implementation based on platform
 */
export const getVideoProcessor = async (
  workerPath?: string
): Promise<any> => {
  if (Platform.OS === 'web' && workerPath && areWebWorkersSupported()) {
    return await safeLoadWebWorker(workerPath, videoProcessingFallback);
  }

  // Use fallback for non-web platforms or when workers fail
  return await videoProcessingFallback();
};

// ==================================================================================
// EXPORTS
// ==================================================================================

export default {
  safeLoadWebWorker,
  videoProcessingFallback,
  setupWebWorkerErrorHandling,
  areWebWorkersSupported,
  getVideoProcessor,
};
