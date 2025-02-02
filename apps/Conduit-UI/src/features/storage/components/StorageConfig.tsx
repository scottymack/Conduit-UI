import React, { useEffect, useMemo, useState } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { IStorageConfig, ProviderType } from '../models/StorageModels';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { FormInputSwitch } from '../../../components/common/FormComponents/FormInputSwitch';
import { FormInputSelect } from '../../../components/common/FormComponents/FormInputSelect';
import { FormInputText } from '../../../components/common/FormComponents/FormInputText';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { asyncSaveStorageConfig } from '../store/storageSlice';
import { ConfigSaveSection, ConfigContainer, ConduitTooltip } from '@conduitplatform/ui-components';
import { Button, Icon } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';

const StorageConfig: React.FC = () => {
  const dispatch = useAppDispatch();

  const [edit, setEdit] = useState<boolean>(false);

  const { config } = useAppSelector((state) => state.storageSlice.data);

  const methods = useForm<IStorageConfig>({
    defaultValues: useMemo(() => {
      return config;
    }, [config]),
  });

  const { control, reset, register } = methods;

  useEffect(() => {
    reset(config);
  }, [config, reset]);

  const handleCancel = () => {
    setEdit(!edit);
    reset(config);
  };

  const isActive = useWatch({
    control,
    name: 'active',
  });

  const watchProvider = useWatch({
    control,
    name: 'provider',
  });

  const onSubmit = (data: IStorageConfig) => {
    setEdit(false);
    dispatch(asyncSaveStorageConfig(data));
  };

  const providers: { label: string; value: ProviderType }[] = [
    { label: 'Azure', value: 'azure' },
    { label: 'Google', value: 'google' },
    { label: 'Local', value: 'local' },
    { label: 'Aws S3', value: 'aws' },
    { label: 'Aliyun OSS', value: 'aliyun' },
  ];

  return (
    <ConfigContainer>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Box
            sx={{
              width: '100%',
              display: 'inline-flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant={'h6'}>Activate Storage Module</Typography>
              <ConduitTooltip
                title={
                  <Box display="flex" flexDirection="column" gap={2} p={2}>
                    <Typography variant="body2">
                      To get an idea on how to setup your storage provider take a look at the
                      documentation.
                    </Typography>
                    <Box display="flex" gap={2}>
                      <a
                        href="https://getconduit.dev/docs/modules/storage/config#local-storage"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none' }}>
                        <Button variant="outlined">Local</Button>
                      </a>
                      <a
                        href="https://getconduit.dev/docs/modules/storage/config#azure-storage"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none' }}>
                        <Button variant="outlined">Azure</Button>
                      </a>
                      <a
                        href="https://getconduit.dev/docs/modules/storage/config#google-storage"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none' }}>
                        <Button variant="outlined">Google</Button>
                      </a>
                      <a
                        href="https://getconduit.dev/docs/modules/storage/config#amazon-storage"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none' }}>
                        <Button variant="outlined">AS3</Button>
                      </a>
                    </Box>
                  </Box>
                }>
                <Icon sx={{ display: 'flex' }}>
                  <InfoOutlined />
                </Icon>
              </ConduitTooltip>
            </Box>
            <FormInputSwitch {...register('active', { disabled: !edit })} />
          </Box>
          <Grid container spacing={2} sx={{ pl: 4, mb: 1 }}>
            {isActive && (
              <>
                <Grid item xs={12}>
                  <Typography variant={'subtitle2'}>The provider to use for storage</Typography>
                </Grid>
                <Grid item md={6} xs={12}>
                  <FormInputSelect
                    label={'Provider'}
                    {...register('provider', { disabled: !edit })}
                    options={providers?.map((template) => ({
                      label: template.label,
                      value: template.value,
                    }))}
                  />
                </Grid>
                {watchProvider === 'azure' && (
                  <Grid item md={6} xs={12}>
                    <FormInputText
                      {...register('azure.connectionString', { disabled: !edit })}
                      label="Connection String"
                    />
                  </Grid>
                )}
                {watchProvider === 'google' && (
                  <>
                    <Grid item md={6} xs={12}>
                      <FormInputText
                        {...register('google.serviceAccountKeyPath', { disabled: !edit })}
                        label="Service Account Key Path"
                      />
                    </Grid>
                    <Grid item md={6} xs={12}>
                      <FormInputText
                        {...register('google.bucketName', { disabled: !edit })}
                        label="Bucket Name"
                      />
                    </Grid>
                  </>
                )}
                {watchProvider === 'aws' && (
                  <>
                    <Grid item md={6} xs={12}>
                      <FormInputText
                        {...register('aws.region', { disabled: !edit })}
                        label="Region"
                      />
                    </Grid>
                    <Grid item md={6} xs={12}>
                      <FormInputText
                        {...register('aws.secretAccessKey', { disabled: !edit })}
                        label="Secret Access Key"
                      />
                    </Grid>
                    <Grid item md={6} xs={12}>
                      <FormInputText
                        {...register('aws.accessKeyId', { disabled: !edit })}
                        label="Access Key Id"
                      />
                    </Grid>
                    <Grid item md={6} xs={12}>
                      <FormInputText
                        {...register('aws.accountId', { disabled: !edit })}
                        label="Account Id"
                      />
                    </Grid>
                  </>
                )}
                {watchProvider === 'aliyun' && (
                  <>
                    <Grid item md={6} xs={12}>
                      <FormInputText
                        {...register('aliyun.region', { disabled: !edit })}
                        label="Region"
                      />
                    </Grid>
                    <Grid item md={6} xs={12}>
                      <FormInputText
                        {...register('aliyun.accessKeyId', { disabled: !edit })}
                        label="Access Key Id"
                      />
                    </Grid>
                    <Grid item md={6} xs={12}>
                      <FormInputText
                        {...register('aliyun.accessKeySecret', { disabled: !edit })}
                        label="Access Key Secret"
                      />
                    </Grid>
                  </>
                )}
                {watchProvider === 'local' && (
                  <>
                    <Grid item md={6} xs={12}>
                      <FormInputText
                        {...register('local.storagePath', { disabled: !edit })}
                        label="Storage Path"
                      />
                    </Grid>
                  </>
                )}
              </>
            )}
          </Grid>
          <ConfigSaveSection edit={edit} setEdit={setEdit} handleCancel={handleCancel} />
        </form>
      </FormProvider>
    </ConfigContainer>
  );
};

export default StorageConfig;
