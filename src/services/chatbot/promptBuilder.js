/**
 * Prompt Builder Service
 * Constructs context-aware prompts for Gemini API
 */

import { searchKnowledge, getPageInfo } from './knowledgeBase.js';
import { getDashboardName, getPageName } from './contextDetector.js';

/**
 * Build a context-aware prompt for the chatbot
 */
export const buildPrompt = (userQuery, context) => {
    const { dashboard, page } = context;
    const dashboardName = getDashboardName(dashboard);
    const pageName = getPageName(page);

    // Search for relevant knowledge
    const relevantFAQs = searchKnowledge(userQuery, context);
    const pageInfo = getPageInfo(context);

    // Build the system prompt
    const systemPrompt = `You are a helpful AI assistant for CarbonOS, a GHG (Greenhouse Gas) emissions management platform.

**CURRENT USER CONTEXT:**
- Dashboard: ${dashboardName}
- Current Page: ${pageName}
- User Role: ${context.role || 'User'}

${pageInfo ? `**CURRENT PAGE INFO:**\n- Purpose: ${pageInfo.purpose}\n` : ''}

**RELEVANT KNOWLEDGE BASE:**
${formatKnowledgeBase(relevantFAQs)}

**YOUR INSTRUCTIONS:**
1. Answer questions based ONLY on the knowledge base provided above
2. Be concise, helpful, and specific
3. If the question is about "${pageName}", prioritize information from that context
4. Provide step-by-step instructions when explaining how to do something
5. Suggest navigation when relevant (format as: "Go to [Page Name]")
6. If the information is not in the knowledge base, respond with: "I don't have that information yet. Please contact support or check the documentation."
7. Do NOT make up information about features that aren't in the knowledge base
8. Keep responses focused and under 150 words when possible

**USER QUESTION:**
${userQuery}

**YOUR RESPONSE:**`;

    return systemPrompt;
};

/**
 * Format knowledge base for prompt
 */
const formatKnowledgeBase = (faqs) => {
    if (!faqs || faqs.length === 0) {
        return 'No specific knowledge available for this query.';
    }

    return faqs
        .map((faq, index) => {
            return `${index + 1}. Q: ${faq.question}\n   A: ${faq.answer}${faq.relatedLinks?.length > 0
                    ? `\n   Related: ${faq.relatedLinks.join(', ')}`
                    : ''
                }`;
        })
        .join('\n\n');
};

/**
 * Build a simple greeting message based on context
 */
export const buildGreeting = (context) => {
    const dashboardName = getDashboardName(context.dashboard);
    const pageName = getPageName(context.page);

    return `👋 Hi! I'm your CarbonOS assistant. I can help you navigate the **${dashboardName}** dashboard.

You're currently on the **${pageName}** page. Feel free to ask me:
• How to perform tasks on this page
• General platform navigation questions
• Information about different features

What can I help you with?`;
};
