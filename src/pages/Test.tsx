import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSituations, analyzeAnswer, getTopics } from '../api/eqApi';

const EQ_KEYS = [
  { key: 'self_awareness', label: 'Self Awareness', color: '#f8bcbc' },
  { key: 'empathy', label: 'Empathy', color: '#ffe2b0' },
  { key: 'self_regulation', label: 'Self Regulation', color: '#f7ffb0' },
  { key: 'communication', label: 'Communication', color: '#caffc7' },
  { key: 'decision_making', label: 'Decision Making', color: '#b0d6ff' },
  { key: 'overall', label: 'Overall', color: '#e2d0ff' },
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
  const [situations, setSituations] = useState<Situation[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState('');
  const [answers, setAnswers] = useState<string[]>([]);
  const [showGrid, setShowGrid] = useState(false);
  const [selectedBox, setSelectedBox] = useState<string | null>(null);
  const [results, setResults] = useState<(AnalysisResult | null)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        setCurrent(0);
        setTopics(topicsRes.data);
      })
      .catch(() => setError('Không thể tải dữ liệu.'))
      .finally(() => setLoading(false));
  }, [topicId]);

  const handlePrev = () => {
    if (current > 0) setCurrent(current - 1);
  };
  const handleNext = () => {
    if (current < situations.length - 1) setCurrent(current + 1);
    // Nếu là câu cuối, có thể chuyển sang trang kết quả
  };
  const handleSend = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await analyzeAnswer({
        situation_id: situations[current].id,
        answer_text: answer,
      });
      const newAnswers = [...answers];
      newAnswers[current] = answer;
      setAnswers(newAnswers);
      const newResults = [...results];
      newResults[current] = res.data;
      setResults(newResults);
      setShowGrid(true);
      setAnswer('');
    } catch (err) {
      setError('Có lỗi khi gửi câu trả lời.');
    } finally {
      setLoading(false);
    }
  };
  const handleCloseOverlay = () => setSelectedBox(null);

  const getOverallScore = (scores: { [key: string]: number }) => {
    const keys = ['self_awareness', 'empathy', 'self_regulation', 'communication', 'decision_making'];
    const sum = keys.reduce((acc, k) => acc + (scores[k] || 0), 0);
    return Math.round((sum / keys.length) * 10) / 10;
  };

  const getOverallReasoning = (score: number) => {
    if (score < 3) {
      return "EQ của bạn đang ở mức rất thấp. Có thể bạn gặp khó khăn trong việc nhận diện và điều tiết cảm xúc. Hãy bắt đầu bằng việc quan sát cảm xúc hàng ngày và học cách thấu hiểu người khác.";
    } else if (score < 6) {
      return "EQ của bạn ở mức trung bình thấp. Bạn có tiềm năng để cải thiện, đặc biệt trong việc giao tiếp cảm xúc và kiểm soát phản ứng. Hãy thử rèn luyện qua các tình huống thực tế và phản hồi từ người xung quanh.";
    } else if (score < 8) {
      return "EQ của bạn ở mức khá. Bạn có khả năng thấu hiểu và quản lý cảm xúc tốt trong phần lớn tình huống, nhưng vẫn còn một số điểm có thể phát triển để đạt mức xuất sắc.";
    } else {
      return "Bạn có EQ rất cao! Khả năng đồng cảm, tự nhận thức và điều tiết cảm xúc của bạn thật ấn tượng. Hãy tiếp tục phát huy và lan tỏa sự tích cực này đến những người xung quanh.";
    }
  };

  function getScoreColor(score: number | undefined): string {
    if (score === undefined) return '#eee';
    if (score <= 2) return '#ffb3b3'; // đỏ nhạt
    if (score <= 5) return '#ffd59e'; // cam nhạt
    if (score <= 7) return '#b6f5b6'; // xanh lục nhạt
    if (score <= 9) return '#b6d6ff'; // xanh dương nhạt
    return '#e2d0ff'; // tím nhạt cho 10
  }

  const topicName = topics.length > 0 && topicId ? (topics.find(t => t.id === Number(topicId))?.name || '') : '';

  if (loading) return <div style={{ textAlign: 'center', marginTop: 60 }}>Đang tải dữ liệu...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', marginTop: 60 }}>{error}</div>;
  if (!situations.length) return <div style={{ textAlign: 'center', marginTop: 60 }}>Không có tình huống nào cho chủ đề này.</div>;

  const sit = situations[current];
  const result = results[current];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ddd',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Quicksand, Nunito, Arial, sans-serif',
      position: 'relative',
    }}>
      {/* Navigation */}
      <div style={{ width: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <button
          onClick={handlePrev}
          disabled={current === 0}
          style={{ background: 'none', border: 'none', fontSize: 48, color: '#a00', cursor: 'pointer', opacity: current === 0 ? 0.3 : 1 }}
        >&#8592;</button>
        <div style={{ fontWeight: 700, fontSize: 28, color: '#a00', border: '2px dashed #a00', borderRadius: 12, padding: '4px 32px', background: '#fff', letterSpacing: 1 }}>
          {loading
            ? <span style={{ color: '#aaa' }}>Đang tải...</span>
            : topicName
              ? topicName.toUpperCase()
              : <span style={{ color: '#aaa' }}>Không có chủ đề</span>
          }
        </div>
        <button
          onClick={handleNext}
          disabled={current === situations.length - 1}
          style={{ background: 'none', border: 'none', fontSize: 48, color: '#a00', cursor: 'pointer', opacity: current === situations.length - 1 ? 0.3 : 1 }}
        >&#8594;</button>
      </div>
      {/* Main 2 box hoặc grid điểm */}
      {!showGrid ? (
        <div style={{ display: 'flex', gap: 24, width: 700 }}>
          {/* Box tình huống */}
          <div style={{ flex: 1, background: '#e6d6fa', borderRadius: 24, border: '4px solid #6c3fc5', padding: 24, minHeight: 260, boxShadow: '2px 4px 12px #bbb', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ color: 'green', fontSize: 22, fontWeight: 500, marginBottom: 16 }}>{sit.context}</div>
            <div style={{ color: 'brown', fontSize: 22, fontWeight: 600 }}>{sit.question}</div>
          </div>
          {/* Box trả lời */}
          <div style={{ flex: 1, background: '#cbe2fa', borderRadius: 24, border: '4px solid #223a7a', padding: 24, minHeight: 260, boxShadow: '2px 4px 12px #bbb', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ color: '#223a7a', fontSize: 22, fontWeight: 500, marginBottom: 16 }}>Câu trả lời của bạn</div>
            <textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="Nhập câu trả lời..."
              style={{ width: '100%', minHeight: 80, fontSize: 20, borderRadius: 8, border: '2px solid #223a7a', padding: 8, marginBottom: 16, resize: 'vertical' }}
              disabled={loading}
            />
            {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 16 }}>
              {/* Icon ghi âm (chỉ là placeholder) */}
              <button style={{ width: 48, height: 48, borderRadius: '50%', border: '2px solid #223a7a', background: '#fff', boxShadow: '2px 2px 6px #bbb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, cursor: 'pointer' }}>
                <span role="img" aria-label="voice">🎤</span>
              </button>
              {/* Nút gửi */}
              <button
                onClick={handleSend}
                disabled={loading || !answer.trim()}
                style={{ width: 48, height: 48, borderRadius: '50%', border: '2px solid #223a7a', background: '#4da3ff', boxShadow: '2px 2px 6px #bbb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, cursor: loading || !answer.trim() ? 'not-allowed' : 'pointer', color: '#111', opacity: loading || !answer.trim() ? 0.5 : 1 }}
              >
                {loading ? <span role="img" aria-label="loading">⏳</span> : <span role="img" aria-label="send">➤</span>}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ width: 700, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(2, 1fr)', gap: 24, marginTop: 16 }}>
          {result ? EQ_KEYS.map((item, idx) => {
            let score = result.scores[item.key];
            let reasoning = result.reasoning[item.key];
            if (item.key === 'overall') {
              score = getOverallScore(result.scores);
              reasoning = getOverallReasoning(score);
            }
            const boxColor = getScoreColor(score);
            return (
              <div
                key={item.key}
                onClick={() => setSelectedBox(selectedBox === item.key ? null : item.key)}
                style={{
                  background: boxColor,
                  borderRadius: 24,
                  border: '4px solid #222',
                  boxShadow: selectedBox === item.key ? '0 8px 32px 0 rgba(60,72,88,0.18)' : '2px 4px 12px #bbb',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 140,
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'transform 0.25s cubic-bezier(.34,1.56,.64,1)',
                  zIndex: selectedBox === item.key ? 100 : 1,
                  transform: selectedBox === item.key ? 'scale(1.15)' : 'scale(1)',
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 600, color: '#222', marginBottom: 8 }}>{item.label}</div>
                <div style={{ fontSize: 64, fontWeight: 700, color: '#444' }}>{score !== undefined ? score : ''}</div>
                {/* Overlay nhận xét */}
                {selectedBox === item.key && (
                  <div
                    onClick={handleCloseOverlay}
                    style={{
                      position: 'fixed',
                      inset: 0,
                      background: 'rgba(0,0,0,0.25)',
                      zIndex: 99,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div
                      style={{
                        background: boxColor,
                        borderRadius: 32,
                        border: '6px solid #222',
                        boxShadow: '0 8px 32px 0 rgba(60,72,88,0.18)',
                        padding: '48px 32px',
                        minWidth: 340,
                        maxWidth: 420,
                        textAlign: 'center',
                        fontSize: 28,
                        fontWeight: 600,
                        color: '#222',
                        position: 'relative',
                        zIndex: 200,
                      }}
                    >
                      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>{item.label} score</div>
                      <div style={{ fontSize: 64, fontWeight: 700, color: '#a00', marginBottom: 16 }}>{score !== undefined ? score : ''}</div>
                      <div style={{ fontSize: 24, color: '#a00', fontWeight: 500 }}>{reasoning}</div>
                    </div>
                  </div>
                )}
              </div>
            );
          }) : <div>Đang tải kết quả...</div>}
        </div>
      )}
    </div>
  );
};

export default Test; 