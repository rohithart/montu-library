import { AddressSuggestion } from '../models/AddressSuggestion';

export interface AddressProvider {
  getSuggestions(query: string): Promise<AddressSuggestion[]>;
}
