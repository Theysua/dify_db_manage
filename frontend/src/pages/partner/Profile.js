import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { partnerProfile } from '../../services/partnerApi';

const Profile = () => {
  const [profile, setProfile] = useState({
    PartnerName: '',
    ContactPerson: '',
    Email: '',
    Phone: '',
    Address: '',
    Region: '',
    BusinessLicense: '',
    Notes: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await partnerProfile.getProfile();
        setProfile(data);
      } catch (err) {
        setError('加载个人资料失败，请稍后重试');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    try {
      await partnerProfile.updateProfile(profile);
      setSuccessMessage('个人资料更新成功！');
      
      // Update local storage with new profile info
      const partnerInfo = JSON.parse(localStorage.getItem('partner_info') || '{}');
      const updatedInfo = { ...partnerInfo, ...profile };
      localStorage.setItem('partner_info', JSON.stringify(updatedInfo));
      
    } catch (err) {
      setError('更新个人资料失败: ' + (err.response?.data?.detail || err.message));
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSuccessMessage('');
  };
  
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
      <Typography variant="h4" gutterBottom>合作伙伴资料</Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>公司信息</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="公司名称"
                name="PartnerName"
                value={profile.PartnerName || ''}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="联系人"
                name="ContactPerson"
                value={profile.ContactPerson || ''}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="电子邮箱"
                name="Email"
                type="email"
                value={profile.Email || ''}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="联系电话"
                name="Phone"
                value={profile.Phone || ''}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="公司地址"
                name="Address"
                multiline
                rows={2}
                value={profile.Address || ''}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="区域"
                name="Region"
                value={profile.Region || ''}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="营业执照号"
                name="BusinessLicense"
                value={profile.BusinessLicense || ''}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>其他信息</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="备注"
                name="Notes"
                multiline
                rows={3}
                value={profile.Notes || ''}
                onChange={handleChange}
                helperText="附加信息或特殊要求"
              />
            </Grid>
            
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={saving}
                sx={{ minWidth: 120 }}
              >
                {saving ? <CircularProgress size={24} /> : '保存更改'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={successMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default Profile;
