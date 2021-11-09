import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import React, { useEffect, useState } from 'react';
import EmailDetails from './EmailDetails';
import { EmailTemplateType } from '../../models/emails/EmailModels';
import Image from 'next/dist/client/image';
import EmailImage from '../../assets/email.svg';
import { Paper } from '@material-ui/core';
import { enqueueInfoNotification } from '../../utils/useNotifier';
import { useAppDispatch } from '../../redux/store';
import sharedClasses from '../common/sharedClasses';
import DrawerButtons from '../common/DrawerButtons';

interface Props {
  handleCreate: (templateState: EmailTemplateType) => void;
  handleSave: (templateState: EmailTemplateType) => void;
  template: EmailTemplateType;
  edit: boolean;
  setEdit: (value: boolean) => void;
  create: boolean;
  setCreate: (value: boolean) => void;
}

const TabPanel: React.FC<Props> = ({
  handleCreate,
  handleSave,
  template,
  edit,
  setEdit,
  create,
  setCreate,
}) => {
  const classes = sharedClasses();
  const dispatch = useAppDispatch();

  const [templateState, setTemplateState] = useState<EmailTemplateType>({
    _id: 'newTemplate_id',
    name: '',
    subject: '',
    sender: '',
    externalManaged: false,
    body: '',
    variables: [],
  });

  useEffect(() => {
    if (!create)
      setTemplateState({
        _id: template._id,
        name: template.name,
        sender: template.sender,
        externalManaged: template.externalManaged,
        subject: template.subject,
        body: template.body,
        variables: template.variables,
      });
  }, [template, edit, create]);

  const handleSaveClick = () => {
    if (create) {
      handleCreate(templateState);
    } else {
      handleSave(templateState);
    }
    setCreate(false);
    setEdit(!edit);
  };

  const handleCancelClick = () => {
    if (create) {
      setTemplateState({
        _id: '',
        name: '',
        subject: '',
        body: '',
        variables: [],
        sender: '',
        externalManaged: false,
      });
      return;
    }
    setTemplateState({
      _id: template._id,
      name: template.name,
      subject: template.subject,
      body: template.body,
      sender: template.sender,
      externalManaged: template.externalManaged,
      variables: template.variables,
    });
  };

  const handleDisabled = () => {
    return templateState.name && templateState.subject && templateState.body;
  };

  const handleSenderChange = (value: string) => {
    if (value.includes('@')) {
      dispatch(
        enqueueInfoNotification('The mail server is already set on the config', 'templateSender')
      );
      return;
    }

    setTemplateState({
      ...templateState,
      sender: value,
    });
  };

  const handleTemplateNameChange = (value: string) => {
    const regex = /[^a-z0-9_]/gi;
    if (regex.test(value)) {
      dispatch(
        enqueueInfoNotification(
          'The template name can only contain alpharithmetics and _',
          'duplicate'
        )
      );
    }

    setTemplateState({
      ...templateState,
      name: value.replace(/[^a-z0-9_]/gi, ''),
    });
  };

  return (
    <Container className={classes.marginTop}>
      <Box>
        <Paper elevation={0} className={classes.paper}>
          <Grid container spacing={2} justify="space-around">
            {edit ? (
              <>
                <Grid item xs={12}>
                  <TextField
                    className={classes.textField}
                    label={'Template name'}
                    variant={'outlined'}
                    value={templateState.name}
                    onChange={(event) => {
                      handleTemplateNameChange(event.target.value);
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    className={classes.textField}
                    label={'Sender(optional)'}
                    variant={'outlined'}
                    value={templateState.sender}
                    onChange={(event) => handleSenderChange(event.target.value)}
                  />
                </Grid>
              </>
            ) : (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Template name:</Typography>
                  <Typography variant="h6">{templateState.name}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Sender:</Typography>
                  <Typography variant="h6">{templateState.sender}</Typography>
                </Grid>
              </>
            )}
          </Grid>
        </Paper>
        <Divider className={classes.divider} />
        <EmailDetails
          edit={edit}
          templateState={templateState}
          setTemplateState={setTemplateState}
        />
        <DrawerButtons
          edit={edit}
          setEdit={setEdit}
          handleCancelClick={handleCancelClick}
          handleSaveClick={handleSaveClick}
          handleDisabled={!handleDisabled()}
        />
        {!edit && (
          <div className={classes.centeredImg}>
            <Image src={EmailImage} width="200px" alt="mail" />
          </div>
        )}
      </Box>
    </Container>
  );
};

export default TabPanel;