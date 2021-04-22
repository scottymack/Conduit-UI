import ConduitGrpcSdk, {
  ConduitRoute,
  ConduitRouteActions,
  ConduitRouteReturnDefinition,
  ConduitSocket,
  constructRoute,
  constructSocket,
  GrpcServer,
  RouterRequest,
  RouterResponse,
  SocketRequest,
  SocketResponse,
  TYPE,
} from '@quintessential-sft/conduit-grpc-sdk';
import { isArray, isNil } from 'lodash';
import * as grpc from 'grpc';

export class ChatRoutes {
  private database: any;

  constructor(readonly server: GrpcServer, private readonly grpcSdk: ConduitGrpcSdk) {
    const self = this;
    grpcSdk.waitForExistence('database-provider').then(() => {
      self.database = this.grpcSdk.databaseProvider;
    });
  }

  async createRoom(call: RouterRequest, callback: RouterResponse) {
    const { roomName, users } = JSON.parse(call.request.params);
    const { user } = JSON.parse(call.request.context);

    if (isNil(users) || !isArray(users) || users.length === 0) {
      return callback({ code: grpc.status.INVALID_ARGUMENT, message: 'users array is required and cannot be empty'});
    }

    try {
      await this.validateUsersInput(users);
    } catch (e) {
      return callback({ code: e.code, message: e.message });
    }

    let errorMessage: string | null = null;
    const room = await this.database.create('ChatRoom', { name: roomName, participants: Array.from(new Set([user._id, ...users])) })
      .catch((e: Error) => {
        errorMessage = e.message;
      });
    if (!isNil(errorMessage)) {
      return callback({ code: grpc.status.INTERNAL, message: errorMessage });
    }

    callback(null, { result: JSON.stringify({ roomId: room._id })});
  }

  async addUserToRoom(call: RouterRequest, callback: RouterResponse) {
    const { roomId, users } = JSON.parse(call.request.params);
    const { user } = JSON.parse(call.request.context);

    if (isNil(roomId) || isNil(users) || !isArray(users) || users.length === 0) {
      return callback({ code: grpc.status.INVALID_ARGUMENT, message: 'roomId and users array are required' });
    }

    let errorMessage: string | null = null;
    const room = await this.database.findOne('ChatRoom', { _id: roomId })
      .catch((e: Error) => {
        errorMessage = e.message;
      });
    if (!isNil(errorMessage)) {
      return callback({ code: grpc.status.INTERNAL, message: errorMessage });
    }

    if (isNil(room) || !room.participants.includes(user._id)) {
      return callback({ code: grpc.status.INVALID_ARGUMENT, message: 'Room does not exist' });
    }

    try {
      await this.validateUsersInput(users);
    } catch (e) {
      return callback({ code: e.code, message: e.message });
    }

    room.participants = Array.from(new Set([...room.participants, ...users]));
    await this.database.findByIdAndUpdate('ChatRoom', room._id, room)
      .catch((e: Error) => {
        errorMessage = e.message;
      });
    if (!isNil(errorMessage)) {
      return callback({ code: grpc.status.INTERNAL, message: errorMessage });
    }

    callback(null, { result: 'users added successfully' });
  }

  async leaveRoom(call: RouterRequest, callback: RouterResponse) {
    const { roomId } = JSON.parse(call.request.params);
    const { user } = JSON.parse(call.request.context);

    if (isNil(roomId)) {
      return callback({ code: grpc.status.INVALID_ARGUMENT, message: 'roomId is required' });
    }

    let errorMessage: string | null = null;
    const room = await this.database.findOne('ChatRoom', { _id: roomId })
      .catch((e: Error) => {
        errorMessage = e.message;
      });
    if (!isNil(errorMessage)) {
      return callback({ code: grpc.status.INTERNAL, message: errorMessage });
    }

    if (isNil(room)) {
      return callback({ code: grpc.status.INVALID_ARGUMENT, message: 'Room does not exist' });
    }

    const index = room.participants.indexOf(user._id);
    if (index > -1) {
      room.participants.splice(index, 1);
      await this.database.findByIdAndUpdate('ChatRoom', room._id, room)
        .catch((e: Error) => {
          errorMessage = e.message;
        });
      if (!isNil(errorMessage)) {
        return callback({ code: grpc.status.INTERNAL, message: errorMessage });
      }
    }

    callback(null, { result: 'ok' });
  }

  async getMessages(call: RouterRequest, callback: RouterResponse) {
    const { roomId, skip, limit } = JSON.parse(call.request.params);
    const { user } = JSON.parse(call.request.context);

    let messagesPromise;
    let countPromise;
    let errorMessage: string | null = null;
    if (isNil(roomId)) {
      const rooms = await this.database.findMany('ChatRoom', { participants: user._id })
        .catch((e: Error) => (errorMessage = e.message));
      if (!isNil(errorMessage)) {
        return callback({ code: grpc.status.INTERNAL, message: errorMessage });
      }

      const query = { room: { $in: rooms.map((room: any) => room._id) }};
      messagesPromise = this.database.findMany('ChatMessage', query, undefined, skip, limit, '-createdAt');
      countPromise = this.database.countDocuments('ChatMessage', query);
    } else {
      const room = await this.database.findOne('ChatRoom', { _id: roomId })
        .catch((e: Error) => (errorMessage = e.message));
      if (!isNil(errorMessage)) {
        return callback({ code: grpc.status.INTERNAL, message: errorMessage });
      }
      if (isNil(room) || !room.participants.includes(user._id)) {
        return callback({ code: grpc.status.INVALID_ARGUMENT, message: 'room does not exist'})
      }
      messagesPromise = this.database.findMany(
        'ChatMessage',
        {
          room: roomId
        },
        undefined,
        skip,
        limit,
        '-createdAt'
      );

      countPromise = this.database.countDocuments('ChatMessage', { room: roomId });
    }

    Promise.all([messagesPromise, countPromise])
      .then((res) => {
        callback(null, { result: JSON.stringify({ messages: res[0], count: res[1] }) });
      })
      .catch((e: Error) => {
        callback({
          code: grpc.status.INTERNAL,
          message: e.message
        });
      });
  }

  async deleteMessage(call: RouterRequest, callback: RouterResponse) {
    const { messageId } = JSON.parse(call.request.params);
    const { user } = JSON.parse(call.request.context);

    let errorMessage: string | null = null;
    const message = await this.database.findOne('ChatMessage', { _id: messageId })
      .catch((e: Error) => {
        errorMessage = e.message;
      });

    if (!isNil(errorMessage)) {
      return callback({ code: grpc.status.INTERNAL, message: errorMessage });
    }

    if (isNil(message) || message.senderUser !== user._id) {
      return callback({ code: grpc.status.INVALID_ARGUMENT, message: 'invalid message id' });
    }

    this.database.deleteOne('ChatMessage', { _id: messageId })
      .then(() => {
        callback(null, { result: 'message deleted successfully' });
      })
      .catch((e: Error) => {
        callback({ code: grpc.status.INTERNAL, message: e.message });
      });
  }

  async editMessage(call: RouterRequest, callback: RouterResponse) {
    const { messageId, newMessage } = JSON.parse(call.request.params);
    const { user } = JSON.parse(call.request.context);

    let errorMessage: string | null = null;
    const message = await this.database.findOne('ChatMessage', { _id: messageId })
      .catch((e: Error) => {
        errorMessage = e.message;
      });

    if (!isNil(errorMessage)) {
      return callback({ code: grpc.status.INTERNAL, message: errorMessage });
    }

    if (isNil(message) || message.senderUser !== user._id) {
      return callback({ code: grpc.status.INVALID_ARGUMENT, message: 'invalid message id' });
    }

    message.message = newMessage;
    this.database.findByIdAndUpdate('ChatMessage', message._id, message)
      .then(() => {
        callback(null, { result: 'message changed successfully' });
      })
      .catch((e: Error) => {
        callback({ code: grpc.status.INTERNAL, message: e.message });
      });
  }

  async connect(call: SocketRequest, callback: SocketResponse) {
    const { user } = JSON.parse(call.request.context);

    let errorMessage: string | null = null;
    const rooms = await this.database.findMany('ChatRoom', { participants: user._id })
      .catch((e: Error) => {
        errorMessage = e.message;
      });
    if (!isNil(errorMessage)) {
      return callback({ code: grpc.status.INTERNAL, message: errorMessage });
    }

    callback(null, { rooms: rooms?.map((room: any) => room._id) });
  }

  async onMessage(call: SocketRequest, callback: SocketResponse) {
    const { user } = JSON.parse(call.request.context);
    const [ roomId, message ] = JSON.parse(call.request.params);

    let errorMessage: string | null = null;
    const room = await this.database.findOne('ChatRoom', { _id: roomId })
      .catch((e: Error) => {
        errorMessage = e.message;
      });
    if (!isNil(errorMessage)) {
      return callback({ code: grpc.status.INTERNAL, message: errorMessage });
    }

    if (isNil(room) || !room.participants.includes(user._id)) {
      return callback({ code: grpc.status.INVALID_ARGUMENT, message: 'invalid room' });
    }

    this.database.create('ChatMessage', {
      message,
      senderUser: user._id,
      room: roomId,
      readBy: [user._id]
    }).then(() => {
      callback(null, {
        event: 'message',
        receivers: [roomId],
        data: JSON.stringify({ sender: user._id, message, room: roomId })
      });
    }).catch((e: Error) => {
      callback({
        code: grpc.status.INTERNAL,
        message: e.message
      });
    });
  }

  async onMessagesRead(call: SocketRequest, callback: SocketResponse) {
    const { user } = JSON.parse(call.request.context);
    const [ roomId ] = JSON.parse(call.request.params);

    let errorMessage: string | null = null;
    const room = await this.database.findOne('ChatRoom', { _id: roomId })
      .catch((e: Error) => (errorMessage = e.message));
    if (!isNil(errorMessage)) {
      return callback({
        code: grpc.status.INTERNAL,
        message: errorMessage
      });
    }

    if (isNil(room) || !room.participants.includes(user._id)) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: 'invalid room'
      });
    }

    const filterQuery = {
      room: room._id,
      readBy: { $ne: user._id }
    };

    this.database.updateMany('ChatMessage', filterQuery, { $push: { readBy: user._id } })
      .then(() => {
        callback(null, {
          event: 'messagesRead',
          receivers: [room._id],
          data: JSON.stringify({ room: room._id, readBy: user._id })
        });
      })
      .catch((e: Error) => {
        callback({
          code: grpc.status.INTERNAL,
          message: e.message
        });
      });
  }

  private async validateUsersInput(users: any[]) {
    const uniqueUsers = Array.from(new Set(users));
    let errorMessage: string | null = null;
    const usersToBeAdded = await this.database.findMany('User', { _id: { $in: uniqueUsers } })
      .catch((e: Error) => {
        errorMessage = e.message;
      });
    if (!isNil(errorMessage)) {
      return Promise.reject({ code: grpc.status.INTERNAL, message: errorMessage });
    }
    if (usersToBeAdded.length != uniqueUsers.length) {
      const dbUserIds = usersToBeAdded.map((user: any) => user._id);
      const wrongIds = uniqueUsers.filter((id) => !dbUserIds.includes(id));
      if (wrongIds.length != 0) {
        return Promise.reject({ code: grpc.status.INVALID_ARGUMENT, message: `users [${wrongIds}] do not exist` });
      }
    }
  }

  async registerRoutes() {
    const activeRoutes = await this.getRegisteredRoutes();

    this.grpcSdk.router
      .registerRouter(this.server, activeRoutes, {
        connect: this.connect.bind(this),
        createRoom: this.createRoom.bind(this),
        addUserToRoom: this.addUserToRoom.bind(this),
        leaveRoom: this.leaveRoom.bind(this),
        getMessages: this.getMessages.bind(this),
        deleteMessage: this.deleteMessage.bind(this),
        editMessage: this.editMessage.bind(this),
        onMessage: this.onMessage.bind(this),
        onMessagesRead: this.onMessagesRead.bind(this),
      })
      .catch((err: Error) => {
        console.log('Failed to register routes for module');
        console.log(err);
      });
  }

  private async getRegisteredRoutes(): Promise<any[]> {
    let routesArray: any[] = [];

    routesArray.push(
      constructRoute(
        new ConduitRoute(
          {
            path: '/new',
            action: ConduitRouteActions.POST,
            bodyParams: {
              roomName: TYPE.String,
              users: [TYPE.String]
            },
            middlewares: ['authMiddleware'],
          },
          new ConduitRouteReturnDefinition('CreateRoom', {
            roomId: TYPE.String
          }),
          'createRoom'
        )
      )
    );

    routesArray.push(
      constructRoute(
        new ConduitRoute(
          {
            path: '/add/:roomId',
            action: ConduitRouteActions.UPDATE,
            urlParams: {
              roomId: TYPE.String,
            },
            bodyParams: {
              users: [TYPE.String]
            },
            middlewares: ['authMiddleware'],
          },
          new ConduitRouteReturnDefinition('AddUserToRoomResponse', 'String'),
          'addUserToRoom',
        ),
      ),
    );

    routesArray.push(
      constructRoute(
        new ConduitRoute(
          {
            path: '/leave/:roomId',
            action: ConduitRouteActions.UPDATE,
            urlParams: {
              roomId: TYPE.String,
            },
            middlewares: ['authMiddleware'],
          },
          new ConduitRouteReturnDefinition('LeaveRoom', 'String'),
          'leaveRoom',
        ),
      ),
    );

    routesArray.push(
      constructRoute(
        new ConduitRoute(
          {
            path: '/messages',
            action: ConduitRouteActions.GET,
            queryParams: {
              roomId: TYPE.String,
              skip: TYPE.Number,
              limit: TYPE.Number,
            },
            middlewares: ['authMiddleware']
          },
          new ConduitRouteReturnDefinition('MessagesResponse', {
            messages: [{
              _id: TYPE.String,
              message: TYPE.String,
              senderUser: TYPE.String,
              room: TYPE.String,
              readBy: [TYPE.String],
              createdAt: TYPE.Date,
              updatedAt: TYPE.Date,
            }],
            count: TYPE.Number
          }),
          'getMessages'
        )
      )
    );

    const config = await this.grpcSdk.config.get('chat');
    if (config.allowMessageDelete) {
      routesArray.push(
        constructRoute(
          new ConduitRoute(
            {
              path: '/messages/:messageId',
              action: ConduitRouteActions.DELETE,
              urlParams: {
                messageId: TYPE.String
              },
              middlewares: ['authMiddleware']
            },
            new ConduitRouteReturnDefinition('DeleteMessageResponse', 'String'),
            'deleteMessage'
          )
        )
      );
    }

    if (config.allowMessageEdit) {
      routesArray.push(
        constructRoute(
          new ConduitRoute(
            {
              path: '/messages/:messageId',
              action: ConduitRouteActions.UPDATE,
              urlParams: {
                messageId: TYPE.String
              },
              bodyParams: {
                newMessage: TYPE.String
              },
              middlewares: ['authMiddleware']
            },
            new ConduitRouteReturnDefinition('EditMessageResponse', 'String'),
            'editMessage'
          )
        )
      );
    }

    routesArray.push(
      constructSocket(
        new ConduitSocket(
          {
            path: '/',
            middlewares: ['authMiddleware'],
          },
          {
            'connect': {
              handler: 'connect',
            },
            'message': {
              handler: 'onMessage',
              params: [TYPE.String, TYPE.String],
              returnType: new ConduitRouteReturnDefinition('MessageResponse', {
                sender: TYPE.String,
                message: TYPE.String,
                room: TYPE.String
              })
            },
            'messagesRead': {
              handler: 'onMessagesRead',
              params: [TYPE.String],
              returnType: new ConduitRouteReturnDefinition('MessagesReadResponse', {
                room: TYPE.String,
                readBy: TYPE.String
              })
            }
          },
        ),
      ),
    );

    return routesArray;
  }
}