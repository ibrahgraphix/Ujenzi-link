import React from 'react';

interface SeoProps {
  title: string;
  description: string;
  canonicalPath?: string;
  image?: string;
  noindex?: boolean;
}

export const Seo: React.FC<SeoProps> = ({
  title,
  description,
  canonicalPath = '',
  image = 'https://ujenzi-link.com/og-image.jpg',
  noindex = false,
}) => {
  const fullTitle = title.includes('Ujenzi Link') ? title : `${title} | Ujenzi Link`;
  const canonicalUrl = `https://ujenzi-link.com${canonicalPath}`;

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      {noindex && <meta name="robots" content="noindex" />}
    </>
  );
};
