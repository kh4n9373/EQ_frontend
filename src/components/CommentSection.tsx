import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, Avatar, IconButton, Divider, Collapse } from '@mui/material';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import { getComments, postComment, getReactions, postReaction, deleteReaction } from '../api/eqApi';
import SentimentAnalysis from './SentimentAnalysis';

// Emoji cho sentiment với màu sắc
const SENTIMENT_EMOJIS = {
  positive: { emoji: '💚', color: '#4caf50' }, // xanh lá
  negative: { emoji: '💢', color: '#f44336' }, // đỏ
  neutral: { emoji: '👀', color: '#2196f3' }   // xanh dương
};

export default function CommentSection({ situationId }: { situationId: number }) {
  const [comments, setComments] = useState<any[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [reactions, setReactions] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showSentiment, setShowSentiment] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    fetchComments();
    fetchReactions();
    fetchCurrentUser();
    // eslint-disable-next-line
  }, [showAll, situationId]);

  async function fetchCurrentUser() {
    const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8001'}/users/me`, { credentials: 'include' });
    if (res.ok) setCurrentUser(await res.json());
  }

  async function fetchComments() {
    setLoading(true);
    const data = await getComments(situationId, 'all'); // luôn lấy all
    setComments(data); // KHÔNG slice ở đây!
    setLoading(false);
  }

  async function fetchReactions() {
    const data = await getReactions(situationId);
    setReactions(data);
  }

  async function handlePostComment() {
    if (!newComment.trim()) return;
    
    // Optimistic: thêm comment vào state ngay
    const tempComment = {
      id: 'temp-' + Math.random(),
      situation_id: situationId,
      user: currentUser,
      content: newComment,
      created_at: new Date().toISOString(),
    };
    setComments([tempComment, ...comments]);
    setNewComment('');
    
    // Gửi comment lên server (server sẽ tự động phân tích sentiment)
    await postComment(situationId, tempComment.content);
    
    // Sync lại để lấy comment với sentiment analysis
    setTimeout(fetchComments, 1000);
  }

  // Tìm reaction của user hiện tại
  const myReaction = currentUser
    ? reactions.find((r) => r.user?.id === currentUser.id)
    : null;

  async function handleReaction(type: 'upvote' | 'downvote') {
    if (myReaction?.reaction_type === type) {
      // Optimistic: xóa reaction khỏi state ngay
      setReactions(reactions.filter(r => !(r.user?.id === currentUser?.id && r.reaction_type === type)));
      await deleteReaction(situationId, type);
      // Optionally: sync lại sau
      // setTimeout(fetchReactions, 1500);
    } else if (!myReaction) {
      // Optimistic: thêm reaction vào state ngay
      setReactions([
        ...reactions,
        {
          id: 'temp-' + Math.random(),
          situation_id: situationId,
          user: currentUser,
          reaction_type: type,
          created_at: new Date().toISOString(),
        }
      ]);
      await postReaction(situationId, type);
      // Optionally: sync lại sau
      // setTimeout(fetchReactions, 1500);
    }
  }

  // Đếm upvote/downvote
  const upvotes = reactions.filter((r) => r.reaction_type === 'upvote').length;
  const downvotes = reactions.filter((r) => r.reaction_type === 'downvote').length;

  // Phân biệt comment thật (có id là số) và comment tạm thời (id là string)
  const realComments = comments.filter(c => typeof c.id === 'number');
  const tempComments = comments.filter(c => typeof c.id !== 'number');
  // Sort real comments mới nhất lên đầu
  const sortedRealComments = [...realComments].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  // Gộp comment tạm thời (nếu có) lên đầu, sau đó là real comments
  const sortedComments = [...tempComments, ...sortedRealComments];
  // Số comment thực tế từ backend (không tính comment tạm thời)
  const totalRealComments = realComments.length;
  const displayedComments = showAll ? sortedComments : sortedComments.slice(0, 5);

  const toggleSentiment = (commentId: string) => {
    setShowSentiment(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  // Kiểm tra xem user có thể xem sentiment analysis của comment này không
  const canViewSentiment = (comment: any) => {
    return currentUser && comment.user?.id === currentUser.id;
  };

  return (
    <Box sx={{ mt: 3 }}>
      {/* DEBUG: Hiển thị số lượng comment thực tế */}
      {/* <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
        Tổng comment thực tế: {totalRealComments} | Đang hiển thị: {displayedComments.length} | showAll: {showAll ? 'true' : 'false'}
      </Typography> */}
      {/* Reaction */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <IconButton onClick={() => handleReaction('upvote')} color={myReaction?.reaction_type === 'upvote' ? 'primary' : 'default'}>
          <ThumbUpAltIcon />
        </IconButton>
        <Typography>{upvotes}</Typography>
        <IconButton onClick={() => handleReaction('downvote')} color={myReaction?.reaction_type === 'downvote' ? 'error' : 'default'}>
          <ThumbDownAltIcon />
        </IconButton>
        <Typography>{downvotes}</Typography>
      </Box>
      <Divider sx={{ mb: 2 }} />
      {/* Comment Form */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          placeholder="Viết bình luận..."
          size="small"
          fullWidth
        />
        <Button variant="contained" onClick={handlePostComment} disabled={loading || !newComment.trim()}>
          Gửi
        </Button>
      </Box>
      {/* Comment List */}
      {displayedComments.map((c) => (
        <Box key={c.id} sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <Avatar src={c.user?.picture} alt={c.user?.name} sx={{ mr: 1 }} />
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontWeight: 600 }}>{c.user?.name}</Typography>
                {/* Emoji sentiment */}
                {c.sentiment_analysis && (
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontSize: '1.2rem',
                      color: SENTIMENT_EMOJIS[c.sentiment_analysis.sentiment as keyof typeof SENTIMENT_EMOJIS]?.color || '#2196f3'
                    }}
                  >
                    {SENTIMENT_EMOJIS[c.sentiment_analysis.sentiment as keyof typeof SENTIMENT_EMOJIS]?.emoji || '👍'}
                  </Typography>
                )}
              </Box>
              <Typography variant="body2" color="text.secondary">{c.content}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {new Date(c.created_at).toLocaleString('vi-VN')}
                </Typography>
                {/* Chỉ hiển thị nút phân tích cho comment của user hiện tại */}
                {canViewSentiment(c) && c.sentiment_analysis && (
                  <Button 
                    size="small" 
                    onClick={() => toggleSentiment(c.id)}
                    sx={{ minWidth: 'auto', p: 0.5, fontSize: '0.75rem' }}
                  >
                    {showSentiment[c.id] ? 'Ẩn phân tích' : 'Xem phân tích cảm xúc'}
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
          
          {/* Sentiment Analysis - chỉ hiển thị cho comment của user hiện tại */}
          {canViewSentiment(c) && c.sentiment_analysis && (
            <Collapse in={showSentiment[c.id]}>
              <Box sx={{ ml: 4, mt: 1 }}>
                <SentimentAnalysis {...c.sentiment_analysis} />
              </Box>
            </Collapse>
          )}
        </Box>
      ))}
      {/* Toggle show all */}
      <Box sx={{ textAlign: 'center' }}>
        {totalRealComments > 5 && (
          <Button onClick={() => setShowAll(!showAll)} sx={{ mt: 1 }}>
            {showAll ? 'Ẩn bớt bình luận' : `Hiện thêm ${totalRealComments - 5} bình luận`}
          </Button>
        )}
      </Box>
    </Box>
  );
} 