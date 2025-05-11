import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Grid,
  Divider,
} from '@mui/material';
import {
  AccountCircle,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile } from '../services/authService';

const Layout = () => {
  const { user, logoutUser } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [openProfileDialog, setOpenProfileDialog] = useState(false);
  const [profileData, setProfileData] = useState(null);
  
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logoutUser();
  };

  const handleOpenProfile = async () => {
    handleClose();
    try {
      const data = await getUserProfile();
      setProfileData(data);
      setOpenProfileDialog(true);
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
    }
  };

  const handleCloseProfile = () => {
    setOpenProfileDialog(false);
  };

  // Форматирование даты
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Платформа службы доставки
          </Typography>
          
          <div>
            <Button 
              color="inherit" 
              onClick={handleMenu}
              startIcon={
                <Avatar 
                  sx={{ width: 32, height: 32 }}
                >
                  {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </Avatar>
              }
            >
              {user?.username || 'Пользователь'}
            </Button>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleOpenProfile}>
                <ListItemIcon>
                  <AccountCircle fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Профиль" />
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Выйти" />
              </MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>
      
      {/* Диалоговое окно профиля */}
      <Dialog open={openProfileDialog} onClose={handleCloseProfile} maxWidth="sm" fullWidth>
        <DialogTitle>
          Профиль пользователя
        </DialogTitle>
        <DialogContent>
          {profileData && (
            <Paper sx={{ p: 2 }} variant="outlined">
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    ID пользователя
                  </Typography>
                  <Typography variant="body1">
                    {profileData.id}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Имя пользователя
                  </Typography>
                  <Typography variant="body1">
                    {profileData.username}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {profileData.email}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Имя
                  </Typography>
                  <Typography variant="body1">
                    {profileData.first_name || '—'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Фамилия
                  </Typography>
                  <Typography variant="body1">
                    {profileData.last_name || '—'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Администратор
                  </Typography>
                  <Typography variant="body1">
                    {profileData.is_staff ? 'Да' : 'Нет'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Дата регистрации
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(profileData.date_joined)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProfile}>Закрыть</Button>
        </DialogActions>
      </Dialog>
      
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout; 