import axios from 'axios';
import {
  getSuggestionFromTomTom,
  mapAddressFromTomTom,
} from '../../src/helpers/tomtom.helper';
import { AddressModuleOptions } from '../../src/modules/address/AddressModuleOptions';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('TomTom helper', () => {
  const options: AddressModuleOptions = {
    apiKey: 'test-api-key',
    countrySet: 'AU',
    limit: 5,
  };

  describe('#getSuggestionFromTomTom', () => {
    it('should call TomTom API with correct parameters', async () => {
      const mockResponse = { data: { results: [] } };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const query = '123 Test Street';
      const result = await getSuggestionFromTomTom(options, query);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(
          'https://api.tomtom.com/search/2/search/123%20Test%20Street.json',
        ),
        {
          params: {
            key: options.apiKey,
            countrySet: options.countrySet,
            limit: options.limit,
          },
        },
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('#mapAddressFromTomTom', () => {
    it('should return undefined when input is null', () => {
    expect(mapAddressFromTomTom(null)).toBeUndefined();
  });

  it('should return undefined when input is undefined', () => {
    expect(mapAddressFromTomTom(undefined)).toBeUndefined();
  });

  it('should return undefined when address property is missing', () => {
    const incompleteResult = { position: { lat: 1, lon: 2 } };
    expect(mapAddressFromTomTom(incompleteResult)).toBeUndefined();
  });

  it('should return undefined when position property is missing', () => {
    const incompleteResult = {
      address: {
        freeformAddress: 'Some Address',
        country: 'AU',
        municipality: 'Sydney',
      },
    };
    expect(mapAddressFromTomTom(incompleteResult)).toBeUndefined();
  });

  it('should return undefined when result is an empty object', () => {
    expect(mapAddressFromTomTom({})).toBeUndefined();
  });

    it('should map TomTom API result correctly', () => {
      const apiResult = {
        address: {
          freeformAddress: '123 Test Street, Sydney',
          country: 'Australia',
          municipality: 'Sydney',
        },
        position: {
          lat: -33.865143,
          lon: 151.2099,
        },
      };

      const mapped = mapAddressFromTomTom(apiResult);

      expect(mapped).toEqual({
        fullAddress: '123 Test Street, Sydney',
        country: 'Australia',
        municipality: 'Sydney',
        latitude: -33.865143,
        longitude: 151.2099,
      });
    });
  });
});
