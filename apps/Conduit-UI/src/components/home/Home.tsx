import Head from 'next/head';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Typography from '@mui/material/Typography';
import Slide from '@mui/material/Slide';
import Box from '@mui/material/Box';
import { Container, Grid, Button, Icon, useTheme, useMediaQuery, Divider } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import SchemaIcon from '@mui/icons-material/VerticalSplit';
import SecretIcon from '@mui/icons-material/VpnKey';
import Description from '@mui/icons-material/Description';
import {
  SwaggerModal,
  GraphQLModal,
  HomePageCard,
  LinkComponent,
  GraphContainer,
} from '@conduitplatform/ui-components';
import GraphQL from '../../assets/svgs/graphQL.svg';
import Swagger from '../../assets/svgs/swagger.svg';
import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import {
  asyncGetIntrospectionStatus,
  asyncGetSchemas,
  asyncSetCustomEndpoints,
} from '../../redux/slices/databaseSlice';
import { ScreenSearchDesktopRounded } from '@mui/icons-material';
import { IModule } from '../../models/appAuth';
import LogsComponent from '../logs/LogsComponent';
import { styled } from '@mui/material/styles';
import ExtractGraph from '../metrics/ExtractMetricGraph';
import MetricsWidget from '../metrics/MetricsWidget';
import { asyncGetAuthUserData } from '../../redux/slices/authenticationSlice';
import RequestsLatency from '../metrics/RequestLatency';
import ModuleHealth from '../metrics/ModuleHealth';
import { asyncGetForms } from '../../redux/slices/formsSlice';
import { asyncGetEmailTemplates } from '../../redux/slices/emailsSlice';

const Home: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const homePageFontSizeHeader = {
    fontSize: '2.5rem',
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.2rem',
    },
    [theme.breakpoints.between('sm', 'md')]: {
      fontSize: '2rem',
    },
  };

  const homePageFontSizeSubtitles = {
    fontSize: '0.8rem',
    [theme.breakpoints.down('lg')]: {
      fontSize: '0.6rem',
    },
    [theme.breakpoints.down('md')]: {
      fontSize: '0.6rem',
    },
  };

  const [swaggerModal, setSwaggerModal] = useState<boolean>(false);
  const [graphQLOpen, setGraphQLOpen] = useState<boolean>(false);

  const { introspectionStatus } = useAppSelector((state) => state.databaseSlice.data);
  const transportsAdmin = useAppSelector((state) => state.settingsSlice?.adminSettings?.transports);
  const transportsRouter = useAppSelector((state) => state.routerSlice?.data?.config?.transports);
  const enabledModules = useAppSelector((state) => state.appAuthSlice?.data?.enabledModules);
  const SERVICE_API = useAppSelector((state) => state.routerSlice?.data?.config?.hostUrl);
  const CONDUIT_API = useAppSelector((state) => state.settingsSlice?.adminSettings?.hostUrl);

  const { count } = useAppSelector((state) => state.authenticationSlice.data.authUsers);
  const { schemasCount } = useAppSelector((state) => state.databaseSlice.data.schemas);
  const formsCount = useAppSelector((state) => state.formsSlice.data.count);
  const endpointsCount = useAppSelector((state) => state.databaseSlice.data.customEndpoints.count);
  const emailsCount = useAppSelector((state) => state.emailsSlice.data.totalCount);

  useEffect(() => {
    dispatch(asyncGetAuthUserData({ skip: 0, limit: 5 }));
    dispatch(asyncGetSchemas({ skip: 0, limit: 5 }));
    dispatch(asyncSetCustomEndpoints({ skip: 0, limit: 5 }));
    dispatch(asyncGetEmailTemplates({ skip: 0, limit: 5 }));
    dispatch(asyncGetForms({ skip: 0, limit: 5 }));
  }, [dispatch]);

  const noSwagger = useMemo(() => {
    return !transportsRouter.rest && !transportsAdmin.rest;
  }, [transportsAdmin.rest, transportsRouter.rest]);

  const noGraphQL = useMemo(() => {
    return !transportsRouter.graphql && !transportsAdmin.graphql;
  }, [transportsAdmin.graphql, transportsRouter.graphql]);

  useEffect(() => {
    dispatch(asyncGetIntrospectionStatus());
  }, [dispatch]);

  const isEnabled = useCallback(
    (str: string) => {
      return enabledModules.find((item: IModule) => item.moduleName === str);
    },
    [enabledModules]
  );

  const Main = styled('main')(() => ({
    flexGrow: 1,
  }));

  return (
    <>
      <Head>
        <title>Conduit - App</title>
      </Head>
      <Box sx={{ height: '100vh', p: 4 }}>
        <Box
          p={2}
          display={'flex'}
          justifyContent="flex-end"
          alignItems={'flex-end'}
          flex={1}
          sx={{ marginBottom: '20px', gap: 2 }}>
          {noSwagger ? null : (
            <Button color="primary" variant="outlined" onClick={() => setSwaggerModal(true)}>
              <Icon sx={{ display: 'flex', alignContent: 'center', width: 24, height: 24 }}>
                <Image src={Swagger} alt="swagger" />
              </Icon>
              <Typography sx={{ ml: smallScreen ? 0 : 1 }}>
                {smallScreen ? null : 'SWAGGER'}
              </Typography>
            </Button>
          )}
          {noGraphQL ? null : (
            <Button color="primary" variant="outlined" onClick={() => setGraphQLOpen(true)}>
              <Icon sx={{ display: 'flex', alignContent: 'center', width: 24, height: 24 }}>
                <Image src={GraphQL} alt="graphQL" />
              </Icon>
              <Typography sx={{ ml: smallScreen ? 0 : 1 }}>
                {smallScreen ? null : 'GraphQL'}
              </Typography>
            </Button>
          )}
          <a
            href="https://getconduit.dev/docs/overview/intro"
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: 'none' }}>
            <Button variant="contained" color="primary">
              <Description width={24} height={24} />
              <Typography sx={{ ml: smallScreen ? 0 : 1 }}>
                {smallScreen ? null : 'DOCUMENTATION'}
              </Typography>
            </Button>
          </a>
        </Box>

        <Box display={'flex'} alignItems={'center'} flex={1} sx={{ marginBottom: 5 }}>
          <Typography
            variant={'h4'}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              flex: 1,
              fontSize: homePageFontSizeHeader,
            }}>
            Welcome to C
            <Slide timeout={1000} in direction={'down'}>
              <Typography variant={'h4'} component={'span'} role="img" aria-label="okhand">
                👌
              </Typography>
            </Slide>
            nduit!
          </Typography>
        </Box>
        <Main>
          <Container maxWidth="xl" sx={{ marginBottom: 4 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={12} md={12} lg={6}>
                <GraphContainer>
                  <ExtractGraph
                    query="/query_range"
                    expression="sum(increase(conduit_admin_grpc_requests_total[10m]))"
                    graphTitle="Total admin grpc requests"
                    label="Requests"
                    hasControls={false}
                    canZoom={false}
                  />
                </GraphContainer>
              </Grid>
              <Grid item xs={12} sm={12} md={12} lg={6}>
                <GraphContainer>
                  <ExtractGraph
                    query="/query_range"
                    expression="sum(increase(conduit_internal_grpc_requests_total[10m]))"
                    graphTitle="Internal grpc requests"
                    label="Requests"
                    hasControls={false}
                    canZoom={false}
                  />
                </GraphContainer>
              </Grid>
              <Grid item xs={6} sm={3}>
                <RequestsLatency module="home" />
              </Grid>
              <Grid item xs={6} sm={3}>
                <ModuleHealth module="home" />
              </Grid>
              {isEnabled('database') && (
                <Grid item xs={6} sm={3}>
                  <MetricsWidget
                    title="Schemas"
                    metric={
                      <Typography color="primary" variant="h4">
                        {schemasCount}
                      </Typography>
                    }
                  />
                </Grid>
              )}
              {isEnabled('database') && (
                <Grid item xs={6} sm={3}>
                  <MetricsWidget
                    title="Endpoints"
                    metric={
                      <Typography color="primary" variant="h4">
                        {endpointsCount}
                      </Typography>
                    }
                  />
                </Grid>
              )}
              {isEnabled('authentication') && (
                <Grid item xs={6} sm={3}>
                  <MetricsWidget
                    title="Users"
                    metric={
                      <Typography color="primary" variant="h4">
                        {count}
                      </Typography>
                    }
                  />
                </Grid>
              )}
              {isEnabled('forms') && (
                <Grid item xs={6} sm={3}>
                  <MetricsWidget
                    title="Forms"
                    metric={
                      <Typography color="primary" variant="h4">
                        {formsCount}
                      </Typography>
                    }
                  />
                </Grid>
              )}
              {isEnabled('email') && (
                <Grid item xs={6} sm={3}>
                  <MetricsWidget
                    title="Email templates"
                    metric={
                      <Typography color="primary" variant="h4">
                        {emailsCount}
                      </Typography>
                    }
                  />
                </Grid>
              )}
            </Grid>
            <Grid pt={3} container spacing={2}>
              {isEnabled('authentication') ? (
                <Grid item xs={6} md={4}>
                  <LinkComponent href="/authentication/signIn" underline={'none'}>
                    <HomePageCard
                      icon={<SecretIcon width={24} height={24} />}
                      title="Set up an authentication method"
                      descriptionContent={
                        <Typography
                          variant="subtitle2"
                          sx={{ height: '40px', fontSize: homePageFontSizeSubtitles, mb: 1 }}>
                          Easily login with the method of your choice!
                        </Typography>
                      }
                    />
                  </LinkComponent>
                </Grid>
              ) : null}
              {isEnabled('database') ? (
                <Grid item xs={6} md={4}>
                  <LinkComponent href="/database/schemas" underline={'none'}>
                    <HomePageCard
                      icon={<SchemaIcon width={24} height={24} />}
                      title="Create a schema"
                      descriptionContent={
                        <Typography
                          variant="subtitle2"
                          sx={{ height: '40px', fontSize: homePageFontSizeSubtitles, mb: 1 }}>
                          Create your schema with a user friendly UI and start editing you documents
                          right away!
                        </Typography>
                      }
                    />
                  </LinkComponent>
                </Grid>
              ) : null}
              {isEnabled('email') ? (
                <Grid item xs={6} md={4}>
                  <LinkComponent href="/email/config" underline={'none'}>
                    <HomePageCard
                      icon={<EmailIcon width={24} height={24} />}
                      title="Set up email provider"
                      descriptionContent={
                        <Typography
                          variant="subtitle2"
                          sx={{ height: '40px', fontSize: homePageFontSizeSubtitles, mb: 1 }}>
                          Select your preferred provider and start mailing!
                        </Typography>
                      }
                    />
                  </LinkComponent>
                </Grid>
              ) : null}
              {isEnabled('router') ? (
                <Grid item xs={6} md={4}>
                  <LinkComponent href="/router/security" underline={'none'}>
                    <HomePageCard
                      icon={<LockIcon width={24} height={24} />}
                      title="Set up client secrets"
                      descriptionContent={
                        <Typography
                          variant="subtitle2"
                          sx={{ height: '40px', fontSize: homePageFontSizeSubtitles, mb: 1 }}>
                          Set up your client secret across multiple platforms!
                        </Typography>
                      }
                    />
                  </LinkComponent>
                </Grid>
              ) : null}
              {isEnabled('database') ? (
                <Grid item xs={6} md={4}>
                  <LinkComponent href="/database/introspection" underline={'none'}>
                    <HomePageCard
                      icon={<ScreenSearchDesktopRounded width={24} height={24} />}
                      title="Introspection"
                      descriptionContent={
                        <Box
                          display="flex"
                          justifyContent={'space-around'}
                          sx={{ height: '40px', mb: 1 }}>
                          <Box display="flex" flexDirection={'row'} alignItems={'center'}>
                            <Typography sx={{ fontSize: homePageFontSizeSubtitles }}>
                              Foreign Schemas:
                            </Typography>
                            <Typography
                              color="error"
                              ml={1}
                              sx={{ fontSize: homePageFontSizeSubtitles }}>
                              {introspectionStatus.foreignSchemaCount}
                            </Typography>
                          </Box>
                          <Divider orientation="vertical" sx={{ marginX: 2 }} />
                          <Box display="flex" flexDirection={'row'} alignItems={'center'}>
                            <Typography sx={{ fontSize: homePageFontSizeSubtitles }}>
                              Imported Schemas:
                            </Typography>
                            <Typography
                              color="primary"
                              ml={1}
                              sx={{ fontSize: homePageFontSizeSubtitles }}>
                              {introspectionStatus.importedSchemaCount}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </LinkComponent>
                </Grid>
              ) : null}
            </Grid>
          </Container>
        </Main>
        <SwaggerModal
          open={swaggerModal}
          setOpen={setSwaggerModal}
          swagger="App"
          title="App"
          baseUrl={SERVICE_API}
          adminUrl={CONDUIT_API}
          transportsAdmin={transportsAdmin}
          transportsRouter={transportsRouter}
        />
        <GraphQLModal
          open={graphQLOpen}
          setOpen={setGraphQLOpen}
          title="App"
          baseUrl={SERVICE_API}
          adminUrl={CONDUIT_API}
          transportsAdmin={transportsAdmin}
          transportsRouter={transportsRouter}
        />
        <LogsComponent module={'core'} />
      </Box>
    </>
  );
};

export default Home;