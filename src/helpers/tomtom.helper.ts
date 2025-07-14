import axios from 'axios';
import { AddressModuleOptions } from '../modules/address/AddressModuleOptions';

export async function getSuggestionFromTomTom(
  options: AddressModuleOptions,
  query: any,
) {
  return await axios.get(
    `https://api.tomtom.com/search/2/search/${encodeURIComponent(query)}.json`,
    {
      params: {
        key: options.apiKey,
        countrySet: options.countrySet,
        limit: options.limit,
      },
    },
  );
}

export function mapAddressFromTomTom(result) {
  if (!result || !result?.address || !result?.position) return undefined;

  return {
    fullAddress: result.address.freeformAddress,
    country: result.address.country,
    municipality: result.address.municipality,
    latitude: result.position.lat,
    longitude: result.position.lon,
  };
}
