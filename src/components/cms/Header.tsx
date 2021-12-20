import React, { FC, useEffect, useState } from 'react';
import { Box, Typography, Button, Input, Checkbox } from '@material-ui/core';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { clearSelectedSchema } from '../../redux/slices/cmsSlice';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { enqueueInfoNotification } from '../../utils/useNotifier';

export const headerHeight = 64;

const useStyles = makeStyles((theme) => ({
  header: {
    zIndex: 9999,
    height: headerHeight,
    backgroundColor: theme.palette.primary.main,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'fixed',
    top: 0,
    right: 0,
    left: 0,
  },
  input: {
    height: theme.spacing(5),
    padding: theme.spacing(1),
    marginRight: theme.spacing(3),
    '&:hover': {
      border: '1px solid',
      borderColor: 'rgba(255,255,255,0.5)',
    },
    borderBottom: '1px solid rgba(255,255,255,0.5)',
  },
  checkbox: {
    color: '#FFFFFF',
    '&.Mui-checked': {
      color: '#FFFFFF',
    },
  },
  backIconContainer: {
    height: theme.spacing(8),
    width: theme.spacing(8),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing(3),
    cursor: 'pointer',
  },
  backIcon: {
    height: theme.spacing(5),
    width: theme.spacing(5),
  },
  selectMenu: {
    backgroundColor: theme.palette.primary.main,
  },
  saveButton: {
    margin: theme.spacing(0, 2),
  },
  saveIcon: {
    height: theme.spacing(3),
    width: theme.spacing(3),
    marginRight: theme.spacing(1),
  },
  colorWhite: {
    color: theme.palette.common.white,
  },
}));

interface Props {
  name: string;
  authentication: boolean;
  crudOperations: boolean;
  readOnly: boolean;
  handleSave: (name: string, readOnly: boolean, crud: boolean) => void;
}

const Header: FC<Props> = ({
  name,
  authentication,
  crudOperations,
  readOnly,
  handleSave,
  ...rest
}) => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const [schemaName, setSchemaName] = useState(name);
  const [schemaAuthentication, setSchemaAuthentication] = useState(false);
  const [schemaCrudOperations, setSchemaCrudOperations] = useState(false);

  useEffect(() => {
    setSchemaName(name);
    if (authentication !== null && authentication !== undefined) {
      setSchemaAuthentication(authentication);
    }
    if (crudOperations !== null && crudOperations !== undefined) {
      setSchemaCrudOperations(crudOperations);
    }
  }, [authentication, crudOperations, name]);

  const handleDataName = (value: string) => {
    const regex = /[^a-z0-9_]/gi;
    if (regex.test(value)) {
      dispatch(enqueueInfoNotification('The schema name can only contain alpharithmetics and _'));
    }

    setSchemaName(value.replace(/[^a-z0-9_]/gi, ''));
  };

  const handleData = () => {
    handleSave(schemaName, schemaAuthentication, schemaCrudOperations);
  };

  const handleBackButtonClick = () => {
    dispatch(clearSelectedSchema());
  };

  return (
    <Box className={clsx(classes.header, classes.colorWhite)} {...rest}>
      <Box display={'flex'} alignItems={'center'}>
        <Link href="/cms/schemas">
          {/* TODO call dispatch clear cms */}
          <a style={{ textDecoration: 'none' }} onClick={handleBackButtonClick}>
            <Box className={classes.backIconContainer}>
              <ArrowBackIcon
                onClick={() => clearSelectedSchema}
                className={clsx(classes.backIcon, classes.colorWhite)}
              />
            </Box>
          </a>
        </Link>
        <Input
          className={clsx(classes.input, classes.colorWhite)}
          id="data-name"
          placeholder={'Schema name'}
          onChange={(event) => handleDataName(event.target.value)}
          disableUnderline
          value={schemaName}
          readOnly={readOnly}
        />
        <FormControlLabel
          control={
            <Checkbox
              className={classes.checkbox}
              checked={schemaAuthentication}
              onChange={(event) => {
                setSchemaAuthentication(event.target.checked);
              }}
              name="authentication"
            />
          }
          label="Authentication required"
        />
        <FormControlLabel
          control={
            <Checkbox
              className={classes.checkbox}
              checked={schemaCrudOperations}
              onChange={(event) => {
                setSchemaCrudOperations(event.target.checked);
              }}
              name="crudOperations"
            />
          }
          label="Allow Crud Operations"
        />
      </Box>
      <Box display={'flex'} alignItems={'center'}>
        <Button
          className={clsx(classes.saveButton, classes.colorWhite)}
          onClick={() => handleData()}>
          <SaveIcon className={classes.saveIcon} />
          <Typography>Save</Typography>
        </Button>
      </Box>
    </Box>
  );
};

export default Header;