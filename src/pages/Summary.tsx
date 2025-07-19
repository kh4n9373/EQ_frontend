import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Summary: React.FC = () => {
  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Phân tích kết quả
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Trang này sẽ hiển thị phân tích chi tiết về kết quả EQ test của bạn.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Summary; 