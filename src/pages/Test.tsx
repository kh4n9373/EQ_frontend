import React, { useState, useEffect, useRef } from 'react';
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
  const [answers, setAnswers] = useState<string[]>([]);
  const [results, setResults] = useState<(AnalysisResult | null)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Linked list state
  const [linkedList, setLinkedList] = useState<any[]>([]); // [Q1, null, Q2, null, ... , Q5, null, 'xem_ket_qua']
  const [currentIndex, setCurrentIndex] = useState(0); // index trên linkedList
  const [answer, setAnswer] = useState('');
  const [selectedBox, setSelectedBox] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [sendHover, setSendHover] = useState(false);
  const finalizedTranscript = useRef('');

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
        // Tạo linkedList: [Q1, null, Q2, null, ..., Q5, null, 'xem_ket_qua']
        const arr = [];
        for (let i = 0; i < situationsRes.data.length; i++) {
          arr.push(i); // index câu hỏi
          arr.push(null); // kết quả
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

  // Helper: next/prev bỏ qua null
  const findNextIndex = (from: number, dir: 1 | -1) => {
    let idx = from + dir;
    while (idx >= 0 && idx < linkedList.length) {
      // Nếu là null (chưa có kết quả), skip
      if (linkedList[idx] !== null) return idx;
      idx += dir;
    }
    return from; // không đi được nữa
  };

  const handlePrev = () => {
    if (currentIndex === 0) return;
    const prevIdx = findNextIndex(currentIndex, -1);
    setCurrentIndex(prevIdx);
    // Nếu là câu hỏi, setAnswer lại
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
      // Cập nhật linkedList: chèn kết quả vào vị trí null sau câu hỏi
      const newLinkedList = [...linkedList];
      newLinkedList[currentIndex + 1] = res.data;
      setLinkedList(newLinkedList);
      setAnswer('');
      // Tự động next sang grid điểm
      setCurrentIndex(currentIndex + 1);
    } catch (err) {
      setError('Có lỗi khi gửi câu trả lời.');
    } finally {
      setLoading(false);
    }
  };
  const handleCloseOverlay = () => setSelectedBox(null);

  // Voice recognition handler
  const handleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setError('Trình duyệt của bạn không hỗ trợ ghi âm giọng nói.');
      return;
    }
    if (isRecording) {
      // Stop
      setIsRecording(false);
      if (recognitionRef.current) recognitionRef.current.stop();
    } else {
      // Start
      setError('');
      setIsRecording(true);
      finalizedTranscript.current = answer; // lưu lại phần đã có
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
      // Không tự động stop khi onend, chỉ stop khi user bấm lại
      recognitionRef.current = recognition;
      recognition.start();
    }
  };

  const getOverallScore = (scores: { [key: string]: number }) => {
    const keys = ['self_awareness', 'empathy', 'self_regulation', 'communication', 'decision_making'];
    const sum = keys.reduce((acc, k) => acc + (scores[k] || 0), 0);
    return Math.round((sum / keys.length) * 10) / 10;
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

  function getScoreColor(score: number | undefined): string {
    if (score === undefined) return '#eee';
    if (score <= 2) return '#ffb3b3'; // đỏ nhạt
    if (score <= 5) return '#ffd59e'; // cam nhạt
    if (score <= 7) return '#b6f5b6'; // xanh lục nhạt
    if (score <= 9) return '#b6d6ff'; // xanh dương nhạt
    return '#e2d0ff'; // tím nhạt cho 10
  }

  const topicName = topics.length > 0 && topicId ? (topics.find(t => t.id === Number(topicId))?.name || '') : '';

  // Enable nút xem kết quả nếu tất cả các kết quả đã có (không còn null trừ cuối)
  const canViewSummary = linkedList.length > 1 && linkedList.slice(1, -1).every((v, i) => (i % 2 === 0 ? true : v !== null));

  // Render
  if (loading) return <div style={{ textAlign: 'center', marginTop: 60 }}>Đang tải dữ liệu...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', marginTop: 60 }}>{error}</div>;
  if (!situations.length) return <div style={{ textAlign: 'center', marginTop: 60 }}>Không có tình huống nào cho chủ đề này.</div>;

  // Lấy index câu hỏi hiện tại nếu là Q, hoặc kết quả nếu là grid
  const node = linkedList[currentIndex];
  let sit: Situation | null = null;
  let result: AnalysisResult | null = null;
  if (typeof node === 'number') {
    sit = situations[node];
    result = results[node];
  } else if (node && typeof node === 'object') {
    // node là kết quả
    const qIdx = Math.floor((currentIndex - 1) / 2);
    result = results[qIdx];
    sit = situations[qIdx];
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ddd',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      fontFamily: 'K2D, Quicksand, Nunito, Arial, sans-serif',
      position: 'relative',
      width: '90vw',
      maxWidth: '100vw',
      padding: '0 6vw',
    }}>
      {/* Navigation */}
      <div style={{ width: '100%', maxWidth: '100vw', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          style={{ background: 'none', border: 'none', fontSize: 48, color: '#a00', cursor: 'pointer', opacity: currentIndex === 0 ? 0.3 : 1 }}
        >&#8592;</button>
        <div style={{ fontWeight: 700, fontSize: 28, color: '#a00', border: '2px dashed #a00', borderRadius: 12, padding: '4px 32px', background: '#fff', letterSpacing: 1,
          marginTop: 10, marginBottom: 32 }}>
          {loading
            ? <span style={{ color: '#aaa' }}>Đang tải...</span>
            : topicName
              ? topicName.toUpperCase()
              : <span style={{ color: '#aaa' }}>Không có chủ đề</span>
          }
        </div>
        <button
          onClick={handleNext}
          disabled={currentIndex === linkedList.length - 1}
          style={{ background: 'none', border: 'none', fontSize: 48, color: '#a00', cursor: 'pointer', opacity: currentIndex === linkedList.length - 1 ? 0.3 : 1 }}
        >&#8594;</button>
      </div>
      {/* Main content: Q, grid, hoặc xem_ket_qua */}
      {node === 'xem_ket_qua' ? (
        <div style={{ width: '100%', maxWidth: '100vw', textAlign: 'center', marginTop: 40 }}>
          <button
            disabled={!canViewSummary}
            style={{ fontSize: 28, padding: '16px 48px', borderRadius: 16, background: canViewSummary ? '#6c3fc5' : '#ccc', color: '#fff', border: 'none', fontWeight: 700, cursor: canViewSummary ? 'pointer' : 'not-allowed', boxShadow: '2px 4px 12px #bbb', marginBottom: 24 }}
            onClick={() => window.location.href = `/summary?topicId=${topicId}`}
          >XEM KẾT QUẢ EQ</button>
          {!canViewSummary && <div style={{ color: '#a00', marginTop: 12 }}>Bạn cần hoàn thành tất cả các câu hỏi để xem kết quả tổng hợp.</div>}
        </div>
      ) : typeof node === 'number' ? (
        // Box nhập câu trả lời
        <div style={{ display: 'flex', gap: '5vw', width: '100%', maxWidth: '100vw', minHeight: 420 }}>
          {/* Box tình huống */}
          <div style={{ flex: 1, background: '#e6d6fa', borderRadius: 24, border: '4px solid #6c3fc5', padding: '3vw', minHeight: 720, boxShadow: '2px 4px 12px #bbb', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', minWidth: 0 }}>
            <div style={{ color: 'green', fontSize: 24, fontWeight: 500, marginBottom: 18, whiteSpace: 'pre-line', fontFamily: 'K2D, Quicksand, Nunito, Arial, sans-serif' }}>{sit?.context}</div>
            <div style={{ color: '#a00', fontSize: 24, fontWeight: 700, marginTop: 0, whiteSpace: 'pre-line', fontFamily: 'K2D, Quicksand, Nunito, Arial, sans-serif' }}>{sit?.question}</div>
          </div>
          {/* Box trả lời */}
          <div style={{ flex: 1, background: '#cbe2fa', borderRadius: 24, border: '4px solid #223a7a', padding: '3vw', minHeight: 720, boxShadow: '2px 4px 12px #bbb', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'stretch', position: 'relative', fontFamily: 'K2D, Quicksand, Nunito, Arial, sans-serif', minWidth: 0 }}>
            <div style={{ color: '#223a7a', fontSize: 22, fontWeight: 600, marginBottom: 12, textAlign: 'left', fontFamily: 'K2D, Quicksand, Nunito, Arial, sans-serif' }}>Câu trả lời của bạn</div>
            <textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="Nhập câu trả lời..."
              style={{
                width: '100%',
                minHeight: 90,
                fontSize: 20,
                borderRadius: 12,
                border: 'none',
                background: 'transparent',
                padding: 10,
                marginBottom: 0,
                resize: 'vertical',
                color: '#223a7a',
                outline: 'none',
                boxShadow: 'none',
                fontFamily: 'K2D, Quicksand, Nunito, Arial, sans-serif',
              }}
              disabled={loading}
            />
            {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
            {/* Nút voice + send căn giữa dưới cùng */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, marginTop: 'auto', marginBottom: 0 }}>
              {/* Icon sóng âm */}
              <button
                type="button"
                onClick={handleVoice}
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: '50%',
                  border: isRecording ? '2px solid #d32f2f' : '2px solid #223a7a',
                  background: isRecording ? '#fff0f0' : '#fff',
                  boxShadow: isRecording ? '0 0 0 4px #ffd6d6' : '2px 2px 6px #bbb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'background 0.2s, border 0.2s, box-shadow 0.2s',
                  outline: 'none',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = isRecording ? '#ffb3b3' : '#ffeaea';
                  (e.currentTarget as HTMLButtonElement).style.border = '2px solid #d32f2f';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = isRecording ? '#fff0f0' : '#fff';
                  (e.currentTarget as HTMLButtonElement).style.border = isRecording ? '2px solid #d32f2f' : '2px solid #223a7a';
                }}
              >
                {/* SVG sóng âm */}
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="4" y="12" width="2" height="4" rx="1" fill={isRecording ? '#d32f2f' : '#223a7a'}/>
                  <rect x="8" y="9" width="2" height="10" rx="1" fill={isRecording ? '#d32f2f' : '#223a7a'}/>
                  <rect x="12" y="6" width="2" height="16" rx="1" fill={isRecording ? '#d32f2f' : '#223a7a'}/>
                  <rect x="16" y="9" width="2" height="10" rx="1" fill={isRecording ? '#d32f2f' : '#223a7a'}/>
                  <rect x="20" y="12" width="2" height="4" rx="1" fill={isRecording ? '#d32f2f' : '#223a7a'}/>
                </svg>
              </button>
              {/* Nút gửi */}
              <button
                onClick={handleSend}
                disabled={loading || !answer.trim()}
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: '50%',
                  border: sendHover && !(loading || !answer.trim()) ? '2px solid #1976d2' : '2px solid #223a7a',
                  background: sendHover && !(loading || !answer.trim()) ? '#4da3ff' : '#fff',
                  boxShadow: sendHover && !(loading || !answer.trim()) ? '0 0 0 4px #b3e0ff' : '2px 2px 6px #bbb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 32,
                  cursor: loading || !answer.trim() ? 'not-allowed' : 'pointer',
                  color: '#111',
                  opacity: loading || !answer.trim() ? 0.5 : 1,
                  padding: 0,
                  transition: 'background 0.2s, border 0.2s, box-shadow 0.2s, transform 0.2s',
                  position: 'relative',
                  outline: 'none',
                  transform: sendHover && !(loading || !answer.trim()) ? 'scale(1.08)' : 'scale(1)',
                }}
                onMouseEnter={() => setSendHover(true)}
                onMouseLeave={() => setSendHover(false)}
              >
                {loading ? (
                  <span role="img" aria-label="loading">⏳</span>
                ) : (
                  // Tam giác đen, khi hover thì đổi sang trắng nếu nền xanh
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <polygon id="send-triangle" points="8,6 22,14 8,22" fill={sendHover && !(loading || !answer.trim()) ? '#fff' : '#111'} />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Grid điểm
        <div style={{ width: '100%', maxWidth: '100vw', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(2, 1fr)', gap: '3vw', marginTop: 16, minHeight: 420 }}>
          {result ? EQ_KEYS.map((item, idx) => {
            if (!result) return null; // guard cho chắc
            let score = result.scores[item.key];
            // Tìm key reasoning phù hợp bằng cách kiểm tra từ khóa đặc trưng trong tên key
            const reasoningKeys = Object.keys(result.reasoning || {});
            const topicKeywords = {
              self_awareness: 'awareness',
              empathy: 'empathy',
              self_regulation: 'regulation',
              communication: 'communication',
              decision_making: 'decision',
              overall: 'overall',
            };
            let reasoning = "Không có nhận xét cho mục này.";
            const keyword = topicKeywords[item.key as keyof typeof topicKeywords];
            if (keyword) {
              const foundKey = reasoningKeys.find(k => k.toLowerCase().includes(keyword));
              if (foundKey) reasoning = result.reasoning[foundKey];
            }
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
                  height: 350,
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