import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import Snackbar from '@mui/material/Snackbar';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

import endpoints from 'src/contants/apiEndpoint';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export type TrxProps = {
  id: string;
  kode_invoice: string;
  biaya_tambahan: string;
  status: string;
};

type TrxTableRowProps = {
  row: TrxProps;
  selected: boolean;
  onSelectRow: () => void;
  onDeleteUser: (id: string) => void;
};

export function TrxTableRow({ row, selected, onSelectRow, onDeleteUser }: TrxTableRowProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const navigate = useNavigate();

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>('success');

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleEdit = useCallback(() => {
    handleClosePopover();
    navigate(`/trx/edit-trx/${row.id}`);
  }, [navigate, row.id, handleClosePopover]);

  const handleShow = useCallback(() => {
    handleClosePopover();
    navigate(`/trx/show-trx/${row.id}`);
  }, [navigate, row.id, handleClosePopover]);

  const handleDeleteDialogOpen = useCallback(() => {
    setOpenDeleteDialog(true);
    handleClosePopover();
  }, [handleClosePopover]);

  const handleDeleteDialogClose = useCallback(() => {
    setOpenDeleteDialog(false);
  }, []);

  const handleDelete = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setToastMessage('Unauthorized!');
      setToastSeverity('error');
      setToastOpen(true);
      return;
    }

    try {
      const response = await fetch(`${endpoints.users}/${row.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setToastMessage(`User "${row.kode_invoice}" has been deleted successfully.`);
        setToastSeverity('success');
        onDeleteUser(row.id);
      } else {
        const result = await response.json();
        setToastMessage(result.message || 'Failed to delete user.');
        setToastSeverity('error');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setToastMessage('An error occurred while deleting the user.');
      setToastSeverity('error');
    } finally {
      setToastOpen(true);
      setOpenDeleteDialog(false);
    }
  }, [row.id, row.kode_invoice, onDeleteUser]);

  const handleCloseToast = () => {
    setToastOpen(false);
  };

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
        </TableCell>

        <TableCell>{row.kode_invoice}</TableCell>

        <TableCell>{row.biaya_tambahan}</TableCell>

        <TableCell>{row.status}</TableCell>

        <TableCell align="right">
          <IconButton onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuList
          disablePadding
          sx={{
            p: 0.5,
            gap: 0.5,
            width: 140,
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: {
              px: 1,
              gap: 2,
              borderRadius: 0.75,
              [`&.${menuItemClasses.selected}`]: { bgcolor: 'action.selected' },
            },
          }}
        >
          <MenuItem onClick={handleEdit}>
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>

          <MenuItem onClick={handleShow}>
            <Iconify icon="icon-park-outline:eyes" />
            Show
          </MenuItem>

          <MenuItem onClick={handleDeleteDialogOpen} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>
        </MenuList>
      </Popover>

      {/* Dialog Confirm Delete */}
      <Dialog open={openDeleteDialog} onClose={handleDeleteDialogClose}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete user {row.kode_invoice}?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for Toast */}
      <Snackbar open={toastOpen} autoHideDuration={6000} onClose={handleCloseToast} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseToast} severity={toastSeverity} sx={{ width: '100%' }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
