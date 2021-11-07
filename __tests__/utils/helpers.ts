import { APIGatewayProxyEvent, EventBridgeEvent } from 'aws-lambda';
import jwt from 'jsonwebtoken';
import {
    AuthorizationModules,
    AuthorizationOperations,
} from '../../src/config/types';
import { Module } from '../../src/models/module';
import { Operation } from '../../src/models/operation';
import { Permission } from '../../src/models/permission';
import { Role } from '../../src/models/role';
import { User } from '../../src/models/user';
import { AuthEventsDetailTypes, AuthEventDetail } from '../../src/events/types';

export const testUserEmail = 'test@test.com';
export const readUsersPermissionId = 'authorization-api-read-users';

export function constructAPIGwEvent(
    message: unknown,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: Record<string, any> = {},
): APIGatewayProxyEvent {
    return {
        httpMethod: options.method || 'GET',
        path: options.path || '/',
        queryStringParameters: options.query || {},
        headers: options.headers || {},
        body: options.rawBody || JSON.stringify(message),
        multiValueHeaders: {},
        multiValueQueryStringParameters: {},
        isBase64Encoded: false,
        pathParameters: options.pathParameters || {},
        stageVariables: options.stageVariables || {},
        requestContext: options.requestContext || {},
        resource: options.resource || '',
    };
}

export const constructAuthenticatedAPIGwEvent = (
    message: unknown,
    options: Record<string, unknown>,
    userEmail = testUserEmail,
): APIGatewayProxyEvent => {
    const token = jwt.sign(
        {
            email: userEmail,
        },
        'test',
    );

    const event = constructAPIGwEvent(message, options);

    event.headers = {
        ...event.headers,
        Authorization: `Bearer ${token}`,
    };

    return event;
};

/**
 * detail format: { type: 'user.deleted', userId: 'test@test.com' }
 *
 * @param detailType
 * @param detail
 * @returns
 */
export const constructEventBridgeEvent = (
    detailType: AuthEventsDetailTypes,
    detail: AuthEventDetail,
): EventBridgeEvent<AuthEventsDetailTypes, AuthEventDetail> => {
    return {
        version: '0',
        id: '123456',
        'detail-type': detailType,
        source: 'test.users',
        account: '123456789',
        time: new Date().toISOString(),
        region: 'us-east-1',
        resources: [],
        detail: detail,
    };
};

export const addUserWithPermissions = async () => {
    // Add Operations
    const readOperation = await Operation.create({
        id: AuthorizationOperations.Read,
        name: 'Read',
    });
    const addOperation = await Operation.create({
        id: AuthorizationOperations.Add,
        name: 'Add',
    });
    const deleteOperation = await Operation.create({
        id: AuthorizationOperations.Delete,
        name: 'Delete',
    });

    // Add Modules
    const authorizationModule = await Module.create({
        id: AuthorizationModules.Modules,
        name: 'Authorization Modules',
    });
    const authorizationOperation = await Module.create({
        id: AuthorizationModules.Operations,
        name: 'Authorization Operations',
    });
    const authorizationPermission = await Module.create({
        id: AuthorizationModules.Permissions,
        name: 'Authorization Permissions',
    });
    const authorizationRole = await Module.create({
        id: AuthorizationModules.Roles,
        name: 'Authorization Roles',
    });
    const authorizationUser = await Module.create({
        id: AuthorizationModules.Users,
        name: 'Authorization Users',
    });

    // Add Permissions
    const readModulesPermission = await Permission.create({
        id: 'authorization-api-read-modules',
        name: 'Authorization API Read Modules',
        moduleId: authorizationModule.id,
        operationId: readOperation.id,
    });
    const addModulePermission = await Permission.create({
        id: 'authorization-api-add-module',
        name: 'Authorization API Add Module',
        moduleId: authorizationModule.id,
        operationId: addOperation.id,
    });
    const deleteModulePermission = await Permission.create({
        id: 'authorization-api-delete-module',
        name: 'Authorization API Delete Module',
        moduleId: authorizationModule.id,
        operationId: deleteOperation.id,
    });
    const readOperationsPermission = await Permission.create({
        id: 'authorization-api-read-operations',
        name: 'Authorization API Read Operations',
        moduleId: authorizationOperation.id,
        operationId: readOperation.id,
    });
    const addOperationPermission = await Permission.create({
        id: 'authorization-api-add-operation',
        name: 'Authorization API Add Operation',
        moduleId: authorizationOperation.id,
        operationId: addOperation.id,
    });
    const deleteOperationPermission = await Permission.create({
        id: 'authorization-api-delete-operation',
        name: 'Authorization API Delete Operation',
        moduleId: authorizationOperation.id,
        operationId: deleteOperation.id,
    });
    const readPermissionsPermission = await Permission.create({
        id: 'authorization-api-read-permissions',
        name: 'Authorization API Read Permissions',
        moduleId: authorizationPermission.id,
        operationId: readOperation.id,
    });
    const addPermissionPermission = await Permission.create({
        id: 'authorization-api-add-permission',
        name: 'Authorization API Add Permission',
        moduleId: authorizationPermission.id,
        operationId: addOperation.id,
    });
    const deletePermissionPermission = await Permission.create({
        id: 'authorization-api-delete-permission',
        name: 'Authorization API Delete Permission',
        moduleId: authorizationPermission.id,
        operationId: deleteOperation.id,
    });
    const readRolesPermission = await Permission.create({
        id: 'authorization-api-read-roles',
        name: 'Authorization API Read Roles',
        moduleId: authorizationRole.id,
        operationId: readOperation.id,
    });
    const addRolePermission = await Permission.create({
        id: 'authorization-api-add-role',
        name: 'Authorization API Add Role',
        moduleId: authorizationRole.id,
        operationId: addOperation.id,
    });
    const deleteRolePermission = await Permission.create({
        id: 'authorization-api-delete-role',
        name: 'Authorization API Delete Role',
        moduleId: authorizationRole.id,
        operationId: deleteOperation.id,
    });
    const readUsersPermission = await Permission.create({
        id: readUsersPermissionId,
        name: 'Authorization API Read Users',
        moduleId: authorizationUser.id,
        operationId: readOperation.id,
    });
    const addUserPermission = await Permission.create({
        id: 'authorization-api-add-user',
        name: 'Authorization API Add User',
        moduleId: authorizationUser.id,
        operationId: addOperation.id,
    });
    const deleteUserPermission = await Permission.create({
        id: 'authorization-api-delete-user',
        name: 'Authorization API Delete User',
        moduleId: authorizationUser.id,
        operationId: deleteOperation.id,
    });

    // Add Roles
    const role = await Role.create({
        id: 'auth-user-test-role',
        name: 'Authorized User Test Role',
        permissions: [
            readModulesPermission.id,
            addModulePermission.id,
            deleteModulePermission.id,
            readOperationsPermission.id,
            addOperationPermission.id,
            deleteOperationPermission.id,
            readPermissionsPermission.id,
            addPermissionPermission.id,
            deletePermissionPermission.id,
            readRolesPermission.id,
            addRolePermission.id,
            deleteRolePermission.id,
            readUsersPermission.id,
            addUserPermission.id,
            deleteUserPermission.id,
        ],
    });

    // Add authorized user
    await User.create({
        id: testUserEmail,
        roles: [role.id],
    });
};
