import ConduitGrpcSdk from "@quintessential-sft/conduit-grpc-sdk";
import {SchemaController} from "../../controllers/schema.controller";
import {inputValidation, queryValidation} from "./utils";
import grpc from "grpc";
import {isNil} from "lodash";

export class CustomEndpointsAdmin {

    private database: any;

    constructor(private readonly grpcSdk: ConduitGrpcSdk, private readonly schemaController: SchemaController) {
        this.database = this.grpcSdk.databaseProvider;
    }

    async getCustomEndpoints(call: any, callback: any) {
        let errorMessage: string | null = null;

        const customEndpointsDocs = await this.database.findMany('CustomEndpoints', {}).catch((e: any) => errorMessage = e.message);
        if (!isNil(errorMessage)) return callback({code: grpc.status.INTERNAL, message: errorMessage});
        return callback(null, {result: JSON.stringify({results: customEndpointsDocs})});
    }

    async editCustomEndpoints(call: any, callback: any) {
        const params = JSON.parse(call.request.params);
        const id = params.id;
        const {inputs, queries, selectedSchema} = params
        if (isNil(id)) {
            return callback({
                code: grpc.status.INVALID_ARGUMENT,
                message: 'id must not be null'
            });
        }
        let errorMessage: string | null = null;
        delete params.id;
        const found = await this.database.findOne('CustomEndpoints', {
            _id: id
        }).catch((e: any) => errorMessage = e.message);
        if (isNil(found) || !isNil(errorMessage)) {
            return callback({
                code: grpc.status.INVALID_ARGUMENT,
                message: 'Schema not found'
            });
        }
        errorMessage = null;
        const findSchema = await this.database.findOne('SchemaDefinitions', {
            _id: selectedSchema
        }).catch((e: any) =>
            errorMessage = e.message);
        if (!isNil(errorMessage) || isNil(findSchema)) {
            return callback({
                code: grpc.status.INVALID_ARGUMENT,
                message: 'SelectedSchema not found'
            });
        }

        // todo checks for inputs & queries
        if (!Array.isArray(inputs)) {
            return callback({
                code: grpc.status.INVALID_ARGUMENT,
                message: 'Inputs must be an array, even if empty!'
            });
        }
        if (!Array.isArray(queries) || queries.length === 0) {
            return callback({
                code: grpc.status.INVALID_ARGUMENT,
                message: 'The queries field must be an array, and not empty!'
            });
        }

        errorMessage = null;
        inputs.forEach(r => {
            let error = inputValidation(r.name, r.type, r.location);
            if (error !== true) {
                return errorMessage = error as string;
            }
        })
        if (!isNil(errorMessage)) {
            return callback({
                code: grpc.status.INVALID_ARGUMENT,
                message: errorMessage
            });
        }

        errorMessage = null;
        queries.forEach(r => {
            let error = queryValidation(findSchema, inputs, r.schemaField, r.operation, r.comparisonField);
            if (error !== true) {
                return errorMessage = error as string;
            }
        })

        Object.keys(params).forEach(key => {
            const value = params[key];
            found[key] = value;
        });

        const updatedSchema = await this.database.findByIdAndUpdate
        ('CustomEndpoints', found._id, found).catch((e: any) =>
            errorMessage = e.message);

        if (!isNil(errorMessage)) return callback({code: grpc.status.INTERNAL, message: errorMessage});
        return callback(null, {result: JSON.stringify(updatedSchema)});
    }

    async deleteCustomEndpoints(call: any, callback: any) {
        const {id} = JSON.parse(call.request.params);
        if (isNil(id)) {
            return callback({
                code: grpc.status.INVALID_ARGUMENT,
                message: 'Id is missing'
            });
        }
        if (id.length === 0) {
            return callback({
                code: grpc.status.INVALID_ARGUMENT,
                message: 'Id must not be empty'
            });
        }
        let errorMessage: any = null;
        const schema = await this.database.findOne('CustomEndpoints', {_id: id}).catch((e: any) =>
            errorMessage = e.message);
        if (!isNil(errorMessage)) return callback({code: grpc.status.INTERNAL, message: errorMessage});


        if (isNil(schema)) {
            return callback({
                code: grpc.status.NOT_FOUND,
                message: 'Requested schema not found',
            });
        }

        await this.database.deleteOne('CustomEndpoints', {_id: id}).catch((e: any) => errorMessage = e.message);
        if (!isNil(errorMessage)) return callback({code: grpc.status.INTERNAL, message: errorMessage});
        return callback(null, {result: 'Selected Schema is Deleted'});
    }

    async createCustomEndpoints(call: any, callback: any) {
        const {name, operation, selectedSchema, inputs, queries} = JSON.parse(call.request.params);

        if (isNil(name) || isNil(operation) || isNil(selectedSchema) ||
            isNil(inputs) || isNil(queries)) {
            return callback({
                code: grpc.status.INVALID_ARGUMENT,
                message: 'Required fields are missing'
            });
        }
        if (name.length === 0) {
            return callback({
                code: grpc.status.INVALID_ARGUMENT,
                message: 'Name must not be empty'
            });
        }
        if (operation < 0 || operation > 3) {
            return callback({
                code: grpc.status.INVALID_ARGUMENT,
                message: 'Operation is not valid'

            });
        }

        if (selectedSchema.length === 0) {
            return callback({
                code: grpc.status.INVALID_ARGUMENT,
                message: 'SelectedSchema must not be empty'
            });
        }
        let errorMessage: string | null = null;
        const findSchema = await this.database.findOne('SchemaDefinitions', {
            _id: selectedSchema
        }).catch((e: any) =>
            errorMessage = e.message);
        if (!isNil(errorMessage) || isNil(findSchema)) {
            return callback({
                code: grpc.status.INVALID_ARGUMENT,
                message: 'SelectedSchema not found'
            });
        }

        if (!Array.isArray(inputs)) {
            return callback({
                code: grpc.status.INVALID_ARGUMENT,
                message: 'Inputs must be an array, even if empty!'
            });
        }
        if (!Array.isArray(queries) || queries.length === 0) {
            return callback({
                code: grpc.status.INVALID_ARGUMENT,
                message: 'The queries field must be an array, and not empty!'
            });
        }

        errorMessage = null;
        inputs.forEach(r => {
            let error = inputValidation(r.name, r.type, r.location);
            if (error !== true) {
                return errorMessage = error as string;
            }
        })
        if (!isNil(errorMessage)) {
            return callback({
                code: grpc.status.INVALID_ARGUMENT,
                message: errorMessage
            });
        }

        errorMessage = null;
        queries.forEach(r => {
            let error = queryValidation(findSchema, inputs, r.schemaField, r.operation, r.comparisonField);
            if (error !== true) {
                return errorMessage = error as string;
            }
        })
        if (!isNil(errorMessage)) {
            return callback({
                code: grpc.status.INVALID_ARGUMENT,
                message: errorMessage
            });
        }
        errorMessage = null;
        const newSchema = await this.database.create('CustomEndpoints', {
            name,
            operation, selectedSchema, inputs, queries
        }).catch((e: any) =>
            errorMessage = e.message);
        if (!isNil(errorMessage)) {
            return callback({
                code: grpc.status.INVALID_ARGUMENT,
                message: 'Endpoint Creation failed'
            });
        }
        return callback(null, {result: JSON.stringify(newSchema)});
    }
}