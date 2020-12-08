import { Container } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Divider from '@material-ui/core/Divider';
import MenuItem from '@material-ui/core/MenuItem';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    color: theme.palette.text.secondary,
  },
  textField: {
    marginBottom: theme.spacing(2),
  },
  typography: {
    marginBottom: theme.spacing(4),
  },
  innerGrid: {
    paddingLeft: theme.spacing(4),
  },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    width: '100%',
  },
}));

const ProviderData = ({ settings, error, handleSave }) => {
  const classes = useStyles();
  const [settingsState, setSettingsState] = useState({
    active: false,
    transport: '',
    transportSettings: { apiKey: '', domain: '', host: '' },
  });

  useEffect(() => {
    if (!settings) {
      return;
    }
    setSettingsState({
      active: settings.active,
      transport: settings.transport,
      transportSettings: {
        apiKey:
          settings.transportSettings && settings.transportSettings[settings.transport]
            ? settings.transportSettings[settings.transport].apiKey
            : '',
        domain:
          settings.transportSettings && settings.transportSettings[settings.transport]
            ? settings.transportSettings[settings.transport].domain
            : '',
        host:
          settings.transportSettings && settings.transportSettings[settings.transport]
            ? settings.transportSettings[settings.transport].host
            : '',
      },
    });
  }, [settings, error]);

  const handleCancel = () => {
    setSettingsState({
      ...settingsState,
      active: settings.active,
      transport: settings.transport,
    });
  };

  const onSaveClick = () => {
    const data = {
      active: settingsState.active,
      transport: settingsState.transport,
      transportSettings: {
        [settingsState.transport]: {
          apiKey: settingsState.transportSettings.apiKey,
          domain: settingsState.transportSettings.domain,
          host: settingsState.transportSettings.host,
        },
      },
    };
    handleSave(data);
  };

  const renderSettingsFields = () => {
    return (
      <>
        <Grid item xs={12}>
          <Typography variant={'h6'}>Transport</Typography>
        </Grid>
        <Grid item xs={12}>
          <TextField
            select
            label=""
            value={settingsState.transport}
            onChange={(event) => {
              setSettingsState({
                ...settingsState,
                transport: event.target.value,
              });
            }}
            helperText="Select your transport provider"
            variant="outlined">
            <MenuItem key={'mailgun'} value={'mailgun'}>
              Mailgun
            </MenuItem>
            <MenuItem key={'smtp'} value={'smtp'}>
              Smtp
            </MenuItem>
          </TextField>
        </Grid>
        <Divider className={classes.divider} />
        <Grid item xs={12}>
          <Typography variant={'h6'}>Transport settings</Typography>
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            id="apiKey"
            label="API key"
            variant="outlined"
            value={settingsState.transportSettings.apiKey}
            onChange={(event) => {
              setSettingsState({
                ...settingsState,
                transportSettings: {
                  ...settingsState.transportSettings,
                  apiKey: event.target.value,
                },
              });
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            id="domain"
            label="Domain"
            variant="outlined"
            value={settingsState.transportSettings.domain}
            onChange={(event) => {
              setSettingsState({
                ...settingsState,
                transportSettings: {
                  ...settingsState.transportSettings,
                  domain: event.target.value,
                },
              });
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            id="host"
            label="Host"
            variant="outlined"
            value={settingsState.transportSettings.host}
            onChange={(event) => {
              setSettingsState({
                ...settingsState,
                transportSettings: {
                  ...settingsState.transportSettings,
                  host: event.target.value,
                },
              });
            }}
          />
        </Grid>
      </>
    );
  };

  return (
    <Container>
      <Paper className={classes.paper}>
        <Grid container>
          <Box
            width={'100%'}
            display={'inline-flex'}
            justifyContent={'space-between'}
            alignItems={'center'}>
            <Typography variant={'h6'}>Email Settings Module</Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settingsState.active}
                  onChange={() =>
                    setSettingsState({
                      ...settingsState,
                      active: !settingsState.active,
                    })
                  }
                  value={'active'}
                  color="primary"
                />
              }
              label={''}
            />
          </Box>

          <Divider className={classes.divider} />

          <Grid container spacing={2} className={classes.innerGrid}>
            {settingsState.active && renderSettingsFields()}
          </Grid>
          <Grid item container xs={12} justify={'flex-end'}>
            <Button
              onClick={() => handleCancel()}
              style={{ marginRight: 16 }}
              color={'primary'}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              style={{ alignSelf: 'flex-end' }}
              onClick={() => onSaveClick()}>
              Save
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default ProviderData;