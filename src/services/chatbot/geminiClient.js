/**
 * Gemini API Client
 * Handles communication with Google's Gemini AI API
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL_NAME = import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash';

if (!API_KEY) {
    console.warn('VITE_GEMINI_API_KEY not found in environment variables');
}

console.log('🔧 Gemini Config:', { hasKey: !!API_KEY, model: MODEL_NAME });

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

/**
 * Call Gemini API with a prompt
 */
export const callGemini = async (prompt, options = {}) => {
    if (!genAI) {
        throw new Error('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
    }

    try {
        console.log('🤖 Calling Gemini API...');

        // Get the model
        const model = genAI.getGenerativeModel({
            model: options.model || MODEL_NAME,
        });

        // Generation config
        const generationConfig = {
            temperature: options.temperature || 0.7,
            topP: options.topP || 0.95,
            topK: options.topK || 40,
            maxOutputTokens: options.maxOutputTokens || 1024,
        };

        // Generate content
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig,
        });

        const response = result.response;

        // Check if response was blocked
        if (!response || !response.candidates || response.candidates.length === 0) {
            console.error('❌ Gemini response blocked or empty:', response);
            throw new Error('Response was blocked by safety filters. Please rephrase your question.');
        }

        const text = response.text();
        console.log('✅ Gemini response received');

        return text;
    } catch (error) {
        console.error('❌ Gemini API error:', error);
        console.error('Error details:', {
            message: error.message,
            name: error.name,
            stack: error.stack,
        });

        // Handle specific error cases
        if (error.message?.includes('API_KEY_INVALID')) {
            throw new Error('Invalid API key. Please check your VITE_GEMINI_API_KEY in .env file.');
        }

        if (error.message?.includes('API key not valid')) {
            throw new Error('Invalid API key. Please check your VITE_GEMINI_API_KEY in .env file.');
        }

        if (error.message?.includes('quota')) {
            throw new Error('API quota exceeded. Please try again later.');
        }

        if (error.message?.includes('SAFETY')) {
            throw new Error('Response blocked by safety filters. Please try rephrasing.');
        }

        if (error.message?.includes('RECITATION')) {
            throw new Error('Response blocked due to content policy. Please try rephrasing.');
        }

        // Re-throw the original error message if it's already descriptive
        if (error.message) {
            throw error;
        }

        throw new Error('Failed to get response from AI. Please try again.');
    }
};

/**
 * Stream response from Gemini (for future use)
 */
export const streamGemini = async (prompt, onChunk, options = {}) => {
    if (!genAI) {
        throw new Error('Gemini API key not configured.');
    }

    try {
        const model = genAI.getGenerativeModel({
            model: options.model || MODEL_NAME,
        });

        const generationConfig = {
            temperature: options.temperature || 0.7,
            topP: options.topP || 0.95,
            topK: options.topK || 40,
            maxOutputTokens: options.maxOutputTokens || 1024,
        };

        const result = await model.generateContentStream({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig,
        });

        let fullText = '';
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            fullText += chunkText;
            if (onChunk) {
                onChunk(chunkText, fullText);
            }
        }

        return fullText;
    } catch (error) {
        console.error('Gemini streaming error:', error);
        throw new Error('Failed to stream response from AI.');
    }
};

/**
 * Check if Gemini API is configured
 */
export const isGeminiConfigured = () => {
    return !!API_KEY;
};
