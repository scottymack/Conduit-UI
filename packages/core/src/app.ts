import express, { NextFunction, Request, Response } from 'express';
import { ConduitApp } from './interfaces/ConduitApp';
import {
    ConduitRoute,
    ConduitRouteActions as Actions,
    ConduitRouteReturnDefinition as ReturnDefinition,
    ConduitSDK,
    IConduitRouter
} from '@quintessential-sft/conduit-sdk';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { ConduitLogger } from './utils/logging/logger';
import { MonitoringUtility } from './utils/monitoring';

export class App {
    private app: ConduitApp;
    private conduitRouter: IConduitRouter;
    private readonly logger: ConduitLogger;

    constructor() {

        this.initializeSdk();
        this.logger = new ConduitLogger();
    }

    get() {
        return this.app;
    }

    initialize() {
        this.conduitRouter = this.app.conduit.getRouter();
        this.registerGlobalMiddleware();
        this.registerRoutes();
        MonitoringUtility.getInstance().enableMetrics();
    }

    private initializeSdk() {
        const expressApp = express();
        const conduitSDK = ConduitSDK.getInstance(expressApp);

        const conduitExtras = {
            conduit: conduitSDK,
            initialized: false
        };
        this.app = Object.assign(expressApp, conduitExtras);
    }

    private registerGlobalMiddleware() {
        this.conduitRouter.registerGlobalMiddleware('cors', cors());
        this.conduitRouter.registerGlobalMiddleware('logger', this.logger.middleware);
        this.conduitRouter.registerGlobalMiddleware('jsonParser', express.json());
        this.conduitRouter.registerGlobalMiddleware('urlEncoding', express.urlencoded({extended: false}));
        this.conduitRouter.registerGlobalMiddleware('cookieParser', cookieParser());
        this.conduitRouter.registerGlobalMiddleware('staticResources', express.static(path.join(__dirname, 'public')));

        this.conduitRouter.registerGlobalMiddleware('errorLogger', this.logger.errorLogger);
        this.conduitRouter.registerGlobalMiddleware('errorCatch', (error: any, req: Request, res: Response, next: NextFunction) => {
            let status = error.status;
            if (status === null || status === undefined) status = 500;
            res.status(status).json({error: error.message});
        });
    }

    private registerRoutes() {
        this.conduitRouter.registerRoute(new ConduitRoute({
            path: '/',
            action: Actions.GET
        }, new ReturnDefinition('HelloResult', 'String'), async params => {
            return 'Hello there!';
        }));

        this.conduitRouter.registerRoute(new ConduitRoute({
            path: '/health',
            action: Actions.GET,
            queryParams: {
                shouldCheck: 'String'
            }
        }, new ReturnDefinition('HealthResult', 'String'), (params) => {
            return new Promise(((resolve, reject) => {
                if (this.app.initialized) {
                    resolve('Conduit is online!');
                } else {
                    throw new Error('Conduit is not active yet!');
                }
            }));
        }));
    }
}