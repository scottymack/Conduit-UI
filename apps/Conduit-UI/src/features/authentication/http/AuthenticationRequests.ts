import { deleteRequest, getRequest, patchRequest, postRequest } from '../../../http/requestsConfig';
import { AuthUser } from '../models/AuthModels';
import { Pagination, Search, Sort } from '../../../models/http/HttpModels';

export const getUsers = (params: Pagination & Search & { provider?: string } & Sort) =>
  getRequest(`/authentication/users`, params);

export const createUser = (values: { email: string; password: string }) =>
  postRequest(`/authentication/users`, {
    email: values.email,
    password: values.password,
  });

export const editUser = (values: AuthUser) =>
  patchRequest(`/authentication/users/${values._id}`, {
    ...values,
  });

export const deleteUsers = (ids: string[]) => {
  return deleteRequest(`/authentication/users`, { ids });
};

export const blockUser = (id: string) => {
  return postRequest(`/authentication/users/${id}/block`);
};

export const blockUnblockUsers = (body: { ids: string[]; block: boolean }) => {
  return postRequest(`/authentication/users/toggle`, body);
};

export const unblockUser = (id: string) => {
  return postRequest(`/authentication/users/${id}/unblock`);
};

export const getAuthenticationConfig = () => getRequest(`/config/authentication`);

export const patchAuthenticationConfig = (body: any) =>
  patchRequest(`/config/authentication`, { config: { ...body } });
