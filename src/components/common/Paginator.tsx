import React from 'react';
import Grid from '@material-ui/core/Grid';
import TablePagination from '@material-ui/core/TablePagination';

interface Props {
  page: number;
  limit: number;
  handlePageChange: (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => void;
  handleLimitChange: (value: number) => void;
  count: number;
}

const Paginator: React.FC<Props> = ({
  handlePageChange,
  page,
  limit,
  handleLimitChange,
  count,
}) => {
  return (
    <Grid container justifyContent="flex-end">
      <TablePagination
        color="primary"
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={count}
        page={page}
        onPageChange={handlePageChange}
        rowsPerPage={limit}
        onRowsPerPageChange={(event) => handleLimitChange(parseInt(event.target.value))}
      />
    </Grid>
  );
};

export default Paginator;
