import React, { useEffect, useState } from 'react';
import { Box, Avatar, Typography, Paper, TextField, Button, Divider, Card, CardContent } from '@mui/material';
import { getContributedSituations } from '../api/eqApi';
import CommentSection from '../components/CommentSection';

const COVER_URL = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80';

const UserInfo: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [bio, setBio] = useState('');
  const [editingBio, setEditingBio] = useState(false);
  const [situations, setSituations] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8001'}/users/me`, {
      credentials: 'include',
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setUser(data);
        setBio(data?.bio || '');
      });
    getContributedSituations().then(res => setSituations(res.data));
  }, []);

  if (!user) return <Typography align="center">Chưa đăng nhập</Typography>;

  const mySituations = situations
    .filter((s: any) => s.user?.id === user.id)
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Cover Photo */}
      <Box sx={{ width: '100%', height: 260, position: 'relative', mb: 0 }}>
        <img src={COVER_URL} alt="cover" style={{ width: '100%', height: 260, objectFit: 'cover' }} />
      </Box>
      <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 0, display: 'flex', gap: 4, alignItems: 'flex-start', px: 2 }}>
        {/* Left: Avatar + Intro */}
        <Box sx={{ width: 340, minWidth: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
          {/* Avatar đè lên cover, căn giữa card Intro */}
          <Box sx={{ position: 'absolute', top: -60, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 2 }}>
            <Avatar src={user.picture} alt={user.name} sx={{ width: 120, height: 120, boxShadow: 2, border: '4px solid #fff', background: '#fff' }} />
          </Box>
          <Paper elevation={3} sx={{ p: 3, pb: 3, pt: 8, mt: 9.5, textAlign: 'center', width: '100%' ,borderRadius: 4}}>
            <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center', mb: 1 }}>{user.name}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 2 }}>{user.email}</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Giới thiệu</Typography>
            {editingBio ? (
              <Box>
                <TextField
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  multiline
                  minRows={2}
                  fullWidth
                  sx={{ mb: 1 }}
                />
                <Button variant="contained" size="small" onClick={() => setEditingBio(false)} sx={{ mr: 1 }}>Lưu</Button>
                <Button variant="outlined" size="small" onClick={() => setEditingBio(false)}>Hủy</Button>
              </Box>
            ) : (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, minHeight: 32 }}>
                  {bio || <span style={{ color: '#aaa' }}>Chưa có giới thiệu bản thân.</span>}
                </Typography>
                <Button variant="text" size="small" onClick={() => setEditingBio(true)}>
                  {bio ? 'Chỉnh sửa giới thiệu' : 'Thêm giới thiệu'}
                </Button>
              </Box>
            )}
          </Paper>
        </Box>
        {/* Right: Feed các post đã đóng góp */}
        <Box sx={{ flex: 1, mt: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Các bài đóng góp ({mySituations.length})</Typography>
          {mySituations.length === 0 ? (
            <Typography color="text.secondary">Bạn chưa đóng góp bài nào.</Typography>
          ) : (
            <Box>
              {mySituations.map((sit: any) => (
                <Card key={sit.id} elevation={3} sx={{ mb: 4, borderRadius: 4 }}>
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

export default UserInfo; 