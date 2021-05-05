import { Layout } from '../components/navigation/Layout';
import React, { useState } from 'react';
import Typography from '@material-ui/core/Typography';
import CustomTabs from '../components/common/CustomTabs';
import Box from '@material-ui/core/Box';

import { privateRoute } from '../components/utils/privateRoute';

import { makeStyles } from '@material-ui/core/styles';

import SendSms from '../components/sms/SendSms';
import SmsProviderDetails from '../components/sms/SmsProviderDetails';

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
  },
  snackBar: {
    maxWidth: '80%',
    width: 'auto',
  },
}));

const Emails = () => {
  const tabs = [{ title: 'Send SMS', isDisabled: false }, { title: 'Provider details' }];
  const [selected, setSelected] = useState(0);
  const handleChange = (event, newValue) => {
    setSelected(newValue);
  };

  return (
    <Layout itemSelected={3}>
      <Box p={2}>
        <Typography variant={'h4'}>SMS</Typography>
        <CustomTabs tabs={tabs} selected={selected} handleChange={handleChange} />

        <Box role="tabpanel" hidden={selected !== 0} id={`tabpanel-1`}>
          <SendSms />
        </Box>
        <Box role="tabpanel" hidden={selected !== 1} id={`tabpanel-2`}>
          <SmsProviderDetails />
        </Box>
      </Box>
    </Layout>
  );
};

export default privateRoute(Emails);