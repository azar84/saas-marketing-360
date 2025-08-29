import { create } from 'zustand';

export interface Company {
  id: number;
  name: string;
  website: string;
  baseUrl?: string;
  description?: string;
  slug?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  addresses: CompanyAddress[];
  contacts: CompanyContact[];
  socials: CompanySocial[];
  technologies: CompanyTechnology[];
  services: CompanyService[];
  staff: CompanyStaff[];
  industries: CompanyIndustryRelation[];
  subIndustries: CompanySubIndustry[];
  urls: CompanyUrl[];
  enrichments: CompanyEnrichment[];
}

export interface CompanyAddress {
  id: number;
  type: string;
  streetAddress?: string;
  addressLine2?: string;
  city?: string;
  stateProvince?: string;
  country?: string;
  zipPostalCode?: string;
  fullAddress?: string;
  phone?: string;
  email?: string;
}

export interface CompanyContact {
  id: number;
  companyId: number;
  type: string;
  label?: string;
  value: string;
  contactPage?: string;
  description?: string;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface CompanySocial {
  id: number;
  companyId: number;
  platform: string;
  url: string;
  handle?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface CompanyTechnology {
  id: number;
  companyId: number;
  category: string;
  name: string;
  version?: string;
  firstDetected?: string;
  lastDetected?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CompanyService {
  id: number;
  companyId: number;
  name: string;
  description?: string;
  category?: string;
  isPrimary: boolean;
  createdAt: string;
}

export interface CompanyStaff {
  id: number;
  companyId: number;
  name: string;
  title?: string;
  department?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface CompanyIndustryRelation {
  id: number;
  companyId: number;
  industryId: number;
  isPrimary: boolean;
  createdAt: string;
  industry: {
    id: number;
    label: string;
    code: string;
  };
}

export interface CompanySubIndustry {
  id: number;
  companyId: number;
  subIndustryId: number;
  isPrimary: boolean;
  createdAt: string;
}

export interface CompanyUrl {
  id: number;
  companyId: number;
  url: string;
  path?: string;
  title?: string;
  description?: string;
  status: string;
  statusCode?: number;
  contentType?: string;
  contentLength?: number;
  lastScraped?: string;
  scrapedCount: number;
  isInternal: boolean;
  depth: number;
  discoveredAt: string;
  updatedAt: string;
}

export interface CompanyEnrichment {
  id: number;
  companyId: number;
  source: string;
  mode: string;
  pagesScraped: number;
  totalPagesFound: number;
  rawData: any;
  scrapedAt?: string;
  processedAt: string;
}

interface CompanyStore {
  companies: Company[];
  loading: boolean;
  lastUpdated: Date | null;
  
  // Actions
  setCompanies: (companies: Company[]) => void;
  addCompany: (company: Company) => void;
  updateCompany: (id: number, updates: Partial<Company>) => void;
  removeCompany: (id: number) => void;
  setLoading: (loading: boolean) => void;
  setLastUpdated: (date: Date) => void;
  
  // Computed
  getCompanyById: (id: number) => Company | undefined;
  getCompanyByWebsite: (website: string) => Company | undefined;
  getCompanyCount: () => number;
}

export const useCompanyStore = create<CompanyStore>((set, get) => ({
  companies: [],
  loading: false,
  lastUpdated: null,
  
  setCompanies: (companies) => set({ companies, lastUpdated: new Date() }),
  
  addCompany: (company) => set((state) => ({
    companies: [...state.companies, company],
    lastUpdated: new Date()
  })),
  
  updateCompany: (id, updates) => set((state) => ({
    companies: state.companies.map(company => 
      company.id === id ? { ...company, ...updates } : company
    ),
    lastUpdated: new Date()
  })),
  
  removeCompany: (id) => set((state) => ({
    companies: state.companies.filter(company => company.id !== id),
    lastUpdated: new Date()
  })),
  
  setLoading: (loading) => set({ loading }),
  
  setLastUpdated: (date) => set({ lastUpdated: date }),
  
  // Computed getters
  getCompanyById: (id) => get().companies.find(company => company.id === id),
  
  getCompanyByWebsite: (website) => get().companies.find(company => 
    company.website === website || company.baseUrl === website
  ),
  
  getCompanyCount: () => get().companies.length,
}));
