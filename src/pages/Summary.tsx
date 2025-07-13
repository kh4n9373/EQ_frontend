import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface AnalysisResult {
  id: number;
  situation_id: number;
  answer_text: string;
  scores: Record<string, number>;
  reasoning: Record<string, string>;
  question: string;
  context?: string;
  created_at: string;
}

const Summary: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const results: AnalysisResult[] = location.state?.results || [];

  if (!results.length) {
    return <Typography>Không có dữ liệu tổng kết. Hãy làm bài test trước!</Typography>;
  }

  // Tính điểm trung bình cho mỗi trụ EQ
  const pillars = ["self_awareness", "empathy", "self_regulation", "communication", "decision_making"];
  const avgScores = pillars.map(pillar => ({
    pillar,
    score: Math.round(results.reduce((sum, r) => sum + (r.scores[pillar] || 0), 0) / results.length)
  }));

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>Tổng kết EQ của bạn</Typography>
        <Box sx={{ width: '100%', height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={avgScores}>
              <PolarGrid />
              <PolarAngleAxis dataKey="pillar" />
              <PolarRadiusAxis angle={30} domain={[0, 10]} />
              <Radar name="Điểm EQ" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </Box>
        <Box sx={{ mt: 3 }}>
          {avgScores.map(item => (
            <Typography key={item.pillar}><b>{item.pillar}:</b> {item.score}/10</Typography>
          ))}
        </Box>
        <Button sx={{ mt: 3 }} variant="contained" onClick={() => navigate('/')}>Làm lại bài test</Button>
      </Paper>
    </Box>
  );
};

export default Summary; 