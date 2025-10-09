import React, { useState, useEffect } from 'react';
import { Upload, Button, message, Input, Modal, Card, Typography, Space, Tag, Alert, Steps } from 'antd';
import { UploadOutlined, UserOutlined, MailOutlined, PhoneOutlined, RocketOutlined, FileTextOutlined, CheckCircleOutlined } from '@ant-design/icons';
import pdfToText from 'react-pdftotext';
import mammoth from 'mammoth';
import useInterviewStore from '../redux/InterviewStore';

const { Title, Text } = Typography;
const { Step } = Steps;

const extractInfo = (text) => {
  console.log('Raw text length:', text.length);
  console.log('First 500 chars:', text.substring(0, 500));
  
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
  const phoneMatch = text.match(/(?:\+?91[\s-]?)?(\d{5}[\s-]?\d{5})/);

  let phone = '';
  if (phoneMatch) {
    phone = phoneMatch[1].replace(/[\s-]/g, '');
  }

  // Simple and effective name extraction
  const extractName = (text) => {
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && line.length < 50);
    
    // Take the first line that:
    // 1. Doesn't contain email
    // 2. Doesn't contain phone numbers
    // 3. Doesn't contain common resume section headers
    // 4. Has reasonable length for a name
    const excludePatterns = [
      /@/, // email
      /\d{10}/, // phone
      /(name|email|phone|mobile|address|linkedin|github|experience|education|skills|summary|objective|resume|cv)/i
    ];
    
    for (const line of lines.slice(0, 5)) { // Check first 5 lines only
      const shouldExclude = excludePatterns.some(pattern => pattern.test(line));
      
      if (!shouldExclude && 
          /^[A-Za-z\s\.\-]{3,30}$/.test(line) && // Only letters, spaces, dots, hyphens
          line.includes(' ')) { // Should contain space (first + last name)
        console.log('Name found:', line);
        return line;
      }
    }
    
    return '';
  };

  const name = extractName(text);
  console.log('Final name extracted:', name);

  return {
    name: name,
    email: emailMatch ? emailMatch[0] : '',
    phone: phone,
  };
};

const ResumeUpload = ({ onComplete }) => {
  const candidates = useInterviewStore(state => state.candidates);
  const addCandidate = useInterviewStore(state => state.addCandidate);
  const updateCandidate = useInterviewStore(state => state.updateCandidate);
  const getUnfinishedInterview = useInterviewStore(state => state.getUnfinishedInterview);

  const [candidateData, setCandidateData] = useState({ name: '', email: '', phone: '' });
  const [missingFields, setMissingFields] = useState([]);
  const [uploadProcessed, setUploadProcessed] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [unfinishedCandidate, setUnfinishedCandidate] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  // Check for unfinished interviews when component mounts
  useEffect(() => {
    // This will be checked after resume upload when we have the email
    // The actual resume check happens in handleFileUpload
  }, []);

  const handleFileUpload = async (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx'].includes(ext)) {
      message.error('Please upload a PDF or DOCX file.');
      return Upload.LIST_IGNORE;
    }

    try {
      let text = '';
      if (ext === 'pdf') text = await pdfToText(file);
      else {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value;
      }

      const info = extractInfo(text);
      setCandidateData(info);

      const missing = Object.entries(info)
        .filter(([_, val]) => !val)
        .map(([key]) => key);
      setMissingFields(missing);
      setUploadProcessed(true);
      setCurrentStep(1);

      // Check for unfinished interview AFTER we have the email from resume
      if (info.email) {
        const unfinished = getUnfinishedInterview(info.email);
        if (unfinished) {
          setUnfinishedCandidate(unfinished);
          setShowWelcomeBack(true);
        }
      }

      // Only add to store if this is a new candidate
      if (!candidates[info.email]) {
        addCandidate(info.email, {
          info,
          currentIndex: 0,
          responses: [],
          timeLeft: 0,
          interviewOver: false,
        });
      }

      message.success('Resume processed successfully!');
    } catch (err) {
      console.error(err);
      message.error('Failed to process resume. Please try again with a different file.');
    }

    return Upload.LIST_IGNORE;
  };

  const handleFieldChange = (field, value) => {
    if (field === 'phone' && !/^\d*$/.test(value)) return;
    setCandidateData(prev => ({ ...prev, [field]: value }));
    setMissingFields(prev => prev.filter(f => f !== field || !value.trim()));
  };

  const validateAndStart = () => {
    const missing = Object.entries(candidateData)
      .filter(([key, val]) => (!val || val.trim() === '') && key !== 'score' && key !== 'summary')
      .map(([key]) => key);

    if (missing.length > 0) {
      setMissingFields(missing);
      message.error('Please complete all required fields.');
      return;
    }

    if (candidateData.phone && !/^\d{10}$/.test(candidateData.phone)) {
      message.error('Phone number must be exactly 10 digits.');
      return;
    }

    // Update candidate info in store
    if (candidates[candidateData.email]) {
      updateCandidate(candidateData.email, {
        info: candidateData
      });
    }

    onComplete(candidateData);
  };

  const resumeInterview = () => {
    if (!unfinishedCandidate) return;
    
    setShowWelcomeBack(false);
    message.info('Resuming your previous assessment...');
    onComplete(unfinishedCandidate.info);
  };

  const startNewInterview = () => {
    if (unfinishedCandidate && candidateData.email) {
      // Reset the unfinished candidate
      updateCandidate(candidateData.email, {
        currentIndex: 0,
        responses: [],
        timeLeft: 0,
        interviewOver: false,
      });
    }
    
    setShowWelcomeBack(false);
    setUnfinishedCandidate(null);
    // Continue with normal flow - user will click "Start Assessment"
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
      {/* Header Section */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Title level={2} style={{ color: '#1e293b', marginBottom: 8 }}>
          Begin Assessment
        </Title>
        <Text style={{ fontSize: 16, color: '#64748b' }}>
          Upload your resume to start the AI-powered evaluation
        </Text>
      </div>

      {/* Progress Steps */}
      <Steps current={currentStep} style={{ marginBottom: 40 }}>
        <Step title="Upload" icon={<UploadOutlined />} />
        <Step title="Verify" icon={<UserOutlined />} />
        <Step title="Assess" icon={<CheckCircleOutlined />} />
      </Steps>

      {/* Upload Card */}
      {currentStep === 0 && (
        <Card
          style={{
            borderRadius: 12,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0',
            marginBottom: 24
          }}
        >
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <FileTextOutlined style={{ fontSize: 48, color: '#3b82f6', marginBottom: 20 }} />
            <Title level={4} style={{ color: '#1e293b', marginBottom: 8 }}>Upload Your Resume</Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
              Supported formats: PDF or DOCX
            </Text>
            
            <Upload 
              beforeUpload={handleFileUpload} 
              showUploadList={false} 
              accept=".pdf,.docx"
            >
              <Button 
                type="primary" 
                size="large"
                icon={<UploadOutlined />}
                style={{
                  background: '#3b82f6',
                  border: 'none',
                  borderRadius: 8,
                  padding: '12px 32px',
                  height: 'auto',
                  fontSize: 16,
                  fontWeight: 600
                }}
              >
                Choose File
              </Button>
            </Upload>
          </div>
        </Card>
      )}

      {/* Information Verification Card */}
      {uploadProcessed && (
        <Card
          title={
            <Space>
              <UserOutlined style={{ color: '#10b981' }} />
              <span>Verify Your Information</span>
            </Space>
          }
          style={{
            borderRadius: 12,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0'
          }}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {['name', 'email', 'phone'].map(field => (
              <div key={field}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                  {field === 'name' && <UserOutlined style={{ color: '#3b82f6', marginRight: 8 }} />}
                  {field === 'email' && <MailOutlined style={{ color: '#3b82f6', marginRight: 8 }} />}
                  {field === 'phone' && <PhoneOutlined style={{ color: '#3b82f6', marginRight: 8 }} />}
                  <Text strong style={{ textTransform: 'capitalize', color: '#374151' }}>
                    {field}
                    {missingFields.includes(field) && (
                      <Tag color="red" style={{ marginLeft: 8, fontSize: 10, borderRadius: 4 }}>
                        Required
                      </Tag>
                    )}
                  </Text>
                </div>
                <Input
                  placeholder={`Enter your ${field}`}
                  value={candidateData[field]}
                  onChange={e => handleFieldChange(field, e.target.value)}
                  maxLength={field === 'phone' ? 10 : undefined}
                  status={missingFields.includes(field) ? 'error' : ''}
                  style={{
                    borderRadius: 6
                  }}
                />
                {missingFields.includes(field) && (
                  <Text type="danger" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
                    {field === 'phone' ? 'Phone number is required' :
                     field === 'email' ? 'Email address is required' : 'Full name is required'}
                  </Text>
                )}
              </div>
            ))}
            
            <Button 
              type="primary" 
              size="large"
              icon={<RocketOutlined />}
              onClick={validateAndStart}
              style={{
                background: '#10b981',
                border: 'none',
                borderRadius: 8,
                padding: '12px 32px',
                height: 'auto',
                width: '100%',
                marginTop: 16,
                fontSize: 16,
                fontWeight: 600
              }}
            >
              Start Assessment
            </Button>
          </Space>
        </Card>
      )}

      {/* Welcome Back Modal - Shows when unfinished interview is found */}
      <Modal
        title="Continue Your Assessment?"
        open={showWelcomeBack}
        onCancel={() => setShowWelcomeBack(false)}
        footer={[
          <Button 
            key="new" 
            onClick={startNewInterview}
            style={{ borderRadius: 6 }}
          >
            Start New Assessment
          </Button>,
          <Button 
            key="resume" 
            type="primary" 
            onClick={resumeInterview}
            style={{
              background: '#3b82f6',
              border: 'none',
              borderRadius: 6
            }}
          >
            Continue Previous
          </Button>,
        ]}
        style={{ borderRadius: 12 }}
      >
        <Alert
          message="Unfinished Assessment Found"
          description={`We found an incomplete assessment from your previous session. You have completed ${unfinishedCandidate?.responses?.length || 0} questions. Would you like to continue where you left off or start a new assessment?`}
          type="info"
          showIcon
          style={{ borderRadius: 8 }}
        />
        
        {unfinishedCandidate && (
          <div style={{ marginTop: 16, padding: 12, background: '#f8fafc', borderRadius: 6 }}>
            <Text strong>Progress: </Text>
            <Text>{unfinishedCandidate.responses.length} questions answered</Text>
            <br />
            <Text strong>Last Updated: </Text>
            <Text>{new Date(unfinishedCandidate.lastUpdated).toLocaleString()}</Text>
          </div>
        )}
      </Modal>

      {/* Help Text */}
      {!uploadProcessed && (
        <Card 
          style={{ 
            borderRadius: 8,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            marginTop: 16
          }}
        >
          <Space direction="vertical" size="small">
            <Text strong style={{ color: '#374151' }}>📋 Tips for best results:</Text>
            <Text type="secondary" style={{ fontSize: 14, lineHeight: 1.6 }}>
              • Ensure your resume includes up-to-date contact information<br/>
              • PDF files typically provide more accurate data extraction<br/>
              • Verify all extracted information before starting the assessment<br/>
              • All fields are required to begin the evaluation process
            </Text>
          </Space>
        </Card>
      )}
    </div>
  );
};

export default ResumeUpload;
