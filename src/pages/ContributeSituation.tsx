import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, MenuItem, Alert, Paper } from '@mui/material';
import { getTopics, contributeSituation } from '../api/eqApi';

interface Topic {
  id: number;
  name: string;
}

const uploadToCloudinary = async (file: File): Promise<string> => {
  const url = 'https://api.cloudinary.com/v1_1/duqmsoxk4/image/upload';
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'emotional'); 
  const res = await fetch(url, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  return data.secure_url;
};

const ContributeSituation: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicId, setTopicId] = useState('');
  const [context, setContext] = useState('');
  const [question, setQuestion] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getTopics().then(res => setTopics(res.data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    if (!topicId || !context.trim() || !question.trim()) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }
    setLoading(true);
    try {
      let image_url = '';
      if (imageFile) {
        image_url = await uploadToCloudinary(imageFile);
      }
      await contributeSituation({ topic_id: Number(topicId), context, question, image_url });
      setSuccess('Đóng góp của bạn đã được ghi nhận!');
      setContext('');
      setQuestion('');
      setTopicId('');
      setImageFile(null);
    } catch (err: any) {
      setError('Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.default', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      fontFamily: 'Quicksand, Nunito, Arial, sans-serif' 
    }}>
      <Paper elevation={4} sx={{ 
        p: 4, 
        maxWidth: 480, 
        width: '100%', 
        borderRadius: 4,
        bgcolor: 'background.paper'
      }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 700, 
            mb: 2,
            color: 'text.primary'
          }} 
          align="center"
        >
          Đóng góp tình huống mới
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            select
            label="Chủ đề *"
            value={topicId}
            onChange={e => setTopicId(e.target.value)}
            fullWidth
            required
            sx={{ mb: 2 }}
          >
            {topics.map(topic => (
              <MenuItem key={topic.id} value={topic.id}>{topic.name}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Nội dung tình huống *"
            value={context}
            onChange={e => setContext(e.target.value)}
            fullWidth
            required
            multiline
            minRows={3}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Câu hỏi mở cho tình huống *"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            fullWidth
            required
            multiline
            minRows={2}
            sx={{ mb: 2 }}
          />
          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{ mb: 2 }}
          >
            {imageFile ? imageFile.name : "Chọn ảnh minh họa (tùy chọn)"}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={e => setImageFile(e.target.files?.[0] || null)}
            />
          </Button>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ fontWeight: 600, py: 1.2 }}>
            {loading ? 'Đang gửi...' : 'Gửi đóng góp'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default ContributeSituation; 