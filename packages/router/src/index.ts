import {Application, NextFunction, Router, Request, Response} from "express";
import {RouterBuilder} from "./builders";
import {IConduitRouter} from "@conduit/sdk";
import {ConduitRoutingController, GraphQLController} from "./controllers";


export class ConduitDefaultRouter implements IConduitRouter {

    private _app: Application;
    private _internalRouter: ConduitRoutingController;
    private _graphQL?: GraphQLController;
    private _globalMiddlewares: string[];
    private _routes: any[];

    constructor(app: Application) {
        this._app = app;
        this._routes = [];
        this._globalMiddlewares = [];
        this._internalRouter = new ConduitRoutingController(this._app);
    }

    initGraphQL() {
        this._graphQL = new GraphQLController(this._app);
    }

    registerGlobalMiddleware(name: string, middleware: any) {
        this._globalMiddlewares.push(name);
        this._internalRouter.registerMiddleware(middleware);
    }

    getGlobalMiddlewares(): string[] {
        return this._globalMiddlewares;
    }

    hasGlobalMiddleware(name: string): boolean {
        return this._globalMiddlewares.indexOf(name) !== -1;
    }

    registerRouter(routerBuilder: RouterBuilder) {
        let {name, router} = routerBuilder.construct();
        this._routes.push(name);
        this._internalRouter.registerRoute(name, router);
    }

    registerExpressRouter(name: string, router: Router) {
        this._routes.push(name);
        this._internalRouter.registerRoute(name, router);
    }

    registerDirectRouter(name: string, router: (req: Request, res: Response, next: NextFunction) => void) {
        this._routes.push(name);
        this._internalRouter.registerRoute(name, router);
    }

    getRegisteredRoutes() {
        return this._routes;
    }

}


export * from './builders';


