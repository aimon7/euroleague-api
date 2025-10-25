import {
  Injectable,
  Logger,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
  RequestTimeoutException,
  ConflictException,
  InternalServerErrorException,
  BadGatewayException,
  ServiceUnavailableException,
  GatewayTimeoutException,
  HttpException,
} from '@nestjs/common';
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
              this.handleError(error);
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
   * Maps HTTP status codes to appropriate NestJS exceptions
   */
  private handleError(error: AxiosError): never {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const status = error.response.status;
      const responseData = error.response.data as
        | { title?: string; detail?: string; message?: string }
        | undefined;

      // Extract meaningful error message from the API response
      const errorMessage =
        responseData?.title ??
        responseData?.detail ??
        responseData?.message ??
        error.message;

      // Build error options with cause for logging purposes
      const errorOptions = {
        cause: error,
        description: responseData?.detail ?? errorMessage,
      };

      // Map HTTP status codes to appropriate NestJS exceptions
      if (status === 400) {
        throw new BadRequestException(errorMessage, errorOptions);
      } else if (status === 401) {
        throw new UnauthorizedException(errorMessage, errorOptions);
      } else if (status === 403) {
        throw new ForbiddenException(errorMessage, errorOptions);
      } else if (status === 404) {
        throw new NotFoundException(errorMessage, errorOptions);
      } else if (status === 408) {
        throw new RequestTimeoutException(errorMessage, errorOptions);
      } else if (status === 409) {
        throw new ConflictException(errorMessage, errorOptions);
      } else if (status === 500) {
        throw new InternalServerErrorException(errorMessage, errorOptions);
      } else if (status === 502) {
        throw new BadGatewayException(errorMessage, errorOptions);
      } else if (status === 503) {
        throw new ServiceUnavailableException(errorMessage, errorOptions);
      } else if (status === 504) {
        throw new GatewayTimeoutException(errorMessage, errorOptions);
      } else {
        // For any other status codes, throw a generic HttpException
        throw new HttpException(
          errorMessage || 'An error occurred',
          status,
          errorOptions,
        );
      }
    } else if (error.request) {
      // The request was made but no response was received
      this.logger.error('No response received from Euroleague API', error);
      throw new ServiceUnavailableException(
        'No response received from Euroleague API',
        { cause: error },
      );
    } else {
      // Something happened in setting up the request that triggered an Error
      this.logger.error('Request setup error', error.message);
      throw new InternalServerErrorException(
        `Request error: ${error.message}`,
        { cause: error },
      );
    }
  }

  /**
   * Get the base URL for the API
   */
  getBaseUrl(): string {
    return this.BASE_URL;
  }
}
