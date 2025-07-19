// Thêm vào public/index.html: <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600;700&display=swap" rel="stylesheet">

import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  CardMedia,
  CircularProgress,
  Alert
} from '@mui/material';
import { Link } from 'react-router-dom';
import { getTopics } from '../api/eqApi';
import loveImg from '../assets/love_eq.png';
import workImg from '../assets/cong_so_eq.png';
import familyImg from '../assets/gia_dinh_eq.png';
import friendsImg from '../assets/ban_be_eq.png';

interface Topic {
  id: number;
  name: string;
  description?: string;
  image?: string;
}

const Home: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Mapping ảnh và description cho từng topic
  const topicImages: { [key: string]: string } = {
    'Tình yêu': loveImg,
    'Công sở': workImg,
    'Gia đình': familyImg,
    'Bạn bè': friendsImg,
  };

  const topicDescriptions: { [key: string]: string } = {
    'Tình yêu': 'Khả năng thấu hiểu cảm xúc bản thân và đối phương, xây dựng mối quan hệ lãng mạn bền vững, biết lắng nghe và sẻ chia trong tình cảm.',
    'Công sở': 'Kỹ năng giao tiếp, hợp tác và giải quyết mâu thuẫn nơi làm việc, thể hiện trí tuệ cảm xúc trong môi trường chuyên nghiệp.',
    'Gia đình': 'Sự đồng cảm, lắng nghe và gắn kết giữa các thành viên, nuôi dưỡng cảm xúc tích cực trong mái ấm gia đình.',
    'Bạn bè': 'Khả năng xây dựng, duy trì và phát triển tình bạn qua sự chân thành, sẻ chia và tinh tế trong cảm xúc.',
  };

  useEffect(() => {
    getTopics()
      .then(res => {
        const topicsWithDetails = res.data.map((topic: any) => ({
          ...topic,
          description: topicDescriptions[topic.name] || topic.description || 'Mô tả ngắn về chủ đề này.',
          image: topicImages[topic.name] || topic.image,
        }));
        setTopics(topicsWithDetails);
      })
      .catch(() => setError('Không thể tải danh sách chủ đề.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Typography variant="h3" sx={{ mb: 4, fontWeight: 700, color: 'text.primary' }}>
        Chào mừng đến với EQ Test
      </Typography>
      <Typography variant="h6" sx={{ mb: 6, color: 'text.secondary' }}>
        Khám phá và cải thiện trí tuệ cảm xúc của bạn
      </Typography>
      
      {/* 4 Chủ đề EQ */}
      <Grid container spacing={4} sx={{ mb: 6, maxWidth: 1200, mx: 'auto' }}>
        {topics.map((topic) => (
          <Grid item xs={12} sm={6} md={6} lg={3} key={topic.id}>
            <Card 
              elevation={3} 
              component={Link}
              to={`/test/${topic.id}`}
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                borderRadius: 4,
                overflow: 'hidden',
                position: 'relative',
                aspectRatio: '1 / 1',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                textDecoration: 'none',
                '&:hover': { 
                  transform: 'scale(1.03)',
                  boxShadow: 6
                }
              }}
            >
              {/* Ảnh nền */}
              <CardMedia
                component="img"
                image={topic.image}
                alt={topic.name}
                sx={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  zIndex: 1,
                }}
              />
              {/* Overlay gradient */}
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 2,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.6) 10%, rgba(0,0,0,0.05) 20%)',
                }}
              />
              {/* Text nằm dưới */}
              <Box
                sx={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 3,
                  p: 3,
                  color: 'text.primary',
                  textShadow: '0 2px 8px rgba(0,0,0,0.7)',
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                  {topic.name}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 400 }}>
                  {topic.description}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Các nút khác */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button 
          component={Link} 
          to="/contributed-situations" 
          variant="outlined" 
          size="large"
          sx={{ borderRadius: 2, px: 4, py: 1.5 }}
        >
          Xem cộng đồng
        </Button>
        <Button 
          component={Link} 
          to="/contribute" 
          variant="outlined" 
          size="large"
          sx={{ borderRadius: 2, px: 4, py: 1.5 }}
        >
          Đóng góp tình huống
        </Button>
      </Box>
    </Box>
  );
};

export default Home; 