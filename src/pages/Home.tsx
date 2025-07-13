// Thêm vào public/index.html: <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600;700&display=swap" rel="stylesheet">

import React, { useEffect, useState } from 'react';
import { getTopics } from '../api/eqApi';
import { useNavigate } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Grid, Card, CardMedia, CardContent, Button } from '@mui/material';
import loveImg from '../assets/love_eq.png';
import workImg from '../assets/cong_so_eq.png';
import familyImg from '../assets/gia_dinh_eq.png';
import friendsImg from '../assets/ban_be_eq.png';
interface Topic {
  id: number;
  name: string;
  description: string;
  image?: string;
}

const placeholderImg = 'https://via.placeholder.com/300x180?text=Topic+Image';
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

const Home: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getTopics()
      .then(res => {
        const topicsWithDesc = res.data.map((t: any) => ({
          ...t,
          description: topicDescriptions[t.name] || t.description || 'Mô tả ngắn về chủ đề này.',
          image: t.image || topicImages[t.name] || placeholderImg,
        }));
        setTopics(topicsWithDesc);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (topicId: number) => {
    navigate(`/test/${topicId}`);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f9f6f2 60%, #e0e7ff 100%)',
        fontFamily: 'Quicksand, Nunito, Arial, sans-serif',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 900 }}>
        <Typography
          variant="h3"
          gutterBottom
          align="center"
          sx={{
            fontWeight: 700,
            mb: 5,
            color: '#2d3142',
            letterSpacing: 1,
            fontFamily: 'Quicksand, Nunito, Arial, sans-serif',
          }}
        >
          Chọn chủ đề để bắt đầu bài test EQ
        </Typography>
        {loading ? (
          <Typography align="center">Đang tải...</Typography>
        ) : (
          <Grid container spacing={5} justifyContent="center" alignItems="center">
            {topics.map(topic => (
              <Grid item xs={12} sm={6} md={6} lg={6} key={topic.id}>
                <Card
                  sx={{
                    borderRadius: 4,
                    boxShadow: 3,
                    overflow: 'hidden',
                    position: 'relative',
                    aspectRatio: '1 / 1',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.03)' },
                  }}
                  onClick={() => handleSelect(topic.id)}
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
                      color: '#fff',
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
        )}
        {/* Custom ripple effect CSS */}
        <style>{`
          .ripple-effect:active::after {
            content: '';
            position: absolute;
            left: 50%;
            top: 50%;
            width: 120%;
            height: 120%;
            background: rgba(165,180,252,0.18);
            border-radius: 50%;
            transform: translate(-50%, -50%) scale(0.7);
            animation: ripple-anim 0.5s linear;
            z-index: 1;
          }
          @keyframes ripple-anim {
            0% { opacity: 0.7; transform: translate(-50%, -50%) scale(0.7); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(1.5); }
          }
        `}</style>
      </Box>
    </Box>
  );
};

export default Home; 