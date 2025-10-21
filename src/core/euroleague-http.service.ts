import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

/**
 * Core HTTP service for making requests to the Euroleague API
 * Wraps the Axios HTTP client with error handling and logging
 */
@Injectable()
export class EuroleagueHttpService {
  private readonly logger = new Logger(EuroleagueHttpService.name);
  private readonly BASE_URL = 'https://api-live.euroleague.net';

  constructor(private readonly httpService: HttpService) {}

  /**
   * Make a GET request to the Euroleague API
   * @param url - The full URL or path to request
   * @param params - Optional query parameters
   * @returns Promise with the response data
   */
  async get<T = any>(url: string, params?: Record<string, any>): Promise<T> {
    const fullUrl = url.startsWith('http') ? url : `${this.BASE_URL}${url}`;

    this.logger.debug(`GET ${fullUrl}`, params ? { params } : '');

    try {
      const response = await firstValueFrom(
        this.httpService
          .get<T>(fullUrl, {
            params,
            headers: {
              Accept: 'application/json',
            },
            timeout: 60000,
          })
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(`Error fetching ${fullUrl}`, error.message);
              throw this.handleError(error);
            }),
          ),
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch from ${fullUrl}`, error);
      throw error;
    }
  }

  /**
   * Handle HTTP errors and provide meaningful error messages
   */
  private handleError(error: AxiosError): Error {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const status = error.response.status;
      const message = error.response.data || error.message;
      return new Error(`HTTP ${status}: ${JSON.stringify(message)}`);
    } else if (error.request) {
      // The request was made but no response was received
      return new Error('No response received from Euroleague API');
    } else {
      // Something happened in setting up the request that triggered an Error
      return new Error(`Request error: ${error.message}`);
    }
  }

  /**
   * Get the base URL for the API
   */
  getBaseUrl(): string {
    return this.BASE_URL;
  }
}
