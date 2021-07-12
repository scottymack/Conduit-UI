import PaymentsConfigSchema from './config';
import { isNil } from 'lodash';
import ConduitGrpcSdk, {
  GrpcServer,
  GrpcRequest,
  GrpcResponse,
  SetConfigRequest,
  SetConfigResponse,
  wrapCallObjectForRouter,
  wrapCallbackFunctionForRouter,
} from '@quintessential-sft/conduit-grpc-sdk';
import path from 'path';
import * as grpc from 'grpc';
import { PaymentsRoutes } from './routes/Routes';
import * as models from './models';
import { AdminHandlers } from './admin/admin';
import { IamportHandlers } from './handlers/iamport';
import { StripeHandlers } from './handlers/stripe';

type CreateIamportPaymentRequest = GrpcRequest<{
  productId: string,
  quantity: number,
  userId: string
}>;

type CreateIamportPaymentResponse = GrpcResponse<{
  merchant_uid: string,
  amount: number
}>;

type CompleteIamportPaymentRequest = GrpcRequest<{
  imp_uid: string,
  merchant_uid: string
}>;

type CompleteIamportPaymentResponse = GrpcResponse<{ success: boolean }>;

type CreateStripePaymentRequest = GrpcRequest<{
  productId: string,
  userId: string,
  saveCard: boolean,
}>;

type CreateStripePaymentResponse = GrpcResponse<{
  clientSecret: string,
  paymentId: string,
}>;

type CancelStripePaymentRequest = GrpcRequest<{
  paymentId: string,
  userId: string,
}>;

type CancelStripePaymentResponse = GrpcResponse<{
  success: boolean,
}>;

type RefundStripePaymentRequest = GrpcRequest<{
  paymentId: string,
  userId: string,
}>;

type RefundStripePaymentResponse = GrpcResponse<{
  success: boolean,
}>;

export default class PaymentsModule {
  private database: any;
  private _admin: AdminHandlers;
  private isRunning: boolean = false;
  private readonly _url: string;
  private readonly grpcServer: GrpcServer;
  private _router: PaymentsRoutes;
  private iamportHandlers: IamportHandlers | null;
  private stripeHandlers: StripeHandlers | null;

  constructor(private readonly grpcSdk: ConduitGrpcSdk) {
    this.grpcServer = new GrpcServer(process.env.SERVICE_URL);
    this._url = this.grpcServer.url;
    this.grpcServer
      .addService(path.resolve(__dirname, './payments.proto'), 'payments.Payments', {
        setConfig: this.setConfig.bind(this),
        createIamportPayment: this.createIamportPayment.bind(this),
        completeIamportPayment: this.completeIamportPayment.bind(this),
        createStripePayment: this.createStripePayment.bind(this),
        cancelStripePayment: this.cancelStripePayment.bind(this),
        refundStripePayment: this.refundStripePayment.bind(this),
      })
      .then(() => {
        return this.grpcServer.start();
      })
      .then(() => {
        console.log('Grpc server is online');
      })
      .catch((err: Error) => {
        console.log('Failed to initialize server');
        console.error(err);
        process.exit(-1);
      });

    this.grpcSdk
      .waitForExistence('database-provider')
      .then(() => {
        return this.grpcSdk.initializeEventBus();
      })
      .then(() => {
        this.grpcSdk.bus?.subscribe('payments', (message: string) => {
          if (message === 'config-update') {
            this.enableModule()
              .then(() => {
                console.log('Updated payments configuration');
              })
              .catch(() => {
                console.log('Failed to update payments config');
              });
          }
        });
      })
      .catch(() => {
        console.log('Bus did not initialize!');
      })
      .then(() => {
        return this.grpcSdk.config.get('payments');
      })
      .catch(() => {
        return this.grpcSdk.config.updateConfig(
          PaymentsConfigSchema.getProperties(),
          'payments'
        );
      })
      .then(() => {
        return this.grpcSdk.config.addFieldstoConfig(
          PaymentsConfigSchema.getProperties(),
          'payments'
        );
      })
      .catch(() => {
        console.log('payments config did not update');
      })
      .then((paymentsConfig: any) => {
        if (paymentsConfig.active) {
          return this.enableModule();
        }
      })
      .catch(console.log);
  }

  get url(): string {
    return this._url;
  }

  async setConfig(call: SetConfigRequest, callback: SetConfigResponse) {
    const newConfig = JSON.parse(call.request.newConfig);
    if (
      isNil(newConfig.active) ||
      isNil(newConfig.providerName) ||
      isNil(newConfig[newConfig.providerName])
    ) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: 'Invalid configuration given',
      });
    }

    try {
      PaymentsConfigSchema.load(newConfig).validate();
    } catch (e) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: 'Invalid configuration given',
      });
    }

    let errorMessage: string | null = null;
    const updateResult = await this.grpcSdk.config
      .updateConfig(newConfig, 'payments')
      .catch((e: Error) => (errorMessage = e.message));
    if (!isNil(errorMessage)) {
      return callback({ code: grpc.status.INTERNAL, message: errorMessage });
    }

    const paymentsConfig = await this.grpcSdk.config.get('payments');
    if (paymentsConfig.active) {
      await this.enableModule().catch((e: Error) => (errorMessage = e.message));
      if (!isNil(errorMessage))
        return callback({ code: grpc.status.INTERNAL, message: errorMessage });
      this.grpcSdk.bus?.publish('payments', 'config-update');
    } else {
      return callback({ code: grpc.status.INTERNAL, message: 'Module is not active' });
    }
    if (!isNil(errorMessage)) {
      return callback({ code: grpc.status.INTERNAL, message: errorMessage });
    }

    return callback(null, { updatedConfig: JSON.stringify(updateResult) });
  }

  async createIamportPayment(call: CreateIamportPaymentRequest, callback: CreateIamportPaymentResponse) {
    const productId = call.request.productId;
    const quantity = call.request.quantity;
    const userId = call.request.userId === '' ? undefined : call.request.userId;

    if (isNil(this.iamportHandlers)) {
      return callback({ code: grpc.status.INTERNAL, message: 'Iamport is deactivated' });
    }

    try {
      const res = await this.iamportHandlers.createPayment(productId, quantity, userId);

      return callback(null, res);
    } catch (e) {
      return callback({ code: e.code, message: e.message });
    }
  }

  async completeIamportPayment(call: CompleteIamportPaymentRequest, callback: CompleteIamportPaymentResponse) {
    const imp_uid = call.request.imp_uid;
    const merchant_uid = call.request.merchant_uid;

    if (isNil(this.iamportHandlers)) {
      return callback({ code: grpc.status.INTERNAL, message: 'Iamport is deactivated' });
    }

    if (isNil(imp_uid) || isNil(merchant_uid) || imp_uid === '' || merchant_uid === '') {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: 'imp_uid and merchant_uid are required',
      });
    }

    try {
      const success = await this.iamportHandlers.completePayment(imp_uid, merchant_uid);
      return callback(null, { success });
    } catch (e) {
      return callback({ code: e.code, message: e.message });
    }
  }

  async createStripePayment(call: CreateStripePaymentRequest, callback: CreateStripePaymentResponse) {
    if (isNil(this.stripeHandlers)) {
      return callback({ code: grpc.status.INTERNAL, message: 'Stripe is deactivated' });
    }

    await this.stripeHandlers.createPayment(wrapCallObjectForRouter(call), wrapCallbackFunctionForRouter(callback));
  }

  async cancelStripePayment(call: CancelStripePaymentRequest, callback: CancelStripePaymentResponse) {
    if (isNil(this.stripeHandlers)) {
      return callback({ code: grpc.status.INTERNAL, message: 'Stripe is deactivated' });
    }

    await this.stripeHandlers.cancelPayment(wrapCallObjectForRouter(call), wrapCallbackFunctionForRouter(callback));
  }

  async refundStripePayment(call: RefundStripePaymentRequest, callback: RefundStripePaymentResponse) {
    if (isNil(this.stripeHandlers)) {
      return callback({ code: grpc.status.INTERNAL, message: 'Stripe is deactivated' });
    }

    await this.stripeHandlers.refundPayment(wrapCallObjectForRouter(call), wrapCallbackFunctionForRouter(callback));
  }

  private async enableModule() {
    if (!this.isRunning) {
      this.database = this.grpcSdk.databaseProvider;
      this._router = new PaymentsRoutes(this.grpcServer, this.grpcSdk);
      this.stripeHandlers = await this._router.getStripe();
      this.iamportHandlers = await this._router.getIamport();
      this._admin = new AdminHandlers(
        this.grpcServer,
        this.grpcSdk,
        this.stripeHandlers
      );
      await this.registerSchemas();
      this.isRunning = true;
    }
    await this._router.registerRoutes();
  }

  private registerSchemas() {
    const promises = Object.values(models).map((model) => {
      return this.database.createSchemaFromAdapter(model);
    });
    return Promise.all(promises);
  }
}