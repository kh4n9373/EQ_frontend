import React from 'react';
import { 
  Box, 
  Typography, 
  Alert, 
  Chip, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Paper,
  useTheme
} from '@mui/material';
import { 
  Warning, 
  Lightbulb, 
  SentimentSatisfied, 
  SentimentNeutral, 
  SentimentDissatisfied,
  CheckCircle
} from '@mui/icons-material';

interface SentimentAnalysisProps {
  sentiment: string;
  score: number;
  severity: string;
  warning?: string;
  suggestions: string[];
  analysis: {
    positive_words: number;
    negative_words: number;
    total_words: number;
  };
}

const SentimentAnalysis: React.FC<SentimentAnalysisProps> = ({
  sentiment,
  score,
  severity,
  warning,
  suggestions,
  analysis
}) => {
  const theme = useTheme();

  const getSentimentIcon = () => {
    switch (sentiment) {
      case 'positive':
        return <SentimentSatisfied sx={{ color: 'success.main' }} />;
      case 'negative':
        return <SentimentDissatisfied sx={{ color: 'error.main' }} />;
      default:
        return <SentimentNeutral sx={{ color: 'info.main' }} />;
    }
  };

  const getSentimentColor = () => {
    switch (sentiment) {
      case 'positive':
        return 'success';
      case 'negative':
        return severity === 'high' ? 'error' : 'warning';
      default:
        return 'info';
    }
  };

  const getSeverityColor = () => {
    switch (severity) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      default:
        return 'success';
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {getSentimentIcon()}
        <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
          Phân tích cảm xúc
        </Typography>
        <Chip 
          label={sentiment === 'positive' ? 'Tích cực' : sentiment === 'negative' ? 'Tiêu cực' : 'Trung tính'}
          color={getSentimentColor() as any}
          size="small"
          sx={{ ml: 1 }}
        />
        <Chip 
          label={`Độ nghiêm trọng: ${severity === 'high' ? 'Cao' : severity === 'medium' ? 'Trung bình' : 'Thấp'}`}
          color={getSeverityColor() as any}
          size="small"
          sx={{ ml: 1 }}
        />
      </Box>

      {/* Score và thống kê */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <Chip 
          label={`Điểm: ${(score * 100).toFixed(1)}%`}
          variant="outlined"
          color={score > 0.1 ? 'success' : score < -0.1 ? 'error' : 'default'}
        />
        <Chip 
          label={`Từ tích cực: ${analysis.positive_words}`}
          variant="outlined"
          color="success"
        />
        <Chip 
          label={`Từ tiêu cực: ${analysis.negative_words}`}
          variant="outlined"
          color="error"
        />
        <Chip 
          label={`Tổng từ: ${analysis.total_words}`}
          variant="outlined"
        />
      </Box>

      {/* Cảnh báo nếu có */}
      {warning && (
        <Alert 
          severity={severity === 'high' ? 'error' : 'warning'} 
          icon={<Warning />}
          sx={{ mb: 2 }}
        >
          {warning}
        </Alert>
      )}

      {/* Gợi ý */}
      {suggestions.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center' }}>
            <Lightbulb sx={{ mr: 1, color: 'warning.main' }} />
            Gợi ý cho bạn:
          </Typography>
          <List dense>
            {suggestions.map((suggestion, index) => (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                </ListItemIcon>
                <ListItemText 
                  primary={suggestion}
                  primaryTypographyProps={{ 
                    variant: 'body2',
                    sx: { color: 'text.secondary' }
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Paper>
  );
};

export default SentimentAnalysis; 