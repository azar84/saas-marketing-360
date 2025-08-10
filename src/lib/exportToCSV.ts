import { BuiltWithCompany } from './builtwith';

/**
 * Convert BuiltWith company data to CSV format
 */
export function exportToCSV(companies: BuiltWithCompany[], filename: string = 'tech-discovery-results.csv'): void {
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
    .map(row => 
      row.map(field => {
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        const escaped = field.toString().replace(/"/g, '""');
        if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')) {
          return `"${escaped}"`;
        }
        return escaped;
      }).join(',')
    )
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

/**
 * Validate CSV data before export
 */
export function validateCSVData(companies: BuiltWithCompany[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!Array.isArray(companies)) {
    errors.push('Data must be an array');
    return { isValid: false, errors };
  }

  if (companies.length === 0) {
    errors.push('No companies to export');
    return { isValid: false, errors };
  }

  // Check for required fields
  companies.forEach((company, index) => {
    if (!company.domain) {
      errors.push(`Company at index ${index} is missing domain`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}
