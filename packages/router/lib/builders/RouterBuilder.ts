import {RouteOptions} from "../interaces/RouteOptions";
import {IRoute, Router} from "express";
import {RouteBuilder} from "./RouteBuilder";

export class RouterBuilder {

    private _path: string;
    private _middleware?: any[];
    private _router: Router;

    constructor(routePath: string, middleware?: any[]) {
        this._path = routePath;
        this._router = Router();
        if (middleware) {
            this._middleware = middleware;
        }

    }

    get(path: string, options: RouteOptions, middleware: []): void {
        this._router.get(path, middleware);
    }

    post(path: string, options: RouteOptions, middleware: []): void {
        this._router.post(path, middleware);

    }

    put(path: string, options: RouteOptions, middleware: []): void {
        this._router.put(path, middleware);

    }

    delete(path: string, options: RouteOptions, middleware: []): void {
        this._router.delete(path, middleware);
    }

    route(name: string): RouteBuilder {
        return new RouteBuilder(name);
    }

    construct(): any {
        return {name: this._path, router: this._router}
    }

}
