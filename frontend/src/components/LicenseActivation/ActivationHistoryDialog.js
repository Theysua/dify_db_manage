import React from 'react';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip
} from '@mui/material';
import {
  SwapHoriz as SwapHorizIcon,
  OnlinePrediction as OnlineIcon,
  OfflineBolt as OfflineIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const ActivationHistoryDialog = ({ open, onClose, activationHistory, licenseId }) => {
  const theme = useTheme();
  
  const formatDate = (dateString) => {
    if (!dateString) return '未知时间';
    return new Date(dateString).toLocaleString();
  };
  
  const getChangeIcon = (fromMode, toMode) => {
    if (fromMode === toMode) {
      return <RefreshIcon color="action" />;
    }
    if (toMode === 'ONLINE') {
      return <OnlineIcon color="primary" />;
    }
    return <OfflineIcon color="secondary" />;
  };
  
  const getChangeDescription = (change) => {
    if (change.from_mode === change.to_mode) {
      return `重新生成${change.to_mode === 'OFFLINE' ? '离线' : '在线'}激活码`;
    }
    return `从${change.from_mode === 'ONLINE' ? '在线' : '离线'}激活切换为${change.to_mode === 'ONLINE' ? '在线' : '离线'}激活`;
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        激活模式变更历史
      </DialogTitle>
      <DialogContent>
        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
          许可证ID: {licenseId}
        </Typography>
        <Divider sx={{ my: 1 }} />
        
        {(!activationHistory || !activationHistory.changes || activationHistory.changes.length === 0) ? (
          <Box p={2} textAlign="center">
            <Typography variant="body1">暂无激活模式变更记录</Typography>
          </Box>
        ) : (
          <List>
            {activationHistory.changes.map((change, index) => (
              <Paper 
                key={index}
                elevation={1}
                sx={{ 
                  mb: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  borderLeft: `4px solid ${change.to_mode === 'ONLINE' ? theme.palette.primary.main : theme.palette.secondary.main}`
                }}
              >
                <ListItem alignItems="flex-start">
                  <ListItemIcon>
                    {getChangeIcon(change.from_mode, change.to_mode)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1">
                          {getChangeDescription(change)}
                        </Typography>
                        <Chip 
                          size="small" 
                          label={formatDate(change.timestamp)}
                          variant="outlined"
                          color="default"
                        />
                      </Box>
                    }
                    secondary={
                      <Box mt={1}>
                        {change.to_mode === 'OFFLINE' && (
                          <Box mt={1}>
                            <Typography variant="body2" component="span" color="textSecondary">
                              集群ID: 
                            </Typography>
                            <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                              {change.cluster_id || '未指定'}
                            </Typography>
                          </Box>
                        )}
                        
                        <Box display="flex" alignItems="center" mt={1}>
                          <SwapHorizIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
                          <Box>
                            <Chip
                              label={change.from_mode === 'ONLINE' ? '在线激活' : '离线激活'}
                              size="small"
                              color={change.from_mode === 'ONLINE' ? 'primary' : 'secondary'}
                              variant="outlined"
                              sx={{ mr: 1 }}
                            />
                            <Typography variant="body2" component="span">
                              {" → "}
                            </Typography>
                            <Chip
                              label={change.to_mode === 'ONLINE' ? '在线激活' : '离线激活'}
                              size="small"
                              color={change.to_mode === 'ONLINE' ? 'primary' : 'secondary'}
                              sx={{ ml: 1 }}
                            />
                          </Box>
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              </Paper>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          关闭
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ActivationHistoryDialog;
