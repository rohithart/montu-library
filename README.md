# Montu Library

This is a NestJS library for Montu with their 3rd party integrations.

## Assumptions
- This library will be used for NestJS applications.
- Only POI search has been implemented as a POC, other searches can be implemented.
- Provider interface has been kept in place to extend to other platforms like Google Search.
- If a `freeformAddress` is not found, address is not returned, this can be updated based on the requirement of the product for partial address.
- Result set has been set to 5 in the below example, which can be updated as per business requirement.
- Basic validations on edge cases has been considered, however may change according to business requirements.
- GH actions has been setup to semantically release versions of the library.
- GH actions has to be triggered manually, this can be set to run on PR or specific branches depending on business needs.
- An approval gate has been set in place, which will create a GH issue, which has to be addressed to release new version.
- `GH_TOKEN` for `.npmrc` file is not provided for security reasons. This has to be setup as environment variable in the service side.

### Build

```bash
$ yarn build
```

### Test

```bash
$ yarn test
```

### Test with coverage

```bash
$ yarn test:cov
```

## Usage
In `.npmrc`
```
@rohithart:registry=https://npm.pkg.github.com/
//npm.pkg.github.com/:_authToken={GH_TOKEN}
```

Install the dependency.
```bash
  yarn add @rohithart/montu-library
```

In `app.module.ts`
```ts
import { AddressModule } from '@rohithart/montu-library/modules';

@Module({
  imports: [
    ...
    AddressModule.forRoot({
      apiKey: process.env.TOMTOM_API_KEY, //TomTom API key to be specified as environment variable
      countrySet: 'AU',
      limit: 5,
    }),
  ]
})
```

In `address.service.ts`
```ts
import { AddressSuggestion } from '@rohithart/montu-library/models';
import { AddressService } from '@rohithart/montu-library/modules';

@Injectable()
export class AddressService {
  constructor(private readonly addressService: AddressService) {}

  async getPOISearchResults(query: string) {
    const address: AddressSuggestion[] = await this.addressService.getPOISearchResults('20 lomandra drive');
    return address;
  }
}
```

## CI/CD - Release new version
Releasing a new version of the library can be achieved by running the action on GitHub Actions.

## Installing the package locally

```bash
$ yarn link
$ yarn build:watch
```

Navigate to the repo (assuming it is `sample-app`) where the package has to be installed.

```bash
$ cd sample-app
```

Now use npm to link it.

```bash
$ yarn link @rohithart/montu-library
```
