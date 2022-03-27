import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { useGridApiRef, DataGridPro, GridToolbarContainer, GridActionsCellItem } from '@mui/x-data-grid-pro';
import { Typography } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';

function DatagridproComponent() {
    const apiRef = useGridApiRef();
    const [users, setUsers] = useState([]);
    const [buttonFlag, setButtonFlag] = useState(false);
    const [editFlag, setEditFlag] = useState(false);
    const [open, setOpen] = useState(false);
  
    // fetching data
    const getdata = () => {
      axios
        .get('https://6139330a1fcce10017e78a63.mockapi.io/datagrid')
        .then((response) => {
          setUsers(response.data);
        })
        .catch((error) => {
          console.log(error.message);
        });
    };
    useEffect(() => {
      getdata();
    }, []);
  
    const handleRowEditStart = (params, event) => {
      event.defaultMuiPrevented = true;
    };
  
    const handleRowEditStop = (params, event) => {
      event.defaultMuiPrevented = true;
    };
  
    const handleCellFocusOut = (params, event) => {
      event.defaultMuiPrevented = true;
    };
  
    const handleEditClick = (id) => (event) => {
      event.stopPropagation();
      apiRef.current.setCellFocus(id, 'name');
  
      apiRef.current.setRowMode(id, 'edit');
      setButtonFlag(true);
      setEditFlag(true);
    };
  
    const handleSaveClick = (id) => (event) => {
      event.stopPropagation();
      // Wait for the validation to run
      const isValid = apiRef.current.commitRowChange(id);
      
      if ( buttonFlag && editFlag) {
        const row = apiRef.current.getRow(id);
        apiRef.current.updateRows([{ ...row, isNew: false }]);
  
        const nameCheck = row.name;
        
        const nameArray = users.filter((item)=> item.id !== id).map((data)=> data.name)
        
        if (!nameArray.includes(nameCheck)) {
          axios.put(`https://6139330a1fcce10017e78a63.mockapi.io/datagrid/${id}`, row)
          .then(() => {
            apiRef.current.setRowMode(id, 'view');
            setButtonFlag(false);
            setEditFlag(false);
            getdata();
          });
        } 
        else {
          // alert(`"Name: ${nameCheck}" already exists, Kindly Enter a Unique Name !`);
          setOpen(true);
          apiRef.current.setCellFocus(id, 'name');
          
        }
      } else if (isValid) {
        const row = apiRef.current.getRow(id);
        apiRef.current.updateRows([{ ...row, isNew: false }]);
  
        const nameCheck = row.name;
  
        const filterFlag = users.filter((item) => item.name === nameCheck);
  
        if (filterFlag.length === 0) {
          axios.post('https://6139330a1fcce10017e78a63.mockapi.io/datagrid', row)
          .then((response) => {
            apiRef.current.setRowMode(id, 'view');
            setButtonFlag(false);
            getdata();
          });
        } else {
          // alert(`"Name: ${nameCheck}" already exists, Kindly Enter a Unique Name !`);
          setOpen(true);
          apiRef.current.setCellFocus(id, 'name');
        }
      }
    };
  
    const handleDeleteClick = (id) => (event) => {
      event.stopPropagation();
      apiRef.current.updateRows([{ id, _action: 'delete' }]);
      axios.delete(`https://6139330a1fcce10017e78a63.mockapi.io/datagrid/${id}`)
      .then((response) => {
        getdata();
      });
    };
  
    const handleCancelClick = (id) => (event) => {
      event.stopPropagation();
      apiRef.current.setRowMode(id, 'view');
  
      const row = apiRef.current.getRow(id);
      if (row.isNew) {
        apiRef.current.updateRows([{ id, _action: 'delete' }]);
      }
    };
    let isInEditMode;
    function EditToolbar(props) {
      const { apiRef } = props;
  
      const handleClick = (event) => {
        event.stopPropagation();
        
        const id = +users[users.length - 1].id + 1;
        apiRef.current.updateRows([{ id, isNew: true }]);
        apiRef.current.setRowMode(id, 'edit');
  
        setTimeout(() => {
          apiRef.current.scrollToIndexes({
            rowIndex: apiRef.current.getRowsCount() - 1,
          });
          apiRef.current.setCellFocus(id, 'name');
        });
       
        setButtonFlag(true);
        isInEditMode = true;
        console.log(buttonFlag, isInEditMode);
      };
      return (
        <GridToolbarContainer>
          <Button style={{ color: 'white' }} variant="contained" onClick={handleClick} disabled={buttonFlag}>
            Add
          </Button>
        </GridToolbarContainer>
      );
    }
    EditToolbar.propTypes = {
      apiRef: PropTypes.shape({
        current: PropTypes.object.isRequired,
      }).isRequired,
    };
  
    const columns = [
      { field: 'id', headerName: 'ID', width: 100, type: 'number' },
      { field: 'name', headerName: 'Name', width: 180, editable: true },
      { field: 'comments', headerName: 'Comments', width: 180, editable: true },
  
      {
        field: 'createdby',
        headerName: 'Created-by',
        width: 180,
        editable: true,
      },
      {
        field: 'actions',
        type: 'actions',
        headerName: 'Actions',
        width: 200,
        cellClassName: 'actions',
        getActions: ({ id }) => {
          isInEditMode = apiRef.current.getRowMode(id) === 'edit';
  
          if (isInEditMode) {
            return [
              <GridActionsCellItem icon={<SaveIcon />} label="Save" onClick={handleSaveClick(id)} color="primary" />,
              <GridActionsCellItem
                icon={<CancelIcon />}
                label="Cancel"
                className="textPrimary"
                onClick={handleCancelClick(id)}
                color="inherit"
              />,
            ];
          }
  
          return [
            <GridActionsCellItem
              icon={<EditIcon />}
              label="Edit"
              className="textPrimary"
              onClick={handleEditClick(id)}
              color="inherit"
            />,
            <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={handleDeleteClick(id)} color="inherit" />,
          ];
        },
      },
    ];
    
    const handleClose = (event, reason) => {
      if (reason === 'clickaway') {
        return;
      }
  
      setOpen(false);
    };
    const action = (
      <>
        <IconButton
          size="small"
          aria-label="close"
          color="inherit"
          onClick={handleClose}
        >
          <CancelIcon fontSize="small" />
        </IconButton>
      </>
    );
    
  
    return (
      <>
        <Typography variant="h3" style={{ textAlign: 'center', marginTop: '2rem' }}>
          Table Created using Data-Grid-Pro
        </Typography>
        <Box
          sx={{
            height: 500,
            width: '80%',
            margin: '1rem auto',
            border: '2px solid grey',
            '& .actions': {
              color: 'text.secondary',
            },
            '& .textPrimary': {
              color: 'text.primary',
            },
          }}
        >
          <DataGridPro
            initialState={{sorting:{sortModel:[{field:'id',sort:'desc'}]}}}
            rows={users}
            columns={columns}
            apiRef={apiRef}
            editMode="row"
            onRowEditStart={handleRowEditStart}
            onRowEditStop={handleRowEditStop}
            onCellFocusOut={handleCellFocusOut}
            components={{
              Toolbar: EditToolbar,
            }}
            componentsProps={{
              toolbar: { apiRef },
            }}
          />
          <Snackbar
          open={open}
          autoHideDuration={4000}
          onClose={handleClose}
          message="Duplicate Name Not-Allowed, Enter unique Name!"
          action={action}
        />
        </Box>
      </>
    );
}

export default DatagridproComponent