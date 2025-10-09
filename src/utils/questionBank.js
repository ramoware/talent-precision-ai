// ------------------- QUESTION POOL ------------------- 
export const questionPool = [
  // 🟢 EASY
  { 
    id: 1, 
    difficulty: "Easy", 
    topic: "React Basics", 
    question: "What is JSX and why is it used in React?", 
    expected_keywords: ["syntax", "JavaScript", "HTML", "readability", "transpiled", "Babel"] 
  },
  { 
    id: 2, 
    difficulty: "Easy", 
    topic: "Node Basics", 
    question: "What is the purpose of package.json in a Node.js project?", 
    expected_keywords: ["metadata", "dependencies", "scripts", "project info"] 
  },
  { 
    id: 3, 
    difficulty: "Easy", 
    topic: "React Components", 
    question: "What is the difference between a functional component and a class component in React?", 
    expected_keywords: ["hooks", "state", "lifecycle", "this keyword"] 
  },
  { 
    id: 4, 
    difficulty: "Easy", 
    topic: "NPM", 
    question: "What is npm and why is it important in Node.js development?", 
    expected_keywords: ["package manager", "dependencies", "install", "modules"] 
  },

  // 🟡 MEDIUM
  { 
    id: 5, 
    difficulty: "Medium", 
    topic: "Express Middleware", 
    question: "Explain how middleware works in Express.", 
    expected_keywords: ["request", "response", "next()", "pipeline"] 
  },
  { 
    id: 6, 
    difficulty: "Medium", 
    topic: "React Props vs State", 
    question: "What is the difference between state and props in React?", 
    expected_keywords: ["props", "state", "immutable", "parent to child", "component data"] 
  },
  { 
    id: 7, 
    difficulty: "Medium", 
    topic: "Node Async", 
    question: "Why is asynchronous programming important in Node.js?", 
    expected_keywords: ["non-blocking", "I/O", "performance", "event loop", "callbacks", "promises"] 
  },
  { 
    id: 8, 
    difficulty: "Medium", 
    topic: "React Lifecycle", 
    question: "Explain the purpose of useEffect in React.", 
    expected_keywords: ["side effects", "fetching", "cleanup", "dependencies", "render"] 
  },

  // 🔴 HARD
  { 
    id: 9, 
    difficulty: "Hard", 
    topic: "React Performance", 
    question: "How would you optimize a large React app that's rendering slowly?", 
    expected_keywords: ["memoization", "React.memo", "useMemo", "virtualization", "lazy loading", "profiling"] 
  },
  { 
    id: 10, 
    difficulty: "Hard", 
    topic: "Backend Architecture", 
    question: "How would you structure a Node.js + Express app for scalability?", 
    expected_keywords: ["modular", "routes", "controllers", "services", "load balancing", "cluster"] 
  },
  { 
    id: 11, 
    difficulty: "Hard", 
    topic: "Database Design", 
    question: "What factors would you consider when designing a database for a large-scale web application?", 
    expected_keywords: ["normalization", "indexing", "scalability", "data modeling", "sharding", "replication"] 
  },
  { 
    id: 12, 
    difficulty: "Hard", 
    topic: "API Security", 
    question: "How would you secure a REST API in a full-stack app?", 
    expected_keywords: ["JWT", "authentication", "authorization", "rate limiting", "CORS", "validation"] 
  },
];

// ------------------- INTERVIEW SET GENERATOR ------------------- 
export const generateInterviewSet = () => {
  // Simple shuffle - just pick first 2 from each category
  const easyQuestions = questionPool.filter(q => q.difficulty === "Easy");
  const mediumQuestions = questionPool.filter(q => q.difficulty === "Medium");
  const hardQuestions = questionPool.filter(q => q.difficulty === "Hard");

  // Select first 2 questions from each difficulty level
  const selectedEasy = easyQuestions.slice(0, 2);
  const selectedMedium = mediumQuestions.slice(0, 2);
  const selectedHard = hardQuestions.slice(0, 2);

  // Return in fixed order: Easy → Medium → Hard
  const finalSet = [...selectedEasy, ...selectedMedium, ...selectedHard];
  
  return finalSet;
};

// ------------------- ENHANCED FREE ANSWER SCORING -------------------
export const evaluateAnswer = (answer, keywords, difficulty) => {
  if (!answer || answer === "(No answer given)" || answer === "Time expired - no response provided") {
    return {
      score: 0,
      reasoning: "No answer provided",
      strengths: [],
      improvements: ["Please provide an answer to demonstrate your knowledge"],
      keywords_covered: [],
      keywords_missed: keywords
    };
  }

  const answerLower = answer.toLowerCase().trim();
  const wordCount = answer.split(/\s+/).length;
  
  // Enhanced keyword matching with variations and synonyms
  const { foundKeywords, confidence } = matchKeywordsWithVariations(answerLower, keywords);
  const missedKeywords = keywords.filter(kw => !foundKeywords.includes(kw));
  
  // Calculate base score
  let score = calculateBaseScore(foundKeywords.length, keywords.length);
  
  // Apply quality bonuses
  score = applyQualityBonuses(score, answerLower, wordCount, difficulty);
  
  return createEvaluationResult(score, keywords, foundKeywords, missedKeywords, wordCount);
};

// Helper function for smart keyword matching
const matchKeywordsWithVariations = (answerLower, keywords) => {
  const foundKeywords = [];
  let totalConfidence = 0;
  
  // Comprehensive technical variations database
  const technicalVariations = {
    // React & JS
    "syntax": ["syntax", "structure", "format", "notation", "code style"],
    "javascript": ["javascript", "js", "ecmascript", "programming language"],
    "html": ["html", "markup", "dom", "hypertext", "web page"],
    "readability": ["readability", "readable", "clear", "understandable", "maintainable", "clean code"],
    "transpiled": ["transpiled", "compiled", "converted", "transformed", "babel", "compile"],
    "babel": ["babel", "transpiler", "compiler", "build tool"],
    "hooks": ["hooks", "usestate", "useeffect", "custom hooks", "react hooks"],
    "state": ["state", "usestate", "setstate", "data", "variables", "component state"],
    "lifecycle": ["lifecycle", "mount", "update", "unmount", "useeffect", "component lifecycle"],
    "props": ["props", "properties", "arguments", "parameters", "component props"],
    "immutable": ["immutable", "cannot change", "read-only", "constant", "unchangeable"],
    
    // Performance & Optimization
    "memoization": ["memoization", "memoisation", "memo", "caching", "cache", "remember", "store results"],
    "react.memo": ["react.memo", "memo", "higher order component", "hoc"],
    "usememo": ["usememo", "use memo", "memo hook", "usememo", "performance hook"],
    "virtualization": ["virtualization", "virtualisation", "windowing", "virtual scrolling", "react window", "react virtualized"],
    "lazy loading": ["lazy loading", "lazy load", "dynamic imports", "react.lazy", "code splitting", "load on demand"],
    "profiling": ["profiling", "profiler", "performance monitoring", "react devtools", "measure performance"],
    
    // Node & Backend
    "metadata": ["metadata", "information", "details", "description", "project metadata"],
    "dependencies": ["dependencies", "packages", "libraries", "modules", "requirements", "node modules"],
    "scripts": ["scripts", "commands", "tasks", "npm run", "package scripts"],
    "package manager": ["package manager", "npm", "yarn", "dependency manager", "node package manager"],
    "non-blocking": ["non-blocking", "non blocking", "asynchronous", "async", "not blocking", "concurrent"],
    "i/o": ["i/o", "input output", "file system", "network", "database", "input-output"],
    "event loop": ["event loop", "event queue", "callback queue", "node runtime", "libuv"],
    "callbacks": ["callbacks", "callback functions", "cb", "async callbacks", "callback pattern"],
    "promises": ["promises", "promise", "async/await", "then catch", "future", "async operations"],
    
    // Express & Middleware
    "request": ["request", "req", "incoming", "http request", "client request"],
    "response": ["response", "res", "outgoing", "http response", "server response"],
    "next()": ["next()", "next function", "next middleware", "next", "middleware chain"],
    "pipeline": ["pipeline", "chain", "sequence", "order", "middleware chain", "request pipeline"],
    
    // Architecture & Scalability
    "modular": ["modular", "modularity", "separated", "organized", "structured", "modular architecture"],
    "routes": ["routes", "routing", "endpoints", "api routes", "express routes", "http routes"],
    "controllers": ["controllers", "controller", "business logic", "request handlers", "route handlers"],
    "services": ["services", "service layer", "business services", "data access", "service pattern"],
    "load balancing": ["load balancing", "load balancer", "scaling horizontally", "multiple instances", "traffic distribution"],
    "cluster": ["cluster", "clustering", "node cluster", "multiple processes", "cpu cores", "process cluster"],
    
    // Database
    "normalization": ["normalization", "normalisation", "normalize", "normalise", "database design", "reduce redundancy", "data organization"],
    "indexing": ["indexing", "indexes", "database index", "query performance", "faster queries", "search optimization"],
    "scalability": ["scalability", "scalable", "handles growth", "performance at scale", "large scale"],
    "data modeling": ["data modeling", "data modelling", "schema design", "entity relationship", "database schema"],
    "sharding": ["sharding", "shard", "partitioning", "horizontal partitioning", "split data", "database sharding"],
    "replication": ["replication", "replica", "master slave", "primary secondary", "data redundancy", "backup databases"],
    
    // Security
    "jwt": ["jwt", "json web token", "tokens", "authentication tokens", "bearer token", "jwt token"],
    "authentication": ["authentication", "authenticate", "auth", "login", "signin", "verify identity", "user verification"],
    "authorization": ["authorization", "authorisation", "authorize", "authorise", "permissions", "access control", "roles", "rights"],
    "rate limiting": ["rate limiting", "throttling", "request limiting", "api limits", "request throttling"],
    "cors": ["cors", "cross origin", "cross-origin resource sharing", "cors headers", "domain security"],
    "validation": ["validation", "validate", "input validation", "data validation", "sanitization", "input sanitization"],
    
    // General
    "side effects": ["side effects", "side effect", "external interactions", "api calls", "data fetching"],
    "fetching": ["fetching", "api", "data fetching", "http requests", "ajax", "data loading"],
    "cleanup": ["cleanup", "clean up", "unsubscribe", "remove listeners", "clear intervals", "resource cleanup"],
    "dependencies": ["dependencies", "dependency array", "second argument", "watch values", "useEffect dependencies"],
    "render": ["render", "rendering", "re-render", "component render", "ui update", "virtual dom"],
  };

  keywords.forEach(keyword => {
    let matched = false;
    let confidence = 0;
    
    // Direct match (high confidence)
    if (answerLower.includes(keyword.toLowerCase())) {
      matched = true;
      confidence = 1.0;
    }
    // Check technical variations
    else {
      const variations = technicalVariations[keyword] || [keyword];
      for (const variation of variations) {
        if (answerLower.includes(variation.toLowerCase())) {
          matched = true;
          confidence = 0.8; // Partial credit for variations
          break;
        }
      }
    }
    
    if (matched) {
      foundKeywords.push(keyword);
      totalConfidence += confidence;
    }
  });
  
  return {
    foundKeywords,
    confidence: foundKeywords.length > 0 ? totalConfidence / foundKeywords.length : 0
  };
};

const calculateBaseScore = (foundCount, totalCount) => {
  const ratio = foundCount / totalCount;
  if (ratio >= 0.7) return 3;
  if (ratio >= 0.5) return 2;
  if (ratio >= 0.3) return 1;
  return 0;
};

const applyQualityBonuses = (score, answerLower, wordCount, difficulty) => {
  let adjustedScore = score;
  
  // Length bonus (detailed answers get credit)
  if (wordCount > 80) adjustedScore += 0.5;
  else if (wordCount > 40) adjustedScore += 0.25;
  
  // Structure bonus (well-organized answers)
  const hasStructure = /first|second|then|next|finally|additionally|moreover|however|therefore/i.test(answerLower);
  if (hasStructure) adjustedScore += 0.25;
  
  // Example bonus (answers with practical examples)
  const hasExamples = /example|for instance|such as|e\.g|for example|like when|scenario/i.test(answerLower);
  if (hasExamples) adjustedScore += 0.25;
  
  // Code example bonus (mentions code or specific syntax)
  const hasCodeMentions = /function|const|let|var|return|import|export|component|<[^>]*>|\(\)|=>/i.test(answerLower);
  if (hasCodeMentions) adjustedScore += 0.25;
  
  // Difficulty adjustment (hard questions get slight leniency)
  if (difficulty === 'Hard' && score > 0) adjustedScore += 0.25;
  if (difficulty === 'Easy' && score === 3) adjustedScore += 0.1; // Reward perfect easy answers
  
  return Math.min(Math.max(adjustedScore, 0), 3);
};

const createEvaluationResult = (score, allKeywords, foundKeywords, missedKeywords, wordCount = 0) => {
  const roundedScore = Math.round(score);
  const coverage = foundKeywords.length / allKeywords.length;
  
  let reasoning, strengths, improvements;

  if (roundedScore === 3) {
    reasoning = `Excellent comprehensive answer covering ${foundKeywords.length}/${allKeywords.length} key concepts with strong depth and clarity`;
    strengths = [
      `Comprehensive coverage: ${foundKeywords.join(', ')}`,
      wordCount > 60 ? 'Detailed and well-explained' : 'Clear and concise',
      'Demonstrates deep understanding of the topic'
    ];
    improvements = ["Consider adding more real-world examples for practical context"];
  } 
  else if (roundedScore === 2) {
    reasoning = `Good answer demonstrating solid understanding of ${foundKeywords.length}/${allKeywords.length} key concepts`;
    strengths = [
      `Covered core concepts: ${foundKeywords.join(', ')}`,
      'Shows good fundamental knowledge',
      wordCount > 40 ? 'Adequate explanation' : 'Direct and relevant'
    ];
    improvements = [
      `Expand on: ${missedKeywords.slice(0, 2).join(', ')}`,
      'Add more specific examples or use cases'
    ];
  } 
  else if (roundedScore === 1) {
    reasoning = `Basic understanding demonstrated but missing ${missedKeywords.length} key concepts`;
    strengths = [
      `Mentioned: ${foundKeywords.join(', ') || 'some relevant points'}`,
      'Shows beginning knowledge of the topic'
    ];
    improvements = [
      `Focus on understanding: ${missedKeywords.slice(0, 3).join(', ')}`,
      'Provide more detailed explanations with examples',
      'Review fundamental concepts thoroughly'
    ];
  } 
  else {
    reasoning = "Insufficient or incorrect answer showing limited understanding";
    strengths = [];
    improvements = [
      `Study all key concepts: ${allKeywords.join(', ')}`,
      'Practice explaining technical concepts clearly',
      'Review the fundamentals of this topic'
    ];
  }

  // Add quality assessment notes
  if (wordCount < 20 && roundedScore > 0) {
    improvements.push('Try to provide more detailed explanations');
  }

  return {
    score: roundedScore,
    reasoning,
    strengths,
    improvements,
    keywords_covered: foundKeywords,
    keywords_missed: missedKeywords,
    metrics: {
      keyword_coverage: `${Math.round(coverage * 100)}%`,
      answer_length: wordCount > 60 ? 'Detailed' : wordCount > 30 ? 'Moderate' : 'Brief',
      conceptual_depth: roundedScore >= 2 ? 'Good' : 'Basic'
    }
  };
};

// Backward compatibility - simple scoring for existing code
export const evaluateAnswerSimple = (answer, keywords) => {
  const result = evaluateAnswer(answer, keywords, "Medium");
  return result.score;
};
