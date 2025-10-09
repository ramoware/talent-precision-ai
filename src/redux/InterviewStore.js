// src/redux/InterviewStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useInterviewStore = create(
  persist(
    (set, get) => ({
      candidates: {},
      
      addCandidate: (email, candidateData) => {
        set(state => ({
          candidates: {
            ...state.candidates,
            [email]: {
              ...candidateData,
              lastUpdated: new Date().toISOString()
            }
          }
        }));
      },
      
      updateCandidate: (email, updates) => {
        set(state => ({
          candidates: {
            ...state.candidates,
            [email]: {
              ...state.candidates[email],
              ...updates,
              lastUpdated: new Date().toISOString()
            }
          }
        }));
      },
      
      removeCandidate: (email) => {
        set(state => {
          const newCandidates = { ...state.candidates };
          delete newCandidates[email];
          return { candidates: newCandidates };
        });
      },
      
      // Get unfinished interview for a candidate
      getUnfinishedInterview: (email) => {
        const state = get();
        const candidate = state.candidates[email];
        if (candidate && !candidate.interviewOver && candidate.responses && candidate.responses.length > 0) {
          return candidate;
        }
        return null;
      }
    }),
    {
      name: 'interview-storage',
      version: 1,
    }
  )
);

export default useInterviewStore;