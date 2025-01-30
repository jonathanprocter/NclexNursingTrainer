"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.voiceAssistantService = exports.VoiceAssistantService = exports.voiceCommandSchema = void 0;
const zod_1 = require("zod");
const openai_1 = __importDefault(require("openai"));
// Enhanced schema for voice commands with learning context
exports.voiceCommandSchema = zod_1.z.object({
    command: zod_1.z.string().min(1),
    studentId: zod_1.z.string(),
    context: zod_1.z.object({
        type: zod_1.z.string(),
        topic: zod_1.z.string().optional(),
        focusAreas: zod_1.z.array(zod_1.z.string()),
        emotionalState: zod_1.z.enum(['stressed', 'confident', 'neutral']).optional(),
        tutorPersonality: zod_1.z.enum(['encouraging', 'analytical', 'socratic', 'practical']).optional(),
        learningStyle: zod_1.z.enum(['visual', 'auditory', 'kinesthetic', 'reading']).optional(),
        difficultyLevel: zod_1.z.enum(['beginner', 'intermediate', 'advanced']).optional()
    })
});
class VoiceAssistantService {
    constructor() {
        const openaiApiKey = process.env.OPENAI_API_KEY;
        if (!openaiApiKey) {
            throw new Error('OpenAI API key is required for personalized learning assistance');
        }
        this.openai = new openai_1.default({ apiKey: openaiApiKey });
    }
    async processCommand(input) {
        try {
            const validatedInput = exports.voiceCommandSchema.parse(input);
            const emotionalState = this.detectEmotionalState(validatedInput.command);
            if (emotionalState) {
                return this.generateEmotionalResponse(emotionalState);
            }
            if (validatedInput.context.tutorPersonality) {
                return await this.getPersonalizedResponse(validatedInput.command, validatedInput.context);
            }
            return await this.handleDefaultCommand(validatedInput);
        }
        catch (error) {
            console.error('Error processing voice command:', error);
            throw error;
        }
    }
    detectEmotionalState(command) {
        const stressKeywords = ['stressed', 'nervous', 'worried', 'anxiety', 'overwhelmed', 'confused'];
        const confidenceKeywords = ['confident', 'ready', 'understand', 'got this', 'prepared'];
        if (stressKeywords.some(k => command.toLowerCase().includes(k)))
            return 'stressed';
        if (confidenceKeywords.some(k => command.toLowerCase().includes(k)))
            return 'confident';
        return null;
    }
    generateEmotionalResponse(state) {
        const responses = {
            stressed: {
                text: "I understand you're feeling stressed. Let's break this down into manageable steps and take it one concept at a time.",
                suggestions: [
                    'Take a 5-minute breather',
                    'Review basic concepts first',
                    'Try some practice questions at an easier level',
                    'Focus on understanding rather than memorizing'
                ],
                learningTips: [
                    'Break complex topics into smaller parts',
                    'Use mind maps for visual organization',
                    'Practice with simpler questions first'
                ]
            },
            confident: {
                text: "That's excellent that you're feeling confident! Let's challenge yourself while maintaining this positive momentum.",
                suggestions: [
                    'Try some advanced practice questions',
                    'Explain concepts to others',
                    'Tackle complex case studies',
                    'Review edge cases and exceptions'
                ],
                learningTips: [
                    'Challenge yourself with timed practice',
                    'Create your own test questions',
                    'Explore related advanced topics'
                ]
            },
            neutral: {
                text: "Let's work on building your confidence through structured practice and clear understanding.",
                suggestions: [
                    'Start with concept review',
                    'Practice key principles',
                    'Track your progress',
                    'Set specific learning goals'
                ],
                learningTips: [
                    'Focus on one topic at a time',
                    'Use active recall techniques',
                    'Create summary notes'
                ]
            }
        };
        return {
            ...responses[state],
            confidence: 0.95,
            emotionalSupport: true
        };
    }
    async getPersonalizedResponse(command, context) {
        try {
            const completion = await this.openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: `You are a ${context.tutorPersonality} NCLEX tutor specializing in nursing education.
            Student Context:
            - Emotional State: ${context.emotionalState || 'neutral'}
            - Learning Style: ${context.learningStyle || 'varied'}
            - Difficulty Level: ${context.difficultyLevel || 'intermediate'}

            Provide detailed, encouraging responses with specific examples and mnemonics when applicable.`
                    },
                    { role: "user", content: command }
                ]
            });
            const response = completion.choices[0]?.message?.content || "Could not generate response";
            // Structure the response with learning aids
            return {
                text: response,
                confidence: 0.95,
                learningTips: [
                    "Use mnemonics for better retention",
                    "Practice with similar scenarios",
                    "Review related concepts"
                ],
                practiceQuestions: [
                    {
                        question: "How would you apply this concept in a clinical setting?",
                        options: [
                            "A) Follow standard procedures",
                            "B) Assess patient needs first",
                            "C) Consult with senior staff",
                            "D) Document the situation"
                        ],
                        explanation: "Consider the nursing process and prioritize patient safety."
                    }
                ]
            };
        }
        catch (error) {
            console.error('Error getting personalized response:', error);
            throw error;
        }
    }
    async handleDefaultCommand(input) {
        try {
            const studentId = parseInt(input.studentId);
            if (isNaN(studentId)) {
                throw new Error('Invalid student ID format');
            }
            // Generate a basic response when study path service is not available
            const defaultTopics = ['Fundamentals', 'Pharmacology', 'Medical-Surgical Nursing'];
            const nextTopic = input.context.focusAreas[0] || defaultTopics[0];
            return {
                text: `Let's focus on ${input.context.topic || 'NCLEX preparation'}. Based on your preferences, we'll study ${nextTopic} using an approach that matches your learning style.`,
                suggestions: defaultTopics,
                nextTopic,
                confidence: 0.9,
                learningTips: [
                    `Break down ${nextTopic} into smaller concepts`,
                    "Use practice questions to reinforce learning",
                    "Create summary notes for quick review"
                ]
            };
        }
        catch (error) {
            console.error('Error handling default command:', error);
            throw error;
        }
    }
}
exports.VoiceAssistantService = VoiceAssistantService;
exports.voiceAssistantService = new VoiceAssistantService();
