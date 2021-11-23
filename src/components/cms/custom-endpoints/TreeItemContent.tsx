import { Box, Button, Grid, Switch, Typography } from '@material-ui/core';
import React, { FC } from 'react';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';

interface Props {
  operator: any;
  editMode: boolean;
  handleOperatorChange: any;
  handleAddNode: any;
  handleRemoveNode: any;
  handleAddQuery: any;
}

const TreeItemContent: FC<Props> = ({
  operator,
  editMode,
  handleOperatorChange,
  handleAddNode,
  handleRemoveNode,
  handleAddQuery,
}) => {
  const handleChange = () => {
    if (operator === 'AND') handleOperatorChange('OR');
    if (operator === 'OR') handleOperatorChange('AND');
  };

  return (
    <Box width={'100%'} display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
      <Grid container justifyContent={'space-between'}>
        <Grid container item xs={7} spacing={1}>
          <Grid container item alignItems={'center'}>
            <Grid item>
              <Typography>AND</Typography>
            </Grid>
            <Grid item>
              <Switch
                color={'primary'}
                checked={operator === 'OR'}
                onClick={handleChange}
                disabled={!editMode}
              />
            </Grid>
            <Grid item>
              <Typography>OR</Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid container item xs={5} justifyContent={'flex-end'} spacing={1}>
          <Grid item>
            <Button
              variant="text"
              color={'primary'}
              startIcon={<AddCircleOutlineIcon />}
              disabled={!editMode}
              onClick={handleAddNode}>
              Node
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="text"
              color={'primary'}
              startIcon={<RemoveCircleOutlineIcon />}
              disabled={!editMode}
              onClick={handleRemoveNode}>
              Node
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="text"
              color={'primary'}
              startIcon={<AddCircleOutlineIcon />}
              disabled={!editMode}
              onClick={handleAddQuery}>
              Query
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TreeItemContent;
