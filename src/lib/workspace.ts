import { collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface ProjectContent {
  script?: any;
  prompts?: any;
  thumbnails?: any;
  seo?: any;
  audio?: any;
  shorts?: any;
  research?: any;
}

export interface WorkspaceProject {
  id: string;
  title: string;
  ownerId: string;
  collaborators: string[];
  createdAt: number;
  updatedAt: number;
  tags: string[];
  aiModelUsed: string;
  completionPercentage: number;
  content: ProjectContent;
}

export const createProject = async (ownerId: string, title: string = 'Untitled Project'): Promise<WorkspaceProject> => {
  const projectsRef = collection(db, 'projects');
  const newProjectRef = doc(projectsRef);
  const now = Date.now();
  
  const project: WorkspaceProject = {
    id: newProjectRef.id,
    title,
    ownerId,
    collaborators: [],
    createdAt: now,
    updatedAt: now,
    tags: [],
    aiModelUsed: 'Gemini 3.1 Pro',
    completionPercentage: 0,
    content: {},
  };
  
  await setDoc(newProjectRef, {
    ...project,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  
  return project;
};

export const updateProject = async (projectId: string, updates: Partial<WorkspaceProject>) => {
  const projectRef = doc(db, 'projects', projectId);
  await updateDoc(projectRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

export const deleteProject = async (projectId: string) => {
  await deleteDoc(doc(db, 'projects', projectId));
};

export const subscribeToProjects = (userId: string, callback: (projects: WorkspaceProject[]) => void) => {
  const projectsRef = collection(db, 'projects');
  // Include projects where user is owner or collaborator. 
  // Firestore OR queries are better done via multiple queries or composite index, but for simplicity we fetch by ownerId.
  const q = query(projectsRef, where('ownerId', '==', userId), orderBy('updatedAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const projects: WorkspaceProject[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      projects.push({
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : data.createdAt,
        updatedAt: data.updatedAt?.toMillis ? data.updatedAt.toMillis() : data.updatedAt,
      } as WorkspaceProject);
    });
    callback(projects);
  });
};
