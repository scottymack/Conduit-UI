import { Application } from 'express';
import { createServer, Server as httpServer } from 'http';
import { Server as IOServer, ServerOptions, Socket } from 'socket.io';
import { ConduitRouteReturnDefinition, ConduitSocket } from '@quintessential-sft/conduit-sdk';


export class SocketController {
  private readonly httpServer: httpServer;
  private io: IOServer;
  private readonly options: Partial<ServerOptions>;
  private _registeredNamespaces: Map<string, ConduitSocket>;

  constructor(private readonly app: Application) {
    this.httpServer = createServer(app);
    this.options = {};
    this.io = new IOServer(this.httpServer, this.options);
    this.httpServer.listen(process.env.SOCKET_PORT || 3001);
    this._registeredNamespaces = new Map();
  }

  registerConduitSocket(conduitSocket: ConduitSocket) {
    const namespace = conduitSocket.input.path;
    this._registeredNamespaces.set(namespace, conduitSocket);
    this.io.of(namespace).on('connect', socket => {

      socket.onAny((event, ...args) => {

        conduitSocket.executeRequest({
          event,
          socketId: socket.id,
          params: args
        })
        .then(() => {

        })
        .catch((e) => {
          console.error(e);
        });

      });

    });
  }
}
