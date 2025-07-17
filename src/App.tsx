import React, { useEffect, useState } from 'react';
import { Routes, Route, Link as RouterLink, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Button, Box, Avatar, Menu, MenuItem, Divider, Typography } from '@mui/material';
import Home from './pages/Home';
import Test from './pages/Test';
import Summary from './pages/Summary';
import ContributeSituation from './pages/ContributeSituation';
import ContributedSituations from './pages/ContributedSituations';
import UserInfo from './pages/UserInfo';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Gọi API lấy user info nếu đã có access_token (cookie HTTPOnly)
    fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8001'}/users/me`, {
      credentials: 'include',
    })
      .then(res => {
        if (res.ok) {
          return res.json();
        }
        throw new Error('Not logged in');
      })
      .then(data => setUser(data))
      .catch(() => setUser(null));
  }, []);

  const isLoggedIn = !!user;

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8001/login/google';
  };

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleUserInfo = () => {
    navigate('/user-info');
    handleMenuClose();
  };
  const handleSummary = () => {
    navigate('/summary');
    handleMenuClose();
  };
  const handleLogout = () => {
    fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8001'}/logout`, {
      method: 'POST',
      credentials: 'include',
    }).then(() => {
      setUser(null);
      handleMenuClose();
      window.location.reload();
    });
  };

  return (
    <>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'center', gap: 2, position: 'relative' }}>
          <Button component={RouterLink} to="/" color="primary" sx={{ fontWeight: 600 }}>
            Trang chủ
          </Button>
          <Button component={RouterLink} to="/contributed-situations" color="primary" sx={{ fontWeight: 600 }}>
            Danh sách tình huống đóng góp
          </Button>
          <Button component={RouterLink} to="/contribute-situation" color="primary" sx={{ fontWeight: 600 }}>
            Đóng góp tình huống
          </Button>
          <Box sx={{ position: 'absolute', right: 16, top: 0, height: '100%', display: 'flex', alignItems: 'center' }}>
            {isLoggedIn && user ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={handleAvatarClick}>
                <Avatar alt={user.name} src={user.picture} />
                <Typography variant="body1">{user.name}</Typography>
              </Box>
            ) : (
              <Button
                variant="outlined"
                color="primary"
                onClick={handleGoogleLogin}
                sx={{ fontWeight: 600, ml: 2, borderRadius: 3, borderColor: '#4285F4', color: '#4285F4', textTransform: 'none', px: 2, py: 0.5, boxShadow: 'none', '&:hover': { borderColor: '#4285F4', background: '#e3f0fd' } }}
                startIcon={
                  <svg width="22" height="22" viewBox="0 0 48 48" style={{ display: 'block' }}>
                    <g>
                      <path fill="#4285F4" d="M43.6 20.5H42V20H24v8h11.3C34.7 32.1 29.8 35 24 35c-6.1 0-11.3-4.1-13.1-9.6-0.4-1.1-0.6-2.3-0.6-3.4s0.2-2.3 0.6-3.4C12.7 12.1 17.9 8 24 8c3.1 0 6 1.1 8.2 2.9l6.2-6.2C34.6 1.7 29.6 0 24 0 14.8 0 6.7 5.8 2.7 14.1c-0.9 1.8-1.4 3.8-1.4 5.9s0.5 4.1 1.4 5.9C6.7 42.2 14.8 48 24 48c5.6 0 10.6-1.7 14.4-4.7l-6.2-6.2C30 46.9 27.1 48 24 48c-5.8 0-10.7-2.9-13.3-7.5C8.7 36.1 16.1 40 24 40c5.8 0 10.7-2.9 13.3-7.5C39.3 36.1 31.9 40 24 40c-3.1 0-6-1.1-8.2-2.9l-6.2 6.2C13.4 46.3 18.4 48 24 48c9.2 0 17.3-5.8 21.3-14.1 0.9-1.8 1.4-3.8 1.4-5.9s-0.5-4.1-1.4-5.9z"/>
                      <path fill="#34A853" d="M6.3 14.1C8.7 9.9 14.8 5.8 24 5.8c3.1 0 6 1.1 8.2 2.9l6.2-6.2C34.6 1.7 29.6 0 24 0 14.8 0 6.7 5.8 2.7 14.1l3.6 3.6z"/>
                      <path fill="#FBBC05" d="M24 48c5.6 0 10.6-1.7 14.4-4.7l-6.2-6.2C30 46.9 27.1 48 24 48c-5.8 0-10.7-2.9-13.3-7.5l-6.2 6.2C13.4 46.3 18.4 48 24 48z"/>
                      <path fill="#EA4335" d="M43.6 20.5H42V20H24v8h11.3C34.7 32.1 29.8 35 24 35c-6.1 0-11.3-4.1-13.1-9.6-0.4-1.1-0.6-2.3-0.6-3.4s0.2-2.3 0.6-3.4C12.7 12.1 17.9 8 24 8c3.1 0 6 1.1 8.2 2.9l6.2-6.2C34.6 1.7 29.6 0 24 0 14.8 0 6.7 5.8 2.7 14.1c-0.9 1.8-1.4 3.8-1.4 5.9s0.5 4.1 1.4 5.9C6.7 42.2 14.8 48 24 48c5.6 0 10.6-1.7 14.4-4.7l-6.2-6.2C30 46.9 27.1 48 24 48c-5.8 0-10.7-2.9-13.3-7.5C8.7 36.1 16.1 40 24 40c5.8 0 10.7-2.9 13.3-7.5C39.3 36.1 31.9 40 24 40c-3.1 0-6-1.1-8.2-2.9l-6.2 6.2C13.4 46.3 18.4 48 24 48c9.2 0 17.3-5.8 21.3-14.1 0.9-1.8 1.4-3.8 1.4-5.9s-0.5-4.1-1.4-5.9z"/>
                    </g>
                  </svg>
                }
              >
                Đăng nhập Google
              </Button>
            )}
          </Box>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={handleUserInfo}>Xem thông tin đăng nhập</MenuItem>
            <MenuItem onClick={handleSummary}>Xem phân tích</MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/test/:topicId" element={<Test />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/contribute-situation" element={<ContributeSituation />} />
          <Route path="/contributed-situations" element={<ContributedSituations />} />
          <Route path="/user-info" element={<UserInfo />} />
        </Routes>
      </Box>
    </>
  );
};

export default App;
