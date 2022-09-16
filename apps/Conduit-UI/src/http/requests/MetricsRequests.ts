//TODO placeholder fow now till we proxy the actual request
import { ModulesTypes } from '../../models/logs/LogsModels';
import { getRequestProm } from '../requestsConfig';

export const getMetricsQuery = (body: {
  module: ModulesTypes;
  startDate?: number;
  endDate?: number;
  step?: string;
  //TODO define initial states of start,end,step
}) => {
  return getRequestProm('/query_range', {
    query: `sum(increase(conduit_admin_grpc_requests_total{job="${body.module}"}[10m]))`,
    start: body.startDate,
    end: body.endDate,
    step: body.step,
  });
};

//This is an instant vector as we dont need a time series
export const getModuleHealth = (body: {
  module: ModulesTypes;
  //TODO define initial states of start,end,step
}) => {
  return getRequestProm('/query', {
    query:
      body.module !== 'home'
        ? `conduit_module_health_state{job="${body.module}"}[1m]`
        : `conduit_module_health_state[1m]`,
  });
};

export const getModuleLatency = (body: {
  module: ModulesTypes;
  //TODO define initial states of start,end,step
}) => {
  return getRequestProm('/query', {
    query:
      body.module !== 'home'
        ? `avg_over_time(conduit_grpc_request_latency_seconds{job="${body.module}"}[5m])`
        : `avg_over_time(conduit_grpc_request_latency_seconds[5m])`,
  });
};