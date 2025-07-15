export interface AddressSuggestion {
  fullAddress: string;
  countryCode: string;
  country: string;
  latitude: number;
  longitude: number;
  streetNumber?: string;
  streetName?: string;
  suburb?: string;
  postcode?: string;
  municipality?: string;
}
