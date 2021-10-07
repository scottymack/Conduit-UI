import React, { ChangeEvent } from 'react';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Accordion from '@material-ui/core/Accordion';
import { makeStyles } from '@material-ui/core/styles';
import { InputLabel, MenuItem, Select } from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import { SocialDataTypes, SocialNameTypes } from '../../models/authentication/AuthModels';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  titleContent: {
    backgroundColor: theme.palette.grey[200],
    height: theme.spacing(6),
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  expandedPanel: {
    '&.MuiAccordion-root.Mui-expanded': {
      marginTop: '20px',
    },
  },
  details: {
    borderTop: '1px solid',
    borderColor: 'rgb(217, 217, 217)',
  },
  typography: {
    flex: 1,
  },
  statusEnabled: {
    color: theme.palette.secondary.main,
  },
  statusDisabled: {
    color: theme.palette.primary.main,
  },
}));

interface Props {
  name: string;
  expanded: SocialNameTypes[];
  setAccProps: any;
  openExpanded: (value: SocialNameTypes) => void;
  accProps: SocialDataTypes;
}

const ReusableAccordion: React.FC<Props> = ({
  setAccProps,
  expanded,
  children,
  name,
  openExpanded,
  accProps,
}) => {
  const classes = useStyles();

  return (
    <Accordion
      expanded={expanded.includes(name)}
      onChange={() => openExpanded(name)}
      style={{ cursor: 'default' }}
      classes={{ root: classes.expandedPanel }}>
      <AccordionSummary id={'local'}>
        <Box display={'flex'} alignItems={'center'} flex={1}>
          <Typography variant={'subtitle2'} className={classes.typography}>
            {name}
          </Typography>
          <Typography
            variant={'subtitle2'}
            className={
              accProps.enabled
                ? clsx(classes.typography, classes.statusEnabled)
                : clsx(classes.typography, classes.statusDisabled)
            }>
            {accProps.enabled ? 'Enabled' : 'Disabled'}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails classes={{ root: classes.details }}>
        <Box
          display={'flex'}
          flexDirection={'column'}
          justifyContent={'space-between'}
          alignItems={'center'}
          width={'100%'}>
          <Box
            mb={2}
            maxWidth={800}
            display={'flex'}
            width={'100%'}
            flexDirection={'column'}
            alignItems={'center'}>
            <Box
              width={'100%'}
              display={'inline-flex'}
              justifyContent={'space-between'}
              alignItems={'center'}>
              <Typography variant={'button'} style={{ width: '100%' }}>
                Allow users to sign up using their {name} account.
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={accProps.enabled}
                    onChange={() =>
                      setAccProps({
                        ...accProps,
                        enabled: !accProps.enabled,
                      })
                    }
                    value={'enabled'}
                    color="primary"
                  />
                }
                label={accProps.enabled ? 'Enabled' : 'Disabled'}
              />
            </Box>
            {accProps &&
              Object.entries(accProps).map(([key, value]) => {
                if (typeof value === 'boolean' && key !== 'enabled') {
                  return (
                    <Box
                      width={'100%'}
                      key={key}
                      display={'inline-flex'}
                      justifyContent={'space-between'}
                      alignItems={'center'}>
                      <Typography variant={'overline'} style={{ width: '100%' }}>
                        {key.split(/(?=[A-Z])/).join(' ')}
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={value}
                            name={key}
                            onChange={() =>
                              setAccProps({
                                ...accProps,
                                [key]: !value,
                              })
                            }
                            value={value}
                            color="primary"
                          />
                        }
                        label={value ? 'Enabled' : 'Disabled'}
                        disabled={!accProps.enabled || accProps?.identifier === 'username'}
                      />
                    </Box>
                  );
                }
              })}
            {accProps.identifier !== undefined ? (
              <Box width={'100%'} mt={2}>
                <Grid container item xs={8}>
                  <FormControl variant="outlined" fullWidth>
                    <InputLabel id="identifier-label">Identifier</InputLabel>
                    <Select
                      id="identifier-id"
                      labelId="identifier-label"
                      name="identifier"
                      style={{ width: '100%', marginBottom: 8 }}
                      value={accProps.identifier}
                      placeholder={'identifier'}
                      disabled={!accProps.enabled}
                      onChange={(e) =>
                        setAccProps({
                          ...accProps,
                          identifier: e.target.value,
                        })
                      }
                      label="Identifier">
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      <MenuItem value={'email'}>email</MenuItem>
                      <MenuItem value={'username'}>username</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Box>
            ) : (
              ''
            )}
            {Object.entries(accProps).map(([key, value]) => {
              if (typeof value === 'string' && key !== 'identifier') {
                return (
                  <Box width={'100%'} mt={2} key={key}>
                    <Grid container item xs={8}>
                      <TextField
                        style={{ width: '100%', marginBottom: 8 }}
                        id={key}
                        label={key
                          .split(/(?=[A-Z&])/)
                          .join(' ')
                          .replaceAll('_', ' ')}
                        name={key}
                        variant="outlined"
                        value={value}
                        onChange={(e) =>
                          setAccProps({ ...accProps, [e.target.name]: e.target.value })
                        }
                        placeholder={key}
                        disabled={!accProps.enabled}
                      />
                    </Grid>
                  </Box>
                );
              }
            })}
          </Box>
          <Box alignSelf={'flex-end'}>{children}</Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default ReusableAccordion;
