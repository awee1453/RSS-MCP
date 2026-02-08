import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

/**
 * Translation Service using MCP Sampling
 * 
 * This service uses the MCP host's AI capabilities (Claude, etc.) to translate text
 * No external translation API needed - all translations happen through the MCP client
 */
export class TranslationService {
    private static server: McpServer | null = null;

    /**
     * Initialize the translation service with MCP server instance
     */
    static initialize(server: McpServer) {
        this.server = server;
    }

    /**
     * Translate text using MCP sampling (AI assistant)
     */
    static async translate(
        text: string,
        targetLang: string,
        sourceLang?: string
    ): Promise<{
        success: boolean;
        translatedText: string;
        sourceLang: string;
        error?: string;
    }> {
        if (!text || text.trim().length === 0) {
            return {
                success: false,
                translatedText: '',
                sourceLang: sourceLang || 'unknown',
                error: 'Empty text provided'
            };
        }

        // If no MCP server available, return original
        if (!this.server) {
            console.warn('MCP server not initialized, translation unavailable');
            return {
                success: true,
                translatedText: text,
                sourceLang: sourceLang || 'auto',
                error: 'MCP sampling not available'
            };
        }

        try {
            const targetLanguageName = this.getLanguageName(targetLang);
            const sourceHint = sourceLang ? `from ${this.getLanguageName(sourceLang)}` : '';

            const prompt = `Translate the following text ${sourceHint} to ${targetLanguageName}.

Text to translate:
"""
${text}
"""

Return ONLY the translated text, nothing else. No explanations, no JSON format, just the pure translated text.`;

            // Use MCP sampling to request translation from AI assistant
            const result = await this.server.request({
                method: 'sampling/createMessage',
                params: {
                    messages: [{
                        role: 'user',
                        content: {
                            type: 'text',
                            text: prompt
                        }
                    }],
                    maxTokens: 2000,
                    temperature: 0.3 // Lower temperature for more consistent translations
                }
            }, {});

            // Extract translated text from response
            const translatedText = result.content?.[0]?.text?.trim() || text;

            return {
                success: true,
                translatedText: translatedText,
                sourceLang: sourceLang || 'auto'
            };
        } catch (error: any) {
            console.error('Translation error:', error);

            // Fallback: return original text
            return {
                success: false,
                translatedText: text,
                sourceLang: sourceLang || 'unknown',
                error: `Translation failed: ${error.message}`
            };
        }
    }

    /**
     * Get human-readable language name from code
     */
    private static getLanguageName(code: string): string {
        const languages: Record<string, string> = {
            'tr': 'Turkish',
            'en': 'English',
            'ar': 'Arabic',
            'ku': 'Kurdish (Kurmanji)',
            'ckb': 'Kurdish (Sorani)',
            'fa': 'Persian (Farsi)',
            'he': 'Hebrew',
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German',
            'it': 'Italian',
            'pt': 'Portuguese',
            'ru': 'Russian',
            'zh': 'Chinese',
            'ja': 'Japanese',
            'ko': 'Korean'
        };
        return languages[code.toLowerCase()] || code.toUpperCase();
    }
}
