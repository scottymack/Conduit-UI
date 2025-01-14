import { proxy, proxyLoki, proxyPrometheus } from '../../server/proxy';
import { NextApiRequest, NextApiResponse } from 'next';

const path = (req: NextApiRequest, res: NextApiResponse) => {
  return new Promise((resolve, reject) => {
    if (req.url?.match(/^\/api\/info/)) {
      res.status(200).json({
        logsAvailable: process.env.LOKI_URL && process.env.LOKI_URL.length > 0,
        metricsAvailable: !!(process.env.PROMETHEUS_URL && process.env.PROMETHEUS_URL.length > 0),
      });
    } else if (req.url?.match(/^\/api\/loki/)) {
      req.url = req.url?.replace(/^\/api\/loki/, '');

      proxyLoki?.on('error', reject);

      proxyLoki?.web(req, res);
    } else if (req.url?.match(/^\/api\/prometheus/)) {
      req.url = req.url?.replace(/^\/api\/prometheus/, '');

      proxyPrometheus?.on('error', reject);

      proxyPrometheus?.web(req, res);
    } else {
      // removes the api prefix from url
      req.url = req.url?.replace(/^\/api/, '');

      // add masterkey since the initial req does not include
      // it for security measures
      req.headers.masterkey = process.env.MASTER_KEY;

      // const cookies = new Cookies(req, res);
      // const authorization = cookies.get('authorization');
      //
      // // don't forwards the cookies to the target server
      // req.headers.cookie = '';
      //
      // if (authorization) {
      //   req.headers.authorization = authorization;
      // }

      /**
       * if an error occurs in the proxy, we will reject the promise.
       * it is so important. if you don't reject the promise,
       * you're facing the stalled requests issue.
       */
      proxy.on('error', reject);

      proxy.web(req, res);
    }
  });
};
export default path;

export const config = {
  api: {
    bodyParser: false,
  },
};
