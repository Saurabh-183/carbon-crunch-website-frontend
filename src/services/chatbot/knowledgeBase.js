/**
 * Knowledge Base Service
 * Manages FAQ data and searches for relevant information
 */

// Import knowledge base files
import energyManagerKB from '../chatKnowledge/energyManager.json';
import plantAdminKB from '../chatKnowledge/plantAdmin.json';
import orgAdminKB from '../chatKnowledge/orgAdmin.json';
import commonKB from '../chatKnowledge/common.json';

const knowledgeBases = {
    energy_manager: energyManagerKB,
    plant_admin: plantAdminKB,
    org_admin: orgAdminKB,
    common: commonKB,
};

const normalizeText = (text = '') =>
    text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

const tokenize = (text = '') =>
    normalizeText(text)
        .split(' ')
        .filter((token) => token.length > 2);

const editDistance = (a = '', b = '') => {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;

    const matrix = Array.from({ length: a.length + 1 }, () => []);

    for (let i = 0; i <= a.length; i += 1) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j += 1) matrix[0][j] = j;

    for (let i = 1; i <= a.length; i += 1) {
        for (let j = 1; j <= b.length; j += 1) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            );
        }
    }

    return matrix[a.length][b.length];
};

const hasNearTokenMatch = (queryToken, targetTokens) => {
    if (queryToken.length < 4) return false;

    return targetTokens.some((token) => {
        if (Math.abs(token.length - queryToken.length) > 1) return false;
        return editDistance(queryToken, token) <= 1;
    });
};

/**
 * Search for relevant FAQs based on context and query
 */
export const searchKnowledge = (query, context) => {
    const queryLower = query.toLowerCase();
    const { dashboard, page } = context;

    const results = [];

    // Get knowledge base for current dashboard
    const kb = knowledgeBases[dashboard] || {};
    const commonKnowledge = knowledgeBases.common || {};

    // Search in current page's FAQs first (highest priority)
    if (kb[page]?.faqs) {
        const pageResults = searchInFAQs(kb[page].faqs, queryLower, 'high');
        results.push(...pageResults);
    }

    // Search in all dashboard FAQs
    Object.keys(kb).forEach((pageKey) => {
        if (pageKey !== page && kb[pageKey]?.faqs) {
            const pageResults = searchInFAQs(kb[pageKey].faqs, queryLower, 'medium');
            results.push(...pageResults);
        }
    });

    // Search in common knowledge
    Object.keys(commonKnowledge).forEach((category) => {
        if (commonKnowledge[category]?.faqs) {
            const commonResults = searchInFAQs(
                commonKnowledge[category].faqs,
                queryLower,
                'low'
            );
            results.push(...commonResults);
        }
    });

    // Sort by priority and relevance score
    results.sort((a, b) => {
        if (a.priority !== b.priority) {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return b.score - a.score;
    });

    // Return top 5 most relevant FAQs
    return results.slice(0, 5);
};

/**
 * Search within a set of FAQs
 */
const searchInFAQs = (faqs, queryLower, priority) => {
    const results = [];
    const normalizedQuery = normalizeText(queryLower);
    const queryTokens = tokenize(queryLower);

    faqs.forEach((faq) => {
        let score = 0;
        const normalizedQuestion = normalizeText(faq.question || '');
        const normalizedAnswer = normalizeText(faq.answer || '');
        const questionTokens = tokenize(faq.question || '');
        const answerTokens = tokenize(faq.answer || '');
        const qaTokens = [...new Set([...questionTokens, ...answerTokens])];

        // Check keyword matches
        if (faq.keywords) {
            faq.keywords.forEach((keyword) => {
                const normalizedKeyword = normalizeText(keyword);

                if (!normalizedKeyword) return;

                if (normalizedQuery.includes(normalizedKeyword)) {
                    score += 2.5;
                    return;
                }

                const keywordTokens = tokenize(normalizedKeyword);
                const matchedTokens = keywordTokens.filter((token) =>
                    queryTokens.includes(token)
                ).length;

                if (matchedTokens > 0) {
                    score += matchedTokens * 1.2;
                }

                const hasTypoHit = queryTokens.some((token) =>
                    hasNearTokenMatch(token, keywordTokens)
                );
                if (hasTypoHit) {
                    score += 0.8;
                }
            });
        }

        // Check question similarity
        if (
            normalizedQuestion.includes(normalizedQuery) ||
            normalizedQuery.includes(normalizedQuestion)
        ) {
            score += 3;
        }

        const queryQuestionTokenMatches = queryTokens.filter((token) =>
            questionTokens.includes(token)
        ).length;
        score += queryQuestionTokenMatches * 1.1;

        // Lightweight typo tolerance for natural language input.
        const queryTypoMatches = queryTokens.filter((token) =>
            hasNearTokenMatch(token, qaTokens)
        ).length;
        score += queryTypoMatches * 0.25;

        // Check if query words appear in answer
        const queryWords = queryLower.split(' ').filter((w) => w.length > 3);
        queryWords.forEach((word) => {
            if (normalizedAnswer.includes(normalizeText(word))) {
                score += 0.5;
            }
        });

        if (score > 0) {
            results.push({
                ...faq,
                score,
                priority,
            });
        }
    });

    return results;
};

/**
 * Get page information
 */
export const getPageInfo = (context) => {
    const { dashboard, page } = context;
    const kb = knowledgeBases[dashboard] || {};
    return kb[page]?.pageInfo || null;
};

/**
 * Get all FAQs for current context
 */
export const getContextFAQs = (context) => {
    const { dashboard, page } = context;
    const kb = knowledgeBases[dashboard] || {};
    return kb[page]?.faqs || [];
};
