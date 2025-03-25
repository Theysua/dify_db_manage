import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { partnerOrders } from '../../services/partnerApi';

// Helper function to get status color
const getStatusColor = (status) => {
  switch (status) {
    case 'APPROVED':
      return 'success';
    case 'PENDING':
      return 'warning';
    case 'REJECTED':
      return 'error';
    case 'COMPLETED':
      return 'info';
    default:
      return 'default';
  }
};

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('zh-CN');
};

// Helper function to get status text in Chinese
const getStatusText = (status) => {
  switch (status) {
    case 'APPROVED':
      return '已批准';
    case 'PENDING':
      return '审核中';
    case 'REJECTED':
      return '已拒绝';
    case 'COMPLETED':
      return '已完成';
    default:
      return status;
  }
};

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Fetch orders on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await partnerOrders.getOrders();
        setOrders(data);
        setFilteredOrders(data);
      } catch (err) {
        setError('加载订单数据失败，请稍后重试');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);
  
  // Handle filtering when search query or status filter changes
  useEffect(() => {
    if (!orders) return;
    
    const filtered = orders.filter(order => {
      const matchesSearch = searchQuery === '' || 
        order.OrderNumber.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === '' || order.Status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
    
    setFilteredOrders(filtered);
    setPage(0); // Reset to first page when filter changes
  }, [searchQuery, statusFilter, orders]);
  
  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle search query change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  
  // Handle status filter change
  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };
  
  // Calculate empty rows to maintain consistent page height
  const emptyRows = page > 0 
    ? Math.max(0, (1 + page) * rowsPerPage - filteredOrders.length) 
    : 0;
  
  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>订单历史</Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={8}>
            <TextField
              fullWidth
              placeholder="搜索订单编号..."
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel id="status-filter-label">状态筛选</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                value={statusFilter}
                label="状态筛选"
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="">全部</MenuItem>
                <MenuItem value="PENDING">审核中</MenuItem>
                <MenuItem value="APPROVED">已批准</MenuItem>
                <MenuItem value="REJECTED">已拒绝</MenuItem>
                <MenuItem value="COMPLETED">已完成</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>订单编号</TableCell>
                <TableCell>日期</TableCell>
                <TableCell align="right">金额</TableCell>
                <TableCell align="center">状态</TableCell>
                <TableCell>备注</TableCell>
                <TableCell align="right">操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    没有找到匹配的订单记录
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {filteredOrders
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((order) => (
                      <TableRow key={order.OrderId}>
                        <TableCell>{order.OrderNumber}</TableCell>
                        <TableCell>{formatDate(order.OrderDate)}</TableCell>
                        <TableCell align="right">¥{order.TotalAmount.toLocaleString()}</TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={getStatusText(order.Status)} 
                            color={getStatusColor(order.Status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {order.Notes ? (
                            order.Notes.length > 20 
                              ? `${order.Notes.substring(0, 20)}...` 
                              : order.Notes
                          ) : (
                            <Typography variant="body2" color="text.secondary">无</Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            component={RouterLink}
                            to={`/partner/orders/${order.OrderId}`}
                            size="small"
                          >
                            查看
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredOrders.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="每页行数:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} / ${count !== -1 ? count : `超过 ${to}`}`
          }
        />
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          component={RouterLink}
          to="/partner/orders/new"
        >
          创建新订单
        </Button>
      </Box>
    </Box>
  );
};

export default OrderHistory;
