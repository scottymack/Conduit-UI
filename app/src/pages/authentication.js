import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AuthAccordion from '../components/authentication/AuthAccordion';
import NewUserModal from '../components/authentication/NewUserModal';
import AuthSettings from '../components/authentication/AuthSettings';
import AuthUsers from '../components/authentication/AuthUsers';
import CustomTabs from '../components/common/CustomTabs';
import Paginator from '../components/common/Paginator';
import SearchFilter from '../components/authentication/SearchFilter';
import Grid from '@material-ui/core/Grid';
import { Layout } from '../components/navigation/Layout';
import { privateRoute } from '../components/utils/privateRoute';
import {
  getAuthUsersData,
  getConfig,
  updateConfig,
  addNewUserThunk,
  searchUsersThunk,
} from '../redux/thunks/authenticationThunks';
import ServiceAccountsTabs from '../components/authentication/ServiceAccountsTabs';
import Debounce from '../components/common/Debounce';
import AppState from '../components/common/AppState';
import { searchUsers } from '../redux/actions';



const Authentication = () => {
  const dispatch = useDispatch();

  const [selected, setSelected] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ filterValue: 'local' });

  // console.log(useSelector((state) => state.authenticationPageReducer.authUsersState));

  const {
    users: availableUsers,
    error: authUsersError,
    loading: usersLoading,
  } = useSelector((state) => state.authenticationPageReducer.authUsersState);

 

  console.log(availableUsers);

  const {
    data: configData,
    error: authConfigError,
    loading: configLoading,
  } = useSelector((state) => state.authenticationPageReducer.signInMethodsState);

  const handleFilterChange = (event) => {
    const name = event.target.name;
    setFilter({
      ...filter,
      [name]: event.target.value,
    });
  };

  console.log(filter.filterValue);

  useEffect(() => {
    if (search === '' || filter.filterValue === 'local') {
      dispatch(getAuthUsersData(skip, limit, search, filter));
      dispatch(getConfig());
    }
  }, [dispatch, search, filter, skip, limit]);

  useEffect(() => {
    if (search !== '' || filter.filterValue !== 'local') {
      
      debouncedSearch(search);
    }
  }, [search, filter, skip, limit]);

  

  const debouncedSearch = useCallback(
    Debounce((search) => {
      dispatch(getAuthUsersData(skip, limit, search, filter));
    }, 300),
    [search, filter, skip, limit]
  );





  useEffect(() => {
    if (configData && !configData.active) {
      setSelected(2);
    }
  }, [configData]);



  const handleLimitChange = (e, value) => {
    setLimit(parseInt(e.target.value, 10));
    setSkip(0);
    setPage(0);
  };

  const handlePageChange = (e, val) => {
    if (val > page) {
      setPage(page + 1);
      setSkip(skip + limit);
    } else {
      setPage(page - 1);
      setSkip(skip - limit);
    }
  };



  useEffect(() => {
    if (authUsersError || authConfigError) {
      setSnackbarOpen(true);
    }
  }, [authUsersError, authConfigError]);

  const tabs = [
    { title: 'Users', isDisabled: configData ? !configData.active : true },
    { title: 'Sign-In Method', isDisabled: configData ? !configData.active : true },
    { title: 'Service Accounts', isDisabled: false },
    { title: 'Settings', isDisabled: false },
  ];

  const handleChange = (event, newValue) => {
    setSelected(newValue);
  };

  const handleConfigChange = (type, newValue) => {
    const data = {
      ...configData,
      [type]: {
        ...newValue,
      },
    };
    dispatch(updateConfig(data));
  };

  const alertMessage = () => {
    if (authUsersError) {
      return authUsersError.data?.error
        ? authUsersError.data.error
        : 'Something went wrong!';
    }
    if (authConfigError) {
      return authConfigError.data?.error
        ? authConfigError.data.error
        : 'Something went wrong!';
    }
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleNewUserDispatch = (values) => {
    dispatch(addNewUserThunk(values));
    setSkip(0);
    setPage(0);
    setSearch('');
    setFilter({ filterValue: 'local' });
  };

  const handleSettingsSave = (data) => {
    const body = {
      ...configData,
      ...data,
    };
    dispatch(updateConfig(body));
  };

  return (
    <Layout itemSelected={1}>
      <Box p={2}>
        <Typography variant={'h4'}>Authentication</Typography>
        <CustomTabs tabs={tabs} selected={selected} handleChange={handleChange} />
        <Box
          role="tabpanel"
          hidden={selected !== 0 || (configData && !configData.active)}
          id={`tabpanel-0`}>
          <Grid container>
            <Grid item xs={6}>
              <SearchFilter
                // handleSearchChange={handleSearchChange}
                setSearch={setSearch}
                search={search}
                filter={filter}
                handleFilterChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={6}>
              <Paginator
                handlePageChange={handlePageChange}
                skip={skip}
                limit={limit}
                handleLimitChange={handleLimitChange}
                page={page}
              />
            </Grid>
          </Grid>
          {availableUsers ? (
            <AuthUsers users={availableUsers} />
          ) : (
            <Typography>No users available</Typography>
          )}

          <NewUserModal
            handleNewUserDispatch={handleNewUserDispatch}
            page={skip}
            limit={limit}
          />
        </Box>
        <Box
          role="tabpanel"
          hidden={selected !== 1 || (configData && !configData.active)}
          id={`tabpanel-1`}>
          {configData ? (
            <AuthAccordion
              configData={configData}
              configDataError={authConfigError}
              handleData={handleConfigChange}
            />
          ) : (
            <Typography>No config available</Typography>
          )}
        </Box>
        <Box role="tabpanel" hidden={selected !== 2} id={`tabpanel-2`}>
          <ServiceAccountsTabs />
        </Box>
        <Box role="tabpanel" hidden={selected !== 3} id={`tabpanel-3`}>
          <AuthSettings
            handleSave={handleSettingsSave}
            settingsData={configData}
            error={authConfigError}
          />
        </Box>
      </Box>
      <AppState
        message={alertMessage()}
        loading={usersLoading || configLoading}
        snackbarOpen={snackbarOpen}
        handleClose={handleClose}
      />
    </Layout>
  );
          };

export default privateRoute(Authentication);
