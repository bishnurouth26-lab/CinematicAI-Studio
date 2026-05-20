/**
 * Global Types & Interfaces for Creator OS
 * Centralized type definitions for long-term scalability
 */

export interface SystemUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
}

export interface WorkspaceProject {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  tags: string[];
  ownerId: string;
  completionPercentage: number;
  content?: {
    [key: string]: any;
  };
}

export interface ScenePrompt {
  id: string;
  description: string;
  style: string;
  aspectRatio: string;
}

export interface ScriptSequence {
  id: string;
  narrative: string;
  duration: number;
}
