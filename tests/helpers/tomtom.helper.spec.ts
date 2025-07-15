import axios from 'axios';
import { vi, expect, test, describe } from 'vitest';
import {
  getSuggestionFromTomTom,
  mapAddressFromTomTom,
} from '../../src/helpers/tomtom.helper';
import { AddressModuleOptions } from '../../src/modules/address/AddressModuleOptions';
import { AddressSuggestion } from '../../src/models/AddressSuggestion';

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

    describe('when the result is partial', () => {
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

      const mapped: AddressSuggestion | undefined =
        mapAddressFromTomTom(apiResult);

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

    describe('when the result is accurate', () => {
      const apiResult = {
        type: 'Point Address',
        id: '2taLq1tqNaEsvh6W9QSctg',
        score: 4.8037905693,
        address: {
          streetNumber: '20',
          streetName: 'Lomandra Drive',
          municipalitySubdivision: 'Clayton South',
          municipality: 'Melbourne',
          countrySecondarySubdivision: 'Melbourne',
          countrySubdivision: 'Victoria',
          countrySubdivisionName: 'Victoria',
          countrySubdivisionCode: 'VIC',
          postalCode: '3169',
          countryCode: 'AU',
          country: 'Australia',
          countryCodeISO3: 'AUS',
          freeformAddress: '20 Lomandra Drive, Clayton South, VIC, 3169',
          localName: 'Clayton South',
        },
        position: {
          lat: -37.929547,
          lon: 145.125674,
        },
        viewport: {
          topLeftPoint: {
            lat: -37.92865,
            lon: 145.12453,
          },
          btmRightPoint: {
            lat: -37.93045,
            lon: 145.12681,
          },
        },
        entryPoints: [
          {
            type: 'main',
            position: {
              lat: -37.92945,
              lon: 145.12519,
            },
          },
        ],
      };

      const mapped: AddressSuggestion | undefined =
        mapAddressFromTomTom(apiResult);

      test('should map TomTom API result correctly', () => {
        expect(mapped).toEqual({
          country: 'Australia',
          countryCode: 'AU',
          fullAddress: '20 Lomandra Drive, Clayton South, VIC, 3169',
          latitude: -37.929547,
          longitude: 145.125674,
          municipality: 'Melbourne',
          postcode: '3169',
          streetName: 'Lomandra Drive',
          streetNumber: '20',
          suburb: 'Clayton South',
        });
      });
    });
  });
});
