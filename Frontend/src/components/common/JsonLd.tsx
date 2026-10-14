import React from 'react';

interface JsonLdProps {
  data: Record<string, any>;
}

/**
 * JSON-LD component for structured data
 * Renders a <script type="application/ld+json"> tag with the provided data
 */
export const JsonLd: React.FC<JsonLdProps> = ({ data }) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
};
