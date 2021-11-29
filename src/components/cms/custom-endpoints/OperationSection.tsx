import React, { FC, useCallback, useEffect, useState } from 'react';
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  Select,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import OperationsEnum from '../../../models/OperationsEnum';
import { findFieldsWithTypes, getAvailableFieldsOfSchema } from '../../../utils/cms';
import { setEndpointData, setSchemaFields } from '../../../redux/slices/customEndpointsSlice';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { Schema } from '../../../models/cms/CmsModels';
import { Assignment } from '../../../models/customEndpoints/customEndpointsModels';
import TableDialog from '../../common/TableDialog';
import { Pagination, Search } from '../../../models/http/HttpModels';
import { asyncGetCmsSchemas, asyncGetCmsSchemasDialog } from '../../../redux/slices/cmsSlice';
import SelectedElements from '../../common/SelectedElements';

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 180,
  },
  divider: {
    '&.MuiDivider-root': {
      height: '2px',
      background: '#000000',
      borderRadius: '4px',
    },
  },
}));

interface Props {
  schemas: any;
  editMode: boolean;
  availableSchemas: Schema[];
}

const OperationSection: FC<Props> = ({ schemas, editMode, availableSchemas }) => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const [drawer, setDrawer] = useState<boolean>(false);
  const [selectedSchema, setSelectedSchema] = useState<Schema[]>([]);
  const { endpoint, schemaFields } = useAppSelector((state) => state.customEndpointsSlice.data);

  const handleOperationChange = (event: React.ChangeEvent<{ value: any }>) => {
    const operation = Number(event.target.value);
    const assignments: Assignment[] = [];
    if (operation === 1) {
      if (endpoint.selectedSchema) {
        if (schemaFields.length > 0) {
          schemaFields.forEach((field) => {
            const assignment: Assignment = {
              schemaField: field,
              action: 0,
              assignmentField: { type: '', value: '' },
            };
            assignments.push(assignment);
          });
        }
      }
    }
    dispatch(setEndpointData({ operation, assignments }));
  };

  const handleSchemaChange = (event: React.ChangeEvent<{ value: any }>) => {
    const assignments: Assignment[] = [];
    const selectedSchema = event.target.value;
    const fields = getAvailableFieldsOfSchema(selectedSchema, schemas);
    const fieldsWithTypes = findFieldsWithTypes(fields);
    if (endpoint.operation && endpoint.operation === OperationsEnum.POST) {
      const fieldKeys = Object.keys(fields);

      fieldKeys.forEach((field) => {
        const assignment: Assignment = {
          schemaField: field,
          action: 0,
          assignmentField: { type: '', value: '' },
        };
        assignments.push(assignment);
      });
    }
    dispatch(setEndpointData({ selectedSchema, assignments }));
    dispatch(setSchemaFields(fieldsWithTypes));
  };

  const handleAuthenticationChange = (event: React.ChangeEvent<{ checked: boolean }>) => {
    dispatch(setEndpointData({ authentication: event.target.checked }));
  };

  const handlePaginatedChange = (event: React.ChangeEvent<{ checked: boolean }>) => {
    dispatch(setEndpointData({ paginated: event.target.checked }));
  };

  const handleSortedChange = (event: React.ChangeEvent<{ checked: boolean }>) => {
    dispatch(setEndpointData({ sorted: event.target.checked }));
  };

  const { schemas: schemasForDialog, schemasCount } = useAppSelector(
    (state) => state.cmsSlice.data.schemasForDialog
  );

  useEffect(() => {
    const foundSchema = availableSchemas.find((schema) => schema._id === endpoint.selectedSchema);
    foundSchema && setSelectedSchema([foundSchema]);
    const assignments: Assignment[] = [];
    const fields = getAvailableFieldsOfSchema(selectedSchema[0]._id, schemas);
    console.log(fields);
    const fieldsWithTypes = findFieldsWithTypes(fields);

    if (endpoint.operation && endpoint.operation === OperationsEnum.POST) {
      const fieldKeys = Object.keys(fields);

      fieldKeys.forEach((field) => {
        const assignment: Assignment = {
          schemaField: field,
          action: 0,
          assignmentField: { type: '', value: '' },
        };
        assignments.push(assignment);
      });
    }
    dispatch(setEndpointData({ selectedSchema, assignments }));
    dispatch(setSchemaFields(fieldsWithTypes));
  }, [endpoint.selectedSchema, availableSchemas, selectedSchema, endpoint.operation]);

  const getData = useCallback(
    (params: Pagination & Search) => {
      dispatch(asyncGetCmsSchemasDialog({ ...params, enabled: true }));
    },
    [dispatch]
  );

  console.log(schemasForDialog);

  const headers = [
    { title: '_id' },
    { title: 'Name', sort: 'name' },
    { title: 'Authenticated' },
    { title: 'CRUD' },
    { title: 'Created at', sort: 'createdAt' },
    { title: 'Updated at', sort: 'updatedAt' },
  ];

  const formatSchemas = (schemasToFormat: Schema[]) => {
    if (schemasToFormat !== undefined) {
      return schemasToFormat.map((d) => ({
        _id: d._id,
        name: d.name,
        authentication: d.authentication,
        crudOperations: d.crudOperations,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      }));
    }
  };

  const removeSelectedSchema = (i: number) => {
    const filteredArray = selectedSchema.filter((user, index) => index !== i);
    setSelectedSchema(filteredArray);
  };

  return (
    <>
      <Grid item xs={3}>
        <FormControl className={classes.formControl}>
          <InputLabel htmlFor="select_operation">Select Operation</InputLabel>
          <Select
            disabled={!editMode}
            native
            value={endpoint.operation}
            onChange={handleOperationChange}
            labelWidth={100}
            inputProps={{
              name: 'select_operation',
              id: 'select_operation',
            }}>
            <option aria-label="None" value="" />
            <option value={OperationsEnum.GET}>Find/Get</option>
            <option value={OperationsEnum.POST}>Create</option>
            <option value={OperationsEnum.PUT}>Update/Edit</option>
            <option value={OperationsEnum.DELETE}>Delete</option>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={3}>
        <Grid item sm={12}>
          <SelectedElements
            selectedElements={selectedSchema.map((schema) => schema.name)}
            handleButtonAction={() => setDrawer(true)}
            removeSelectedElement={removeSelectedSchema}
            buttonText={'Select Schema'}
            header={'Selected schema'}
          />
        </Grid>
      </Grid>
      <Grid item xs={endpoint.operation === OperationsEnum.GET ? 2 : 4}>
        <FormControlLabel
          control={
            <Checkbox
              disabled={!editMode}
              color={'primary'}
              checked={endpoint.authentication}
              onChange={handleAuthenticationChange}
              name="authentication"
            />
          }
          label="Authenticated"
        />
      </Grid>
      {endpoint.operation === OperationsEnum.GET && (
        <Grid item xs={2}>
          <FormControlLabel
            control={
              <Checkbox
                disabled={!editMode}
                color={'primary'}
                checked={endpoint.paginated}
                onChange={handlePaginatedChange}
                name="paginated"
              />
            }
            label="Paginated"
          />
        </Grid>
      )}
      {endpoint.operation === OperationsEnum.GET && (
        <Grid item xs={2}>
          <FormControlLabel
            control={
              <Checkbox
                disabled={!editMode}
                color={'primary'}
                checked={endpoint.sorted}
                onChange={handleSortedChange}
                name="sorted"
              />
            }
            label="Sorted"
          />
        </Grid>
      )}
      <TableDialog
        open={drawer}
        singleSelect
        title={'Select schema'}
        headers={headers}
        getData={getData}
        data={{
          tableData: schemasForDialog && formatSchemas(schemasForDialog),
          count: schemasCount,
        }}
        handleClose={() => setDrawer(false)}
        buttonText={'Select schema'}
        setExternalElements={setSelectedSchema}
        externalElements={selectedSchema}
      />
    </>
  );
};

export default OperationSection;
