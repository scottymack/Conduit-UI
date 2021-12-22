import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { IClient, INewAdminUser, IPlatformTypes } from '../../models/settings/SettingsModels';
import {
  getAvailableClientsRequest,
  generateNewClientRequest,
  deleteClientRequest,
  postNewAdminUser,
} from '../../http/SettingsRequests';
import { setAppLoading } from './appSlice';
import { getErrorData } from '../../utils/error-handler';
import { enqueueErrorNotification, enqueueSuccessNotification } from '../../utils/useNotifier';

interface INotificationSlice {
  data: {
    availableClients: IClient[];
  };
}

const initialState: INotificationSlice = {
  data: { availableClients: [] },
};

export const asyncGetAvailableClients = createAsyncThunk(
  'notifications/getClients',
  async (arg, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const {
        data: { clients },
      } = await getAvailableClientsRequest();
      thunkAPI.dispatch(setAppLoading(false));
      return clients;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncGenerateNewClient = createAsyncThunk(
  'settings/generateClient',
  async (platform: IPlatformTypes, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await generateNewClientRequest(platform);
      thunkAPI.dispatch(setAppLoading(false));
      return data;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncDeleteClient = createAsyncThunk(
  'settings/deleteClient',
  async (_id: string, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      await deleteClientRequest(_id);
      thunkAPI.dispatch(setAppLoading(false));
      return _id;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncCreateAdminUser = createAsyncThunk(
  'settings/createAdminUser',
  async (values: INewAdminUser, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const body = {
        username: values.username,
        password: values.password,
      };
      await postNewAdminUser(body);
      thunkAPI.dispatch(enqueueSuccessNotification(`Successfully created user ${body.username}!`));
      thunkAPI.dispatch(setAppLoading(false));
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(asyncGetAvailableClients.fulfilled, (state, action) => {
      state.data.availableClients = action.payload;
    });
    builder.addCase(asyncGenerateNewClient.fulfilled, (state, action) => {
      state.data.availableClients.push(action.payload);
    });
    builder.addCase(asyncDeleteClient.fulfilled, (state, action) => {
      const allClients = state.data.availableClients;
      const clientIndex = allClients.findIndex((c) => c._id === action.payload);
      if (clientIndex !== -1) {
        allClients.splice(clientIndex, 1);
      }
    });
  },
});

export default settingsSlice.reducer;
