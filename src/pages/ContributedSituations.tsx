import React, { useEffect, useState } from 'react';
import { Box, Typography, Avatar, CircularProgress, Alert, Paper, Dialog, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { getContributedSituations } from '../api/eqApi';
import CommentSection from '../components/CommentSection';

interface UserShort {
  id: number;
  name: string;
  picture?: string;
}

interface Situation {
  id: number;
  topic_id: number;
  user: UserShort;
  image_url?: string;
  context: string;
  question: string;
  created_at?: string;
}

const formatTime = (iso: string | undefined) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('vi-VN');
};

const ContributedSituations: React.FC = () => {
  const [situations, setSituations] = useState<Situation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openImageUrl, setOpenImageUrl] = useState<string | null>(null);

  useEffect(() => {
    getContributedSituations()
      .then(res => setSituations(res.data))
      .catch(() => setError('Không thể tải danh sách đóng góp.'))
      .finally(() => setLoading(false));
  }, []);

  const handleOpenImage = (url: string) => setOpenImageUrl(url);
  const handleCloseImage = () => setOpenImageUrl(null);

  const sortedSituations = [...situations].sort(
    (a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
  );

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.default', 
      py: 6, 
      px: { xs: 1, md: 0 }, 
      fontFamily: 'Quicksand, Nunito, Arial, sans-serif', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center' 
    }}>
      <Typography 
        variant="h4" 
        align="center" 
        sx={{ 
          fontWeight: 700, 
          mb: 4,
          color: 'text.primary'
        }}
      >
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
        <Box sx={{ width: '100%', maxWidth: 540, mx: 'auto' }}>
          {sortedSituations.map(sit => (
            <Paper key={sit.id} elevation={3} sx={{ 
              mb: 4, 
              borderRadius: 4, 
              p: 2, 
              bgcolor: 'background.paper'
            }}>
              {/* Header: Avatar, Name, Time */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar src={sit.user?.picture} alt={sit.user?.name} sx={{ mr: 1.5 }} />
                <Box>
                  <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>{sit.user?.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{formatTime(sit.created_at)}</Typography>
                </Box>
              </Box>
              {/* Content */}
              <Typography variant="body1" sx={{ fontWeight: 500, mb: 1, color: 'text.primary' }}>{sit.context}</Typography>
              <Typography variant="body2" color="primary" sx={{ mb: 1 }}><b>Câu hỏi mở:</b> {sit.question}</Typography>
              {/* Image (if any) */}
              {sit.image_url && (
                <Box sx={{ mt: 1, textAlign: 'center' }}>
                  <img
                    src={sit.image_url}
                    alt="minh họa"
                    style={{
                      maxWidth: '100%',
                      height: 'auto',
                      borderRadius: 8,
                      cursor: 'pointer',
                      display: 'block',
                      margin: 'auto'
                    }}
                    onClick={() => handleOpenImage(sit.image_url!)}
                  />
                </Box>
              )}
              {/* Comment & Reaction Section */}
              <CommentSection situationId={sit.id} />
            </Paper>
          ))}
        </Box>
      )}
      {/* Lightbox Dialog */}
      <Dialog open={!!openImageUrl} onClose={handleCloseImage} maxWidth="md">
        <Box sx={{ position: 'relative', bgcolor: 'background.paper' }}>
          <IconButton
            onClick={handleCloseImage}
            sx={{ position: 'absolute', top: 8, right: 8, color: 'text.primary', zIndex: 2 }}
          >
            <CloseIcon />
          </IconButton>
          <img
            src={openImageUrl || ''}
            alt="Xem chi tiết"
            style={{
              maxWidth: '90vw',
              maxHeight: '80vh',
              display: 'block',
              margin: 'auto'
            }}
          />
        </Box>
      </Dialog>
    </Box>
  );
};

export default ContributedSituations; 