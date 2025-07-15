import axios from 'axios';
import { AddressModuleOptions } from '../modules/address/AddressModuleOptions';
import { AddressSuggestion } from '../models/AddressSuggestion';

export async function getSuggestionFromTomTom(
  options: AddressModuleOptions,
  query: any,
): Promise<axios.AxiosResponse<any, any>> {
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

export function mapAddressFromTomTom(result): AddressSuggestion | undefined {
  if (!result || !result?.address || !result?.position) return undefined;

  return {
    fullAddress: result.address.freeformAddress,
    streetNumber: result.address.streetNumber,
    streetName: result.address.streetName,
    suburb: result.address.municipalitySubdivision,
    postcode: result.address.postalCode,
    countryCode: result.address.countryCode,
    country: result.address.country,
    municipality: result.address.municipality,
    latitude: result.position.lat,
    longitude: result.position.lon,
  };
}
