import { FileHandlers } from '../handlers/file';
import ConduitGrpcSdk, {
  GrpcServer,
  RouterRequest,
  RouterResponse,
} from '@quintessential-sft/conduit-grpc-sdk';
import { isNil } from 'lodash';
import { status } from '@grpc/grpc-js';

let paths = require('./admin.json').functions;

export class AdminRoutes {
  constructor(
    readonly server: GrpcServer,
    private readonly grpcSdk: ConduitGrpcSdk,
    private readonly fileHandlers: FileHandlers
  ) {
    this.grpcSdk.admin
      .registerAdmin(server, paths, {
        createFile: this.fileHandlers.createFile.bind(this.fileHandlers),
        deleteFile: this.fileHandlers.deleteFile.bind(this.fileHandlers),
        getFile: this.fileHandlers.getFile.bind(this.fileHandlers),
        updateFile: this.fileHandlers.updateFile.bind(this.fileHandlers),
        getFileUrl: this.fileHandlers.getFileUrl.bind(this.fileHandlers),
        getFileData: this.fileHandlers.getFileData.bind(this.fileHandlers),
        createFolder: this.createFolder.bind(this),
        getFolders: this.getFolders.bind(this),
        getFiles: this.getFiles.bind(this),
        getContainers: this.getContainers.bind(this),
        createContainer: this.createContainer.bind(this),
        deleteFolder: this.deleteFolder.bind(this),
        deleteContainer: this.deleteContainer.bind(this),
      })
      .catch((err: Error) => {
        console.log('Failed to register admin routes for module');
        console.log(err);
      });
  }

  async createFolder(call: RouterRequest, callback: RouterResponse) {
    const { name, container, isPublic } = JSON.parse(call.request.params);

    if (isNil(name)) {
      return callback({
        code: status.INVALID_ARGUMENT,
        message: 'Name is required',
      });
    }
    if (isNil(container)) {
      return callback({
        code: status.INVALID_ARGUMENT,
        message: 'Container is required',
      });
    }
    let folder = await this.grpcSdk.databaseProvider!.findOne('_StorageFolder', {
      name,
      container,
    });
    if (isNil(folder)) {
      folder = await this.grpcSdk.databaseProvider!.create('_StorageFolder', {
        name,
        container,
        isPublic,
      });
      let exists = await this.fileHandlers.storage
        .container(container)
        .folderExists(name);
      if (!exists) {
        await this.fileHandlers.storage.container(container).createFolder(name);
      }
    } else {
      return callback({
        code: status.INVALID_ARGUMENT,
        message: 'Folder already exists',
      });
    }
    return callback(null, { result: JSON.stringify(folder) });
  }

  async deleteFolder(call: RouterRequest, callback: RouterResponse) {
    const { name, container } = JSON.parse(call.request.params);

    if (isNil(name)) {
      return callback({
        code: status.INVALID_ARGUMENT,
        message: 'Name is required',
      });
    }
    if (isNil(container)) {
      return callback({
        code: status.INVALID_ARGUMENT,
        message: 'Container is required',
      });
    }
    let folder = await this.grpcSdk.databaseProvider!.findOne('_StorageFolder', {
      name,
      container,
    });
    if (isNil(folder)) {
      return callback({
        code: status.INVALID_ARGUMENT,
        message: 'Folder does not exist',
      });
    } else {
      await this.fileHandlers.storage.container(container).deleteFolder(name);
      await this.grpcSdk.databaseProvider!.deleteOne('_StorageFolder', {
        name,
        container,
      });
    }
    return callback(null, { result: 'OK' });
  }

  async createContainer(call: RouterRequest, callback: RouterResponse) {
    const { name, isPublic } = JSON.parse(call.request.params);

    if (isNil(name)) {
      return callback({
        code: status.INVALID_ARGUMENT,
        message: 'Name is required',
      });
    }
    try {
      let container = await this.grpcSdk.databaseProvider!.findOne('_StorageContainer', {
        name,
      });
      if (isNil(container)) {
        let exists = await this.fileHandlers.storage.containerExists(name);
        if (!exists) {
          await this.fileHandlers.storage.createContainer(name);
        }
        container = await this.grpcSdk.databaseProvider!.create('_StorageContainer', {
          name,
          isPublic,
        });
      } else {
        return callback({
          code: status.INVALID_ARGUMENT,
          message: 'Container already exists',
        });
      }
      return callback(null, { result: JSON.stringify(container) });
    } catch (e) {
      return callback({
        code: status.INTERNAL,
        message: e.message ?? 'Something went wrong',
      });
    }
  }

  async deleteContainer(call: RouterRequest, callback: RouterResponse) {
    const { name } = JSON.parse(call.request.params);

    if (isNil(name)) {
      return callback({
        code: status.INVALID_ARGUMENT,
        message: 'Name is required',
      });
    }
    try {
      let container = await this.grpcSdk.databaseProvider!.findOne('_StorageContainer', {
        name,
      });
      if (isNil(container)) {
        return callback({
          code: status.INVALID_ARGUMENT,
          message: 'Container does not exist',
        });
      } else {
        await this.fileHandlers.storage.deleteContainer(name);
        await this.grpcSdk.databaseProvider!.deleteOne('_StorageContainer', {
          name,
        });
      }
      return callback(null, { result: JSON.stringify(container) });
    } catch (e) {
      return callback({
        code: status.INTERNAL,
        message: e.message ?? 'Something went wrong',
      });
    }
  }

  async getFolders(call: RouterRequest, callback: RouterResponse) {
    const { skip, limit, container, parent } = JSON.parse(call.request.params);
    if (isNil(skip) || isNil(limit)) {
      return callback({
        code: status.INVALID_ARGUMENT,
        message: 'Skip and limit are required',
      });
    }
    let query: { container: string; name?: any } = {
      container,
    };
    if (!isNil(parent)) {
      query.name = { $regex: `${parent}\/\w+`, $options: 'i' };
    }

    let folders = await this.grpcSdk.databaseProvider!.findMany(
      '_StorageFolder',
      query,
      undefined,
      skip,
      limit
    );
    let folderCount = await this.grpcSdk.databaseProvider!.countDocuments(
      '_StorageFolder',
      query
    );

    return callback(null, { result: JSON.stringify({ folders, folderCount }) });
  }

  async getContainers(call: RouterRequest, callback: RouterResponse) {
    const { skip, limit } = JSON.parse(call.request.params);
    if (isNil(skip) || isNil(limit)) {
      return callback({
        code: status.INVALID_ARGUMENT,
        message: 'Skip and limit are required',
      });
    }

    let containers = await this.grpcSdk.databaseProvider!.findMany(
      '_StorageContainer',
      {},
      undefined,
      skip,
      limit
    );
    let containersCount = await this.grpcSdk.databaseProvider!.countDocuments(
      '_StorageContainer',
      {}
    );

    return callback(null, { result: JSON.stringify({ containers, containersCount }) });
  }

  async getFiles(call: RouterRequest, callback: RouterResponse) {
    const { skip, limit, folder, container, search } = JSON.parse(call.request.params);
    if (isNil(skip) || isNil(limit)) {
      return callback({
        code: status.INVALID_ARGUMENT,
        message: 'Skip and limit are required',
      });
    }

    if (isNil(container)) {
      return callback({
        code: status.INVALID_ARGUMENT,
        message: 'Container is required',
      });
    }

    let query: { container: string; folder?: string; name?: any } = { container };

    if (!isNil(folder)) {
      query.folder = folder;
    }
    if (!isNil(search)) {
      query.name = { $regex: `.*${search}.*`, $options: 'i' };
    }

    let files = await this.grpcSdk.databaseProvider!.findMany(
      'File',
      query,
      undefined,
      skip,
      limit
    );
    let filesCount = await this.grpcSdk.databaseProvider!.countDocuments('File', query);

    return callback(null, { result: JSON.stringify({ files, filesCount }) });
  }
}