import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { vi,  expect, test, afterEach, describe, beforeEach } from 'vitest';
import { AddressService } from '../../../src/modules/address/address.service';
import { AddressModuleOptions } from '../../../src/modules/address/AddressModuleOptions';
import * as tomtomHelper from '../../../src/helpers/tomtom.helper';

vi.mock('../../../src/helpers/tomtom.helper');

const mockedGetSuggestion = tomtomHelper.getSuggestionFromTomTom;
const mockedMapAddress = tomtomHelper.mapAddressFromTomTom;

describe('AddressService', () => {
  const validOptions: AddressModuleOptions = {
    apiKey: 'valid-api-key',
    countrySet: 'AU',
    limit: 5,
  };

  const mockApiResultInvalid = {
    data: {
      results: [
        { address: { countryCode: 'NZL' }, position: { lat: 3, lon: 4 } },
      ],
    },
  };

  const mockApiResultValid = {
    data: {
      results: [
        {
          address: { countryCode: 'AUS', freeformAddress: 'Valid Address' },
          position: { lat: 1, lon: 2 },
        },
        {
          address: { countryCode: 'NZL', freeformAddress: 'Invalid Address' },
          position: { lat: 3, lon: 4 },
        },
      ],
    },
  };

  const mappedResultValid = {
    fullAddress: 'Mapped Address',
    country: 'Australia',
    municipality: 'Sydney',
    latitude: 1,
    longitude: 2,
  };

  const mappedResultInvalid = {
    country: 'Australia',
    municipality: 'Sydney',
    latitude: 1,
    longitude: 2,
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    test('should throw if apiKey is missing', () => {
      expect(() => new AddressService({ ...validOptions, apiKey: '' })).toThrow(
        BadRequestException,
      );
    });

    test('should throw if countrySet is missing', () => {
      expect(
        () => new AddressService({ ...validOptions, countrySet: '' }),
      ).toThrow(BadRequestException);
    });

    test('should throw if limit is missing or not a number', () => {
      expect(
        () => new AddressService({ ...validOptions, limit: '' as any }),
      ).toThrow(BadRequestException);
      expect(
        () => new AddressService({ ...validOptions, limit: '10' as any }),
      ).toThrow(BadRequestException);
    });
  });

  describe('#getSuggestions', () => {
    let service: AddressService;

    beforeEach(() => {
      service = new AddressService(validOptions);
    });

    test('should throw if query is empty or invalid', async () => {
      await expect(service.getSuggestions('')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.getSuggestions(null as any)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.getSuggestions('    ')).rejects.toThrow(
        BadRequestException,
      );
    });

    test('should throw if TomTom API call fails', async () => {
      mockedGetSuggestion.mockRejectedValue(new Error('TomTom API failure'));

      await expect(service.getSuggestions('Melbourne')).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockedGetSuggestion).toHaveBeenCalled();
    });

    test('should throw if TomTom response is invalid or null', async () => {
      mockedGetSuggestion.mockResolvedValue(null);

      await expect(service.getSuggestions('Melbourne')).rejects.toThrow(
        InternalServerErrorException,
      );

      mockedGetSuggestion.mockResolvedValue({ data: null });
      await expect(service.getSuggestions('Melbourne')).rejects.toThrow(
        InternalServerErrorException,
      );

      mockedGetSuggestion.mockResolvedValue({ data: { results: null } });
      await expect(service.getSuggestions('Melbourne')).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    test('should filter non-AUS addresses and map valid results', async () => {
      mockedGetSuggestion.mockResolvedValue(mockApiResultValid);
      mockedMapAddress.mockReturnValue(mappedResultValid);

      const results = await service.getSuggestions('Valid Query');

      expect(results).toEqual([mappedResultValid]);
      expect(mockedGetSuggestion).toHaveBeenCalledWith(
        validOptions,
        'Valid Query',
      );
      expect(mockedMapAddress).toHaveBeenCalledTimes(1);
    });

    test('should filter when the full address is empty after mapping', async () => {
      mockedGetSuggestion.mockResolvedValue(mockApiResultValid);
      mockedMapAddress.mockReturnValue(mappedResultInvalid);

      const results = await service.getSuggestions('Invalid Query');

      expect(results).toEqual([]);
      expect(mockedGetSuggestion).toHaveBeenCalledWith(
        validOptions,
        'Invalid Query',
      );
      expect(mockedMapAddress).toHaveBeenCalledTimes(1);
    });

    test('should return empty array if no valid Australian addresses', async () => {
      mockedGetSuggestion.mockResolvedValue(mockApiResultInvalid);

      const results = await service.getSuggestions('Invalid Query');
      expect(results).toEqual([]);
    });
  });
});
