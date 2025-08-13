import { 
  DataValidationResult, 
  ValidationIssue, 
  EnrichedCompanyData, 
  WebsiteScrapeData,
  LLMProcessedData 
} from './types';

export class EnrichmentDataValidator {
  
  /**
   * Validate enriched company data
   */
  validateEnrichedData(data: EnrichedCompanyData): DataValidationResult {
    const issues: ValidationIssue[] = [];
    let score = 100;
    
    // Validate company information
    const companyIssues = this.validateCompanyInfo(data);
    issues.push(...companyIssues);
    
    // Validate contact information
    const contactIssues = this.validateContactInfo(data);
    issues.push(...contactIssues);
    
    // Validate business details
    const businessIssues = this.validateBusinessDetails(data);
    issues.push(...businessIssues);
    
    // Validate technology stack
    const techIssues = this.validateTechnologyStack(data);
    issues.push(...techIssues);
    
    // Validate market information
    const marketIssues = this.validateMarketInfo(data);
    issues.push(...marketIssues);
    
    // Calculate score based on issues
    score = this.calculateScore(issues);
    
    // Generate suggestions
    const suggestions = this.generateSuggestions(issues);
    
    return {
      isValid: score >= 70,
      score,
      issues,
      suggestions,
      confidence: this.getConfidenceLevel(score)
    };
  }

  /**
   * Validate company information
   */
  private validateCompanyInfo(data: EnrichedCompanyData): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    // Company name validation
    if (!data.companyName || data.companyName.trim().length === 0) {
      issues.push({
        field: 'companyName',
        issue: 'Company name is missing',
        severity: 'error',
        suggestion: 'Extract company name from website title or main heading',
        data: data.companyName
      });
    } else if (data.companyName.length < 3) {
      issues.push({
        field: 'companyName',
        issue: 'Company name is too short',
        severity: 'warning',
        suggestion: 'Verify company name extraction from website',
        data: data.companyName
      });
    }
    
    // Website validation
    if (!data.website || !this.isValidUrl(data.website)) {
      issues.push({
        field: 'website',
        issue: 'Invalid or missing website URL',
        severity: 'error',
        suggestion: 'Ensure website URL is properly formatted',
        data: data.website
      });
    }
    
    // Description validation
    if (!data.description || data.description.length < 20) {
      issues.push({
        field: 'description',
        issue: 'Company description is too short or missing',
        severity: 'warning',
        suggestion: 'Extract longer description from website content',
        data: data.description
      });
    }
    
    return issues;
  }

  /**
   * Validate contact information
   */
  private validateContactInfo(data: EnrichedCompanyData): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    // Email validation
    if (data.contact?.email) {
      if (!this.isValidEmail(data.contact.email)) {
        issues.push({
          field: 'contact.email',
          issue: 'Invalid email format',
          severity: 'error',
          suggestion: 'Verify email extraction and format',
          data: data.contact.email
        });
      }
    } else {
      issues.push({
        field: 'contact.email',
        issue: 'No email address found',
        severity: 'warning',
        suggestion: 'Look for email addresses in contact sections or footer',
        data: null
      });
    }
    
    // Phone validation
    if (data.contact?.phone) {
      if (!this.isValidPhone(data.contact.phone)) {
        issues.push({
          field: 'contact.phone',
          issue: 'Invalid phone number format',
          severity: 'warning',
          suggestion: 'Verify phone number extraction and format',
          data: data.contact.phone
        });
      }
    } else {
      issues.push({
        field: 'contact.phone',
        issue: 'No phone number found',
        severity: 'warning',
        suggestion: 'Look for phone numbers in contact sections or footer',
        data: null
      });
    }
    
    // Address validation
    if (data.contact?.address) {
      if (!this.isValidAddress(data.contact.address)) {
        issues.push({
          field: 'contact.address',
          issue: 'Address format may be incomplete',
          severity: 'info',
          suggestion: 'Verify address completeness from website',
          data: data.contact.address
        });
      }
    }
    
    return issues;
  }

  /**
   * Validate business details
   */
  private validateBusinessDetails(data: EnrichedCompanyData): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    // Industry validation
    if (!data.business?.industry || data.business.industry.trim().length === 0) {
      issues.push({
        field: 'business.industry',
        issue: 'Industry information is missing',
        severity: 'warning',
        suggestion: 'Extract industry from website content or meta tags',
        data: data.business?.industry
      });
    }
    
    // Employee count validation
    if (data.business?.employeeCount) {
      if (typeof data.business.employeeCount === 'string') {
        if (!this.isValidEmployeeCount(data.business.employeeCount)) {
          issues.push({
            field: 'business.employeeCount',
            issue: 'Employee count format is unclear',
            severity: 'info',
            suggestion: 'Standardize employee count format',
            data: data.business.employeeCount
          });
        }
      }
    }
    
    return issues;
  }

  /**
   * Validate technology stack
   */
  private validateTechnologyStack(data: EnrichedCompanyData): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    // Technology platforms validation
    if (!data.technology?.platforms || data.technology.platforms.length === 0) {
      issues.push({
        field: 'technology.platforms',
        issue: 'No technology platforms detected',
        severity: 'warning',
        suggestion: 'Look for technology indicators in HTML, meta tags, or content',
        data: data.technology?.platforms
      });
    } else {
      // Validate individual technology entries
      data.technology.platforms.forEach((tech, index) => {
        if (!tech || tech.trim().length === 0) {
          issues.push({
            field: `technology.platforms[${index}]`,
            issue: 'Empty technology platform entry',
            severity: 'warning',
            suggestion: 'Remove empty entries and validate technology detection',
            data: tech
          });
        }
      });
    }
    
    return issues;
  }

  /**
   * Validate market information
   */
  private validateMarketInfo(data: EnrichedCompanyData): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    // Target customers validation
    if (!data.market?.targetCustomers || data.market.targetCustomers.length === 0) {
      issues.push({
        field: 'market.targetCustomers',
        issue: 'Target customer information is missing',
        severity: 'info',
        suggestion: 'Extract target customer information from website content',
        data: data.market?.targetCustomers
      });
    }
    
    return issues;
  }

  /**
   * Validate website scraping data
   */
  validateWebsiteData(data: WebsiteScrapeData): DataValidationResult {
    const issues: ValidationIssue[] = [];
    let score = 100;
    
    // Check if scraping was successful
    if (data.status !== 'success') {
      issues.push({
        field: 'status',
        issue: `Website scraping failed with status: ${data.status}`,
        severity: 'error',
        suggestion: 'Investigate scraping failures and improve error handling',
        data: data.status
      });
      score -= 30;
    }
    
    // Check content quality
    if (!data.title || data.title.length < 5) {
      issues.push({
        field: 'title',
        issue: 'Website title is missing or too short',
        severity: 'warning',
        suggestion: 'Improve title extraction from HTML',
        data: data.title
      });
      score -= 10;
    }
    
    if (!data.description || data.description.length < 20) {
      issues.push({
        field: 'description',
        issue: 'Website description is missing or too short',
        severity: 'warning',
        suggestion: 'Improve description extraction from meta tags or content',
        data: data.description
      });
      score -= 10;
    }
    
    // Check contact information extraction
    const contactScore = this.assessContactExtraction(data);
    score += contactScore;
    
    // Check technology detection
    if (!data.technologies || data.technologies.length === 0) {
      issues.push({
        field: 'technologies',
        issue: 'No technologies detected',
        severity: 'info',
        suggestion: 'Improve technology detection patterns',
        data: data.technologies
      });
      score -= 5;
    }
    
    return {
      isValid: score >= 70,
      score: Math.max(0, score),
      issues,
      suggestions: this.generateSuggestions(issues),
      confidence: this.getConfidenceLevel(score)
    };
  }

  /**
   * Validate LLM processed data
   */
  validateLLMData(data: LLMProcessedData): DataValidationResult {
    const issues: ValidationIssue[] = [];
    let score = 100;
    
    // Check company information
    if (!data.company?.legalName || data.company.legalName.trim().length === 0) {
      issues.push({
        field: 'company.legalName',
        issue: 'Company legal name is missing from LLM output',
        severity: 'error',
        suggestion: 'Improve LLM prompt to extract company names',
        data: data.company?.legalName
      });
      score -= 15;
    }
    
    if (!data.company?.industry || data.company.industry.trim().length === 0) {
      issues.push({
        field: 'company.industry',
        issue: 'Industry classification is missing from LLM output',
        severity: 'warning',
        suggestion: 'Enhance LLM prompt to include industry classification',
        data: data.company?.industry
      });
      score -= 10;
    }
    
    // Check business details
    if (!data.business?.targetCustomers || data.business.targetCustomers.length === 0) {
      issues.push({
        field: 'business.targetCustomers',
        issue: 'Target customer information is missing from LLM output',
        severity: 'info',
        suggestion: 'Include target customer extraction in LLM prompt',
        data: data.business?.targetCustomers
      });
      score -= 5;
    }
    
    // Check technology information
    if (!data.technology?.platforms || data.technology.platforms.length === 0) {
      issues.push({
        field: 'technology.platforms',
        issue: 'Technology platforms are missing from LLM output',
        severity: 'warning',
        suggestion: 'Enhance LLM prompt to extract technology information',
        data: data.technology?.platforms
      });
      score -= 10;
    }
    
    return {
      isValid: score >= 70,
      score: Math.max(0, score),
      issues,
      suggestions: this.generateSuggestions(issues),
      confidence: this.getConfidenceLevel(score)
    };
  }

  /**
   * Assess contact information extraction quality
   */
  private assessContactExtraction(data: WebsiteScrapeData): number {
    let score = 0;
    
    if (data.contactInfo?.emails && data.contactInfo.emails.length > 0) {
      score += 20;
    }
    
    if (data.contactInfo?.phones && data.contactInfo.phones.length > 0) {
      score += 20;
    }
    
    if (data.contactInfo?.addresses && data.contactInfo.addresses.length > 0) {
      score += 10;
    }
    
    return score;
  }

  /**
   * Calculate validation score
   */
  private calculateScore(issues: ValidationIssue[]): number {
    let score = 100;
    
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'error':
          score -= 15;
          break;
        case 'warning':
          score -= 10;
          break;
        case 'info':
          score -= 5;
          break;
      }
    });
    
    return Math.max(0, score);
  }

  /**
   * Generate improvement suggestions
   */
  private generateSuggestions(issues: ValidationIssue[]): string[] {
    const suggestions: string[] = [];
    
    // Group suggestions by field type
    const fieldGroups = new Map<string, string[]>();
    
    issues.forEach(issue => {
      const field = issue.field.split('.')[0];
      if (!fieldGroups.has(field)) {
        fieldGroups.set(field, []);
      }
      fieldGroups.get(field)!.push(issue.suggestion);
    });
    
    // Generate field-specific suggestions
    fieldGroups.forEach((suggestions, field) => {
      if (suggestions.length > 0) {
        suggestions.push(`Focus on improving ${field} extraction and validation`);
      }
    });
    
    // Add general suggestions
    if (issues.length > 0) {
      suggestions.push('Review and improve data extraction patterns');
      suggestions.push('Enhance LLM prompts for better data quality');
      suggestions.push('Implement additional validation rules');
    }
    
    return suggestions;
  }

  /**
   * Get confidence level based on score
   */
  private getConfidenceLevel(score: number): 'low' | 'medium' | 'high' {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  }

  /**
   * Validation helper methods
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)\.]/g, ''));
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private isValidAddress(address: any): boolean {
    if (typeof address === 'string') {
      return address.length > 10;
    }
    return false;
  }

  private isValidEmployeeCount(count: string): boolean {
    // Check for common employee count patterns
    const patterns = [
      /^\d+$/,                    // "50"
      /^\d+\-\d+$/,              // "50-100"
      /^\d+\+$/,                 // "50+"
      /^under\s+\d+$/i,          // "under 50"
      /^over\s+\d+$/i            // "over 50"
    ];
    
    return patterns.some(pattern => pattern.test(count.trim()));
  }
}
