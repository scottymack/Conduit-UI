import { Grid, IconButton, MenuItem, TextField, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React, { FC, Fragment, useCallback } from 'react';
import ActionTypes from '../../../models/ActionTypes';
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';
import OperationEnum from '../../../models/OperationsEnum';
import { deepClone } from '../../../utils/deepClone';
import { Assignment, Input } from '../../../models/customEndpoints/customEndpointsModels';

interface Props {
  editMode: boolean;
  operationType: number;
  selectedInputs: Input[];
  selectedAssignments: any;
  setSelectedAssignments: (assignments: Assignment[]) => void;
  availableFieldsOfSchema: [];
}

const useStyles = makeStyles((theme) => ({
  item: {
    paddingLeft: theme.spacing(4),
  },
  group: {
    fontWeight: 'inherit',
    opacity: '1',
  },
  remove: {
    marginBottom: theme.spacing(1.5),
  },
}));

const EndpointAssignments: FC<Props> = ({
  editMode,
  operationType,
  selectedInputs,
  selectedAssignments,
  setSelectedAssignments,
  availableFieldsOfSchema,
}) => {
  const classes = useStyles();
  const handleAssignmentFieldChange = (event: React.ChangeEvent<{ value: any }>, index: number) => {
    const value = event.target.value;
    const currentAssignments = selectedAssignments.slice();

    const input = { ...currentAssignments[index] };

    if (input) {
      input.schemaField = value;
      currentAssignments[index] = input;
      setSelectedAssignments(currentAssignments);
    }
  };

  const isArrayType = useCallback(
    (fieldName) => {
      const field: any = availableFieldsOfSchema.find((f: any) => f.name === fieldName);
      if (field) {
        return Array.isArray(field.type);
      }
      return false;
    },
    [availableFieldsOfSchema]
  );

  const isNumberType = useCallback(
    (fieldName) => {
      const field: any = availableFieldsOfSchema.find((f: any) => f.name === fieldName);
      if (field) {
        return field.type === 'Number';
      }
      return false;
    },
    [availableFieldsOfSchema]
  );

  const handleAssignmentActionChange = (
    event: React.ChangeEvent<{ value: any }>,
    index: number
  ) => {
    const value = event.target.value;
    const currentAssignments = deepClone(selectedAssignments);
    const input = currentAssignments[index];
    if (input) {
      input.action = Number(value);
      setSelectedAssignments(currentAssignments);
    }
  };

  const handleAssignmentValueFieldChange = (
    event: React.ChangeEvent<{ value: any }>,
    index: number
  ) => {
    const value = event.target.value;
    const type = value.split('-')[0];
    const actualValue = value.split('-')[1];
    const currentAssignments = deepClone(selectedAssignments);
    const assignment = currentAssignments[index];
    if (assignment) {
      assignment.assignmentField.type = type;
      assignment.assignmentField.value = actualValue ? actualValue : '';

      setSelectedAssignments(currentAssignments);
    }
  };

  const handleAssignmentCustomValueChange = (
    event: React.ChangeEvent<{ value: any }>,
    index: number
  ) => {
    const value = event.target.value;
    const currentAssignments = deepClone(selectedAssignments);
    const assignment = currentAssignments[index];
    if (assignment) {
      assignment.assignmentField.value = value;
      setSelectedAssignments(currentAssignments);
    }
  };

  const handleAssignmentContextValueChange = (
    event: React.ChangeEvent<{ value: any }>,
    index: number
  ) => {
    const value = event.target.value;
    const currentAssignments = deepClone(selectedAssignments);
    const assignment = currentAssignments[index];
    if (assignment) {
      assignment.assignmentField.value = value;
      setSelectedAssignments(currentAssignments);
    }
  };

  const handleRemoveAssignment = (index: number) => {
    const currentAssignments = selectedAssignments.slice();
    currentAssignments.splice(index, 1);
    setSelectedAssignments(currentAssignments);
  };

  return selectedAssignments.map((assignment: Assignment, index: number) => (
    <>
      <Fragment key={`assignment-${index}`}>
        <Grid item xs={1}>
          <Typography>{index + 1}.</Typography>
        </Grid>
        <Grid item xs={3}>
          <TextField
            select
            label={'Schema Field'}
            variant="outlined"
            fullWidth
            value={assignment.schemaField}
            disabled={!editMode}
            onChange={(event) => handleAssignmentFieldChange(event, index)}>
            <MenuItem aria-label="None" value="" />
            {availableFieldsOfSchema.map((field: any, index: number) => (
              <MenuItem key={`idx-${index}-field`} value={field.name}>
                {field.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={2}>
          <TextField
            select
            label={'Actions'}
            variant="outlined"
            fullWidth
            value={assignment.action}
            disabled={!editMode}
            onChange={(event) => handleAssignmentActionChange(event, index)}>
            <MenuItem aria-label="None" value="" />
            <MenuItem value={ActionTypes.SET}>SET</MenuItem>
            <MenuItem
              disabled={!isNumberType(assignment.schemaField)}
              value={ActionTypes.INCREMENT}>
              INCREMENT
            </MenuItem>
            <MenuItem
              disabled={!isNumberType(assignment.schemaField)}
              value={ActionTypes.DECREMENT}>
              DECREMENT
            </MenuItem>
            <MenuItem disabled={!isArrayType(assignment.schemaField)} value={ActionTypes.APPEND}>
              APPEND
            </MenuItem>
            <MenuItem disabled={!isArrayType(assignment.schemaField)} value={ActionTypes.REMOVE}>
              REMOVE
            </MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={2}>
          <TextField
            select
            label={'Assignment value'}
            variant="outlined"
            fullWidth
            value={
              assignment.assignmentField.type === 'Custom' ||
              assignment.assignmentField.type === 'Context'
                ? assignment.assignmentField.type
                : assignment.assignmentField.type + '-' + assignment.assignmentField.value
            }
            disabled={!editMode}
            onChange={(event) => handleAssignmentValueFieldChange(event, index)}>
            <MenuItem aria-label="None" value="" />
            <MenuItem disabled className={classes.group}>
              Custom Value
            </MenuItem>
            <MenuItem className={classes.item} value={'Custom'}>
              Add a custom value
            </MenuItem>
            <MenuItem disabled className={classes.group}>
              Context Value
            </MenuItem>
            <MenuItem className={classes.item} value={'Context'}>
              Add a value from context
            </MenuItem>
            <MenuItem disabled className={classes.group}>
              Input Fields
            </MenuItem>
            {selectedInputs.map((input: any, index: number) => (
              <MenuItem
                className={classes.item}
                key={`idx-${index}-input`}
                value={'Input-' + input.name}>
                {input.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        {assignment.assignmentField.type === 'Custom' ||
        assignment.assignmentField.type === 'Context' ? (
          <Grid item xs={2}>
            <TextField
              label={assignment.assignmentField.type + ' Value'}
              variant={'outlined'}
              disabled={!editMode}
              fullWidth
              placeholder={'Value'}
              value={assignment.assignmentField.value}
              onChange={(event) =>
                assignment.assignmentField.type === 'Custom'
                  ? handleAssignmentCustomValueChange(event, index)
                  : handleAssignmentContextValueChange(event, index)
              }
            />
          </Grid>
        ) : (
          <Grid item xs={2} />
        )}
        <Grid item xs={1} />
        <Grid item xs={1} className={classes.remove}>
          {operationType !== OperationEnum.POST && (
            <IconButton
              disabled={!editMode}
              size="small"
              onClick={() => handleRemoveAssignment(index)}>
              <RemoveCircleOutlineIcon />
            </IconButton>
          )}
        </Grid>
      </Fragment>
    </>
  ));
};

export default EndpointAssignments;
