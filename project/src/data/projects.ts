import { Project } from '../types/project';

// Utility to place nodes on a sphere
function sphericalPosition(radius: number, theta: number, phi: number): [number, number, number] {
  return [
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi),
  ];
}

export const projects: Project[] = [
  // Center node: About Me
    {
  id: 'about-me',
  title: 'A b o u t - M e',
  category: 'personal',
  position: [0, 0, 0],
  description: `
Hi, I'm Eesh — a passionate engineer, creative thinker, and lifelong learner driven by curiosity and a desire to solve real-world problems through technology.

🔹 Technical Expertise
  • Building intelligent systems
  • Optimizing digital workflows
  • Exploring emerging technologies

🔹 Background
  • Computer science foundation
  • Hands-on experience across the full development lifecycle

🔹 Professional Focus
  • Working at the intersection of software engineering, data-driven insights, and user-focused design

🔹 Project Experience
  • AI-powered applications and web platforms
  • Automation tools and research initiatives
  • LLM-powered agents for supply chain optimization
  • Disaster response platforms (ML + geospatial data)
  • Hybrid quantum-classical models for financial forecasting

🔹 Areas of Interest
  • Artificial intelligence and machine learning
  • Distributed systems
  • Intelligent automation
  • Quantum computing applications

I believe that great engineering is as much about empathy and clarity as it is about algorithms and architecture. Let's build something meaningful together.
`.trim(),

  size: 'large',
  connections: ['projects', 'resume', 'contact']


},
  // Three main branches
  {
    id: 'projects',
    title: 'P r o j e c t s',
    category: 'personal',
    position: sphericalPosition(8, 0, Math.PI / 2),
    description: 'Explore my featured projects in AI, Quantum Computing, and Full-Stack development.',
    technologies: [
    'PennyLane', 'TensorFlow', 'Agentic AI Frameworks', 'ReAct Framework', 'Python', 'JavaScript', 'SQL', 'Flask', 'ReactJS', 'Node.js',
    'Express.js', 'MySQL', 'MongoDB', 'Git', 'CI/CD Pipelines', 'RESTful APIs', 'OAuth', 'Multer', 'Postman', 'HTML', 'CSS'
  ],
    size: 'large',
    connections: [
      'about-me', 'disaster-reporting-tool', 'RiskPortfolio', 'modflight'
    ]
  },
  {
    id: 'resume',
    title: 'R e s u m e',
    category: 'personal',
    position: sphericalPosition(8, (2 * Math.PI) / 3, Math.PI / 2),
    description: 'Download my resume and view my professional timeline.',
    technologies: [],
    demoUrl: '/resume.pdf',
    size: 'large',
    connections: ['about-me']
  },
  {
  id: 'contact',
  title: 'C o n t a c t - M e',
  category: 'personal',
  position: sphericalPosition(8, (4 * Math.PI) / 3, Math.PI / 2),
  description: 'Get in touch via email or social links.',
  email: 'eesh.khanna19@gmail.com', 
  githubUrl: 'https://github.com/Eesh-487',
  size: 'large',
  connections: ['about-me']
},
  {
  id: 'disaster-reporting-tool',
  title: 'D i s a s t e r - R e p o r t i n g - T o o l',
  category: 'ai', // You can duplicate this object for 'fullstack' if you want it to show in both
  position: [10, 4, -3], // Moved further away from center
  description: 'A real-time disaster reporting and visualization platform using AI and fullstack technologies.',
  technologies: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'AI', 'Mapbox'],
  size: 'medium',
  demoUrl: 'https://disasterfront.vercel.app/',
  githubUrl: 'https://github.com/Eesh-487/disasterfront',
  connections: ['projects'] // Add to the relevant parent nodes
},
{
    id: 'RiskPortfolio',
    title: 'R i s k - P o r t f o l i o',
    category: 'fullstack', // or 'ai' if it uses ML, or 'personal' if it's your own
    position: [12, -2, 3], // Positioned further to the right
    description: 'An interactive platform for stock market portfolio analysis, risk assessment, and optimization, enabling users to make data-driven investment decisions.',
    technologies: ['React', 'Vite', 'Tailwind', 'Node.js', 'Express', 'MongoDB'],
    demoUrl: 'https://stocks-frontend-wheat.vercel.app/',// update if public
    size: 'medium',
    connections: ['projects'], // add related project IDs if any
  },{
  id: 'modflight',
  title: 'M o d F l i g h t',
  category: 'ai',
  position: [9, -5, 5], // Better positioned to avoid overlap
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
}

];