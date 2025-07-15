import {
  Inject,
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

import { AddressSuggestion } from '../../models/AddressSuggestion';
import { AddressProvider } from '../../providers/provider.interface';
import { AddressModuleOptions } from './AddressModuleOptions';
import {
  getSuggestionFromTomTom,
  mapAddressFromTomTom,
} from '../../helpers/tomtom.helper';

@Injectable()
export class AddressService implements AddressProvider {
  constructor(
    @Inject('ADDRESS_MODULE_OPTIONS') private options: AddressModuleOptions,
  ) {
    this.validateOptions();
  }

  async getPOISearchResults(query: string): Promise<AddressSuggestion[]> {
    if (!query || typeof query !== 'string' || !query.trim()) {
      throw new BadRequestException('Query must be a non-empty string.');
    }

    let response;
    try {
      response = await getSuggestionFromTomTom(this.options, query);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch suggestions from TomTom: ${error.message}`,
      );
    }

    if (!response?.data?.results || !Array.isArray(response.data.results)) {
      throw new InternalServerErrorException(
        'TomTom API returned invalid or empty results.',
      );
    }

    return this.filterSearchResult(response.data.results);
  }

  private filterSearchResult(results: any[]) {
    return results.reduce<AddressSuggestion[]>((acc, result) => {
      if (result?.address?.countryCode !== this.options.countrySet) return acc;

      const mapped = mapAddressFromTomTom(result);
      if (mapped?.fullAddress) acc.push(mapped);

      return acc;
    }, []);
  }

  private validateOptions(): void {
    const { apiKey, countrySet, limit } = this.options || {};
    if (!apiKey || typeof apiKey !== 'string' || apiKey.length === 0) {
      throw new BadRequestException(
        'AddressService: API key is missing or invalid.',
      );
    }
    if (
      !countrySet ||
      typeof countrySet !== 'string' ||
      countrySet.length === 0
    ) {
      throw new BadRequestException(
        'AddressService: countrySet is missing or invalid.',
      );
    }
    if (!limit || typeof limit !== 'number') {
      throw new BadRequestException(
        'AddressService: limit is missing or invalid.',
      );
    }
  }
}
