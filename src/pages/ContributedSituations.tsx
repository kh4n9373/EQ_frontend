import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, CircularProgress, Alert } from '@mui/material';
import { getContributedSituations } from '../api/eqApi';

interface Situation {
  id: number;
  topic_name: string;
  context: string;
  question: string;
  created_at?: string;
}

const ContributedSituations: React.FC = () => {
  const [situations, setSituations] = useState<Situation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getContributedSituations()
      .then(res => setSituations(res.data))
      .catch(() => setError('Không thể tải danh sách đóng góp.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f9f6f2', py: 6, px: { xs: 2, md: 8 }, fontFamily: 'Quicksand, Nunito, Arial, sans-serif' }}>
      <Typography variant="h4" align="center" sx={{ fontWeight: 700, mb: 4 }}>
        Danh sách tình huống cộng đồng đóng góp
      </Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : situations.length === 0 ? (
        <Typography align="center" color="text.secondary">Chưa có tình huống nào được đóng góp.</Typography>
      ) : (
        <Grid container spacing={3} justifyContent="center">
          {situations.map(sit => (
            <Grid item xs={12} sm={6} md={4} key={sit.id}>
              <Card sx={{ borderRadius: 4, boxShadow: 2, bgcolor: '#fff', height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 600 }}>
                    {sit.topic_name}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1.5, fontWeight: 500 }}>
                    {sit.context}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <b>Câu hỏi mở:</b> {sit.question}
                  </Typography>
                  {sit.created_at && (
                    <Typography variant="caption" color="text.secondary">
                      {new Date(sit.created_at).toLocaleString('vi-VN')}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ContributedSituations; 