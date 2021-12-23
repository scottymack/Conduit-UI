import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  deleteEmailTemplateRequest,
  getEmailSettingsRequest,
  getEmailTemplateRequest,
  getExternalTemplatesRequest,
  postEmailTemplateRequest,
  putEmailSettingsRequest,
  patchEmailTemplateRequest,
  sendEmailRequest,
  syncExternalTemplates,
  uploadTemplateRequest,
} from '../../http/EmailRequests';
import {
  EmailTemplateType,
  EmailData,
  SendEmailData,
  TransportProviders,
  IEmailConfig,
} from '../../models/emails/EmailModels';
import { setAppLoading } from './appSlice';
import { getErrorData } from '../../utils/error-handler';
import { enqueueErrorNotification, enqueueSuccessNotification } from '../../utils/useNotifier';
import { Pagination, Search } from '../../models/http/HttpModels';

interface IEmailSlice {
  data: {
    templateDocuments: EmailTemplateType[];
    totalCount: number;
    config: IEmailConfig;
    externalTemplates: EmailTemplateType[];
  };
}

const initialState: IEmailSlice = {
  data: {
    templateDocuments: [],
    totalCount: 0,
    config: {
      active: false,
      sendingDomain: '',
      transport: TransportProviders['smtp'],
      transportSettings: {
        mailgun: {
          apiKey: '',
          domain: '',
          host: '',
        },
        smtp: {
          port: '',
          host: '',
          auth: {
            username: '',
            password: '',
            method: '',
          },
        },
        mandrill: {
          apiKey: '',
        },
        sendgrid: {
          apiUser: '',
        },
      },
    },
    externalTemplates: [],
  },
};

export const asyncGetEmailTemplates = createAsyncThunk(
  'emails/getTemplates',
  async (params: Pagination & Search, thunkAPI) => {
    try {
      const { data } = await getEmailTemplateRequest(params);
      return data;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncGetExternalTemplates = createAsyncThunk(
  'emails/getExternalTemplates',
  async (params, thunkAPI) => {
    try {
      const { data } = await getExternalTemplatesRequest();
      return data;
    } catch (error) {
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncUploadTemplate = createAsyncThunk(
  'emails/uploadTemplate',
  async (_id: string, thunkAPI) => {
    try {
      await uploadTemplateRequest(_id);
      thunkAPI.dispatch(enqueueSuccessNotification('Email template was uploaded successfully!'));
      return _id;
    } catch (error) {
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncSaveEmailTemplateChanges = createAsyncThunk(
  'emails/saveTemplateChanges',
  async (dataForThunk: { _id: string; data: EmailData }, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const {
        data: { updatedTemplate: updateEmailData },
      } = await patchEmailTemplateRequest(dataForThunk._id, dataForThunk.data);
      thunkAPI.dispatch(
        enqueueSuccessNotification(
          `Successfully saved changes for the template ${dataForThunk.data.name}!`
        )
      );
      thunkAPI.dispatch(setAppLoading(false));
      return updateEmailData;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncCreateNewEmailTemplate = createAsyncThunk(
  'emails/createNewTemplate',
  async (newEmailData: EmailData, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await postEmailTemplateRequest(newEmailData);
      thunkAPI.dispatch(
        enqueueSuccessNotification(`Successfully created template ${newEmailData.name}!`)
      );
      thunkAPI.dispatch(setAppLoading(false));
      return data;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncSyncTemplates = createAsyncThunk(
  'emails/deleteTemplate',
  async (params, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      await syncExternalTemplates();
      thunkAPI.dispatch(enqueueSuccessNotification(`Successfully synced templates!`));
      thunkAPI.dispatch(setAppLoading(false));
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncDeleteTemplates = createAsyncThunk(
  'emails/deleteMultipleTemplates',
  async (params: { ids: string[]; getTemplates: any }, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      await deleteEmailTemplateRequest(params.ids);
      params.getTemplates();
      thunkAPI.dispatch(enqueueSuccessNotification(`Successfully deleted templates!`));
      thunkAPI.dispatch(setAppLoading(false));
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);
export const asyncGetEmailConfig = createAsyncThunk('emails/getConfig', async (arg, thunkAPI) => {
  thunkAPI.dispatch(setAppLoading(true));
  try {
    const {
      data: { config },
    } = await getEmailSettingsRequest();
    thunkAPI.dispatch(setAppLoading(false));
    return config;
  } catch (error) {
    thunkAPI.dispatch(setAppLoading(false));
    thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
    throw error;
  }
});

export const asyncUpdateEmailConfig = createAsyncThunk(
  'emails/updateConfig',
  async (updatedSettings: IEmailConfig, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const {
        data: { config },
      } = await putEmailSettingsRequest(updatedSettings);
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueSuccessNotification(`Emails config successfully updated`));
      return config;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

export const asyncSendEmail = createAsyncThunk(
  'emails/send',
  async (dataToSend: SendEmailData, thunkAPI) => {
    thunkAPI.dispatch(setAppLoading(true));
    try {
      const { data } = await sendEmailRequest(dataToSend);
      thunkAPI.dispatch(setAppLoading(false));
      return data;
    } catch (error) {
      thunkAPI.dispatch(setAppLoading(false));
      thunkAPI.dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
      throw error;
    }
  }
);

const updateTemplateByID = (updated: EmailTemplateType, templates: EmailTemplateType[]) => {
  return templates.map((t) => {
    if (t._id === updated._id) {
      return {
        ...updated,
      };
    } else {
      return t;
    }
  });
};

const emailsSlice = createSlice({
  name: 'emails',
  initialState,
  reducers: {
    clearEmailPageStore: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(asyncGetEmailTemplates.fulfilled, (state, action) => {
      state.data.templateDocuments = action.payload.templateDocuments;
      state.data.totalCount = action.payload.totalCount;
    });

    builder.addCase(asyncGetExternalTemplates.fulfilled, (state, action) => {
      state.data.externalTemplates = action.payload.templateDocuments;
    });
    builder.addCase(asyncSaveEmailTemplateChanges.fulfilled, (state, action) => {
      state.data.templateDocuments = updateTemplateByID(
        action.payload,
        state.data.templateDocuments
      );
    });
    builder.addCase(asyncCreateNewEmailTemplate.fulfilled, (state, action) => {
      state.data.templateDocuments.push(action.payload.template);
      state.data.totalCount = state.data.totalCount++;
    });
    builder.addCase(asyncGetEmailConfig.fulfilled, (state, action) => {
      state.data.config = action.payload;
    });
    builder.addCase(asyncUpdateEmailConfig.fulfilled, (state, action) => {
      state.data.config = action.payload;
    });
    builder.addCase(asyncSendEmail.fulfilled, () => {
      //handle success
    });
    builder.addCase(asyncUploadTemplate.fulfilled, (state, action) => {
      const templateToUpdate = state.data.templateDocuments.find(
        (template) => template._id === action.payload
      );
      if (templateToUpdate !== undefined) templateToUpdate.externalManaged = true;
    });
  },
});

export default emailsSlice.reducer;
export const { clearEmailPageStore } = emailsSlice.actions;
