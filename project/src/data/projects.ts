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
  title: 'About Me',
  category: 'personal',
  position: [0, 0, 0],
  description: `
Hi, I'm Eesh — a passionate engineer, creative thinker, and lifelong learner driven by curiosity and a desire to solve real-world problems through technology. Whether I’m building intelligent systems, optimizing digital workflows, or experimenting with emerging tech, I’m always pushing boundaries to craft solutions that are not only functional but meaningful.

With a background in computer science and hands-on experience across the full development lifecycle, I thrive at the intersection of software engineering, data-driven insight, and user-focused design. I’ve worked on a diverse range of projects — from AI-powered applications and web platforms to automation tools and research initiatives — each one deepening my understanding of how code can create tangible impact.

I’m especially excited about innovation in areas like artificial intelligence, distributed systems, and intelligent automation. My recent work includes building LLM-powered agents for supply chain optimization, creating disaster response platforms that combine machine learning with geospatial data, and developing hybrid quantum-classical models for financial forecasting.

Outside of work, I enjoy mentoring budding developers, writing about tech, and exploring ideas at the cutting edge of computing and society. I believe that great engineering is as much about empathy and clarity as it is about algorithms and architecture.

If you're looking for someone who blends technical depth with a love for problem-solving, you’re in the right place. Let’s build something meaningful together.
  `.trim(),
  size: 'large',
  connections: ['projects', 'resume', 'contact']
},
  // Three main branches
  {
    id: 'projects',
    title: 'Projects',
    category: 'personal',
    position: sphericalPosition(8, 0, Math.PI / 2),
    description: 'Explore my featured projects in AI, Quantum Computing, and Full-Stack development.',
    technologies: [
    'PennyLane', 'TensorFlow', 'Agentic AI Frameworks', 'ReAct Framework', 'Python', 'JavaScript', 'SQL', 'Flask', 'ReactJS', 'Node.js',
    'Express.js', 'MySQL', 'MongoDB', 'Git', 'CI/CD Pipelines', 'RESTful APIs', 'OAuth', 'Multer', 'Postman', 'HTML', 'CSS'
  ],
    size: 'large',
    connections: [
      'about-me','disaster-reporting-tool'
    ]
  },
  {
    id: 'resume',
    title: 'Resume',
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
  title: 'Contact Me',
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
  title: 'Disaster Reporting Tool',
  category: 'ai', // You can duplicate this object for 'fullstack' if you want it to show in both
  position: [/* choose a position, e.g. */ 6, 2, -3],
  description: 'A real-time disaster reporting and visualization platform using AI and fullstack technologies.',
  technologies: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'AI', 'Mapbox'],
  size: 'medium',
  demoUrl: 'https://disasterfront.vercel.app/',
  githubUrl: 'https://github.com/Eesh-487/disasterfront',
  connections: ['projects'] // Add to the relevant parent nodes
},
{
    id: 'RiskPortfolio',
    title: 'RiskPortfolio',
    category: 'fullstack', // or 'ai' if it uses ML, or 'personal' if it's your own
    position: [2, 1, 0], // choose a unique position
    description: 'An interactive platform for stock market portfolio analysis, risk assessment, and optimization, enabling users to make data-driven investment decisions.',
    technologies: ['React', 'Vite', 'Tailwind', 'Node.js', 'Express', 'MongoDB'],
    demoUrl: 'https://stocks-frontend-wheat.vercel.app/',// update if public
    size: 'medium',
    connections: ['projects'], // add related project IDs if any
  },
// quwdho

];