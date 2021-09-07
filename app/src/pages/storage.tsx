import { Layout } from '../components/navigation/Layout';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import CustomTabs from '../components/common/CustomTabs';
import React, { useEffect, useState } from 'react';
import { privateRoute } from '../components/utils/privateRoute';
import StorageFiles from '../components/storage/StorageFiles';
import StorageSettings from '../components/storage/StorageSettings';
import { useDispatch, useSelector } from 'react-redux';
import { saveStorageConfig } from '../redux/thunks/storageThunks';
import { getStorageConfig } from '../redux/thunks/storageThunks';
import Snackbar from '@material-ui/core/Snackbar';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import { SnackbarCloseReason } from '@material-ui/core/Snackbar/Snackbar';
import { IStorageConfig } from '../models/storage/StorageModels';

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
  },
  snackBar: {
    maxWidth: '80%',
    width: 'auto',
  },
}));
const tabs = [{ title: 'Files' }, { title: 'Settings' }];

const Storage: React.FC = () => {
  const classes = useStyles();
  const [selected, setSelected] = useState(0);
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector(
    (state: {
      storageReducer: {
        data: { config: IStorageConfig };
        loading: boolean;
        error: any;
      };
    }) => state.storageReducer
  );
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    dispatch(getStorageConfig());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      setSnackbarOpen(true);
    }
  }, [error]);

  const handleChange = (event: React.ChangeEvent<any>, newValue: number) => {
    setSelected(newValue);
  };

  const handleStorageSettings = (data: IStorageConfig) => {
    dispatch(saveStorageConfig(data));
  };

  const snackbarAlert = () => {
    if (error) {
      return (
        <Alert variant={'filled'} severity="error">
          {error?.data?.error ? error.data.error : 'Something went wrong!'}
        </Alert>
      );
    } else {
      return undefined;
    }
  };

  const handleClose = (event: React.SyntheticEvent<any>, reason: SnackbarCloseReason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <Layout itemSelected={6}>
      <Box p={2}>
        <Typography variant={'h4'}>Storage</Typography>
        <CustomTabs tabs={tabs} selected={selected} handleChange={handleChange} />
        <Box role="tabpanel" hidden={selected !== 0} id={`tabpanel-0`}>
          <StorageFiles />
        </Box>
        <Box role="tabpanel" hidden={selected !== 1} id={`tabpanel-1`}>
          <StorageSettings config={data.config} handleSave={handleStorageSettings} />
        </Box>
      </Box>
      <Snackbar
        open={snackbarOpen}
        className={classes.snackBar}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        {snackbarAlert()}
      </Snackbar>
      <Backdrop open={loading} className={classes.backdrop}>
        <CircularProgress color="secondary" />
      </Backdrop>
    </Layout>
  );
};

export default privateRoute(Storage);