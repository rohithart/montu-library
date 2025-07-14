import axios from 'axios';
import { vi, expect, test, describe } from 'vitest';
import {
  getSuggestionFromTomTom,
  mapAddressFromTomTom,
} from '../../src/helpers/tomtom.helper';
import { AddressModuleOptions } from '../../src/modules/address/AddressModuleOptions';

vi.mock('axios');
const mockedAxios = axios as unknown as vi.Mocked<typeof axios>;

describe('TomTom helper', () => {
  const options: AddressModuleOptions = {
    apiKey: 'test-api-key',
    countrySet: 'AU',
    limit: 5,
  };

  describe('#getSuggestionFromTomTom', async () => {
    const mockResponse = { data: { results: [] } };
    mockedAxios.get.mockResolvedValue(mockResponse);
    const query = '123 Test Street';
    const result = await getSuggestionFromTomTom(options, query);

    describe('when invoked', () => {
      test('should call TomTom API with correct parameters', async () => {
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
      });
      test('should return the expected result', async () => {
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe('#mapAddressFromTomTom', () => {
    test('should return undefined when input is null', () => {
      expect(mapAddressFromTomTom(null)).toBeUndefined();
    });

    test('should return undefined when input is undefined', () => {
      expect(mapAddressFromTomTom(undefined)).toBeUndefined();
    });

    describe('when address is missing from the result set', () => {
      const incompleteResult = { position: { lat: 1, lon: 2 } };
      test('should return undefined when address property is missing', () => {
        expect(mapAddressFromTomTom(incompleteResult)).toBeUndefined();
      });
    });

    describe('when position is missing from the result set', () => {
      const incompleteResult = {
        address: {
          freeformAddress: 'Some Address',
          country: 'AU',
          municipality: 'Sydney',
        },
      };
      test('should return undefined when position property is missing', () => {
        expect(mapAddressFromTomTom(incompleteResult)).toBeUndefined();
      });
    });

    test('should return undefined when result is an empty object', () => {
      expect(mapAddressFromTomTom({})).toBeUndefined();
    });

    describe('when the result is accurate', () => {
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

      test('should map TomTom API result correctly', () => {
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
});
