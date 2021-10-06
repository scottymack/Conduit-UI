import React, { useEffect, useState } from 'react';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import { Box } from '@material-ui/core';
import { useRouter } from 'next/router';
import sharedClasses from './sharedClasses';

const CmsLayout: React.FC<unknown> = ({ children }) => {
  const classes = sharedClasses();
  const router = useRouter();
  const [value, setValue] = useState(0);

  useEffect(() => {
    const pathNames = [
      '/settings/clientsdk',
      '/settings/secrets',
      '/settings/core',
      '/settings/createuser',
    ];
    const index = pathNames.findIndex((pathname) => pathname === router.pathname);
    setValue(index);
  }, [router.pathname]);

  const handleChange = (event: React.ChangeEvent<any>, newValue: number) => {
    setValue(newValue);
    router.push(`${event.currentTarget.id}`, undefined, { shallow: false });
  };

  return (
    <Box p={4}>
      <Box className={classes.navBar}>
        <Typography variant={'h4'}>Settings</Typography>
        <Tabs value={value} onChange={handleChange}>
          <Tab label="Client SDKs" id="clientsdk" />
          <Tab label="Secrets" id="secrets" />
          <Tab label="Core" id="core" />
          <Tab label="Create New User" id="createuser" />
        </Tabs>
      </Box>
      <Box className={classes.content}>{children}</Box>
    </Box>
  );
};

export default CmsLayout;
