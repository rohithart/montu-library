import { DynamicModule, Module, Provider } from '@nestjs/common';
import { AddressModuleOptions } from './AddressModuleOptions';
import { AddressService } from './address.service';

@Module({})
export class AddressModule {
  static forRoot(options: AddressModuleOptions): DynamicModule {
    const AddressOptionsProvider: Provider = {
      provide: 'ADDRESS_MODULE_OPTIONS',
      useValue: options,
    };

    return {
      module: AddressModule,
      providers: [AddressOptionsProvider, AddressService],
      exports: [AddressService],
      global: true,
    };
  }
}
