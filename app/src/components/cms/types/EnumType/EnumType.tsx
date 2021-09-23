import React, { FC } from 'react';
import Box from '@material-ui/core/Box';
import FieldIndicators from '../../FieldIndicators';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import { makeStyles } from '@material-ui/core/styles';
import SelectIcon from '@material-ui/icons/FormatListBulleted';
import Grid from '@material-ui/core/Grid';

const useStyles = makeStyles((theme) => ({
  icon: {
    height: theme.spacing(3),
    width: theme.spacing(3),
    marginRight: theme.spacing(1),
    opacity: 0.6,
    display: 'flex',
    alignItems: 'center',
  },
}));

const EnumType: FC = ({ item, ...rest }) => {
  const classes = useStyles();

  return (
    <Box {...rest}>
      <Grid container>
        <Grid item xs={6} alignItems={'center'}>
          <Box display={'flex'} alignItems={'center'}>
            <Tooltip title={'Enum field'}>
              <SelectIcon className={classes.icon} />
            </Tooltip>
            <Typography variant={'body2'} style={{ opacity: 0.4 }}>
              {item.placeholder}
            </Typography>
          </Box>
        </Grid>
        <Grid container item xs={6} justify={'flex-end'} alignItems={'center'}>
          <Box display={'flex'} alignItems={'center'}>
            <FieldIndicators item={item} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EnumType;

export const EnumGroupType = ({ item, ...rest }) => {
  const classes = useStyles();

  return (
    <Box {...rest}>
      <Grid container>
        <Grid item xs={6} alignItems={'center'}>
          <Box display={'flex'} alignItems={'center'}>
            <Tooltip title={'Enum field'}>
              <SelectIcon className={classes.icon} />
            </Tooltip>
            <Typography variant={'body2'} style={{ opacity: 0.4 }}>
              {item.placeholder}
            </Typography>
          </Box>
        </Grid>
        <Grid container item xs={6} justify={'flex-end'} alignItems={'center'}>
          <Box display={'flex'} alignItems={'center'}>
            <FieldIndicators item={item} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
