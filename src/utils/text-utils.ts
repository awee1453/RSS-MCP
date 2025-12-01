/**
 * Text direction and language utilities for RTL support
 */

/**
 * Detect if text is primarily in Arabic script
 */
export function isArabicText(text: string): boolean {
    if (!text) return false;

    // Arabic Unicode ranges: \u0600-\u06FF (Arabic), \u0750-\u077F (Arabic Supplement)
    const arabicPattern = /[\u0600-\u06FF\u0750-\u077F]/;
    const arabicChars = text.match(/[\u0600-\u06FF\u0750-\u077F]/g);

    if (!arabicChars) return false;

    // If more than 30% of characters are Arabic, consider it Arabic text
    const totalChars = text.replace(/\s/g, '').length;
    return (arabicChars.length / totalChars) > 0.3;
}

/**
 * Detect if text is in RTL language (Arabic, Hebrew, Persian, Urdu)
 */
export function isRTLText(text: string): boolean {
    if (!text) return false;

    // RTL Unicode ranges
    const rtlPattern = /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return rtlPattern.test(text);
}

/**
 * Get text direction for proper display
 */
export function getTextDirection(text: string): 'rtl' | 'ltr' {
    return isRTLText(text) ? 'rtl' : 'ltr';
}

/**
 * Format text with direction indicator for display
 */
export function formatTextWithDirection(text: string): string {
    const direction = getTextDirection(text);

    if (direction === 'rtl') {
        // Add RTL mark and directional formatting
        return `\u200F${text}\u200F`; // RIGHT-TO-LEFT MARK
    }

    return text;
}

/**
 * Detect language from text
 */
export function detectLanguage(text: string): string {
    if (!text) return 'unknown';

    // Arabic
    if (/[\u0600-\u06FF]/.test(text)) return 'ar';

    // Hebrew
    if (/[\u0590-\u05FF]/.test(text)) return 'he';

    // Persian/Farsi (uses Arabic script with additions)
    if (/[\u06A9\u06AF\u067E\u0686]/.test(text)) return 'fa';

    // Urdu (uses Arabic script with additions)
    if (/[\u0679\u0688\u0691\u0698]/.test(text)) return 'ur';

    // Turkish
    if (/[ğĞıİöÖüÜşŞçÇ]/.test(text)) return 'tr';

    // Default to English
    return 'en';
}

/**
 * Format article output with proper RTL support
 */
export interface FormattedArticle {
    id: string;
    title: string;
    title_direction: 'rtl' | 'ltr';
    link: string;
    pub_date: string;
    summary: string;
    summary_direction: 'rtl' | 'ltr';
    author: string | null;
    categories: string[];
    language: string;
}

export function formatArticleWithRTL(article: {
    id: string;
    title: string;
    link: string;
    pub_date: string;
    summary: string;
    author: string | null;
    categories: string[];
}): FormattedArticle {
    return {
        id: article.id,
        title: formatTextWithDirection(article.title),
        title_direction: getTextDirection(article.title),
        link: article.link,
        pub_date: article.pub_date,
        summary: formatTextWithDirection(article.summary),
        summary_direction: getTextDirection(article.summary),
        author: article.author,
        categories: article.categories,
        language: detectLanguage(article.title + ' ' + article.summary)
    };
}
