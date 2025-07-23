import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { generateFAQCategoryMetadataWithJsonLd } from '@/lib/metadata';
import type { Metadata } from 'next';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const result = await generateFAQCategoryMetadataWithJsonLd(category);
  return result.metadata;
}

interface FAQ {
  id: number;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
  updatedAt: Date;
}

interface FAQCategory {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  color: string;
  faqs: FAQ[];
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

// Helper function to find category by slug
const findCategoryBySlug = async (slug: string): Promise<FAQCategory | null> => {
  try {
    const categories = await prisma.fAQCategory.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        icon: true,
        color: true,
        faqs: {
          select: {
            id: true,
            question: true,
            answer: true,
            sortOrder: true,
            isActive: true,
            updatedAt: true
          },
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        }
      },
      where: { isActive: true }
    });

    // Find category that matches the slug
    for (const category of categories) {
      const categorySlug = createSlug(category.name);
      if (categorySlug === slug) {
        return category;
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching FAQ category:', error);
    return null;
  }
};

interface PageProps {
  params: Promise<{
    category: string;
  }>;
}

export default async function CategoryFAQPage({ params }: PageProps) {
  const { category: categorySlug } = await params;
  const category = await findCategoryBySlug(categorySlug);
  
  if (!category) {
    notFound();
  }

  // Generate JSON-LD for this FAQ category page
  const metadataResult = await generateFAQCategoryMetadataWithJsonLd(categorySlug);

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
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <Link href="/faq" className="hover:text-blue-600 transition-colors">
            FAQ
          </Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900 font-medium">{category.name}</span>
        </nav>

        {/* Category Header */}
        <div className="text-center mb-16">
          {/* Category Icon */}
          {category.icon && (
            <div 
              className="w-20 h-20 rounded-xl mx-auto mb-6 flex items-center justify-center text-3xl"
              style={{ backgroundColor: `${category.color}20`, color: category.color }}
            >
              <span dangerouslySetInnerHTML={{ __html: category.icon }} />
            </div>
          )}
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {category.name}
          </h1>
          
          {category.description && (
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
              {category.description}
            </p>
          )}
          
          <p className="text-gray-500">
            {category.faqs.length} question{category.faqs.length !== 1 ? 's' : ''} in this category
          </p>
        </div>

        {/* FAQ List */}
        {category.faqs.length > 0 ? (
          <div className="max-w-4xl mx-auto space-y-6">
            {category.faqs.map((faq, index) => {
              const questionSlug = createSlug(faq.question);
              const faqUrl = `/faq/${categorySlug}/${questionSlug}`;
              
              return (
                <div
                  key={faq.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <Link href={faqUrl} className="block p-8 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 pr-4">
                        <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600">
                          {faq.question}
                        </h3>
                        <p className="text-gray-600 line-clamp-3">
                          {faq.answer.length > 150 
                            ? `${faq.answer.substring(0, 150)}...` 
                            : faq.answer
                          }
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-blue-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No FAQs in this category yet
            </h3>
            <p className="text-gray-600 mb-8">
              Check back later for new questions and answers.
            </p>
            <Link 
              href="/faq"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to All Categories
            </Link>
          </div>
        )}

        {/* Back to FAQ */}
        <div className="text-center mt-16">
          <Link 
            href="/faq"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to All FAQ Categories
          </Link>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 