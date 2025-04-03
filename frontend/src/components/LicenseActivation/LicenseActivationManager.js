import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Grid, 
  Divider, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Box, 
  Chip, 
  Tooltip, 
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  ContentCopy as ContentCopyIcon,
  Info as InfoIcon,
  ArrowForward as ArrowForwardIcon,
  Refresh as RefreshIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { fetchWithAuth, API_BASE_URL } from '../../utils/api';
import ActivationHistoryDialog from './ActivationHistoryDialog';

const LicenseActivationManager = ({ licenseId, isAdmin }) => {
  const theme = useTheme();
  const [licenseInfo, setLicenseInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activationMode, setActivationMode] = useState('');
  const [clusterId, setClusterId] = useState('');
  const [openModeDialog, setOpenModeDialog] = useState(false);
  const [openRegenerateDialog, setOpenRegenerateDialog] = useState(false);
  const [newClusterId, setNewClusterId] = useState('');
  const [reason, setReason] = useState('');
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);

  // 获取许可证激活信息
  useEffect(() => {
    const fetchLicenseInfo = async () => {
      try {
        setLoading(true);
        // 使用正确的激活API路径
        const response = await fetchWithAuth(
          `${API_BASE_URL}/activation/licenses/${licenseId}/activation-info`
        );
        if (response.ok) {
          const data = await response.json();
          setLicenseInfo(data);
          setActivationMode(data.activation_mode);
          setClusterId(data.cluster_id || '');
        } else {
          throw new Error('获取许可证激活信息失败');
        }
      } catch (error) {
        setAlertMessage(`获取许可证信息错误: ${error.message}`);
        setAlertSeverity('error');
        setAlertOpen(true);
      } finally {
        setLoading(false);
      }
    };

    if (licenseId) {
      fetchLicenseInfo();
    }
  }, [licenseId]);

  // 变更激活模式
  const handleChangeActivationMode = async () => {
    try {
      setLoading(true);
      
      const payload = {
        activation_mode: activationMode === 'ONLINE' ? 'OFFLINE' : 'ONLINE',
        from_mode: activationMode,
        cluster_id: activationMode === 'ONLINE' ? newClusterId : null,
        reason: reason
      };

      const response = await fetchWithAuth(
        `${API_BASE_URL}/activation/licenses/${licenseId}/change-activation`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setLicenseInfo({
          ...licenseInfo,
          activation_mode: data.activation_mode,
          cluster_id: data.cluster_id,
          offline_code: data.offline_code
        });
        setActivationMode(data.activation_mode);
        setClusterId(data.cluster_id || '');
        
        setAlertMessage(data.message);
        setAlertSeverity('success');
        setAlertOpen(true);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || '变更激活模式失败');
      }
    } catch (error) {
      setAlertMessage(`变更激活模式错误: ${error.message}`);
      setAlertSeverity('error');
      setAlertOpen(true);
    } finally {
      setLoading(false);
      setOpenModeDialog(false);
      setReason('');
      setNewClusterId('');
    }
  };

  // 重新生成离线激活码
  const handleRegenerateOfflineCode = async () => {
    try {
      setLoading(true);
      
      const payload = {
        cluster_id: newClusterId,
        reason: reason
      };

      const response = await fetchWithAuth(
        `${API_BASE_URL}/activation/licenses/${licenseId}/regenerate-offline-code`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setLicenseInfo({
          ...licenseInfo,
          cluster_id: data.cluster_id,
          offline_code: data.offline_code
        });
        setClusterId(data.cluster_id);
        
        setAlertMessage(data.message);
        setAlertSeverity('success');
        setAlertOpen(true);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || '重新生成激活码失败');
      }
    } catch (error) {
      setAlertMessage(`重新生成激活码错误: ${error.message}`);
      setAlertSeverity('error');
      setAlertOpen(true);
    } finally {
      setLoading(false);
      setOpenRegenerateDialog(false);
      setReason('');
      setNewClusterId('');
    }
  };

  // 复制离线激活码到剪贴板
  const handleCopyOfflineCode = () => {
    if (licenseInfo?.offline_code) {
      navigator.clipboard.writeText(licenseInfo.offline_code);
      setAlertMessage('离线激活码已复制到剪贴板');
      setAlertSeverity('success');
      setAlertOpen(true);
    }
  };

  // 查看激活历史
  const handleViewActivationHistory = () => {
    setHistoryDialogOpen(true);
  };

  // 渲染激活状态标签
  const renderActivationChip = () => {
    if (!licenseInfo) return null;
    
    return (
      <Chip 
        label={licenseInfo.activation_mode === 'ONLINE' ? '在线激活' : '离线激活'} 
        color={licenseInfo.activation_mode === 'ONLINE' ? 'primary' : 'secondary'}
        sx={{ fontWeight: 'bold' }}
      />
    );
  };

  if (loading && !licenseInfo) {
    return (
      <Card>
        <CardContent>
          <Typography>加载许可证激活信息...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card elevation={3}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" gutterBottom>
                  许可证激活管理
                  <Tooltip title="许可证可以在在线和离线模式之间切换。离线模式需要集群ID来生成激活码。">
                    <IconButton size="small">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Typography>
                {renderActivationChip()}
              </Box>
              <Divider sx={{ my: 1 }} />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" color="textSecondary">
                当前激活模式
              </Typography>
              <Typography variant="body1" gutterBottom>
                {licenseInfo?.activation_mode === 'ONLINE' ? '在线激活' : '离线激活'}
              </Typography>
            </Grid>

            {licenseInfo?.activation_mode === 'OFFLINE' && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    集群ID
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {licenseInfo.cluster_id || '未指定'}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    离线激活码
                  </Typography>
                  <Box 
                    sx={{ 
                      p: 1.5, 
                      bgcolor: theme.palette.grey[100], 
                      borderRadius: 1,
                      position: 'relative',
                      mt: 1,
                      mb: 2,
                      maxHeight: '80px',
                      overflowY: 'auto',
                      wordBreak: 'break-all'
                    }}
                  >
                    <Typography variant="body2" component="div">
                      {licenseInfo.offline_code || '未生成'}
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={handleCopyOfflineCode}
                      sx={{ 
                        position: 'absolute', 
                        top: 5, 
                        right: 5,
                        bgcolor: theme.palette.background.paper,
                        '&:hover': {
                          bgcolor: theme.palette.grey[300],
                        }
                      }}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <Typography variant="subtitle2" color="textSecondary">
                上次激活变更时间
              </Typography>
              <Typography variant="body1" gutterBottom>
                {licenseInfo?.last_activation_change 
                  ? new Date(licenseInfo.last_activation_change).toLocaleString() 
                  : '未发生变更'}
              </Typography>
            </Grid>

            {licenseInfo?.activation_history?.changes?.length > 0 && (
              <Grid item xs={12}>
                <Button 
                  startIcon={<HistoryIcon />}
                  onClick={handleViewActivationHistory}
                  variant="text"
                  size="small"
                >
                  查看激活历史记录
                </Button>
              </Grid>
            )}

            <Grid item xs={12} sx={{ mt: 2 }}>
              <Divider sx={{ mb: 2 }} />
              <Box display="flex" justifyContent="space-between">
                {isAdmin && licenseInfo?.activation_mode === 'ONLINE' && (
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => setOpenModeDialog(true)}
                    startIcon={<ArrowForwardIcon />}
                    disabled={loading}
                  >
                    转为离线激活
                  </Button>
                )}
                {isAdmin && licenseInfo?.activation_mode === 'OFFLINE' && (
                  <>
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={() => setOpenModeDialog(true)}
                      startIcon={<ArrowForwardIcon />}
                      disabled={loading}
                    >
                      转为在线激活
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="secondary"
                      onClick={() => setOpenRegenerateDialog(true)}
                      startIcon={<RefreshIcon />}
                      disabled={loading}
                    >
                      重新生成激活码
                    </Button>
                  </>
                )}
                {!isAdmin && (
                  <Typography variant="body2" color="textSecondary">
                    需要管理员权限才能更改激活模式
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* 变更激活模式对话框 */}
      <Dialog open={openModeDialog} onClose={() => setOpenModeDialog(false)}>
        <DialogTitle>
          {licenseInfo?.activation_mode === 'ONLINE' 
            ? '转为离线激活模式' 
            : '转为在线激活模式'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {licenseInfo?.activation_mode === 'ONLINE' 
              ? '将许可证从在线激活转为离线激活需要提供集群ID。\n离线激活后，将生成与集群ID绑定的离线激活码。' 
              : '将许可证从离线激活转为在线激活后，离线激活码将立即失效。\n如需再次切换回离线激活，需要重新生成激活码。'}
          </DialogContentText>
          
          {licenseInfo?.activation_mode === 'ONLINE' && (
            <TextField
              margin="dense"
              label="集群ID"
              fullWidth
              variant="outlined"
              value={newClusterId}
              onChange={(e) => setNewClusterId(e.target.value)}
              required
              sx={{ mt: 2 }}
            />
          )}
          
          <TextField
            margin="dense"
            label="变更理由"
            fullWidth
            variant="outlined"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            multiline
            rows={2}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModeDialog(false)}>取消</Button>
          <Button 
            onClick={handleChangeActivationMode} 
            variant="contained"
            color="primary"
            disabled={licenseInfo?.activation_mode === 'ONLINE' && !newClusterId}
          >
            确认变更
          </Button>
        </DialogActions>
      </Dialog>

      {/* 重新生成离线激活码对话框 */}
      <Dialog open={openRegenerateDialog} onClose={() => setOpenRegenerateDialog(false)}>
        <DialogTitle>重新生成离线激活码</DialogTitle>
        <DialogContent>
          <DialogContentText>
            重新生成离线激活码将使原激活码失效。通常在集群ID变更时需要重新生成。
          </DialogContentText>
          
          <TextField
            margin="dense"
            label="新集群ID"
            fullWidth
            variant="outlined"
            value={newClusterId}
            onChange={(e) => setNewClusterId(e.target.value)}
            required
            sx={{ mt: 2 }}
          />
          
          <TextField
            margin="dense"
            label="变更理由"
            fullWidth
            variant="outlined"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            multiline
            rows={2}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRegenerateDialog(false)}>取消</Button>
          <Button 
            onClick={handleRegenerateOfflineCode} 
            variant="contained"
            color="primary"
            disabled={!newClusterId}
          >
            重新生成
          </Button>
        </DialogActions>
      </Dialog>

      {/* 激活历史记录对话框 */}
      {licenseInfo && (
        <ActivationHistoryDialog 
          open={historyDialogOpen}
          onClose={() => setHistoryDialogOpen(false)}
          activationHistory={licenseInfo.activation_history}
          licenseId={licenseId}
        />
      )}

      {/* 提示消息 */}
      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={() => setAlertOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setAlertOpen(false)} 
          severity={alertSeverity}
          sx={{ width: '100%' }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default LicenseActivationManager;
