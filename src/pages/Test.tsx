import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Paper, 
  Grid, 
  IconButton, 
  CircularProgress,
  Alert,
  useTheme,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions
} from '@mui/material';
import { 
  KeyboardArrowLeft, 
  KeyboardArrowRight, 
  Mic, 
  Send,
  Close
} from '@mui/icons-material';
import { getSituations, analyzeAnswer, getTopics } from '../api/eqApi';

const EQ_KEYS = [
  { key: 'self-awareness', label: 'Self Awareness' },
  { key: 'empathy', label: 'Empathy' },
  { key: 'self-regulation', label: 'Self Regulation' },
  { key: 'communication', label: 'Communication' },
  { key: 'decision-making', label: 'Decision Making' },
  { key: 'overall', label: 'Overall' },
];

interface Situation {
  id: number;
  topic: string;
  context: string;
  question: string;
}

interface Topic {
  id: number;
  name: string;
}

interface AnalysisResult {
  scores: { [key: string]: number };
  reasoning: { [key: string]: string };
}

const Test: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const theme = useTheme();
  const [situations, setSituations] = useState<Situation[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [results, setResults] = useState<(AnalysisResult | null)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [linkedList, setLinkedList] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const finalizedTranscript = useRef('');
  const [selectedScore, setSelectedScore] = useState<{label: string, score: number, reasoning: string} | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getSituations(Number(topicId)),
      getTopics()
    ])
      .then(([situationsRes, topicsRes]) => {
        setSituations(situationsRes.data);
        setAnswers(Array(situationsRes.data.length).fill(''));
        setResults(Array(situationsRes.data.length).fill(null));
        const arr = [];
        for (let i = 0; i < situationsRes.data.length; i++) {
          arr.push(i);
          arr.push(null);
        }
        arr.push('xem_ket_qua');
        setLinkedList(arr);
        setCurrentIndex(0);
        setTopics(topicsRes.data);
        setAnswer('');
      })
      .catch(() => setError('Không thể tải dữ liệu.'))
      .finally(() => setLoading(false));
  }, [topicId]);

  const findNextIndex = (from: number, dir: 1 | -1) => {
    let idx = from + dir;
    while (idx >= 0 && idx < linkedList.length) {
      if (linkedList[idx] !== null) return idx;
      idx += dir;
    }
    return from;
  };

  const handlePrev = () => {
    if (currentIndex === 0) return;
    const prevIdx = findNextIndex(currentIndex, -1);
    setCurrentIndex(prevIdx);
    if (typeof linkedList[prevIdx] === 'number') {
      setAnswer(answers[linkedList[prevIdx]] || '');
    }
  };

  const handleNext = () => {
    if (currentIndex === linkedList.length - 1) return;
    const nextIdx = findNextIndex(currentIndex, 1);
    setCurrentIndex(nextIdx);
    if (typeof linkedList[nextIdx] === 'number') {
      setAnswer(answers[linkedList[nextIdx]] || '');
    }
  };

  const handleSend = async () => {
    setLoading(true);
    setError('');
    try {
      const qIdx = linkedList[currentIndex];
      const res = await analyzeAnswer({
        situation_id: situations[qIdx].id,
        answer_text: answer,
      });
      const newAnswers = [...answers];
      newAnswers[qIdx] = answer;
      setAnswers(newAnswers);
      const newResults = [...results];
      newResults[qIdx] = res.data;
      setResults(newResults);
      const newLinkedList = [...linkedList];
      newLinkedList[currentIndex + 1] = res.data;
      setLinkedList(newLinkedList);
      setAnswer('');
      setCurrentIndex(currentIndex + 1);
    } catch (err) {
      setError('Có lỗi khi gửi câu trả lời.');
    } finally {
      setLoading(false);
    }
  };

  const handleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setError('Trình duyệt của bạn không hỗ trợ ghi âm giọng nói.');
      return;
    }
    if (isRecording) {
      setIsRecording(false);
      if (recognitionRef.current) recognitionRef.current.stop();
    } else {
      setError('');
      setIsRecording(true);
      finalizedTranscript.current = answer;
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN';
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.continuous = true;
      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript + ' ';
          } else {
            interim += transcript;
          }
        }
        if (final) {
          finalizedTranscript.current += final;
        }
        setAnswer(finalizedTranscript.current + interim);
      };
      recognition.onerror = (event: any) => {
        setError('Lỗi ghi âm: ' + event.error);
        setIsRecording(false);
      };
      recognitionRef.current = recognition;
      recognition.start();
    }
  };

  const getScoreColor = (score: number | undefined) => {
    if (score === undefined) return theme.palette.grey[300];
    if (score <= 2) return theme.palette.error.light;
    if (score <= 5) return theme.palette.warning.light;
    if (score <= 7) return theme.palette.success.light;
    if (score <= 9) return theme.palette.info.light;
    return theme.palette.secondary.light;
  };

  const getOverallScore = (scores: { [key: string]: number }) => {
    const scoreKeys = Object.keys(scores);
    const targetKeys = ['self-awareness', 'empathy', 'self-regulation', 'communication', 'decision-making'];
    
    const sum = targetKeys.reduce((acc, targetKey) => {
      const foundKey = scoreKeys.find(key => 
        key.toLowerCase().replace(/[_-]/g, '') === targetKey.toLowerCase().replace(/[_-]/g, '')
      );
      return acc + (foundKey ? scores[foundKey] : 0);
    }, 0);
    
    return Math.round((sum / targetKeys.length) * 10) / 10;
  };

  const getOverallReasoning = (score: number) => {
    if (score < 3) {
      return "EQ của bạn trong tình huống này là rất thấp. Có thể bạn gặp khó khăn trong việc nhận diện và điều tiết cảm xúc. Hãy bắt đầu bằng việc quan sát cảm xúc hàng ngày và học cách thấu hiểu người khác.";
    } else if (score < 6) {
      return "EQ của bạn trong tình huống này hơi trung bình thấp. Bạn có tiềm năng để cải thiện, đặc biệt trong việc giao tiếp cảm xúc và kiểm soát phản ứng. Hãy thử rèn luyện qua các tình huống thực tế và phản hồi từ người xung quanh.";
    } else if (score < 8) {
      return "EQ của bạn trong tình huống này ở mức khá. Bạn có khả năng thấu hiểu và quản lý cảm xúc tốt trong phần lớn tình huống, nhưng vẫn còn một số điểm có thể phát triển để đạt mức xuất sắc.";
    } else {
      return "Bạn xử lý rất tốt trong tình huống này! Khả năng đồng cảm, tự nhận thức và điều tiết cảm xúc của bạn thật ấn tượng. Hãy tiếp tục phát huy và lan tỏa sự tích cực này đến những người xung quanh.";
    }
  };

  const topicName = topics.length > 0 && topicId ? (topics.find(t => t.id === Number(topicId))?.name || '') : '';
  const canViewSummary = linkedList.length > 1 && linkedList.slice(1, -1).every((v, i) => (i % 2 === 0 ? true : v !== null));

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress />
    </Box>
  );

  if (error) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Alert severity="error">{error}</Alert>
    </Box>
  );

  if (!situations.length) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Typography variant="h6" color="text.secondary">Không có tình huống nào cho chủ đề này.</Typography>
    </Box>
  );

  const node = linkedList[currentIndex];
  let sit: Situation | null = null;
  let result: AnalysisResult | null = null;
  if (typeof node === 'number') {
    sit = situations[node];
    result = results[node];
  } else if (node && typeof node === 'object') {
    const qIdx = Math.floor((currentIndex - 1) / 2);
    result = results[qIdx];
    sit = situations[qIdx];
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: 'background.default',
      p: 3,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      fontFamily: 'Roboto, Arial, sans-serif'
    }}>
      {/* Navigation */}
      <Box sx={{ 
        width: '100%', 
        maxWidth: 1200, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4 
      }}>
        <IconButton
          onClick={handlePrev}
          disabled={currentIndex === 0}
          sx={{ 
            fontSize: 48, 
            color: 'primary.main',
            opacity: currentIndex === 0 ? 0.3 : 1 
          }}
        >
          <KeyboardArrowLeft fontSize="large" />
        </IconButton>
        
        <Paper sx={{ 
          p: 2, 
          border: `2px dashed ${theme.palette.primary.main}`,
          borderRadius: 2,
          bgcolor: 'background.paper'
        }}>
          <Typography variant="h5" sx={{ 
            fontWeight: 700, 
            color: 'primary.main',
            textAlign: 'center',
            fontFamily: 'Roboto, Arial, sans-serif'
          }}>
            {loading ? 'Đang tải...' : topicName ? topicName.toUpperCase() : 'Không có chủ đề'}
          </Typography>
        </Paper>
        
        <IconButton
          onClick={handleNext}
          disabled={currentIndex === linkedList.length - 1}
          sx={{ 
            fontSize: 48, 
            color: 'primary.main',
            opacity: currentIndex === linkedList.length - 1 ? 0.3 : 1 
          }}
        >
          <KeyboardArrowRight fontSize="large" />
        </IconButton>
      </Box>

      {/* Main content */}
      {node === 'xem_ket_qua' ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            disabled={!canViewSummary}
            onClick={() => window.location.href = `/summary?topicId=${topicId}`}
            sx={{ 
              fontSize: 20, 
              py: 2, 
              px: 4, 
              borderRadius: 2,
              mb: 2,
              fontFamily: 'Roboto, Arial, sans-serif'
            }}
          >
            XEM KẾT QUẢ EQ
          </Button>
          {!canViewSummary && (
            <Typography color="error" sx={{ mt: 2, fontFamily: 'Roboto, Arial, sans-serif' }}>
              Bạn cần hoàn thành tất cả các câu hỏi để xem kết quả tổng hợp.
            </Typography>
          )}
        </Box>
      ) : typeof node === 'number' ? (
        // Question and Answer layout
        <Box sx={{ 
          width: '100%', 
          maxWidth: 1200, 
          display: 'flex', 
          gap: 4,
          minHeight: 500
        }}>
          {/* Situation Box */}
          <Paper sx={{ 
            flex: 1, 
            p: 4, 
            borderRadius: 3,
            bgcolor: 'background.paper',
            border: `2px solid ${theme.palette.primary.main}`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start'
          }}>
            <Typography variant="h6" sx={{ 
              color: 'success.main', 
              mb: 2, 
              fontWeight: 500,
              fontFamily: 'Roboto, Arial, sans-serif'
            }}>
              {sit?.context}
            </Typography>
            <Typography variant="h6" sx={{ 
              color: 'error.main', 
              fontWeight: 700,
              fontFamily: 'Roboto, Arial, sans-serif'
            }}>
              {sit?.question}
            </Typography>
          </Paper>

          {/* Answer Box */}
          <Paper sx={{ 
            flex: 1, 
            p: 4, 
            borderRadius: 3,
            bgcolor: 'background.paper',
            border: `2px solid ${theme.palette.secondary.main}`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <Typography variant="h6" sx={{ 
              color: 'secondary.main', 
              mb: 2, 
              fontWeight: 600,
              fontFamily: 'Roboto, Arial, sans-serif'
            }}>
              Câu trả lời của bạn
            </Typography>
            
            <TextField
              multiline
              rows={6}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Nhập câu trả lời..."
              variant="outlined"
              fullWidth
              disabled={loading}
              sx={{ mb: 2 }}
            />

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Voice and Send buttons */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: 2 
            }}>
              <IconButton
                onClick={handleVoice}
                sx={{
                  width: 56,
                  height: 56,
                  border: `2px solid ${isRecording ? 'error.main' : 'secondary.main'}`,
                  bgcolor: isRecording ? 'error.light' : 'background.paper',
                  '&:hover': {
                    bgcolor: isRecording ? 'error.main' : 'secondary.light',
                    color: 'white'
                  }
                }}
              >
                <Mic />
              </IconButton>
              
              <IconButton
                onClick={handleSend}
                disabled={loading || !answer.trim()}
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark'
                  },
                  '&:disabled': {
                    bgcolor: 'grey.300',
                    color: 'grey.500'
                  }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : <Send />}
              </IconButton>
            </Box>
          </Paper>
        </Box>
      ) : (
        // Results Grid
        <Box sx={{ 
          width: '100%', 
          maxWidth: 1200,
          mt: 2
        }}>
          <Grid container spacing={3}>
            {result && EQ_KEYS.map((item) => {
              let score: number | undefined;
              let reasoning = '';

              if (item.key === 'overall') {
                score = getOverallScore(result!.scores);
                reasoning = getOverallReasoning(score);
              } else {
                const scoreKeys = Object.keys(result!.scores);
                const scoreKey = scoreKeys.find(key => 
                  key.toLowerCase().replace(/[_-]/g, '') === item.key.toLowerCase().replace(/[_-]/g, '')
                );
                score = scoreKey ? result!.scores[scoreKey] : undefined;
                
                const reasoningKeys = Object.keys(result!.reasoning || {});
                const topicKeywords = {
                  'self-awareness': 'awareness',
                  empathy: 'empathy',
                  'self-regulation': 'regulation',
                  communication: 'communication',
                  'decision-making': 'decision',
                  overall: 'overall'
                };
                const reasoningKey = reasoningKeys.find(key => 
                  key.toLowerCase().includes(topicKeywords[item.key as keyof typeof topicKeywords])
                );
                reasoning = reasoningKey ? result!.reasoning[reasoningKey] : '';
              }

              return (
                <Grid item xs={12} sm={6} md={4} key={item.key}>
                  <Paper
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      cursor: 'pointer',
                      bgcolor: getScoreColor(score),
                      '&:hover': {
                        transform: 'scale(1.05)',
                        transition: 'transform 0.2s',
                        boxShadow: theme.shadows[8]
                      }
                    }}
                    onClick={() => setSelectedScore({
                      label: item.label,
                      score: score || 0,
                      reasoning: reasoning || 'Không có nhận xét cho mục này.'
                    })}
                  >
                    <Typography variant="h6" sx={{ 
                      mb: 1, 
                      fontWeight: 600,
                      fontFamily: 'Roboto, Arial, sans-serif',
                      color: theme.palette.mode === 'dark' ? 'white' : 'black'
                    }}>
                      {item.label}
                    </Typography>
                    <Typography variant="h2" sx={{ 
                      fontWeight: 700, 
                      mb: 2,
                      fontFamily: 'Roboto, Arial, sans-serif',
                      color: theme.palette.mode === 'dark' ? 'white' : 'black'
                    }}>
                      {score !== undefined ? score : '-'}
                    </Typography>
                    {reasoning && (
                      <Typography variant="body2" sx={{ 
                        color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        fontFamily: 'Roboto, Arial, sans-serif',
                        fontWeight: 'bold',
                      }}>
                        {reasoning}
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* Detail Dialog */}
      <Dialog 
        open={!!selectedScore} 
        onClose={() => setSelectedScore(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          fontFamily: 'Roboto, Arial, sans-serif',
          fontWeight: 700,
          color: 'text.primary'
        }}>
          {selectedScore?.label}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h1" sx={{ 
              fontWeight: 700,
              fontFamily: 'Roboto, Arial, sans-serif',
              color: 'primary.main'
            }}>
              {selectedScore?.score}
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ 
            fontFamily: 'Roboto, Arial, sans-serif',
            color: 'text.primary',
            lineHeight: 1.6
          }}>
            {selectedScore?.reasoning}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setSelectedScore(null)}
            startIcon={<Close />}
            sx={{ fontFamily: 'Roboto, Arial, sans-serif' }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Test; 