import React, { FC } from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Content from '@material-ui/icons/PermMedia';
import Typography from '@material-ui/core/Typography';
import DeleteIcon from '@material-ui/icons/Delete';
import SettingsIcon from '@material-ui/icons/Settings';
import DragHandleIcon from '@material-ui/icons/DragHandle';
import SimpleType from './types/SimpleType/SimpleType';
import BooleanType from './types/BooleanType/BooleanType';
import GroupType from './types/GroupType/GroupType';
import EnumType from './types/EnumType/EnumType';
import ObjectIdType from './types/ObjectIdType/ObjectIdType';
import RelationType from './types/RelationType/RelationType';
import Button from '@material-ui/core/Button';
import { BoxProps } from '@material-ui/core/Box/Box';

const useStyles = makeStyles((theme) => ({
  list: {
    height: '100%',
    border: '1px',
    background: '#303030',
    padding: theme.spacing(4, 10),
    minHeight: theme.spacing(65),
    borderRadius: '4px',
  },
  item: {
    display: 'flex',
    flexDirection: 'column-reverse',
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    borderLeft: '1px solid #dce0e5',
  },
  icon: {
    height: theme.spacing(3),
    width: theme.spacing(3),
    marginLeft: theme.spacing(1),
    cursor: 'pointer',
  },
  listPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: theme.spacing(47),
    border: 'dashed 1px #667587',
  },
  listPlaceholderItems: {
    marginBottom: theme.spacing(2),
  },
  button: {
    minWidth: 0,
    minHeight: 0,
    padding: 0,
    margin: 0,
  },
}));

interface Props extends BoxProps {
  dataKey: any;
  data: any;
  handleDrawer: (item: any, index: number) => void;
  handleDelete: (index: number) => void;
  handleGroupDrawer: (groupItem: any, index: number, groupIndex: number) => void;
  handleGroupDelete: (index: number, groupIndex: number) => void;
  handleGroupInGroupDelete: (
    index: number,
    groupIndex: number,
    itemIndex: number
  ) => void;
  handleGroupInGroupDrawer: (
    groupItem: any,
    index: number,
    groupIndex: number,
    itemIndex: number
  ) => void;
}

const BuildTypesContent: FC<Props> = ({
  dataKey,
  data,
  handleDrawer,
  handleDelete,
  handleGroupDelete,
  handleGroupDrawer,
  handleGroupInGroupDelete,
  handleGroupInGroupDrawer,
  ...rest
}) => {
  const classes = useStyles();

  const handleItemContent = (item: any, index: number) => {
    switch (item.type) {
      case 'Text':
        return item.isEnum ? <EnumType item={item} /> : <SimpleType item={item} />;
      case 'Number':
        return item.isEnum ? <EnumType item={item} /> : <SimpleType item={item} />;
      case 'Date':
        return <SimpleType item={item} />;
      case 'ObjectId':
        return <ObjectIdType item={item} />;
      case 'Boolean':
        return <BooleanType item={item} />;
      case 'Relation':
        return <RelationType item={item} />;
      case 'Group':
        return (
          <GroupType
            item={item}
            groupIndex={index}
            handleDelete={handleGroupDelete}
            handleDrawer={handleGroupDrawer}
            handleGroupDelete={handleGroupInGroupDelete}
            handleGroupDrawer={handleGroupInGroupDrawer}
          />
        );
      default:
        return null;
    }
  };

  const checkIfDisabled = (name: string) => {
    return name === '_id' || name === 'createdAt' || name === 'updatedAt';
  };

  return (
    <Box {...rest}>
      <Droppable droppableId={dataKey}>
        {(provided, snapshot) => (
          <div className={classes.list} ref={provided.innerRef}>
            {data && Array.isArray(data[dataKey]) && data[dataKey].length > 0 ? (
              data[dataKey].map((item: any, index: number) => (
                <Draggable key={item.name} draggableId={item.name} index={index}>
                  {(provided) => (
                    <div
                      className={classes.item}
                      ref={provided.innerRef}
                      {...provided.draggableProps}>
                      <Box width={'99%'}>{handleItemContent(item, index)}</Box>
                      <Box display={'flex'} flexDirection={'column'} width={'99%'} mb={2}>
                        <Box
                          display={'flex'}
                          width={'100%'}
                          justifyContent={'space-between'}>
                          <Box display={'flex'}>
                            <Typography variant={'body2'} style={{ marginRight: 8 }}>
                              Field name: <strong>{item.name}</strong>
                            </Typography>
                          </Box>
                          <Box display={'flex'}>
                            <Button
                              onClick={() => handleDelete(index)}
                              className={classes.button}
                              disabled={checkIfDisabled(item.name)}>
                              <DeleteIcon className={classes.icon} />
                            </Button>
                            <Button
                              onClick={() => handleDrawer(item, index)}
                              className={classes.button}
                              disabled={checkIfDisabled(item.name)}>
                              <SettingsIcon className={classes.icon} />
                            </Button>
                            <Box {...provided.dragHandleProps} className={classes.icon}>
                              <DragHandleIcon />
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </div>
                  )}
                </Draggable>
              ))
            ) : (
              <Box
                className={classes.listPlaceholder}
                style={snapshot.isDraggingOver ? { opacity: 0.4 } : {}}>
                <Content className={classes.listPlaceholderItems} />
                <Typography
                  variant={'subtitle2'}
                  className={classes.listPlaceholderItems}>
                  Simply drag and drop
                </Typography>
                <Typography variant={'body2'}>
                  The fields or elements you want in this custom type
                </Typography>
              </Box>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </Box>
  );
};

export default BuildTypesContent;