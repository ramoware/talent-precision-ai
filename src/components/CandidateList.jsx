// src/components/CandidateList.jsx
import React from 'react';
import { Button, List, message, Popconfirm } from 'antd';
import useInterviewStore from '../redux/InterviewStore';

const CandidateList = () => {
  const candidates = useInterviewStore(state => state.candidates);
  const removeCandidate = useInterviewStore(state => state.removeCandidate);

  const handleDelete = (email) => {
    removeCandidate(email); // remove from Zustand store
    // Also clear from localStorage if stored
    const saved = localStorage.getItem('candidateProgress');
    if (saved) {
      const progress = JSON.parse(saved);
      if (progress.email === email) localStorage.removeItem('candidateProgress');
    }
    message.success('Candidate deleted successfully!');
  };

  return (
    <List
      bordered
      dataSource={Object.values(candidates)}
      renderItem={(candidate) => (
        <List.Item
          actions={[
            <Popconfirm
              title="Are you sure to delete this candidate?"
              onConfirm={() => handleDelete(candidate.info.email)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="primary" danger>Delete</Button>
            </Popconfirm>
          ]}
        >
          {candidate.info.name} ({candidate.info.email})
        </List.Item>
      )}
    />
  );
};

export default CandidateList;
