/**
 * Centralized API & Networking Layer
 * Provides robust fetching, retries, and error handling for production scale.
 */

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

interface FetchOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
}

export const fetchWithRetry = async (
  url: string,
  options: FetchOptions = {}
): Promise<Response> => {
  const { retries = 3, retryDelay = 1000, ...fetchOptions } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, fetchOptions);
      if (!response.ok) {
        throw new ApiError(response.status, `HTTP Error ${response.status}`);
      }
      return response;
    } catch (error: any) {
      lastError = error;
      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
    }
  }

  throw lastError || new Error('Request failed after retries');
};

/**
 * Standardized API Client for all AI model requests.
 */
export const AiClient = {
  async generateText(prompt: string, context?: any) {
    // Implement centralized generation logic when switching models
    // Using fetchWithRetry wrapper
    console.log("[AI Client] Request queued:", { prompt, context });
    return Promise.resolve("Simulated generation");
  },
  
  async validateResponse(schema: any, response: string) {
    // Implement validation layers
    return true;
  }
};
