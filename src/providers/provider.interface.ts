import { AddressSuggestion } from '../models/AddressSuggestion';

export interface AddressProvider {
  getPOISearchResults(query: string): Promise<AddressSuggestion[]>;
}
