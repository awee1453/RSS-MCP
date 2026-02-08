import Parser from 'rss-parser';

export interface ParsedFeed {
    title: string;
    description: string;
    link: string;
    items: ParsedArticle[];
}

export interface ParsedArticle {
    title: string;
    link: string;
    pubDate: string;
    description: string | null;
    content: string | null;
    author: string | null;
    categories: string[];
    guid: string;
}

/**
 * RSS/Atom feed parser
 */
export class FeedParser {
    private parser: Parser;

    constructor() {
        this.parser = new Parser({
            timeout: 10000,
            customFields: {
                feed: ['language', 'copyright'],
                item: [
                    ['content:encoded', 'contentEncoded'],
                    ['media:content', 'mediaContent']
                ]
            }
        });
    }

    /**
     * Parse RSS/Atom feed from XML string
     */
    async parse(xmlContent: string): Promise<ParsedFeed> {
        try {
            const feed = await this.parser.parseString(xmlContent);

            const items: ParsedArticle[] = feed.items.map(item => {
                // Extract content (prefer full content over description)
                const content = (item as any).contentEncoded ||
                    (item as any)['content:encoded'] ||
                    item.content ||
                    null;

                // Extract categories
                const categories: string[] = [];
                if (item.categories) {
                    categories.push(...item.categories);
                }

                // Create unique GUID
                const guid = item.guid || item.link || `${item.title}-${item.pubDate}`;

                return {
                    title: item.title || 'Untitled',
                    link: item.link || '',
                    pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
                    description: item.contentSnippet || item.summary || null,
                    content,
                    author: item.creator || item.author || null,
                    categories,
                    guid
                };
            });

            return {
                title: feed.title || 'Untitled Feed',
                description: feed.description || '',
                link: feed.link || '',
                items
            };
        } catch (error: any) {
            throw new Error(`Feed parsing failed: ${error.message}`);
        }
    }

    /**
     * Validate if XML string is a valid RSS/Atom feed
     */
    async validate(xmlContent: string): Promise<{ valid: boolean; error?: string }> {
        try {
            // Basic XML check
            if (!xmlContent.includes('<rss') &&
                !xmlContent.includes('<feed') &&
                !xmlContent.includes('<rdf:RDF')) {
                return {
                    valid: false,
                    error: 'Content does not appear to be an RSS or Atom feed'
                };
            }

            await this.parser.parseString(xmlContent);
            return { valid: true };
        } catch (error: any) {
            return {
                valid: false,
                error: `Invalid feed format: ${error.message}`
            };
        }
    }
}
