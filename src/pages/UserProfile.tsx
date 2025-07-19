import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Box, 
  Avatar, 
  Typography, 
  Paper, 
  CircularProgress, 
  Alert,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { getUserProfile, getContributedSituations } from '../api/eqApi';
import CommentSection from '../components/CommentSection';

const COVER_URL = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80';

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<any>(null);
  const [situations, setSituations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) return;
    
    setLoading(true);
    Promise.all([
      getUserProfile(Number(userId)),
      getContributedSituations()
    ])
      .then(([userData, situationsData]) => {
        console.log('User data:', userData);
        console.log('Situations data:', situationsData);
        setUser(userData);
        // Lọc chỉ lấy situations của user này và sort theo thời gian mới nhất
        const userSituations = situationsData.data
          .filter((s: any) => s.user?.id === Number(userId))
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        console.log('Filtered user situations:', userSituations);
        console.log('User ID being filtered:', userId);
        setSituations(userSituations);
      })
      .catch((err) => {
        console.error('Lỗi tải profile:', err);
        setError('Không thể tải thông tin người dùng.');
      })
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Alert severity="error">{error || 'Không tìm thấy người dùng'}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: 'background.default',
      fontFamily: 'Quicksand, Nunito, Arial, sans-serif'
    }}>
      {/* Cover Image */}
      <Box sx={{ 
        height: 200, 
        backgroundImage: `url(${COVER_URL})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative'
      }} />
      
      {/* Profile Content */}
      <Box sx={{ 
        maxWidth: 1200, 
        mx: 'auto', 
        px: 3, 
        display: 'flex', 
        gap: 4,
        mt: -8,
        position: 'relative',
        zIndex: 1
      }}>
        {/* Profile Card */}
        <Box sx={{ width: 340, minWidth: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
          {/* Avatar đè lên cover và card Intro */}
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 3 }}>
            <Avatar src={user.picture} alt={user.name} sx={{ width: 120, height: 120, boxShadow: 2, border: '4px solid #fff', background: '#fff' }} />
          </Box>
          <Paper elevation={3} sx={{ p: 3, pb: 3, pt: 8, mt: 21, textAlign: 'center', width: '100%', borderRadius: 4, position: 'relative', zIndex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center', mb: 1 }}>{user.name}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 2 }}>{user.email}</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Giới thiệu</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, minHeight: 32 }}>
              {user.bio || <span style={{ color: '#aaa' }}>Chưa có giới thiệu bản thân.</span>}
            </Typography>
          </Paper>
        </Box>

        {/* Posts */}
        <Box sx={{ flex: 1, mt: 4, pt: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mt: 10 }}>Các bài đóng góp ({situations.length})</Typography>
          {situations.length === 0 ? (
            <Typography color="text.secondary">Chưa có bài đóng góp nào.</Typography>
          ) : (
            <Box>
              {situations.map((sit: any) => (
                <Card key={sit.id} elevation={3} sx={{ mt: 2, borderRadius: 4 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar src={user.picture} alt={user.name} sx={{ width: 40, height: 40, mr: 1 }} />
                      <Typography sx={{ fontWeight: 600 }}>{user.name}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>{sit.created_at}</Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>{sit.context}</Typography>
                    <Typography variant="body2" color="primary" sx={{ mb: 1 }}><b>Câu hỏi mở:</b> {sit.question}</Typography>
                    {sit.image_url && (
                      <Box sx={{ mt: 1, textAlign: 'center' }}>
                        <img
                          src={sit.image_url}
                          alt="minh họa"
                          style={{ maxWidth: '100%', height: 'auto', borderRadius: 8, margin: 'auto' }}
                        />
                      </Box>
                    )}
                    {/* Reaction & Comment section */}
                    <CommentSection situationId={sit.id} />
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default UserProfile; 