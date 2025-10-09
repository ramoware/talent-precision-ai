import React, { useState } from 'react';
import { Tabs, Table, Input, Button, Modal, Progress, Card, Typography, message, Popconfirm, Tag, Space, Statistic, Row, Col, Avatar, Badge, Form, Select, Checkbox, DatePicker } from 'antd';
import { 
  UserOutlined, 
  FileDoneOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  SearchOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  StarOutlined,
  MailOutlined,
  PhoneOutlined,
  CrownOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ScheduleOutlined,
  BarChartOutlined,
  PlayCircleOutlined,
  SettingOutlined,
  DownloadOutlined,
  FilterOutlined,
  PlusOutlined,
  RocketOutlined,
  BulbOutlined,
  CodeOutlined,
  GlobalOutlined,
  SafetyCertificateOutlined,
  BankOutlined,
  ExperimentOutlined,
  SaveOutlined,
  CloseOutlined
} from '@ant-design/icons';
import ResumeUpload from './components/ResumeUpload.jsx';
import InterviewChat from './components/InterviewChat.jsx';
import useInterviewStore from './redux/InterviewStore.js';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const App = () => {
  const candidates = useInterviewStore(state => state.candidates);
  const updateCandidate = useInterviewStore(state => state.updateCandidate);
  const removeCandidate = useInterviewStore(state => state.removeCandidate);
  const addCandidate = useInterviewStore(state => state.addCandidate);

  const [candidateInfo, setCandidateInfo] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [activeTab, setActiveTab] = useState('1');
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  
  // New state for modal visibility
  const [isAddCandidateVisible, setIsAddCandidateVisible] = useState(false);
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  
  // Form references
  const [addCandidateForm] = Form.useForm();
  const [filterForm] = Form.useForm();
  const [settingsForm] = Form.useForm();

  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [scoreRange, setScoreRange] = useState([0, 100]);
  const [dateRange, setDateRange] = useState(null);

  // Luxury Dark Green color palette
  const colors = {
    primaryDark: '#0f2e1f',
    primaryGreen: '#1a472a',
    secondaryGreen: '#2e8b57',
    accentGreen: '#3cb371',
    lightGreen: '#90ee90',
    paleGreen: '#f0fff0',
    gold: '#d4af37',
    lightGold: '#f5e8b0',
    paleGold: '#faf3e0',
    charcoal: '#2f4f4f',
    darkGray: '#556b2f',
    success: '#228b22',
    warning: '#daa520',
    error: '#b22222',
    textDark: '#1a1a1a',
    textLight: '#2f4f4f',
    background: '#f8f8f8',
    white: '#ffffff'
  };

  // Enhanced candidate list with better fallbacks
  const candidateList = Object.values(candidates || {})
    .map(c => {
      const candidateData = c?.info || c || {};
      return { 
        ...candidateData,
        ...c,
        name: candidateData.name || 'New Candidate',
        email: candidateData.email || 'email@example.com',
        phone: candidateData.phone || '+1 (555) 000-0000',
        position: candidateData.position || 'Software Engineer',
        experience: candidateData.experience || 'Not specified',
        key: candidateData.email || `candidate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: candidateData.createdAt || new Date().toISOString()
      };
    })
    .filter(c => {
      const name = c.name || '';
      const email = c.email || '';
      const phone = c.phone || '';
      const position = c.position || '';
      
      const searchLower = searchText.toLowerCase();
      return name.toLowerCase().includes(searchLower) || 
             email.toLowerCase().includes(searchLower) || 
             phone.includes(searchText) ||
             position.toLowerCase().includes(searchLower);
    });

  // Enhanced statistics
  const completedInterviews = candidateList.filter(c => c.interviewOver).length;
  const pendingInterviews = candidateList.filter(c => !c.interviewOver).length;
  const averageScore = candidateList.length > 0 
    ? Math.round(candidateList.reduce((acc, c) => acc + (c.score || 0), 0) / candidateList.length)
    : 0;

  const topCandidate = candidateList.length > 0 
    ? candidateList.reduce((prev, current) => (prev.score > current.score) ? prev : current)
    : null;

  // Enhanced score color system with green/gold theme
  const getScoreColor = score => {
    if (score >= 90) return colors.success;
    if (score >= 80) return colors.secondaryGreen;
    if (score >= 70) return colors.accentGreen;
    if (score >= 60) return colors.gold;
    if (score >= 50) return colors.warning;
    return colors.error;
  };

  const getScoreLevel = score => {
    if (score >= 90) return { level: 'Excellent', color: colors.success, icon: '🏆' };
    if (score >= 80) return { level: 'Very Good', color: colors.secondaryGreen, icon: '⭐' };
    if (score >= 70) return { level: 'Good', color: colors.accentGreen, icon: '✓' };
    if (score >= 60) return { level: 'Average', color: colors.gold, icon: '↔' };
    if (score >= 50) return { level: 'Needs Work', color: colors.warning, icon: '⚡' };
    return { level: 'Poor', color: colors.error, icon: '⚠' };
  };

  const getStatusConfig = (candidate) => {
    if (!candidate.interviewOver) {
      return { color: 'blue', icon: <ClockCircleOutlined />, text: 'Interview in Progress', badge: 'processing' };
    }
    const scoreLevel = getScoreLevel(candidate.score);
    if (candidate.score >= 85) {
      return { color: 'green', icon: <CrownOutlined />, text: 'Top Candidate', badge: 'success' };
    }
    if (candidate.score >= 70) {
      return { color: 'orange', icon: <StarOutlined />, text: 'Qualified', badge: 'warning' };
    }
    return { color: 'red', icon: <ScheduleOutlined />, text: 'Needs Review', badge: 'error' };
  };

  // Enhanced delete function
  const handleDelete = (record) => {
    try {
      const candidateKey = Object.keys(candidates || {}).find(key => {
        const candidate = candidates[key];
        const candidateData = candidate?.info || candidate || {};
        
        if (candidateData.email && candidateData.email === record.email) {
          return true;
        }
        if (candidateData.name && candidateData.name === record.name) {
          return true;
        }
        
        return false;
      });

      if (candidateKey) {
        removeCandidate(candidateKey);
        message.success('Candidate record deleted successfully!');
        
        if (selectedCandidate && selectedCandidate.key === record.key) {
          setSelectedCandidate(null);
        }
      } else {
        message.error('Candidate not found in database');
      }
    } catch (error) {
      console.error('Error deleting candidate:', error);
      message.error('Failed to delete candidate record');
    }
  };

  // Add Candidate Functionality
  const handleAddCandidate = async (values) => {
    try {
      const newCandidate = {
        info: values,
        name: values.name,
        email: values.email,
        phone: values.phone,
        position: values.position,
        experience: values.experience,
        interviewOver: false,
        score: 0,
        summary: 'New candidate - interview pending',
        responses: [],
        createdAt: new Date().toISOString()
      };

      // Generate a unique key for the new candidate
      const key = `candidate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Use the addCandidate function from the store
      if (addCandidate) {
        addCandidate(key, newCandidate);
      } else {
        // Fallback to updateCandidate if addCandidate doesn't exist
        updateCandidate(key, newCandidate);
      }
      
      message.success('Candidate added successfully!');
      setIsAddCandidateVisible(false);
      addCandidateForm.resetFields();
    } catch (error) {
      console.error('Error adding candidate:', error);
      message.error('Failed to add candidate');
    }
  };

  // Export Data Functionality
  const handleExportData = (format) => {
    try {
      let dataToExport;
      
      if (format === 'csv') {
        // Convert to CSV
        const headers = ['Name', 'Email', 'Phone', 'Position', 'Experience', 'Score', 'Status', 'Summary'];
        const csvData = candidateList.map(candidate => [
          candidate.name,
          candidate.email,
          candidate.phone,
          candidate.position,
          candidate.experience,
          candidate.score,
          getStatusConfig(candidate).text,
          candidate.summary
        ]);
        
        const csvContent = [headers, ...csvData]
          .map(row => row.map(field => `"${field}"`).join(','))
          .join('\n');
        
        dataToExport = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
      } else {
        // JSON format
        dataToExport = 'data:application/json;charset=utf-8,' + 
          encodeURIComponent(JSON.stringify(candidateList, null, 2));
      }
      
      // Create download link
      const link = document.createElement('a');
      link.setAttribute('href', dataToExport);
      link.setAttribute('download', `candidates_export.${format}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      message.success(`Data exported successfully as ${format.toUpperCase()}!`);
      setIsExportModalVisible(false);
    } catch (error) {
      console.error('Error exporting data:', error);
      message.error('Failed to export data');
    }
  };

  // Filter Functionality
  const handleApplyFilters = (values) => {
    try {
      setStatusFilter(values.status || 'all');
      setScoreRange(values.scoreRange || [0, 100]);
      setDateRange(values.dateRange || null);
      message.success('Filters applied successfully!');
      setIsFilterModalVisible(false);
    } catch (error) {
      console.error('Error applying filters:', error);
      message.error('Failed to apply filters');
    }
  };

  const handleClearFilters = () => {
    filterForm.resetFields();
    setStatusFilter('all');
    setScoreRange([0, 100]);
    setDateRange(null);
    message.success('Filters cleared!');
    setIsFilterModalVisible(false);
  };

  // Settings Functionality
  const handleSaveSettings = (values) => {
    try {
      // Save settings to localStorage or your preferred storage
      localStorage.setItem('interviewAssistantSettings', JSON.stringify(values));
      message.success('Settings saved successfully!');
      setIsSettingsModalVisible(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      message.error('Failed to save settings');
    }
  };

  // Apply filters to candidate list
  const filteredCandidateList = candidateList.filter(candidate => {
    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'completed' && !candidate.interviewOver) return false;
      if (statusFilter === 'pending' && candidate.interviewOver) return false;
      if (statusFilter === 'top' && candidate.score < 85) return false;
    }
    
    // Score range filter
    if (candidate.score < scoreRange[0] || candidate.score > scoreRange[1]) {
      return false;
    }
    
    // Date range filter
    if (dateRange && candidate.createdAt) {
      const candidateDate = new Date(candidate.createdAt);
      const startDate = new Date(dateRange[0]);
      const endDate = new Date(dateRange[1]);
      
      if (candidateDate < startDate || candidateDate > endDate) {
        return false;
      }
    }
    
    return true;
  });

  // Enhanced columns with luxury green styling
  const columns = [
    { 
      title: 'Candidate Profile', 
      dataIndex: 'name', 
      key: 'name', 
      sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
      render: (name, record) => {
        const status = getStatusConfig(record);
        const safeName = name || 'New Candidate';
        const safeEmail = record.email || 'email@example.com';
        const position = record.position || 'Software Engineer';
        
        return (
          <Space align="start" size="middle">
            <Badge status={status.badge} count={!record.interviewOver ? <ClockCircleOutlined style={{ color: colors.secondaryGreen, fontSize: 12 }} /> : 0}>
              <Avatar 
                size={48}
                style={{ 
                  background: `linear-gradient(135deg, ${colors.primaryGreen} 0%, ${colors.secondaryGreen} 100%)`,
                  fontWeight: 'bold',
                  color: 'white',
                  boxShadow: `0 4px 12px ${colors.primaryGreen}40`,
                  border: `2px solid ${colors.gold}`
                }}
              >
                {safeName.charAt(0).toUpperCase()}
              </Avatar>
            </Badge>
            <div>
              <div style={{ fontWeight: 700, color: colors.textDark, fontSize: 15 }}>{safeName}</div>
              <div style={{ fontSize: 13, color: colors.textLight, marginBottom: 4 }}>{position}</div>
              <div style={{ fontSize: 12, color: colors.darkGray }}>
                <MailOutlined style={{ marginRight: 4 }} />
                {safeEmail}
              </div>
            </div>
          </Space>
        );
      }
    },
    { 
      title: 'Contact Info', 
      dataIndex: 'phone', 
      key: 'phone',
      render: (phone, record) => (
        <Space direction="vertical" size="small">
          <Space>
            <PhoneOutlined style={{ color: colors.primaryGreen, fontSize: 12 }} />
            <Text style={{ fontSize: 13, color: colors.textLight }}>{phone || '+1 (555) 000-0000'}</Text>
          </Space>
          {record.experience && (
            <div style={{ fontSize: 12, color: colors.textLight }}>
              <BulbOutlined style={{ marginRight: 4 }} />
              {record.experience} years
            </div>
          )}
        </Space>
      )
    },
    {
      title: 'Interview Status',
      key: 'status',
      sorter: (a, b) => {
        const statusA = getStatusConfig(a).text;
        const statusB = getStatusConfig(b).text;
        return statusA.localeCompare(statusB);
      },
      render: (_, record) => {
        const status = getStatusConfig(record);
        const scoreLevel = getScoreLevel(record.score);
        return (
          <Space direction="vertical" size="small">
            <Tag 
              color={status.color} 
              icon={status.icon}
              style={{ 
                borderRadius: 16,
                padding: '6px 12px',
                border: 'none',
                fontWeight: 600,
                fontSize: 12,
                margin: 0
              }}
            >
              {status.text}
            </Tag>
            {record.interviewOver && (
              <div style={{ fontSize: 11, color: scoreLevel.color, fontWeight: 600 }}>
                {scoreLevel.icon} {scoreLevel.level}
              </div>
            )}
          </Space>
        );
      }
    },
    {
      title: 'Performance Score',
      dataIndex: 'score',
      key: 'score',
      sorter: (a, b) => (a.score || 0) - (b.score || 0),
      render: (score, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <Progress 
              type="circle" 
              percent={score || 0} 
              size={50}
              strokeColor={getScoreColor(score)}
              strokeWidth={10}
              format={percent => (
                <span style={{ fontSize: 11, fontWeight: 'bold', color: getScoreColor(score) }}>
                  {percent}%
                </span>
              )}
            />
            {record.interviewOver && score >= 85 && (
              <div style={{
                position: 'absolute',
                top: -2,
                right: -2,
                background: colors.gold,
                borderRadius: '50%',
                width: 16,
                height: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <StarOutlined style={{ fontSize: 8, color: colors.primaryDark }} />
              </div>
            )}
          </div>
          <div>
            <div style={{ fontSize: 12, color: colors.textLight, fontWeight: 500 }}>
              Overall
            </div>
            <div style={{ fontSize: 11, color: getScoreColor(score), fontWeight: 700 }}>
              {getScoreLevel(score).level}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Interview Summary',
      dataIndex: 'summary',
      key: 'summary',
      render: (summary, record) => (
        <div>
          <Text 
            ellipsis={{ tooltip: summary || 'Interview in progress...' }} 
            style={{ 
              color: record.interviewOver ? colors.textLight : colors.darkGray, 
              maxWidth: 200,
              fontSize: 13,
              lineHeight: 1.4
            }}
          >
            {summary || (record.interviewOver ? 'No summary available' : 'Interview in progress...')}
          </Text>
          {record.interviewOver && record.responses && (
            <div style={{ fontSize: 11, color: colors.darkGray, marginTop: 4 }}>
              {record.responses.length} questions completed
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EyeOutlined />} 
            type="primary" 
            size="small"
            style={{
              background: `linear-gradient(135deg, ${colors.primaryGreen} 0%, ${colors.secondaryGreen} 100%)`,
              border: 'none',
              borderRadius: 8,
              boxShadow: `0 2px 6px ${colors.primaryGreen}40`,
              fontWeight: 600,
              fontSize: 12
            }}
            onClick={() => setSelectedCandidate(record)}
          >
            Details
          </Button>
          <Popconfirm
            title={
              <div>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>Delete Candidate Record</div>
                <div style={{ color: colors.textLight }}>This will permanently delete all interview data for {record.name}. This action cannot be undone.</div>
              </div>
            }
            description="Are you sure you want to delete this candidate?"
            onConfirm={() => handleDelete(record)}
            okText="Delete"
            cancelText="Cancel"
            okType="danger"
            icon={<DeleteOutlined style={{ color: colors.error }} />}
          >
            <Button 
              icon={<DeleteOutlined />} 
              type="text" 
              danger 
              size="small"
              style={{ 
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 12
              }}
            />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Quick actions menu with luxury green theme
  const quickActions = [
    { 
      icon: <PlusOutlined />, 
      label: 'Add Candidate', 
      color: colors.success,
      onClick: () => setIsAddCandidateVisible(true)
    },
    { 
      icon: <DownloadOutlined />, 
      label: 'Export Data', 
      color: colors.primaryGreen,
      onClick: () => setIsExportModalVisible(true)
    },
    { 
      icon: <FilterOutlined />, 
      label: 'Filter View', 
      color: colors.gold,
      onClick: () => setIsFilterModalVisible(true)
    },
    { 
      icon: <SettingOutlined />, 
      label: 'Settings', 
      color: colors.textLight,
      onClick: () => setIsSettingsModalVisible(true)
    }
  ];

  // Use filtered list for display
  const displayCandidateList = filteredCandidateList;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: `linear-gradient(135deg, ${colors.background} 0%, ${colors.paleGreen}20 50%, ${colors.white} 100%)`,
      backgroundAttachment: 'fixed'
    }}>
      {/* Enhanced Header with Luxury Green Theme */}
      <div style={{
        background: `linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.primaryGreen} 100%)`,
        padding: '40px 24px 80px 24px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        borderBottom: `4px solid ${colors.gold}`
      }}>
        {/* Animated background elements */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          background: `
            radial-gradient(circle at 20% 80%, ${colors.secondaryGreen}20 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, ${colors.gold}15 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)
          `
        }}></div>
        
        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
          {/* Header Content */}
          <div style={{ marginBottom: 48, textAlign: 'center' }}>
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              padding: '12px 24px',
              borderRadius: 50,
              display: 'inline-block',
              marginBottom: 20,
              border: `1px solid ${colors.gold}40`
            }}>
              <SafetyCertificateOutlined style={{ marginRight: 8, color: colors.lightGold }} />
              <Text style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>
                Premium Interview Intelligence Platform
              </Text>
            </div>
            
            <Title level={1} style={{ 
              color: 'white', 
              margin: 0, 
              fontSize: '3.5rem', 
              fontWeight: 800,
              background: 'linear-gradient(135deg, #fff 0%, #f5e8b0 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              lineHeight: 1.2
            }}>
              TalentPrecision AI
            </Title>
            <Text style={{ 
              color: 'rgba(255,255,255,0.9)', 
              fontSize: 18,
              fontWeight: 300,
              maxWidth: 600,
              margin: '20px auto 0',
              lineHeight: 1.6,
              display: 'block'
            }}>
              Enterprise-grade candidate assessment with AI-powered precision and executive insights
            </Text>

            {/* Quick Stats */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 32, flexWrap: 'wrap' }}>
              {[
                { value: displayCandidateList.length, label: 'Candidates' },
                { value: completedInterviews, label: 'Completed' },
                { value: averageScore, label: 'Avg Score', suffix: '%' }
              ].map((stat, idx) => (
                <div key={idx} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: colors.lightGold }}>
                    {stat.value}{stat.suffix || ''}
                  </div>
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Metrics Cards */}
          <Row gutter={[20, 20]} style={{ marginTop: 8 }}>
            {[
                { 
                  icon: <TeamOutlined />, 
                  value: displayCandidateList.length, 
                  label: 'Total Candidates',
                  color: colors.success,
                  description: 'Active candidates in system'
                },
                { 
                  icon: <CheckCircleOutlined />, 
                  value: completedInterviews, 
                  label: 'Interviews Completed',
                  color: colors.secondaryGreen,
                  description: 'Finished assessments'
                },
                { 
                  icon: <ScheduleOutlined />, 
                  value: pendingInterviews, 
                  label: 'In Progress',
                  color: colors.gold,
                  description: 'Ongoing interviews'
                },
                { 
                  icon: <BarChartOutlined />, 
                  value: averageScore, 
                  label: 'Average Score',
                  suffix: '%',
                  color: colors.accentGreen,
                  description: 'Overall performance'
                }
              ].map((metric, index) => (
                <Col xs={24} sm={12} md={6} key={index}>
                  <div style={{
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(15px)',
                    border: `1px solid ${colors.gold}30`,
                    borderRadius: 20,
                    padding: '28px 20px',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    height: '100%'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.border = `1px solid ${colors.gold}60`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.border = `1px solid ${colors.gold}30`;
                  }}
                  >
                    <div style={{
                      width: 60,
                      height: 60,
                      background: `linear-gradient(135deg, ${metric.color}40, ${metric.color}20)`,
                      borderRadius: 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 20px',
                      border: `1px solid ${metric.color}30`
                    }}>
                      {React.cloneElement(metric.icon, { 
                        style: { 
                          fontSize: 24, 
                          color: colors.lightGold,
                          fontWeight: 'bold'
                        } 
                      })}
                    </div>
                    <div style={{
                      fontSize: 36,
                      fontWeight: 800,
                      color: 'white',
                      lineHeight: 1.2,
                      marginBottom: 8
                    }}>
                      {metric.value}{metric.suffix || ''}
                    </div>
                    <div style={{
                      fontSize: 16,
                      color: 'white',
                      fontWeight: 600,
                      marginBottom: 8
                    }}>
                      {metric.label}
                    </div>
                    <div style={{
                      fontSize: 12,
                      color: 'rgba(255,255,255,0.8)',
                      fontWeight: 400
                    }}>
                      {metric.description}
                    </div>
                  </div>
                </Col>
              ))}
          </Row>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ 
        maxWidth: 1200, 
        margin: '-60px auto 0 auto', 
        padding: '0 24px 40px 24px',
        position: 'relative'
      }}>
        
        {/* Quick Actions Bar */}
        <Card style={{
          background: colors.white,
          borderRadius: 20,
          boxShadow: `0 8px 32px ${colors.primaryGreen}10`,
          border: `1px solid ${colors.lightGreen}`,
          marginBottom: 24,
          padding: '16px 0'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px' }}>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  icon={action.icon}
                  onClick={action.onClick}
                  style={{
                    background: `${action.color}15`,
                    border: `1px solid ${action.color}30`,
                    color: action.color,
                    borderRadius: 12,
                    fontWeight: 600,
                    height: 40
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${action.color}25`;
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `${action.color}15`;
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {action.label}
                </Button>
              ))}
            </div>
            <Button 
              type="text" 
              icon={<BulbOutlined />}
              onClick={() => setIsHelpVisible(true)}
              style={{ color: colors.textLight, fontWeight: 600 }}
            >
              Help & Tips
            </Button>
          </div>
        </Card>

        {/* Main Content Card */}
        <Card style={{
          background: colors.white,
          borderRadius: 24,
          boxShadow: `0 20px 60px ${colors.primaryGreen}08`,
          border: `1px solid ${colors.lightGreen}`,
          overflow: 'hidden',
          backdropFilter: 'blur(10px)'
        }}>
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            tabBarStyle={{
              padding: '0 32px',
              background: `linear-gradient(135deg, ${colors.paleGreen} 0%, ${colors.background} 100%)`,
              borderBottom: `1px solid ${colors.lightGreen}`,
              margin: 0
            }}
            items={[
              {
                key: '1',
                label: (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '20px 32px',
                    borderRadius: '16px 16px 0 0',
                    background: activeTab === '1' ? colors.white : 'transparent',
                    margin: activeTab === '1' ? '0 0 -1px 0' : '0',
                    border: activeTab === '1' ? `1px solid ${colors.lightGreen}` : 'none',
                    borderBottom: activeTab === '1' ? `1px solid ${colors.white}` : 'none',
                    fontWeight: 700,
                    color: activeTab === '1' ? colors.textDark : colors.textLight,
                    transition: 'all 0.3s ease',
                    fontSize: 15
                  }}>
                    <UserOutlined style={{ marginRight: 12, fontSize: 18, color: colors.primaryGreen }} />
                    Candidate Portal
                    {!candidateInfo && (
                      <Badge count="New" style={{ 
                        marginLeft: 8,
                        background: `linear-gradient(135deg, ${colors.primaryGreen} 0%, ${colors.secondaryGreen} 100%)`
                      }} />
                    )}
                  </div>
                ),
                children: (
                  <div style={{ minHeight: 500 }}>
                    {!candidateInfo ? (
                      <ResumeUpload onComplete={setCandidateInfo} />
                    ) : (
                      <InterviewChat 
                        candidateInfo={candidateInfo} 
                        onComplete={() => {
                          message.success('🎉 Interview completed! Check the dashboard for detailed results.');
                          setCandidateInfo(null);
                        }} 
                      />
                    )}
                  </div>
                )
              },
              {
                key: '2',
                label: (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '20px 32px',
                    borderRadius: '16px 16px 0 0',
                    background: activeTab === '2' ? colors.white : 'transparent',
                    margin: activeTab === '2' ? '0 0 -1px 0' : '0',
                    border: activeTab === '2' ? `1px solid ${colors.lightGreen}` : 'none',
                    borderBottom: activeTab === '2' ? `1px solid ${colors.white}` : 'none',
                    fontWeight: 700,
                    color: activeTab === '2' ? colors.textDark : colors.textLight,
                    transition: 'all 0.3s ease',
                    fontSize: 15
                  }}>
                    <BarChartOutlined style={{ marginRight: 12, fontSize: 18, color: colors.primaryGreen }} />
                    Analytics Dashboard
                    <Badge count={displayCandidateList.length} style={{ 
                      marginLeft: 8,
                      background: `linear-gradient(135deg, ${colors.primaryGreen} 0%, ${colors.secondaryGreen} 100%)`
                    }} />
                  </div>
                ),
                children: (
                  <div style={{ padding: '8px 0' }}>
                    {/* Top Candidate Banner */}
                    {topCandidate && topCandidate.score >= 85 && (
                      <div style={{
                        background: `linear-gradient(135deg, ${colors.paleGreen} 0%, ${colors.lightGreen}30 100%)`,
                        border: `1px solid ${colors.gold}`,
                        borderRadius: 20,
                        padding: '24px 28px',
                        marginBottom: 32,
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          position: 'absolute',
                          right: 20,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          opacity: 0.1
                        }}>
                          <TrophyOutlined style={{ fontSize: 100, color: colors.primaryGreen }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 20, position: 'relative' }}>
                          <div style={{
                            width: 60,
                            height: 60,
                            background: `linear-gradient(135deg, ${colors.primaryGreen} 0%, ${colors.secondaryGreen} 100%)`,
                            borderRadius: 16,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: `2px solid ${colors.gold}`
                          }}>
                            <TrophyOutlined style={{ fontSize: 28, color: colors.lightGold }} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: colors.primaryDark, fontSize: 18, marginBottom: 6 }}>
                              🏆 Elite Performer
                            </div>
                            <div style={{ color: colors.primaryGreen, fontWeight: 600, fontSize: 14 }}>
                              <strong>{topCandidate.name}</strong> scored {topCandidate.score}% - Executive recommendation
                            </div>
                            <div style={{ fontSize: 13, color: colors.secondaryGreen, marginTop: 4 }}>
                              {getScoreLevel(topCandidate.score).level} • {topCandidate.responses?.length || 0} questions completed
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Enhanced Search Section */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      marginBottom: 32,
                      flexWrap: 'wrap',
                      gap: 20,
                      background: `linear-gradient(135deg, ${colors.paleGreen} 0%, ${colors.background} 100%)`,
                      padding: 24,
                      borderRadius: 20,
                      border: `1px solid ${colors.lightGreen}`
                    }}>
                      <div style={{ flex: 1, minWidth: 300 }}>
                        <Input.Search
                          placeholder="Search candidates by name, email, phone, or position..."
                          value={searchText}
                          onChange={e => setSearchText(e.target.value)}
                          style={{ 
                            borderRadius: 12,
                          }}
                          allowClear
                          enterButton={
                            <Button 
                              type="primary" 
                              icon={<SearchOutlined />}
                              style={{
                                background: `linear-gradient(135deg, ${colors.primaryGreen} 0%, ${colors.secondaryGreen} 100%)`,
                                border: 'none',
                                borderRadius: '0 12px 12px 0',
                                height: 44,
                                fontWeight: 600
                              }}
                            >
                              Search
                            </Button>
                          }
                          size="large"
                        />
                      </div>
                      <div style={{
                        background: colors.white,
                        padding: '12px 20px',
                        borderRadius: 12,
                        border: `1px solid ${colors.lightGreen}`,
                        minWidth: 180
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <TeamOutlined style={{ color: colors.primaryGreen }} />
                          <Text style={{ fontWeight: 700, color: colors.textDark, fontSize: 15 }}>
                            {displayCandidateList.length} candidate{displayCandidateList.length !== 1 ? 's' : ''}
                          </Text>
                        </div>
                        <div style={{ fontSize: 12, color: colors.textLight, marginTop: 2 }}>
                          {completedInterviews} completed • {pendingInterviews} in progress
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Table */}
                    <Table
                      dataSource={displayCandidateList}
                      columns={columns}
                      rowKey="key"
                      pagination={{ 
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => 
                          `Showing ${range[0]}-${range[1]} of ${total} candidates`,
                        style: { margin: '24px 0' }
                      }}
                      style={{ 
                        borderRadius: 16,
                        overflow: 'hidden',
                        border: `1px solid ${colors.lightGreen}`
                      }}
                      onRow={(record) => ({
                        style: {
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          background: colors.white
                        },
                        onMouseEnter: (e) => {
                          e.currentTarget.style.background = colors.paleGreen;
                          e.currentTarget.style.transform = 'translateX(4px)';
                        },
                        onMouseLeave: (e) => {
                          e.currentTarget.style.background = colors.white;
                          e.currentTarget.style.transform = 'translateX(0)';
                        }
                      })}
                      scroll={{ x: 1200 }}
                    />

                    {/* Enhanced Candidate Detail Modal */}
                    <Modal
                      title={
                        <Space size="middle">
                          <Avatar 
                            size={56}
                            style={{ 
                              background: `linear-gradient(135deg, ${colors.primaryGreen} 0%, ${colors.secondaryGreen} 100%)`,
                              fontWeight: 'bold',
                              color: 'white',
                              boxShadow: `0 4px 12px ${colors.primaryGreen}40`,
                              border: `2px solid ${colors.gold}`
                            }}
                          >
                            {selectedCandidate?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </Avatar>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 20, color: colors.textDark }}>
                              {selectedCandidate?.name || 'Unknown Candidate'}
                            </div>
                            <div style={{ fontSize: 14, color: colors.textLight }}>
                              {selectedCandidate?.position || 'Software Engineer'} • {selectedCandidate?.email || 'No email'}
                            </div>
                          </div>
                        </Space>
                      }
                      open={!!selectedCandidate}
                      onCancel={() => setSelectedCandidate(null)}
                      footer={[
                        <Button 
                          key="close" 
                          onClick={() => setSelectedCandidate(null)}
                          style={{
                            background: `linear-gradient(135deg, ${colors.textLight} 0%, ${colors.charcoal} 100%)`,
                            border: 'none',
                            borderRadius: 10,
                            color: 'white',
                            fontWeight: 600,
                            height: 40,
                            padding: '0 24px'
                          }}
                        >
                          Close Details
                        </Button>
                      ]}
                      width={1000}
                      styles={{
                        body: {
                          padding: '32px 0'
                        },
                        header: {
                          borderBottom: `1px solid ${colors.lightGreen}`,
                          marginBottom: 0,
                          padding: '32px'
                        }
                      }}
                    >
                      {selectedCandidate && (
                        <div style={{ marginTop: 8 }}>
                          <Row gutter={[32, 32]}>
                            <Col span={8}>
                              <Card 
                                size="small" 
                                title="Contact Information"
                                styles={{
                                  header: { 
                                    background: `linear-gradient(135deg, ${colors.paleGreen} 0%, ${colors.background} 100%)`,
                                    fontWeight: 600,
                                    color: colors.textDark
                                  }
                                }}
                                style={{ borderRadius: 12, border: `1px solid ${colors.lightGreen}` }}
                              >
                                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                  <div>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                                      <MailOutlined style={{ marginRight: 12, color: colors.primaryGreen, fontSize: 16 }} />
                                      <Text strong style={{ color: colors.textDark }}>Email Address</Text>
                                    </div>
                                    <div style={{ marginLeft: 28, color: colors.textLight, fontSize: 14 }}>
                                      {selectedCandidate.email || 'No email provided'}
                                    </div>
                                  </div>
                                  <div>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                                      <PhoneOutlined style={{ marginRight: 12, color: colors.primaryGreen, fontSize: 16 }} />
                                      <Text strong style={{ color: colors.textDark }}>Phone Number</Text>
                                    </div>
                                    <div style={{ marginLeft: 28, color: colors.textLight, fontSize: 14 }}>
                                      {selectedCandidate.phone || 'No phone provided'}
                                    </div>
                                  </div>
                                  {selectedCandidate.experience && (
                                    <div>
                                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                                        <BulbOutlined style={{ marginRight: 12, color: colors.primaryGreen, fontSize: 16 }} />
                                        <Text strong style={{ color: colors.textDark }}>Experience</Text>
                                      </div>
                                      <div style={{ marginLeft: 28, color: colors.textLight, fontSize: 14 }}>
                                        {selectedCandidate.experience} years
                                      </div>
                                    </div>
                                  )}
                                </Space>
                              </Card>
                            </Col>
                            <Col span={8}>
                              <Card 
                                size="small" 
                                title="Assessment Overview"
                                styles={{
                                  header: { 
                                    background: `linear-gradient(135deg, ${colors.paleGreen} 0%, ${colors.background} 100%)`,
                                    fontWeight: 600,
                                    color: colors.textDark
                                  }
                                }}
                                style={{ borderRadius: 12, border: `1px solid ${colors.lightGreen}` }}
                              >
                                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                                  <div style={{ position: 'relative', display: 'inline-block' }}>
                                    <Progress 
                                      type="circle" 
                                      percent={selectedCandidate.score || 0} 
                                      strokeColor={getScoreColor(selectedCandidate.score)}
                                      strokeWidth={12}
                                      size={140}
                                      format={percent => (
                                        <div>
                                          <div style={{ fontSize: 28, fontWeight: 'bold', color: getScoreColor(selectedCandidate.score) }}>
                                            {percent}%
                                          </div>
                                          <div style={{ fontSize: 12, color: colors.textLight, marginTop: 4, fontWeight: 600 }}>
                                            FINAL SCORE
                                          </div>
                                        </div>
                                      )}
                                    />
                                    {selectedCandidate.score >= 85 && (
                                      <div style={{
                                        position: 'absolute',
                                        top: -4,
                                        right: -4,
                                        background: colors.gold,
                                        borderRadius: '50%',
                                        width: 24,
                                        height: 24,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: `0 2px 8px ${colors.gold}40`
                                      }}>
                                        <CrownOutlined style={{ fontSize: 12, color: colors.primaryDark }} />
                                      </div>
                                    )}
                                  </div>
                                  <div style={{ marginTop: 16 }}>
                                    <Tag 
                                      color={getStatusConfig(selectedCandidate).color}
                                      style={{ 
                                        borderRadius: 16,
                                        padding: '6px 16px',
                                        border: 'none',
                                        fontWeight: 700,
                                        fontSize: 13
                                      }}
                                    >
                                      {getScoreLevel(selectedCandidate.score).icon} {getScoreLevel(selectedCandidate.score).level}
                                    </Tag>
                                  </div>
                                </div>
                              </Card>
                            </Col>
                            <Col span={8}>
                              <Card 
                                size="small" 
                                title="Evaluation Summary"
                                styles={{
                                  header: { 
                                    background: `linear-gradient(135deg, ${colors.paleGreen} 0%, ${colors.background} 100%)`,
                                    fontWeight: 600,
                                    color: colors.textDark
                                  }
                                }}
                                style={{ borderRadius: 12, border: `1px solid ${colors.lightGreen}` }}
                              >
                                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                  <div>
                                    <Text strong style={{ color: colors.textDark, display: 'block', marginBottom: 8 }}>Status:</Text>
                                    {(() => {
                                      const status = getStatusConfig(selectedCandidate);
                                      return (
                                        <Tag 
                                          color={status.color} 
                                          icon={status.icon}
                                          style={{ 
                                            borderRadius: 16,
                                            padding: '6px 16px',
                                            border: 'none',
                                            fontWeight: 600,
                                            fontSize: 13
                                          }}
                                        >
                                          {status.text}
                                        </Tag>
                                      );
                                    })()}
                                  </div>
                                  <div>
                                    <Text strong style={{ color: colors.textDark, display: 'block', marginBottom: 8 }}>Summary:</Text>
                                    <div style={{ 
                                      color: colors.textLight, 
                                      lineHeight: 1.6, 
                                      fontSize: 14,
                                      background: colors.paleGreen,
                                      padding: 12,
                                      borderRadius: 8
                                    }}>
                                      {selectedCandidate.summary || 'No detailed summary available for this candidate.'}
                                    </div>
                                  </div>
                                </Space>
                              </Card>
                            </Col>
                          </Row>

                          {/* Enhanced Interview Responses */}
                          <Card 
                            title="Detailed Interview Responses" 
                            style={{ marginTop: 32 }}
                            styles={{
                              header: { 
                                background: `linear-gradient(135deg, ${colors.paleGreen} 0%, ${colors.background} 100%)`,
                                fontWeight: 600,
                                color: colors.textDark,
                                fontSize: 16
                              }
                            }}
                          >
                            {selectedCandidate.responses?.length > 0 ? (
                              <div style={{ maxHeight: 500, overflow: 'auto', paddingRight: 8 }}>
                                {selectedCandidate.responses.map((r, idx) => (
                                  <Card 
                                    key={idx} 
                                    size="small" 
                                    style={{ 
                                      marginBottom: 20, 
                                      backgroundColor: colors.paleGreen,
                                      borderRadius: 12,
                                      borderLeft: `4px solid ${getScoreColor(r.score * 33.33)}`,
                                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                                    }}
                                    bodyStyle={{ padding: 20 }}
                                  >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{
                                          width: 32,
                                          height: 32,
                                          background: `linear-gradient(135deg, ${colors.primaryGreen} 0%, ${colors.secondaryGreen} 100%)`,
                                          borderRadius: 8,
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          color: 'white',
                                          fontWeight: 700,
                                          fontSize: 14
                                        }}>
                                          {idx + 1}
                                        </div>
                                        <Text strong style={{ color: colors.textDark, fontSize: 15 }}>Question {idx + 1}</Text>
                                      </div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <Tag color={
                                          r.difficulty === 'hard' ? 'red' : 
                                          r.difficulty === 'medium' ? 'orange' : 'green'
                                        } style={{ fontWeight: 600, borderRadius: 8 }}>
                                          {r.difficulty?.toUpperCase() || 'MEDIUM'}
                                        </Tag>
                                        <div style={{ 
                                          background: getScoreColor(r.score * 33.33),
                                          color: 'white',
                                          padding: '6px 12px',
                                          borderRadius: 12,
                                          fontSize: 13,
                                          fontWeight: 'bold',
                                          minWidth: 80,
                                          textAlign: 'center'
                                        }}>
                                          AI Score: {r.score}/3
                                        </div>
                                      </div>
                                    </div>
                                    <Text style={{ color: colors.textDark, display: 'block', marginBottom: 16, fontSize: 14, lineHeight: 1.6 }}>
                                      {r.question}
                                    </Text>
                                    <div style={{ background: colors.white, padding: 16, borderRadius: 8, marginBottom: 12, border: `1px solid ${colors.lightGreen}` }}>
                                      <Text strong style={{ color: colors.textDark, display: 'block', marginBottom: 8 }}>Candidate's Response:</Text>
                                      <Text style={{ color: colors.textLight, lineHeight: 1.6 }}>{r.answer}</Text>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <Text style={{ fontSize: 13, color: colors.textLight, fontStyle: 'italic' }}>
                                        <strong>AI Analysis:</strong> {r.reasoning}
                                      </Text>
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            ) : (
                              <div style={{ textAlign: 'center', padding: 40 }}>
                                <FileDoneOutlined style={{ fontSize: 48, color: colors.lightGreen, marginBottom: 16 }} />
                                <div style={{ color: colors.textLight, fontSize: 16, fontWeight: 500 }}>
                                  No interview responses available for this candidate.
                                </div>
                                <div style={{ color: colors.darkGray, fontSize: 14, marginTop: 8 }}>
                                  {selectedCandidate.interviewOver ? 'The interview has been completed but no responses were recorded.' : 'The interview is still in progress.'}
                                </div>
                              </div>
                            )}
                          </Card>
                        </div>
                      )}
                    </Modal>
                  </div>
                )
              }
            ]}
          />
        </Card>
      </div>

      {/* Add Candidate Modal */}
      <Modal
        title={
          <Space>
            <PlusOutlined style={{ color: colors.success, fontSize: 20 }} />
            <span style={{ fontWeight: 700, fontSize: 18, color: colors.textDark }}>Add New Candidate</span>
          </Space>
        }
        open={isAddCandidateVisible}
        onCancel={() => {
          setIsAddCandidateVisible(false);
          addCandidateForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={addCandidateForm}
          layout="vertical"
          onFinish={handleAddCandidate}
          style={{ marginTop: 20 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: true, message: 'Please enter candidate name' }]}
              >
                <Input placeholder="Enter candidate name" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email Address"
                rules={[
                  { required: true, message: 'Please enter email address' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input placeholder="Enter email address" size="large" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Phone Number"
              >
                <Input placeholder="Enter phone number" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="position"
                label="Position"
                rules={[{ required: true, message: 'Please enter position' }]}
              >
                <Input placeholder="Enter position" size="large" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="experience"
            label="Experience (Years)"
          >
            <Input placeholder="Enter years of experience" size="large" />
          </Form.Item>
          
          <Form.Item
            name="notes"
            label="Additional Notes"
          >
            <Input.TextArea placeholder="Enter any additional notes" rows={3} />
          </Form.Item>
          
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button 
                onClick={() => {
                  setIsAddCandidateVisible(false);
                  addCandidateForm.resetFields();
                }}
                size="large"
              >
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                style={{
                  background: `linear-gradient(135deg, ${colors.primaryGreen} 0%, ${colors.secondaryGreen} 100%)`,
                  border: 'none'
                }}
                size="large"
              >
                <PlusOutlined /> Add Candidate
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Export Data Modal */}
      <Modal
        title={
          <Space>
            <DownloadOutlined style={{ color: colors.primaryGreen, fontSize: 20 }} />
            <span style={{ fontWeight: 700, fontSize: 18, color: colors.textDark }}>Export Candidate Data</span>
          </Space>
        }
        open={isExportModalVisible}
        onCancel={() => setIsExportModalVisible(false)}
        footer={null}
        width={500}
      >
        <div style={{ marginTop: 20 }}>
          <Text style={{ color: colors.textLight, marginBottom: 16, display: 'block' }}>
            Choose the format to export candidate data. The export will include all candidate information and interview results.
          </Text>
          
          <Space direction="vertical" style={{ width: '100%', marginTop: 24 }} size="large">
            <Button 
              block
              size="large"
              icon={<FileDoneOutlined />}
              onClick={() => handleExportData('csv')}
              style={{
                background: `${colors.success}15`,
                border: `1px solid ${colors.success}30`,
                color: colors.success,
                fontWeight: 600,
                height: 50
              }}
            >
              Export as CSV (Excel Compatible)
            </Button>
            
            <Button 
              block
              size="large"
              icon={<CodeOutlined />}
              onClick={() => handleExportData('json')}
              style={{
                background: `${colors.primaryGreen}15`,
                border: `1px solid ${colors.primaryGreen}30`,
                color: colors.primaryGreen,
                fontWeight: 600,
                height: 50
              }}
            >
              Export as JSON (API Compatible)
            </Button>
          </Space>
          
          <div style={{ marginTop: 24, padding: 16, background: colors.paleGreen, borderRadius: 8 }}>
            <Text style={{ color: colors.textLight, fontSize: 12 }}>
              <strong>Note:</strong> The export will include {displayCandidateList.length} candidate records with their complete interview data and assessment scores.
            </Text>
          </div>
        </div>
      </Modal>

      {/* Filter View Modal */}
      <Modal
        title={
          <Space>
            <FilterOutlined style={{ color: colors.gold, fontSize: 20 }} />
            <span style={{ fontWeight: 700, fontSize: 18, color: colors.textDark }}>Filter Candidates</span>
          </Space>
        }
        open={isFilterModalVisible}
        onCancel={() => setIsFilterModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={filterForm}
          layout="vertical"
          onFinish={handleApplyFilters}
          style={{ marginTop: 20 }}
        >
          <Form.Item
            name="status"
            label="Interview Status"
          >
            <Select placeholder="Select status" size="large">
              <Option value="all">All Candidates</Option>
              <Option value="completed">Completed Interviews</Option>
              <Option value="pending">Pending Interviews</Option>
              <Option value="top">Top Candidates (85%+)</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="scoreRange"
            label="Score Range"
            initialValue={[0, 100]}
          >
            <Select placeholder="Select score range" size="large" mode="tags">
              <Option value="0-100">All Scores</Option>
              <Option value="85-100">Excellent (85-100%)</Option>
              <Option value="70-84">Good (70-84%)</Option>
              <Option value="50-69">Average (50-69%)</Option>
              <Option value="0-49">Below Average (0-49%)</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="dateRange"
            label="Date Added"
          >
            <RangePicker 
              style={{ width: '100%' }} 
              size="large"
              placeholder={['Start Date', 'End Date']}
            />
          </Form.Item>
          
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button 
                onClick={handleClearFilters}
                size="large"
              >
                <CloseOutlined /> Clear All
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                style={{
                  background: `linear-gradient(135deg, ${colors.primaryGreen} 0%, ${colors.secondaryGreen} 100%)`,
                  border: 'none'
                }}
                size="large"
              >
                <FilterOutlined /> Apply Filters
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Settings Modal */}
      <Modal
        title={
          <Space>
            <SettingOutlined style={{ color: colors.textLight, fontSize: 20 }} />
            <span style={{ fontWeight: 700, fontSize: 18, color: colors.textDark }}>Application Settings</span>
          </Space>
        }
        open={isSettingsModalVisible}
        onCancel={() => setIsSettingsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={settingsForm}
          layout="vertical"
          onFinish={handleSaveSettings}
          style={{ marginTop: 20 }}
        >
          <Form.Item
            name="autoSave"
            label="Auto-Save"
            valuePropName="checked"
            initialValue={true}
          >
            <Checkbox>Automatically save interview progress</Checkbox>
          </Form.Item>
          
          <Form.Item
            name="notifications"
            label="Notifications"
            valuePropName="checked"
            initialValue={true}
          >
            <Checkbox>Enable desktop notifications</Checkbox>
          </Form.Item>
          
          <Form.Item
            name="theme"
            label="Theme"
            initialValue="dark-green"
          >
            <Select size="large">
              <Option value="dark-green">Dark Green (Current)</Option>
              <Option value="light">Light Theme</Option>
              <Option value="dark">Dark Theme</Option>
              <Option value="blue">Blue Theme</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="resultsVisibility"
            label="Results Visibility"
            initialValue="immediate"
          >
            <Select size="large">
              <Option value="immediate">Show results immediately</Option>
              <Option value="review">Require manual review</Option>
              <Option value="scheduled">Show after 24 hours</Option>
            </Select>
          </Form.Item>
          
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button 
                onClick={() => setIsSettingsModalVisible(false)}
                size="large"
              >
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                style={{
                  background: `linear-gradient(135deg, ${colors.primaryGreen} 0%, ${colors.secondaryGreen} 100%)`,
                  border: 'none'
                }}
                size="large"
              >
                <SaveOutlined /> Save Settings
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Help Modal */}
      <Modal
        title={
          <Space>
            <BankOutlined style={{ color: colors.primaryGreen, fontSize: 20 }} />
            <span style={{ fontWeight: 700, fontSize: 18, color: colors.textDark }}>Interview Platform Guide</span>
          </Space>
        }
        open={isHelpVisible}
        onCancel={() => setIsHelpVisible(false)}
        footer={[
          <Button 
            key="close" 
            onClick={() => setIsHelpVisible(false)}
            style={{
              background: `linear-gradient(135deg, ${colors.primaryGreen} 0%, ${colors.secondaryGreen} 100%)`,
              border: 'none',
              borderRadius: 10,
              color: 'white',
              fontWeight: 600
            }}
          >
            Got It
          </Button>
        ]}
        width={600}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%', marginTop: 20 }}>
          {[
            { icon: '👤', title: 'Candidate Portal', desc: 'Start new interviews and manage candidate sessions' },
            { icon: '📊', title: 'Analytics Dashboard', desc: 'View all candidate data, scores, and performance metrics' },
            { icon: '🔍', title: 'Smart Search', desc: 'Search candidates by name, email, phone, or position' },
            { icon: '⭐', title: 'AI Scoring', desc: 'Automated evaluation with detailed feedback and insights' }
          ].map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ fontSize: 20 }}>{item.icon}</div>
              <div>
                <div style={{ fontWeight: 600, color: colors.textDark, marginBottom: 4 }}>{item.title}</div>
                <div style={{ color: colors.textLight, fontSize: 14 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </Space>
      </Modal>
    </div>
  );
};

export default App;