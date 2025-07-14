import axios from 'axios';
import { AddressModuleOptions } from '../../../src/modules/address/AddressModuleOptions';
import { AddressService } from '../../../src/modules/address/address.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AddressService', () => {
  let addressService: AddressService;
  let options: AddressModuleOptions;

  beforeEach(() => {
    options = {
      apiKey: 'test-api-key',
      countrySet: 'AU',
      limit: 5,
    };

    addressService = new AddressService(options);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call TomTom API with correct params and return formatted address suggestions', async () => {
    const mockApiResponse = {
      data: {
        results: [
          {
            address: {
              freeformAddress: '123 Test Street, Sydney, NSW',
              country: 'Australia',
              countryCode: 'AUS',
              municipality: 'Sydney',
            },
            position: {
              lat: -33.865143,
              lon: 151.209900,
            },
          },
          {
            address: {
              freeformAddress: '456 Fake Road, Auckland, NZ',
              country: 'New Zealand',
              countryCode: 'NZL',
              municipality: 'Auckland',
            },
            position: {
              lat: -36.8485,
              lon: 174.7633,
            },
          },
        ],
      },
    };

    mockedAxios.get.mockResolvedValue(mockApiResponse);

    const result = await addressService.getSuggestions('123');

    // Assertions
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('https://api.tomtom.com/search/2/search/123.json'),
      {
        params: {
          key: options.apiKey,
          countrySet: options.countrySet,
          limit: options.limit,
        },
      },
    );

    expect(result).toEqual([
      {
        fullAddress: '123 Test Street, Sydney, NSW',
        country: 'Australia',
        municipality: 'Sydney',
        latitude: -33.865143,
        longitude: 151.209900,
      },
    ]);

    // Ensure filtering removed the NZ address
    expect(result.length).toBe(1);
  });

  it('should return empty array if no Australian addresses are found', async () => {
    const mockApiResponse = {
      data: {
        results: [
          {
            address: {
              freeformAddress: '456 Fake Road, Auckland, NZ',
              country: 'New Zealand',
              countryCode: 'NZL',
              municipality: 'Auckland',
            },
            position: {
              lat: -36.8485,
              lon: 174.7633,
            },
          },
        ],
      },
    };

    mockedAxios.get.mockResolvedValue(mockApiResponse);

    const result = await addressService.getSuggestions('456');
    expect(result).toEqual([]);
  });
});
