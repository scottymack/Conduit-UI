import React from 'react';
import { Container, Grid } from '@mui/material';
import ExtractGraph from '../metrics/ExtractMetricGraph';
import TotalRequestsByModule from '../metrics/TotalRequestsByModule';
import { GraphContainer } from '@conduitplatform/ui-components';
import RequestsLatency from '../metrics/RequestLatency';
import ModuleHealth from '../metrics/ModuleHealth';

const SmsDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Grid container gap={2}>
        <Grid container item spacing={2}>
          <Grid item xs={12}>
            <GraphContainer>
              <TotalRequestsByModule module="sms" />
            </GraphContainer>
          </Grid>
          <Grid item md={12} lg={6}>
            <GraphContainer>
              <ExtractGraph
                query="/query_range"
                expression="sum(increase(conduit_forms_total[10m]))"
                graphTitle="Total sms sent"
                label="Sms sent"
              />
            </GraphContainer>
          </Grid>
        </Grid>
        <Grid container gap={2}>
          <Grid item xs={4}>
            <RequestsLatency module="sms" />
          </Grid>
          <Grid item xs={4}>
            <ModuleHealth module="sms" />
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SmsDashboard;