import { Project } from '../types/project';

// Utility to place nodes on a sphere
function sphericalPosition(radius: number, theta: number, phi: number): [number, number, number] {
  return [
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  ];
}

export const projects: Project[] = [
  // Center node: About Me
    {
  id: 'about-me',
  tagline: 'AI Engineer · Machine Learning · Agentic Systems',
  title: 'Eesh Khanna',
  category: 'personal',
  position: [0, 0, 0],
  description: `
Hi, I'm Eesh — a passionate engineer, creative thinker, and lifelong learner driven by curiosity and a desire to solve real-world problems through technology.

Technical Expertise
- Building intelligent systems
- Optimizing digital workflows
- Exploring emerging technologies

Background
- Computer science foundation
- Hands-on experience across the full development lifecycle

Professional Focus
- Working at the intersection of software engineering, data-driven insights, and user-focused design

Project Experience
- AI-powered applications and web platforms
- Automation tools and research initiatives
- LLM-powered agents for supply chain optimization
- Disaster response platforms (ML + geospatial data)
- Hybrid quantum-classical models for financial forecasting

Areas of Interest
- Artificial intelligence and machine learning
- Distributed systems
- Intelligent automation
- Quantum computing applications

I believe that great engineering is as much about empathy and clarity as it is about algorithms and architecture. Let's build something meaningful together.
`.trim(),

  size: 'large',
  connections: ['projects', 'research', 'experience', 'hackathons']


},
  // Three main branches
  {
    id: 'projects',
    tagline: 'AI systems, ML applications, and production tools.',
    title: 'Projects',
    category: 'personal',
    position: sphericalPosition(16, 0, Math.PI / 2),
    description: 'Explore my featured projects in AI, Quantum Computing, and Full-Stack development.',
    technologies: [
    'PennyLane', 'TensorFlow', 'Agentic AI Frameworks', 'ReAct Framework', 'Python', 'JavaScript', 'SQL', 'Flask', 'ReactJS', 'Node.js',
    'Express.js', 'MySQL', 'MongoDB', 'Git', 'CI/CD Pipelines', 'RESTful APIs', 'OAuth', 'Multer', 'Postman', 'HTML', 'CSS'
  ],
    size: 'large',
    connections: [
      'about-me', 'compliance-memory', 'disaster-reporting-tool', 'RiskPortfolio', 'modflight'
    ]
  },
  {
    id: 'resume',
    tagline: 'Experience and timeline as a PDF.',
    title: 'Resume',
    category: 'personal',
    position: sphericalPosition(16, (4 * Math.PI) / 3, Math.PI / 2),
    description: 'Download my resume and view my professional timeline.',
    technologies: [],
    demoUrl: '/resume.pdf',
    size: 'large',
    connections: ['about-me']
  },
  {
  id: 'contact',
  tagline: 'Email, GitHub, and LinkedIn.',
  title: 'Contact',
  category: 'personal',
  position: sphericalPosition(16, (5 * Math.PI) / 3, Math.PI / 2),
  description: 'Get in touch via email or social links.',
  email: 'eesh.khanna30@gmail.com',
  linkedinUrl: 'https://www.linkedin.com/in/eesh-khanna',
  githubUrl: 'https://github.com/Eesh-487',
  size: 'large',
  connections: ['about-me']
},
  {
  id: 'disaster-reporting-tool',
  tagline: 'Real-time disaster reporting with AI and maps.',
  title: 'Disaster Reporting Tool',
  category: 'ai', // You can duplicate this object for 'fullstack' if you want it to show in both
  position: [22, 3, -8],
  description: 'A real-time disaster reporting and visualization platform using AI and fullstack technologies.',
  technologies: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'AI', 'Mapbox'],
  size: 'medium',
  demoUrl: 'https://disasterfront.vercel.app/',
  githubUrl: 'https://github.com/Eesh-487/disasterfront',
  connections: ['projects'] // Add to the relevant parent nodes
},
{
    id: 'RiskPortfolio',
    tagline: 'Portfolio risk analysis and optimization.',
    title: 'Risk Portfolio',
    category: 'fullstack', // or 'ai' if it uses ML, or 'personal' if it's your own
    position: [26, -2, 4],
    description: 'An interactive platform for stock market portfolio analysis, risk assessment, and optimization, enabling users to make data-driven investment decisions.',
    technologies: ['React', 'Vite', 'Tailwind', 'Node.js', 'Express', 'MongoDB'],
    demoUrl: 'https://stocks-frontend-wheat.vercel.app/',// update if public
    size: 'medium',
    connections: ['projects'], // add related project IDs if any
  },{
  id: 'modflight',
  tagline: 'Citation-backed aviation regulatory intelligence with RAG.',
  featured: true,
  title: 'ModFlight',
  category: 'ai',
  position: [19, -3, 12],
  description: 'An intelligent aircraft modification certification platform featuring automated classification, regulatory mapping, and EASA Level of Involvement assessment. Uses advanced NLP and machine learning to analyze modification types, predict applicable CS-25/AMC regulations, and provide similarity analysis with historical modifications for comprehensive certification planning.',
  technologies: [
    'Python', 
    'Streamlit', 
    'Plotly', 
    'Pandas', 
    'NumPy', 
    'Scikit-learn', 
    'Sentence Transformers', 
    'NLTK', 
    'FAISS', 
    'Seaborn', 
    'Matplotlib', 
    'Machine Learning'
  ],
  demoUrl: 'https://modflight.streamlit.app/',
  githubUrl: 'https://github.com/Eesh-487/mod-certification-nlp-flight',
  size: 'medium',
  connections: ['projects']
},
  {
    id: 'compliance-memory',
    tagline: 'Multi-agent GraphRAG for legal compliance.',
    featured: true,
    title: 'Compliance Memory',
    category: 'ai',
    position: [20, 2, -16],
    description: `Agentic AI for legal compliance.

- Multi-agent GraphRAG system built with LangGraph, Neo4j, and ChromaDB
- Hybrid retrieval combining BM25, dense vector search, and reranking
- Auditable, interconnected policy knowledge graphs generated from unstructured legal documents
- Bidirectional compliance analysis with human-in-the-loop policy remediation
- Automated regulatory gap detection for enterprise-wide compliance`,
    technologies: ['Python', 'FastAPI', 'LangGraph', 'Neo4j', 'ChromaDB', 'DeepEval', 'Docker'],
    demoUrl: 'https://complianceconsole.vercel.app',
    githubUrl: 'https://github.com/Eesh-487/Agents',
    size: 'medium',
    connections: ['projects'],
  },

  // Research: publications and patents
  {
    id: 'research',
    tagline: 'Peer-reviewed work in quantum ML and explainable AI, plus a patent.',
    title: 'Research',
    category: 'personal',
    position: sphericalPosition(16, Math.PI / 3, Math.PI / 2),
    description: 'Publications and patents in quantum machine learning, explainable AI, and multi-modal disaster verification.',
    size: 'large',
    connections: ['about-me', 'quantum-forecasting', 'lumpy-skin-xai', 'disaster-verification-patent'],
  },
  {
    id: 'quantum-forecasting',
    tagline: 'Quantum-enhanced forecasting · ESWA, first author.',
    featured: true,
    title: 'Quantum Forecasting',
    category: 'quantum',
    position: [17.4, 2, 19.3],
    description: `Quantum-Enhanced Forecasting Pipeline Integrating Sentiment Dynamics and Regime Modeling
Expert Systems with Applications (ESWA), 2025 · In Proceedings, First Author

- Hybrid quantum-classical pipeline integrating FinBERT sentiment and Hidden Markov regime modeling
- Regime-conditioned Monte Carlo simulations and a novel Quantum-Enhanced Adam optimizer
- Reduced pooled RMSE by 38.9% across recurrent models, reaching R² 0.9894 and 4.43% MAPE`,
    technologies: ['PennyLane', 'FinBERT', 'HMM', 'Monte Carlo', 'LSTM/GRU', 'PyTorch'],
    size: 'medium',
    connections: ['research'],
  },
  {
    id: 'lumpy-skin-xai',
    tagline: 'Explainable AutoML for disease detection · Springer.',
    title: 'Explainable AutoML',
    category: 'ai',
    position: [12.2, -2, 23],
    description: `Enhancing Explainability of AutoML and Deep Learning for Lumpy Skin Disease Detection
Springer, ICAIC 2025 · Co-author

- Evaluated AutoML and deep learning models on epidemiological data for cattle disease detection
- Stratified K-Fold validation and SMOTE to handle class imbalance
- 0.94 accuracy and 0.99 ROC AUC with TPOT, with LIME for transparent clinical insights`,
    technologies: ['TPOT', 'AutoML', 'LIME', 'SMOTE', 'Scikit-learn', 'TensorFlow'],
    size: 'medium',
    connections: ['research'],
  },
  {
    id: 'disaster-verification-patent',
    tagline: 'Multi-modal disaster verification · patent application.',
    title: 'Disaster Verification Patent',
    category: 'ai',
    position: [6.3, 1, 25.2],
    description: `Multi-Modal Disaster Verification from Geospatial and Text Data
Patent Application No. 202511074034 A, 2025

- Multi-modal pipeline fusing SBERT text, KNN geospatial clustering, and real-time news
- 85% accuracy and 0.92 specificity via adaptive scoring, minimizing false-positive alerts
- Containerized models with persistent caching for near-instant report verification`,
    technologies: ['SBERT', 'KNN', 'Geospatial', 'Docker'],
    size: 'medium',
    connections: ['research', 'disaster-reporting-tool'],
  },

  // Work experience
  {
    id: 'experience',
    tagline: 'Production agentic AI at LumberFi and Dell Technologies.',
    title: 'Work Experience',
    category: 'personal',
    position: sphericalPosition(16, (2 * Math.PI) / 3, Math.PI / 2),
    description: 'Where I have built production AI systems: LumberFi (Oct 2025 – Present) and Dell Technologies (May – Jul 2025).',
    size: 'large',
    connections: ['about-me', 'lumberfi', 'dell'],
  },
  {
    id: 'lumberfi',
    tagline: '9-stage LangGraph platform; client onboarding from 30–120 days to 1–2.',
    featured: true,
    title: 'LumberFi',
    category: 'fullstack',
    position: [-9.4, 2, 23.2],
    description: `Software Developer Intern · Oct 2025 – Present · Bengaluru

- Architected a 9-stage LangGraph multi-agent platform on Claude APIs for test automation; 500+ test cases generated, authoring under 20 min per epic, 100+ hours saved quarterly
- Agentic workflows that parse, validate, and transform raw client data into Lumber schemas, cutting onboarding from 30–120 days to 1–2 days
- Country-aware payroll subsystem with optimistic locking, enabling full CRA/T4 compliance across 13 provinces
- Indexing and caching fixes that cut API latency from 4s to 500–600ms and raised throughput 300%`,
    technologies: ['LangGraph', 'Claude APIs', 'Python', 'PostgreSQL', 'Load Testing', 'REST APIs'],
    size: 'medium',
    connections: ['experience', 'dell'],
  },
  {
    id: 'dell',
    tagline: '6-agent ReAct platform with Llama 3 and MCP.',
    title: 'Dell Technologies',
    category: 'ai',
    position: [-16.7, -2, 18.6],
    description: `Agentic AI Intern · May 2025 – Jul 2025 · Bengaluru

- Engineered a 6-agent ReAct platform with Llama 3 and FastAPI to automate supply chain analysis
- Integrated Model Context Protocol (MCP) for end-to-end demand reconciliation
- Reduced manual planning effort by 30% and agent handling time by 15%
- Validated agent performance with DeepEval regression testing`,
    technologies: ['Llama 3', 'FastAPI', 'ReAct', 'MCP', 'MongoDB', 'DeepEval'],
    size: 'medium',
    connections: ['experience', 'lumberfi'],
  },

  // Hackathons
  {
    id: 'hackathons',
    tagline: 'Hackathons and recognition.',
    title: 'Achievements',
    category: 'personal',
    position: sphericalPosition(16, Math.PI, Math.PI / 2),
    description: 'Building fast under pressure: national-level hackathon work.',
    size: 'large',
    connections: ['about-me', 'zero-to-one'],
  },
  {
    id: 'zero-to-one',
    tagline: 'National finalist · AI agent for merge conflicts.',
    title: 'ZERO TO ONE AI',
    category: 'ai',
    position: [-26, 2, -1],
    description: `ZERO TO ONE AI Hackathon · National Finalist, 2026
Pocket FM, OpenAI, Lightspeed

- Git-like version control for script collaboration, with branches and pull requests
- AI agent that auto-resolves merge conflicts, cutting manual resolution time by 40%
- Sora-powered visual scene previews and a node-based narrative graph for structural analysis
- Accelerated director feedback by 30% and improved narrative coherence via real-time visual mapping`,
    technologies: ['OpenAI', 'Sora', 'AI Agents', 'Version Control', 'Graph Visualization'],
    size: 'medium',
    connections: ['hackathons'],
  },
];

export function matchesSearch(project: Project, term: string) {
  const q = term.toLowerCase();
  return (
    project.title.toLowerCase().includes(q) ||
    project.description.toLowerCase().includes(q) ||
    !!project.technologies?.some((tech) => tech.toLowerCase().includes(q))
  );
}
