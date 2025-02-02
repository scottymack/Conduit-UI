import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Container, Grid, Icon, Paper, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { FormProvider, useForm } from 'react-hook-form';
import { FormInputSwitch } from '../../../components/common/FormComponents/FormInputSwitch';
import { FormInputText } from '../../../components/common/FormComponents/FormInputText';
import { IRouterConfig } from '../models/RouterModels';
import { asyncPutRouterConfig } from '../store/routerSlice';
import { ConfigSaveSection, ConduitTooltip } from '@conduitplatform/ui-components';
import { InfoOutlined } from '@mui/icons-material';

const RouterSettings: React.FC = () => {
  const dispatch = useAppDispatch();
  const { config } = useAppSelector((state) => state.routerSlice.data);
  const [edit, setEdit] = useState(false);

  const methods = useForm<IRouterConfig>({
    defaultValues: useMemo(() => {
      return config;
    }, [config]),
  });

  const { reset, register } = methods;

  useEffect(() => {
    methods.reset(config);
  }, [methods, config]);

  const onSaveClick = (data: IRouterConfig) => {
    setEdit(false);
    const finalData = { ...data, security: { clientValidation: config.security.clientValidation } };
    dispatch(asyncPutRouterConfig(finalData));
  };

  const handleCancel = () => {
    reset();
    setEdit(false);
  };

  return (
    <Container maxWidth={'md'}>
      <Grid container justifyContent={'center'}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: 8 }}>
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSaveClick)}>
              <Grid container item spacing={1} alignItems={'center'}>
                <Grid item xs={12}>
                  <Box display="flex" gap={2} alignItems="center">
                    <Typography variant={'h6'}>Router settings</Typography>
                    <ConduitTooltip
                      title={
                        <Box display="flex" flexDirection="column" gap={2} p={2}>
                          <Typography variant="body2">
                            This module provides a way for modules to register application routes
                            for REST and GraphQL APIs. Endpoint documentation is automatically
                            generated so as to further facilitate development. It also provides
                            support for application-level WebSockets.
                          </Typography>
                          <Box display="flex" justifyContent="flex-end">
                            <a
                              href="https://getconduit.dev/docs/modules/router/"
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ textDecoration: 'none' }}>
                              <Button variant="outlined">To the docs!</Button>
                            </a>
                          </Box>
                        </Box>
                      }>
                      <Icon sx={{ display: 'flex' }}>
                        <InfoOutlined />
                      </Icon>
                    </ConduitTooltip>
                  </Box>

                  <Typography variant={'subtitle1'}>
                    Below you can see information about the Conduit location
                  </Typography>
                </Grid>
                <Grid item xs={12} container wrap={'nowrap'}>
                  <Grid
                    container
                    item
                    xs={12}
                    sm={8}
                    alignItems={'center'}
                    wrap={'nowrap'}
                    sx={{ marginRight: 4 }}>
                    <FormInputText {...register('hostUrl')} label="Host URL" disabled={!edit} />
                  </Grid>
                </Grid>
                <Grid item xs={12} sx={{ marginTop: 3 }}>
                  <Typography variant={'h6'}>Application Routing</Typography>
                </Grid>
                <Grid item xs={12} container alignItems={'center'}>
                  <Grid item xs={8} sm={4}>
                    <Typography variant={'subtitle1'}>REST:</Typography>
                  </Grid>
                  <Grid item xs={4} sm={8}>
                    <FormInputSwitch {...register('transports.rest')} disabled={!edit} />
                  </Grid>
                </Grid>
                <Grid item xs={12} container alignItems={'center'}>
                  <Grid item xs={8} sm={4}>
                    <Typography variant={'subtitle1'}>GraphQL:</Typography>
                  </Grid>
                  <Grid item xs={4} sm={8}>
                    <FormInputSwitch {...register('transports.graphql')} disabled={!edit} />
                  </Grid>
                </Grid>
                <Grid item xs={12} container alignItems={'center'}>
                  <Grid item xs={8} sm={4}>
                    <Typography variant={'subtitle1'}>WebSockets:</Typography>
                  </Grid>
                  <Grid item xs={4} sm={8}>
                    <FormInputSwitch {...register('transports.sockets')} disabled={!edit} />
                  </Grid>
                </Grid>
              </Grid>
              <ConfigSaveSection edit={edit} setEdit={setEdit} handleCancel={handleCancel} />
            </form>
          </FormProvider>
        </Paper>
      </Grid>
    </Container>
  );
};

export default RouterSettings;
