import { Inject, Injectable } from '@nestjs/common';
import axios from 'axios';

import { AddressSuggestion } from '../../models/AddressSuggestion';
import { AddressProvider } from '../../providers/provider.interface';
import { AddressModuleOptions } from './AddressModuleOptions';

@Injectable()
export class AddressService implements AddressProvider {
  constructor(
    @Inject('ADDRESS_MODULE_OPTIONS') private options: AddressModuleOptions,
  ) {}

  async getSuggestions(query: string): Promise<AddressSuggestion[]> {
    const response = await axios.get(
      `https://api.tomtom.com/search/2/search/${encodeURIComponent(query)}.json`,
      {
        params: {
          key: this.options.apiKey,
          countrySet: this.options.countrySet,
          limit: this.options.limit,
        },
      },
    );

    return response.data.results
      .filter((result) => result.address?.countryCode === 'AUS')
      .map((result) => ({
        fullAddress: result.address.freeformAddress,
        country: result.address.country,
        municipality: result.address.municipality,
        latitude: result.position.lat,
        longitude: result.position.lon,
      }));
  }
}
