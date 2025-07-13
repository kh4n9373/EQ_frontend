import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Button, Box } from '@mui/material';
import Home from './pages/Home';
import Test from './pages/Test';
import Summary from './pages/Summary';
import ContributeSituation from './pages/ContributeSituation';
import ContributedSituations from './pages/ContributedSituations';

const App: React.FC = () => {
  return (
    <Router>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button component={RouterLink} to="/" color="primary" sx={{ fontWeight: 600 }}>
            Trang chủ
          </Button>
          <Button component={RouterLink} to="/contributed-situations" color="primary" sx={{ fontWeight: 600 }}>
            Danh sách tình huống đóng góp
          </Button>
          <Button component={RouterLink} to="/contribute-situation" color="primary" sx={{ fontWeight: 600 }}>
            Đóng góp tình huống
          </Button>
        </Toolbar>
      </AppBar>
      <Box>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/test/:topicId" element={<Test />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/contribute-situation" element={<ContributeSituation />} />
          <Route path="/contributed-situations" element={<ContributedSituations />} />
        </Routes>
      </Box>
    </Router>
  );
};

export default App;
