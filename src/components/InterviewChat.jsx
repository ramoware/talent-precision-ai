import React, { useState, useEffect, useRef } from 'react';
import { 
  Input, 
  Button, 
  Typography, 
  Card, 
  Progress, 
  Space, 
  Alert, 
  Statistic, 
  Row, 
  Col 
} from 'antd';
import { SendOutlined, ClockCircleOutlined, TrophyOutlined, CheckCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import useInterviewStore from '../redux/InterviewStore.js';
import { generateInterviewSet, evaluateAnswer } from '../utils/questionBank.js';

const { Text, Title } = Typography;

const InterviewChat = ({ candidateInfo, onComplete }) => {
  const updateCandidate = useInterviewStore(state => state.updateCandidate);
  const candidates = useInterviewStore(state => state.candidates);

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [responses, setResponses] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [interviewOver, setInterviewOver] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showResumeAlert, setShowResumeAlert] = useState(false);
  
  const hasShownResumeAlert = useRef(false);
  const hasInitialized = useRef(false);
  const candidate = candidates[candidateInfo?.email];

  // Load questions and resume from persisted state
  useEffect(() => {
    const setQ = generateInterviewSet();
    setQuestions(setQ);

    if (candidate && !candidate.interviewOver) {
      setResponses(candidate.responses || []);
      setCurrentIndex(candidate.currentIndex || 0);
      
      if (candidate.currentIndex < setQ.length) {
        const currentQ = setQ[candidate.currentIndex];
        const savedTimeLeft = candidate.timeLeft || getTimeForQuestion(currentQ.difficulty);
        setTimeLeft(savedTimeLeft);
      }
      
      if (candidate.responses && candidate.responses.length > 0 && !hasShownResumeAlert.current && !hasInitialized.current) {
        setShowResumeAlert(true);
        hasShownResumeAlert.current = true;
        setTimeout(() => setShowResumeAlert(false), 4000);
      }
    } else if (setQ[0]) {
      const initialTime = getTimeForQuestion(setQ[0].difficulty);
      setTimeLeft(initialTime);
    }

    hasInitialized.current = true;
  }, [candidateInfo?.email, candidate]);

  // Timer logic - automatically persists to store
  useEffect(() => {
    if (timeLeft <= 0 || interviewOver) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        
        if (candidateInfo?.email) {
          updateCandidate(candidateInfo.email, {
            currentIndex,
            responses,
            timeLeft: newTime,
            interviewOver: false
          });
        }
        
        return newTime;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft, interviewOver, currentIndex, responses, candidateInfo?.email, updateCandidate]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeLeft === 0 && questions.length && !interviewOver && currentIndex < questions.length) {
      handleSubmit(true);
    }
  }, [timeLeft]);

  const getTimeForQuestion = (level) => {
    const times = { Easy: 20, Medium: 60, Hard: 120 };
    return times[level] || 20;
  };

  const getDifficultyColor = (difficulty) => {
    const colors = { Easy: '#10b981', Medium: '#f59e0b', Hard: '#ef4444' };
    return colors[difficulty] || '#6b7280';
  };

  const handleSubmit = (auto = false) => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    const userAnswer = auto ? "Time expired - no response provided" : answer.trim();

    // ✅ FIXED: Use the enhanced evaluateAnswer that returns object
    const evaluation = evaluateAnswer(userAnswer, currentQ.expected_keywords, currentQ.difficulty);

    // ✅ FIXED: Store all evaluation details
    const response = {
      question: currentQ.question,
      answer: userAnswer,
      score: evaluation.score,
      reasoning: evaluation.reasoning,
      strengths: evaluation.strengths,
      improvements: evaluation.improvements,
      keywords_covered: evaluation.keywords_covered,
      keywords_missed: evaluation.keywords_missed,
      difficulty: currentQ.difficulty,
      topic: currentQ.topic
    };

    const updatedResponses = [...responses, response];
    setResponses(updatedResponses);
    setAnswer('');

    const nextIndex = currentIndex + 1;
    const isInterviewComplete = nextIndex >= questions.length;

    // Update store with progress
    if (candidateInfo?.email) {
      updateCandidate(candidateInfo.email, {
        currentIndex: nextIndex,
        responses: updatedResponses,
        timeLeft: isInterviewComplete ? 0 : getTimeForQuestion(questions[nextIndex]?.difficulty),
        interviewOver: isInterviewComplete
      });
    }

    if (!isInterviewComplete) {
      const nextQuestionTime = getTimeForQuestion(questions[nextIndex].difficulty);
      setCurrentIndex(nextIndex);
      setTimeLeft(nextQuestionTime);
    } else {
      finishInterview(updatedResponses);
    }
  };

  const finishInterview = (finalResponses) => {
    setInterviewOver(true);
    const totalScore = finalResponses.reduce((acc, r) => acc + r.score, 0);
    const percentScore = Math.round((totalScore / (questions.length * 3)) * 100);

    const summary =
      percentScore > 80
        ? "Exceptional candidate with strong technical knowledge and problem-solving skills"
        : percentScore > 60
        ? "Competent candidate with good fundamental understanding"
        : percentScore > 40
        ? "Developing candidate who would benefit from additional training"
        : "Candidate requires significant improvement in core competencies";

    // Final update to store
    if (candidateInfo?.email) {
      updateCandidate(candidateInfo.email, {
        score: percentScore,
        summary,
        responses: finalResponses,
        interviewOver: true,
        currentIndex: questions.length,
        timeLeft: 0,
      });
    }

    setTimeout(() => setShowSummary(true), 1000);
    onComplete({ finalResponses, percentScore, summary });
  };

  if (!questions.length) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <Title level={3} style={{ color: '#1e293b', marginBottom: 16 }}>Preparing Assessment</Title>
        <Text type="secondary">Loading optimized question set for evaluation...</Text>
      </div>
    );
  }

  if (interviewOver && showSummary) {
    const totalScore = responses.reduce((acc, r) => acc + r.score, 0);
    const percentScore = Math.round((totalScore / (questions.length * 3)) * 100);
    
    return (
      <div style={{ maxWidth: 800, margin: 'auto', padding: 20 }}>
        <Card 
          style={{ 
            borderRadius: 12,
            background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
            border: '1px solid #10b981',
            textAlign: 'center',
            marginBottom: 24
          }}
        >
          <CheckCircleOutlined style={{ fontSize: 48, color: '#10b981', marginBottom: 16 }} />
          <Title level={2} style={{ color: '#065f46', margin: 0 }}>Assessment Complete</Title>
          <Text style={{ color: '#047857', fontSize: 16 }}>
            Thank you for completing all {questions.length} questions!
          </Text>
        </Card>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card style={{ borderRadius: 8, textAlign: 'center' }}>
              <Statistic
                title="Final Score"
                value={percentScore}
                suffix="/100"
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#10b981' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={{ borderRadius: 8, textAlign: 'center' }}>
              <Statistic
                title="Questions Completed"
                value={responses.length}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#3b82f6' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={{ borderRadius: 8, textAlign: 'center' }}>
              <Statistic
                title="Performance Level"
                value={percentScore >= 70 ? 'Strong' : percentScore >= 50 ? 'Moderate' : 'Developing'}
                valueStyle={{ 
                  color: percentScore >= 70 ? '#10b981' : percentScore >= 50 ? '#f59e0b' : '#ef4444',
                  fontSize: 20
                }}
              />
            </Card>
          </Col>
        </Row>

        <Card title="Assessment Summary" style={{ borderRadius: 8 }}>
          <Text strong style={{ fontSize: 16, color: '#1e293b' }}>{candidate?.summary}</Text>
          
          <Title level={5} style={{ marginTop: 24, color: '#374151' }}>Question Breakdown:</Title>
          {responses.map((r, idx) => (
            <Card 
              key={idx} 
              size="small" 
              style={{ 
                marginBottom: 12, 
                borderLeft: `4px solid ${getDifficultyColor(r.difficulty)}`,
                borderRadius: 6
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <Text strong style={{ color: '#1f2937' }}>Question {idx + 1} • {r.difficulty}</Text>
                  <div style={{ marginTop: 4 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>Topic: {r.topic}</Text>
                  </div>
                </div>
                <div style={{ 
                  background: getDifficultyColor(r.difficulty),
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 'bold'
                }}>
                  Score: {r.score}/3
                </div>
              </div>
              <Text style={{ color: '#4b5563', display: 'block', marginBottom: 8 }}>{r.question}</Text>
              <div style={{ marginTop: 8 }}>
                <Text strong style={{ color: '#374151' }}>Your response: </Text>
                <Text style={{ color: '#6b7280' }}>{r.answer}</Text>
              </div>
              
              {/* ✅ FIXED: Show detailed evaluation results */}
              <div style={{ marginTop: 12, padding: 12, background: '#f8fafc', borderRadius: 6 }}>
                <Text strong style={{ color: '#374151' }}>Evaluation: </Text>
                <Text style={{ color: '#6b7280' }}>{r.reasoning}</Text>
                
                {r.strengths && r.strengths.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <Text strong style={{ color: '#10b981', fontSize: 12 }}>✅ Strengths: </Text>
                    <Text style={{ color: '#059669', fontSize: 12 }}>{r.strengths.join(', ')}</Text>
                  </div>
                )}
                
                {r.improvements && r.improvements.length > 0 && (
                  <div style={{ marginTop: 4 }}>
                    <Text strong style={{ color: '#ef4444', fontSize: 12 }}>💡 Areas for Improvement: </Text>
                    <Text style={{ color: '#dc2626', fontSize: 12 }}>{r.improvements.join(', ')}</Text>
                  </div>
                )}
                
                {r.keywords_covered && r.keywords_covered.length > 0 && (
                  <div style={{ marginTop: 4 }}>
                    <Text strong style={{ color: '#3b82f6', fontSize: 12 }}>📚 Keywords Covered: </Text>
                    <Text style={{ color: '#1d4ed8', fontSize: 12 }}>{r.keywords_covered.join(', ')}</Text>
                  </div>
                )}
                
                {r.keywords_missed && r.keywords_missed.length > 0 && (
                  <div style={{ marginTop: 4 }}>
                    <Text strong style={{ color: '#f59e0b', fontSize: 12 }}>📖 Keywords to Study: </Text>
                    <Text style={{ color: '#d97706', fontSize: 12 }}>{r.keywords_missed.join(', ')}</Text>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </Card>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const totalQuestions = questions.length;
  const progressPercent = ((currentIndex) / totalQuestions) * 100;
  const isSubmitDisabled = answer.trim() === '';

  return (
    <div style={{ maxWidth: 800, margin: 'auto', padding: 20 }}>
      {/* Progress Header */}
      <Card style={{ 
        borderRadius: 8, 
        marginBottom: 24,
        background: 'white',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1e293b' }}>
              Question {currentIndex + 1} of {totalQuestions}
            </Title>
            <Text type="secondary">
              Progress: {currentIndex}/{totalQuestions} questions completed
            </Text>
          </div>
          <div style={{ textAlign: 'center' }}>
            <ClockCircleOutlined style={{ fontSize: 20, color: timeLeft <= 10 ? '#ef4444' : '#6b7280' }} />
            <div style={{ fontSize: 18, fontWeight: 'bold', color: timeLeft <= 10 ? '#ef4444' : '#1e293b' }}>
              {timeLeft}s
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {currentQ.difficulty} level
            </Text>
          </div>
        </div>
        <Progress 
          percent={progressPercent} 
          strokeColor={{
            '0%': '#3b82f6',
            '100%': '#10b981',
          }}
          showInfo={false}
        />
      </Card>

      {/* Resume Alert */}
      {showResumeAlert && (
        <Alert 
          message="Assessment Resumed" 
          description={`Welcome back! Continuing from question ${currentIndex + 1}. Your progress is automatically saved.`}
          type="info"
          showIcon
          style={{ marginBottom: 16, borderRadius: 8 }}
          closable
          onClose={() => setShowResumeAlert(false)}
        />
      )}

      {/* Current Question */}
      <Card 
        style={{ 
          borderRadius: 8,
          marginBottom: 24,
          border: `1px solid ${getDifficultyColor(currentQ.difficulty)}`,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div style={{ 
            display: 'inline-block',
            padding: '4px 12px',
            background: getDifficultyColor(currentQ.difficulty),
            color: 'white',
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 'bold'
          }}>
            {currentQ.difficulty} LEVEL
          </div>
          <div style={{ 
            display: 'inline-block',
            padding: '4px 12px',
            background: '#e2e8f0',
            color: '#475569',
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 'bold'
          }}>
            {currentQ.topic}
          </div>
        </div>

        <Title level={4} style={{ marginBottom: 24, color: '#1e293b', lineHeight: 1.6 }}>
          {currentQ.question}
        </Title>
      </Card>

      {/* Response Input */}
      <Card style={{ borderRadius: 8, marginBottom: 24 }}>
        <Title level={5} style={{ color: '#1e293b', marginBottom: 16 }}>Your Response:</Title>
        <Input.TextArea
          placeholder="Provide your detailed answer here... (Press Ctrl+Enter to submit)"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          autoSize={{ minRows: 4, maxRows: 8 }}
          style={{ 
            marginBottom: 16,
            borderRadius: 6,
            fontSize: 16,
            padding: 12
          }}
          onKeyDown={(e) => {
            if (e.ctrlKey && e.key === 'Enter' && !isSubmitDisabled) {
              handleSubmit();
            }
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text type="secondary">
            {timeLeft <= 10 ? 
              `⏰ Hurry! ${timeLeft} seconds remaining` : 
              `⏱️ ${timeLeft} seconds remaining`
            }
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Progress is automatically saved
            </Text>
          </Text>
          
          <Button 
            type="primary" 
            size="large"
            icon={<SendOutlined />}
            onClick={() => handleSubmit()}
            disabled={isSubmitDisabled}
            style={{
              background: '#3b82f6',
              border: 'none',
              borderRadius: 6,
              padding: '8px 24px',
              height: 'auto',
              fontSize: 16
            }}
          >
            {currentIndex === totalQuestions - 1 ? 'Complete Assessment' : 'Submit Answer'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default InterviewChat;
