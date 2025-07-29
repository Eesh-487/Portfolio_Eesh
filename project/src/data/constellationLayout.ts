import { Project } from '../types/project';
import { projects as baseProjects } from './projects';

export function getConstellationLayout(centerId: string): Project[] {
  const center = baseProjects.find(p => p.id === centerId);
  if (!center) return baseProjects;

  // Place center at [0,0,0]
  const layout: Project[] = [];
  layout.push({ ...center, position: [0, 0, 0] });

  // Get direct connections
  const connections = (center.connections || [])
    .map(id => baseProjects.find(p => p.id === id))
    .filter(Boolean) as Project[];

  // Distribute connections in a circle around center
  const radius = 8;
  connections.forEach((p, i) => {
    const angle = (2 * Math.PI * i) / connections.length;
    layout.push({
      ...p,
      position: [
        radius * Math.cos(angle),
        radius * Math.sin(angle),
        0,
      ],
    });
  });

  // Optionally, add second-level connections (e.g., projects under "Projects")
  connections.forEach((conn, idx) => {
    if (conn.connections) {
      const subConnections = conn.connections
        .map(id => baseProjects.find(p => p.id === id))
        .filter(Boolean) as Project[];
      subConnections.forEach((sub, j) => {
        const subAngle = (2 * Math.PI * j) / subConnections.length;
        layout.push({
          ...sub,
          position: [
            layout[idx + 1].position[0] + 6 * Math.cos(subAngle),
            layout[idx + 1].position[1] + 6 * Math.sin(subAngle),
            0,
          ],
        });
      });
    }
  });

  return layout;
}