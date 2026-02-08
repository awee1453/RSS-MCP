import { XMLParser, XMLBuilder } from 'fast-xml-parser';

/**
 * OPML Import/Export Handler
 */
export class OPMLHandler {
    /**
     * Parse OPML file content
     */
    static parseOPML(opmlContent: string): { feeds: any[]; error: string | null } {
        try {
            const parser = new XMLParser({
                ignoreAttributes: false,
                attributeNamePrefix: '@_'
            });

            const result = parser.parse(opmlContent);
            const feeds: any[] = [];

            // Navigate OPML structure
            const body = result.opml?.body;
            if (!body) {
                return { feeds: [], error: 'Invalid OPML format: missing body' };
            }

            // Extract outlines (feeds)
            const extractFeeds = (outline: any) => {
                if (Array.isArray(outline)) {
                    outline.forEach(item => extractFeeds(item));
                } else if (outline) {
                    if (outline['@_xmlUrl']) {
                        feeds.push({
                            title: outline['@_title'] || outline['@_text'] || 'Untitled Feed',
                            url: outline['@_xmlUrl'],
                            description: outline['@_description'] || null,
                            category: outline['@_category'] || null,
                            htmlUrl: outline['@_htmlUrl'] || null
                        });
                    }

                    // Recursively check for nested outlines
                    if (outline.outline) {
                        extractFeeds(outline.outline);
                    }
                }
            };

            extractFeeds(body.outline);

            return { feeds, error: null };

        } catch (error: any) {
            return { feeds: [], error: `OPML parsing error: ${error.message}` };
        }
    }

    /**
     * Generate OPML content from feeds
     */
    static generateOPML(feeds: any[], title: string = 'RSS Feeds'): string {
        const outlines = feeds.map(feed => ({
            '@_text': feed.title,
            '@_title': feed.title,
            '@_type': 'rss',
            '@_xmlUrl': feed.url,
            '@_htmlUrl': feed.url,
            '@_description': feed.description || ''
        }));

        const opmlStructure = {
            '?xml': {
                '@_version': '1.0',
                '@_encoding': 'UTF-8'
            },
            opml: {
                '@_version': '2.0',
                head: {
                    title: title,
                    dateCreated: new Date().toUTCString()
                },
                body: {
                    outline: outlines
                }
            }
        };

        const builder = new XMLBuilder({
            ignoreAttributes: false,
            attributeNamePrefix: '@_',
            format: true,
            indentBy: '  '
        });

        return builder.build(opmlStructure);
    }

    /**
     * Validate OPML content
     */
    static validateOPML(opmlContent: string): { valid: boolean; error: string | null } {
        try {
            const parser = new XMLParser();
            const result = parser.parse(opmlContent);

            if (!result.opml) {
                return { valid: false, error: 'Not a valid OPML file: missing opml root element' };
            }

            if (!result.opml.body) {
                return { valid: false, error: 'Invalid OPML: missing body element' };
            }

            return { valid: true, error: null };

        } catch (error: any) {
            return { valid: false, error: `OPML validation error: ${error.message}` };
        }
    }

    /**
     * Create OPML from categorized feeds
     */
    static generateCategorizedOPML(feedsByCategory: { [category: string]: any[] }, title: string = 'RSS Feeds'): string {
        const outlines = Object.entries(feedsByCategory).map(([category, feeds]) => ({
            '@_text': category,
            '@_title': category,
            outline: feeds.map(feed => ({
                '@_text': feed.title,
                '@_title': feed.title,
                '@_type': 'rss',
                '@_xmlUrl': feed.url,
                '@_htmlUrl': feed.url,
                '@_description': feed.description || ''
            }))
        }));

        const opmlStructure = {
            '?xml': {
                '@_version': '1.0',
                '@_encoding': 'UTF-8'
            },
            opml: {
                '@_version': '2.0',
                head: {
                    title: title,
                    dateCreated: new Date().toUTCString()
                },
                body: {
                    outline: outlines
                }
            }
        };

        const builder = new XMLBuilder({
            ignoreAttributes: false,
            attributeNamePrefix: '@_',
            format: true,
            indentBy: '  '
        });

        return builder.build(opmlStructure);
    }
}
