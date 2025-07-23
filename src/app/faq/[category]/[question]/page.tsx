import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { generateFAQQuestionMetadataWithJsonLd } from '@/lib/metadata';
import type { Metadata } from 'next';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ category: string; question: string }> }): Promise<Metadata> {
  const { category, question } = await params;
  const result = await generateFAQQuestionMetadataWithJsonLd(category, question);
  return result.metadata;
}

interface FAQ {
  id: number;
  question: string;
  answer: string;
  updatedAt: Date;
  category: {
    id: number;
    name: string;
    description: string | null;
    icon: string | null;
    color: string;
  };
}

// Helper function to create URL-friendly slugs
const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-')      // Replace multiple hyphens with single
    .trim()
    .substring(0, 100);       // Limit length
};

// Helper function to find FAQ by category and question slugs
const findFAQBySlug = async (categorySlug: string, questionSlug: string): Promise<FAQ | null> => {
  try {
    const faqs = await prisma.fAQ.findMany({
      select: {
        id: true,
        question: true,
        answer: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true,
            description: true,
            icon: true,
            color: true
          }
        }
      },
      where: { 
        isActive: true,
        category: {
          isActive: true
        }
      },
      orderBy: { sortOrder: 'asc' }
    });

    // Find FAQ that matches both category and question slugs
    for (const faq of faqs) {
      if (!faq.category) continue; // Skip if no category
      
      const faqCategorySlug = createSlug(faq.category.name);
      const faqQuestionSlug = createSlug(faq.question);
      
      if (faqCategorySlug === categorySlug && faqQuestionSlug === questionSlug) {
        return faq as FAQ; // Type assertion since we've checked category exists
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching FAQ:', error);
    return null;
  }
};

// Helper function to get related FAQs from the same category
const getRelatedFAQs = async (categoryId: number, currentFaqId: number): Promise<Array<{id: number, question: string}>> => {
  try {
    const faqs = await prisma.fAQ.findMany({
      select: {
        id: true,
        question: true
      },
      where: {
        categoryId,
        isActive: true,
        id: { not: currentFaqId }
      },
      orderBy: { sortOrder: 'asc' },
      take: 5
    });

    return faqs;
  } catch (error) {
    console.error('Error fetching related FAQs:', error);
    return [];
  }
};

interface PageProps {
  params: Promise<{
    category: string;
    question: string;
  }>;
}

export default async function FAQQuestionPage({ params }: PageProps) {
  const { category: categorySlug, question: questionSlug } = await params;
  const faq = await findFAQBySlug(categorySlug, questionSlug);
  
  if (!faq) {
    notFound();
  }

  const relatedFAQs = await getRelatedFAQs(faq.category.id, faq.id);
  
  // Generate JSON-LD for this FAQ question page
  const metadataResult = await generateFAQQuestionMetadataWithJsonLd(categorySlug, questionSlug);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* JSON-LD Structured Data */}
      {metadataResult.jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: metadataResult.jsonLd }}
        />
      )}
      
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8 flex-wrap">
          <Link href="/faq" className="hover:text-blue-600 transition-colors">
            FAQ
          </Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <Link 
            href={`/faq/${categorySlug}`} 
            className="hover:text-blue-600 transition-colors truncate"
          >
            {faq.category.name}
          </Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900 font-medium truncate">Question</span>
        </nav>

        {/* FAQ Content */}
        <div className="max-w-4xl mx-auto">
          {/* Category Badge */}
          <div className="flex items-center mb-6">
            {faq.category.icon && (
              <div 
                className="w-8 h-8 rounded-lg mr-3 flex items-center justify-center text-sm"
                style={{ backgroundColor: `${faq.category.color}20`, color: faq.category.color }}
              >
                <span dangerouslySetInnerHTML={{ __html: faq.category.icon }} />
              </div>
            )}
            <span 
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{ backgroundColor: `${faq.category.color}20`, color: faq.category.color }}
            >
              {faq.category.name}
            </span>
          </div>

          {/* Question */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 leading-tight">
            {faq.question}
          </h1>

          {/* Answer */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-12">
            <div 
              className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: faq.answer.replace(/\n/g, '<br>') }}
            />
            
            {/* Last Updated */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Last updated: {new Date(faq.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Related FAQs */}
          {relatedFAQs.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Related Questions
              </h2>
              <div className="space-y-4">
                {relatedFAQs.map((relatedFaq) => {
                  const relatedQuestionSlug = createSlug(relatedFaq.question);
                  const relatedUrl = `/faq/${categorySlug}/${relatedQuestionSlug}`;
                  
                  return (
                    <Link
                      key={relatedFaq.id}
                      href={relatedUrl}
                      className="block bg-white rounded-lg border border-gray-100 p-6 hover:shadow-md hover:border-gray-200 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors pr-4">
                          {relatedFaq.question}
                        </h3>
                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Link 
              href={`/faq/${categorySlug}`}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to {faq.category.name}
            </Link>
            
            <Link 
              href="/faq"
              className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors"
            >
              All FAQ Categories
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Help Section */}
        <div className="text-center mt-16">
          <div className="bg-blue-50 rounded-xl p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Still need help?
            </h3>
            <p className="text-gray-600 mb-6">
              If this FAQ didn't answer your question, our support team is here to help!
            </p>
            <Link 
              href="/contact"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Contact Support
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.456L3 21l2.456-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
              </svg>
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 