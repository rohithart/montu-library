import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { vi, expect, test, afterEach, describe, beforeEach } from 'vitest';
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
          address: { countryCode: 'AU', freeformAddress: 'Valid Address' },
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

  describe('#getPOISearchResults', () => {
    let service: AddressService;

    beforeEach(() => {
      service = new AddressService(validOptions);
    });

    test('should throw if query is empty or invalid', async () => {
      await expect(service.getPOISearchResults('')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.getPOISearchResults(null as any)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.getPOISearchResults('    ')).rejects.toThrow(
        BadRequestException,
      );
    });

    describe('when TomTom API call fails', async () => {
      mockedGetSuggestion.mockRejectedValue(new Error('TomTom API failure'));

      test('should throw if TomTom API call fails', async () => {
        await expect(service.getPOISearchResults('Melbourne')).rejects.toThrow(
          InternalServerErrorException,
        );
        expect(mockedGetSuggestion).toHaveBeenCalled();
      });
    });

    describe('when TomTom response is null', async () => {
      mockedGetSuggestion.mockResolvedValue(null);

      test('should throw an exception', async () => {
        await expect(service.getPOISearchResults('Melbourne')).rejects.toThrow(
          InternalServerErrorException,
        );
      });
    });

    describe('when TomTom response is has data which is null', async () => {
      mockedGetSuggestion.mockResolvedValue({ data: null });
      test('should throw an exception', async () => {
        await expect(service.getPOISearchResults('Melbourne')).rejects.toThrow(
          InternalServerErrorException,
        );
      });
    });

    describe('when TomTom response data.result is null', async () => {
      mockedGetSuggestion.mockResolvedValue({ data: { results: null } });
      test('should throw an exception', async () => {
        await expect(service.getPOISearchResults('Melbourne')).rejects.toThrow(
          InternalServerErrorException,
        );
      });
    });

    describe('when the results are valid', () => {
      let results;

      beforeEach(async () => {
        mockedGetSuggestion.mockResolvedValue(mockApiResultValid);
        mockedMapAddress.mockReturnValue(mappedResultValid);
        results = await service.getPOISearchResults('Valid Query');
      });

      test('should filter non-AUS addresses', () => {
        expect(results).toEqual([mappedResultValid]);
      });

      test('should call the search function', () => {
        expect(mockedGetSuggestion).toHaveBeenCalledWith(
          validOptions,
          'Valid Query',
        );
      });

      test('should call the mapping function', () => {
        expect(mockedMapAddress).toHaveBeenCalledTimes(1);
      });
    });

    describe('when the results are invalid', () => {
      let results;

      beforeEach(async () => {
        mockedGetSuggestion.mockResolvedValue(mockApiResultValid);
        mockedMapAddress.mockReturnValue(mappedResultInvalid);
        results = await service.getPOISearchResults('Invalid Query');
      });

      test('should return no result', async () => {
        expect(results).toEqual([]);
      });

      test('should call the search function', async () => {
        expect(mockedGetSuggestion).toHaveBeenCalledWith(
          validOptions,
          'Invalid Query',
        );
      });

      test('should call the mapping function', async () => {
        expect(mockedMapAddress).toHaveBeenCalledTimes(1);
      });
    });

    describe('when result has no valid Australian addresses', () => {
      let results;

      beforeEach(async () => {
        mockedGetSuggestion.mockResolvedValue(mockApiResultInvalid);
        results = await service.getPOISearchResults('Invalid Query');
      });

      test('should return empty array if no valid Australian addresses', async () => {
        expect(results).toEqual([]);
      });
    });
  });
});
