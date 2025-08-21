import { create } from 'zustand';

export interface GlobalJob {
  id: string;
  type: 'keyword-generation' | 'basic-enrichment' | 'enhanced-enrichment';
  status: 'queued' | 'processing' | 'active' | 'completed' | 'failed';
  progress: number;
  metadata: any;
  result?: any;
  error?: string;
  submittedAt: string;
  completedAt?: string;
  position?: number;
  estimatedWaitTime?: number;
  pollUrl?: string;
}

interface GlobalJobState {
  jobs: GlobalJob[];
  setJobs: (jobs: GlobalJob[]) => void;
  updateJob: (jobId: string, updates: Partial<GlobalJob>) => void;
  addJob: (job: GlobalJob) => void;
  removeJob: (jobId: string) => void;
  getJob: (jobId: string) => GlobalJob | undefined;
  getJobsByType: (type: string) => GlobalJob[];
  getJobsByStatus: (status: string) => GlobalJob[];
  loadJobsFromDatabase: () => Promise<GlobalJob[]>;
}

export const useGlobalJobStore = create<GlobalJobState>((set, get) => ({
  jobs: [],
  
  setJobs: (jobs) => set({ jobs }),
  
  updateJob: (jobId, updates) => set((state) => ({
    jobs: state.jobs.map(job => 
      job.id === jobId ? { ...job, ...updates } : job
    )
  })),
  
  addJob: (job) => set((state) => ({
    jobs: [...state.jobs, job]
  })),
  
  removeJob: (jobId) => set((state) => ({
    jobs: state.jobs.filter(job => job.id !== jobId)
  })),
  
  getJob: (jobId) => get().jobs.find(job => job.id === jobId),
  
  getJobsByType: (type) => get().jobs.filter(job => job.type === type),
  
  getJobsByStatus: (status) => get().jobs.filter(job => job.status === status),
  
  // Load jobs from database when needed
  loadJobsFromDatabase: async () => {
    try {
      console.log('🔄 Loading jobs from database...');
      const response = await fetch('/api/admin/jobs');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('✅ Jobs loaded from database:', data.jobs?.length || 0, 'jobs');
          set({ jobs: data.jobs || [] });
          return data.jobs || [];
        }
      }
    } catch (error) {
      console.error('❌ Failed to load jobs from database:', error);
    }
    return [];
  },
}));
