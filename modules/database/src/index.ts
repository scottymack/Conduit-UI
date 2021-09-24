import { DatabaseProvider } from './DatabaseProvider';
import ConduitGrpcSdk from '@quintessential-sft/conduit-grpc-sdk';
import process from 'process';

if (!process.env.CONDUIT_SERVER) {
  throw new Error('Conduit server URL not provided');
}
let grpcSdk = new ConduitGrpcSdk(process.env.CONDUIT_SERVER, 'database-provider');
let databaseProvider = new DatabaseProvider(grpcSdk);
databaseProvider
  .initialize()
  .then(() => {
    let url =
      (process.env.REGISTER_NAME === 'true' ? 'database-provider:' : '0.0.0.0:') +
      databaseProvider.port;
    return grpcSdk.config.registerModule('database-provider', url);
  })
  .catch((err: Error) => {
    console.log('Failed to initialize server');
    console.error(err);
    process.exit(-1);
  })
  .then(() => {
    return databaseProvider.activate();
  })
  .catch((err: Error) => {
    console.log('Failed to active module');
    console.error(err);
  });