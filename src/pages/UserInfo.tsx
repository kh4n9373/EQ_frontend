import React, { useEffect, useState } from 'react';
import { Box, Avatar, Typography, Paper } from '@mui/material';

const UserInfo: React.FC = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8001'}/users/me`, {
      credentials: 'include',
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => setUser(data));
  }, []);

  if (!user) return <Typography align="center">Chưa đăng nhập</Typography>;

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <Paper elevation={3} sx={{ p: 4, minWidth: 320, textAlign: 'center' }}>
        <Avatar src={user.picture} alt={user.name} sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }} />
        <Typography variant="h6">{user.name}</Typography>
        <Typography variant="body1" color="text.secondary">{user.email}</Typography>
      </Paper>
    </Box>
  );
};

export default UserInfo; 