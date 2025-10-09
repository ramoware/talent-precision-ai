// src/components/IntervieweeTab.jsx
import React, { useState } from 'react';
import { Tabs, Upload, Button, message, Input } from 'antd';
import ResumeUpload from './ResumeUpload';
import InterviewChat from './InterviewChat';

const { TabPane } = Tabs;

const IntervieweeTab = () => {
  const [candidateInfo, setCandidateInfo] = useState(null);

  return (
    <Tabs defaultActiveKey="1">
      <TabPane tab="Interviewee" key="1">
        {!candidateInfo ? (
          <ResumeUpload
            onComplete={(info) => setCandidateInfo(info)}
          />
        ) : (
          <InterviewChat
            candidateInfo={candidateInfo}
            onComplete={(results) => {
              console.log('Interview finished:', results);
              message.success(
                `Interview completed! Total Score: ${results.percentScore}/100. Summary: ${results.feedback}`
              );
            }}
          />
        )}
      </TabPane>
    </Tabs>
  );
};

export default IntervieweeTab;
