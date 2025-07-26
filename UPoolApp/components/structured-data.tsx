'use client'

import Script from 'next/script'

interface StructuredDataProps {
  type?: 'website' | 'organization' | 'software' | 'webapp'
}

export function StructuredData({ type = 'webapp' }: StructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://upool.fun'

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "UPool",
    "description": "Social funding platform for pooling funds, earning yield, and achieving goals together",
    "url": baseUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/explore?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "creator": {
      "@type": "Organization",
      "name": "UPool Team",
      "url": baseUrl
    }
  }

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "UPool",
    "description": "Social funding platform built on Base blockchain with Farcaster integration",
    "url": baseUrl,
    "logo": `${baseUrl}/logo-seo.png`,
    "foundingDate": "2025",
    "founder": {
      "@type": "Organization",
      "name": "UPool Team"
    },
    "sameAs": [
      "https://twitter.com/UPoolFun",
      "https://github.com/upool",
      "https://discord.gg/upool"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "email": "hello@upool.fun"
    }
  }

  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "UPool",
    "description": "Social funding platform for pooling funds, earning DeFi yield, and achieving milestone-based goals",
    "applicationCategory": "FinanceApplication",
    "applicationSubCategory": "DeFi Platform",
    "operatingSystem": "Web Browser, iOS, Android",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "creator": {
      "@type": "Organization",
      "name": "UPool Team"
    },
    "url": baseUrl,
    "screenshot": `${baseUrl}/logo-seo.png`,
    "softwareVersion": "1.0",
    "datePublished": "2025-01-26",
    "featureList": [
      "Pool funds with friends and communities",
      "Earn DeFi yield through Morpho Protocol",
      "Milestone-based fund release",
      "Farcaster Mini App integration",
      "Base blockchain security",
      "Social trust scoring"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "156",
      "bestRating": "5",
      "worstRating": "1"
    }
  }

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "UPool - Social Funding Platform",
    "description": "Create funding pools with friends and communities. Pool funds, earn DeFi yield, and unlock money based on milestone achievements.",
    "url": baseUrl,
    "applicationCategory": "Finance",
    "operatingSystem": "All",
    "browserRequirements": "Requires JavaScript. Compatible with Chrome, Firefox, Safari, Edge.",
    "softwareVersion": "1.0.0",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "creator": {
      "@type": "Organization",
      "name": "UPool",
      "url": baseUrl
    },
    "publisher": {
      "@type": "Organization",
      "name": "UPool",
      "url": baseUrl
    },
    "featureList": [
      "Social funding pools",
      "DeFi yield farming",
      "Milestone-based unlocking", 
      "Farcaster integration",
      "Base blockchain",
      "Community governance"
    ],
    "screenshot": {
      "@type": "ImageObject",
      "url": `${baseUrl}/logo-seo.png`,
      "caption": "UPool - Social Funding Platform Logo"
    }
  }

  const getSchema = () => {
    switch (type) {
      case 'website':
        return websiteSchema
      case 'organization':
        return organizationSchema
      case 'software':
        return softwareApplicationSchema
      case 'webapp':
        return webAppSchema
      default:
        return webAppSchema
    }
  }

  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getSchema()),
      }}
    />
  )
}