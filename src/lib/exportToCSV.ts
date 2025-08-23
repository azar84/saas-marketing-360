/**
 * Convert company data to CSV format
 */

interface Company {
  domain?: string;
  organization?: string;
  email?: string;
  phone?: string;
  country?: string;
  city?: string;
  state?: string;
  postcode?: string;
  vertical?: string;
  employeeCount?: number;
  trafficRank?: number;
  qualityRank?: number;
  uniqueVisitors?: number;
  monthlyVisits?: number;
  firstIndexed?: string;
  lastIndexed?: string;
  firstDetected?: string;
  lastDetected?: string;
  emails?: string[];
  telephones?: string[];
  socialLinks?: string[];
  titles?: string[];
  techStack?: string[];
  enriched?: boolean;
}

export function exportToCSV(companies: Company[], filename: string = 'company-results.csv'): void {
  if (companies.length === 0) {
    console.warn('No companies to export');
    return;
  }

  // Define CSV headers
  const headers = [
    'Domain',
    'Organization',
    'Primary Email',
    'Primary Phone',
    'Country',
    'City',
    'State',
    'Postcode',
    'Vertical',
    'Employee Count',
    'Traffic Rank',
    'Quality Rank',
    'Unique Visitors',
    'Monthly Visits',
    'First Indexed',
    'Last Indexed',
    'First Detected',
    'Last Detected',
    'All Emails',
    'All Phones',
    'Social Links',
    'Job Titles',
    'Tech Stack',
    'Enriched'
  ];

  // Convert companies to CSV rows
  const csvRows = companies.map(company => [
    company.domain || '',
    company.organization || '',
    company.email || '',
    company.phone || '',
    company.country || '',
    company.city || '',
    company.state || '',
    company.postcode || '',
    company.vertical || '',
    company.employeeCount?.toString() || '',
    company.trafficRank?.toString() || '',
    company.qualityRank?.toString() || '',
    company.uniqueVisitors?.toString() || '',
    company.monthlyVisits?.toString() || '',
    company.firstIndexed || '',
    company.lastIndexed || '',
    company.firstDetected || '',
    company.lastDetected || '',
    company.emails ? company.emails.join('; ') : '',
    company.telephones ? company.telephones.join('; ') : '',
    company.socialLinks ? company.socialLinks.join('; ') : '',
    company.titles ? company.titles.join('; ') : '',
    company.techStack ? company.techStack.join('; ') : '',
    company.enriched ? 'Yes' : 'No'
  ]);

  // Combine headers and rows
  const csvContent = [headers, ...csvRows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  // Create and download the file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Generate a filename with timestamp
 */
export function generateFilename(technology: string): string {
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '-');
  const sanitizedTech = technology.replace(/[^a-zA-Z0-9]/g, '-');
  return `${sanitizedTech}-companies-${timestamp}.csv`;
}

/**
 * Format date for CSV export
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch {
    return dateString;
  }
}

export function validateCSVData(companies: Company[]): {
  valid: Company[];
  invalid: { company: Company; errors: string[] }[];
} {
  const valid: Company[] = [];
  const invalid: { company: Company; errors: string[] }[] = [];

  companies.forEach(company => {
    const errors: string[] = [];

    if (!company.domain) {
      errors.push('Missing domain');
    }

    if (company.domain && !company.domain.includes('.')) {
      errors.push('Invalid domain format');
    }

    if (company.email && !company.email.includes('@')) {
      errors.push('Invalid email format');
    }

    if (errors.length === 0) {
      valid.push(company);
    } else {
      invalid.push({ company, errors });
    }
  });

  return { valid, invalid };
}
