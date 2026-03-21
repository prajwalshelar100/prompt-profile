import { ExtractedProductData } from '../types';

export const extractProductFromUrl = async (url: string): Promise<ExtractedProductData> => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();

    const titleMatch = html.match(/<title>(.*?)<\/title>/is) || 
                       html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["'][^>]*>/is);
    let title = titleMatch ? (titleMatch[1] || titleMatch[2] || '').trim() : 'Unknown Product';
    
    // Basic clean-ups for typical e-comm titles (e.g. "Product Name | Amazon")
    title = title.replace(/\s*[-|]\s*.*$/, '');

    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/is) || 
                      html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["'][^>]*>/is) ||
                      html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/is);
    const description = descMatch ? (descMatch[1] || descMatch[2] || '').trim() : 'No description found from link.';

    return {
      product_name: title || 'Linked Product',
      category: 'Link Entry',
      ingredients: 'N/A',
      notes: description,
      raw_text: description // Store the raw meta description for user to edit if needed
    };
  } catch (e: any) {
    throw new Error('Failed to parse URL: ' + e.message);
  }
};
