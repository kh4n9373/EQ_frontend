import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Container, 
  Avatar, 
  Menu, 
  MenuItem, 
  IconButton,
  useTheme,
  useMediaQuery,
  CssBaseline
} from '@mui/material';
import { ThemeProvider as MuiThemeProvider, useTheme as useMuiTheme } from '@mui/material/styles';
import { AccountCircle, Menu as MenuIcon } from '@mui/icons-material';
import { createAppTheme } from './theme/theme';
import { ThemeProvider as CustomThemeProvider, useTheme as useCustomTheme } from './contexts/ThemeContext';
import Test from './pages/Test';
import UserInfo from './pages/UserInfo';
import ContributeSituation from './pages/ContributeSituation';
import ContributedSituations from './pages/ContributedSituations';
import UserProfile from './pages/UserProfile';
import UserSearch from './components/UserSearch';
import Home from './pages/Home';

function AppContent() {
  const [user, setUser] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { isDarkMode, toggleTheme } = useCustomTheme();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8001'}/users/me`, {
      credentials: 'include',
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => setUser(data));
  }, []);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8001'}/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    setUser(null);
    handleClose();
  };

  return (
    <Box sx={{ 
      margin: 0, 
      padding: 0, 
      width: '100%', 
      minHeight: '100vh',
      overflow: 'hidden',
      backgroundColor: 'background.default'
    }}>
      <AppBar position="static" sx={{ bgcolor: 'background.paper', color: 'text.primary', boxShadow: 1 }}>
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            {/* Logo và Navigation */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Typography variant="h6" component={Link} to="/" sx={{ 
                textDecoration: 'none', 
                color: 'inherit',
                fontWeight: 700
              }}>
                EQ Test
              </Typography>
              
              {!isMobile && (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button component={Link} to="/contributed-situations" color="inherit">
                    Cộng đồng
                  </Button>
                  <Button component={Link} to="/contribute" color="inherit">
                    Đóng góp
                  </Button>
                </Box>
              )}
            </Box>

            {/* Search Bar */}
            {!isMobile && (
              <Box sx={{ flex: 1, maxWidth: 400, mx: 4 }}>
                <UserSearch />
              </Box>
            )}

            {/* User Menu */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button onClick={toggleTheme} variant="outlined" size="small">
                {isDarkMode ? '☀️' : '🌙'}
              </Button>
              
              {isMobile ? (
                <IconButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)} color="inherit">
                  <MenuIcon />
                </IconButton>
              ) : (
                <>
                  {user ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar 
                        src={user.picture} 
                        alt={user.name} 
                        sx={{ width: 32, height: 32, cursor: 'pointer' }}
                        onClick={handleMenu}
                      />
                      <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                      >
                        <MenuItem component={Link} to="/profile" onClick={handleClose}>
                          Trang cá nhân
                        </MenuItem>
                        <MenuItem onClick={handleLogout}>
                          Đăng xuất
                        </MenuItem>
                      </Menu>
                    </Box>
                  ) : (
                    <Button 
                      component="a" 
                      href={`${process.env.REACT_APP_API_URL || 'http://localhost:8001'}/login/google`}
                      variant="contained"
                      sx={{ 
                        bgcolor: 'primary.main',
                        '&:hover': { bgcolor: 'primary.dark' }
                      }}
                    >
                      Đăng nhập
                    </Button>
                  )}
                </>
              )}
            </Box>
          </Toolbar>

          {/* Mobile Menu */}
          {isMobile && mobileMenuOpen && (
            <Box sx={{ 
              p: 2, 
              borderTop: 1, 
              borderColor: 'divider',
              bgcolor: 'background.paper'
            }}>
              <Box sx={{ mb: 2 }}>
                <UserSearch />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button component={Link} to="/contributed-situations" color="inherit" fullWidth>
                  Cộng đồng
                </Button>
                <Button component={Link} to="/contribute" color="inherit" fullWidth>
                  Đóng góp
                </Button>
                {user ? (
                  <>
                    <Button component={Link} to="/profile" color="inherit" fullWidth>
                      Trang cá nhân
                    </Button>
                    <Button onClick={handleLogout} color="inherit" fullWidth>
                      Đăng xuất
                    </Button>
                  </>
                ) : (
                  <Button 
                    component="a" 
                    href={`${process.env.REACT_APP_API_URL || 'http://localhost:8001'}/login/google`}
                    variant="contained"
                    fullWidth
                  >
                    Đăng nhập
                  </Button>
                )}
              </Box>
            </Box>
          )}
        </Container>
      </AppBar>

      <Box sx={{ 
        minHeight: 'calc(100vh - 64px)', 
        bgcolor: 'background.default',
        py: 4,
        margin: 0,
        padding: 0,
        overflow: 'hidden'
      }}>
        <Container maxWidth="xl" sx={{ margin: 0, padding: 0 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/test/:topicId" element={<Test />} />
            <Route path="/profile" element={<UserInfo />} />
            <Route path="/user/:userId" element={<UserProfile />} />
            <Route path="/contribute" element={<ContributeSituation />} />
            <Route path="/contributed-situations" element={<ContributedSituations />} />
          </Routes>
        </Container>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <CustomThemeProvider>
      <AppWrapper />
    </CustomThemeProvider>
  );
}

function AppWrapper() {
  const { isDarkMode } = useCustomTheme();
  const theme = createAppTheme(isDarkMode);
  
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <AppContent />
    </MuiThemeProvider>
  );
}

export default App;
