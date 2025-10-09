// utils/session.js
export const saveCandidateSession = (candidateData) => {
  try {
    localStorage.setItem('candidateSession', JSON.stringify(candidateData));
  } catch (err) {
    console.error('Failed to save candidate session:', err);
  }
};

export const getSavedCandidateSession = () => {
  const session = localStorage.getItem('candidateSession');
  return session ? JSON.parse(session) : null;
};

export const clearCandidateSession = () => {
  localStorage.removeItem('candidateSession');
};
