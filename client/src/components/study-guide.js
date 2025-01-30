"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../db/schema");
const router = (0, express_1.Router)();
// Get current study guide with enhanced error handling and learner feedback
router.get("/current", async (req, res) => {
    try {
        const userId = 1; // TODO: Replace with actual user ID from auth
        // Get recent performance data for personalized recommendations
        const performance = await db_1.db
            .select()
            .from(schema_1.userProgress)
            .where((0, drizzle_orm_1.eq)(schema_1.userProgress.userId, userId));
        // Calculate performance metrics
        const completedModules = performance.filter(p => p.totalQuestions && p.totalQuestions > 0);
        const averageScore = completedModules.length > 0
            ? completedModules.reduce((acc, curr) => acc + ((curr.correctAnswers || 0) / (curr.totalQuestions || 1) * 100), 0) / completedModules.length
            : 0;
        // Generate adaptive recommendations based on performance
        const weakModules = completedModules
            .filter(p => p.totalQuestions && p.correctAnswers && (p.correctAnswers / p.totalQuestions) < 0.7)
            .map(p => ({
            moduleId: p.moduleId?.toString(),
            score: ((p.correctAnswers || 0) / (p.totalQuestions || 1) * 100).toFixed(1)
        }));
        const strongModules = completedModules
            .filter(p => p.totalQuestions && p.correctAnswers && (p.correctAnswers / p.totalQuestions) >= 0.7)
            .map(p => ({
            moduleId: p.moduleId?.toString(),
            score: ((p.correctAnswers || 0) / (p.totalQuestions || 1) * 100).toFixed(1)
        }));
        const nursingTopics = [
            "Fundamentals of Nursing",
            "Pharmacology",
            "Medical-Surgical Nursing",
            "Pediatric Nursing"
        ];
        // Transform data to learner-friendly format
        const guide = {
            id: `sg-${Date.now()}`,
            createdAt: new Date().toISOString(),
            topics: nursingTopics.map((domain, index) => ({
                id: domain.toLowerCase().replace(/\s+/g, '-'),
                name: domain,
                priority: index === 0 ? 'high' : 'medium',
                completed: false,
                estimatedTime: 30,
                description: `Focus on mastering key concepts in ${domain} for better NCLEX preparation`,
                learningTips: [
                    "Review core concepts first",
                    "Practice with sample questions",
                    "Create summary notes"
                ]
            })),
            weakAreas: weakModules.map(module => ({
                moduleId: module.moduleId,
                score: module.score,
                improvement: "Focus on understanding core concepts and practice more questions"
            })),
            strengthAreas: strongModules.map(module => ({
                moduleId: module.moduleId,
                score: module.score,
                tip: "Keep practicing to maintain proficiency"
            })),
            recommendedResources: [
                "Patient Care Management",
                "Medication Administration",
                "Health Assessment"
            ].map((plan, i) => ({
                id: `resource-${i}`,
                type: 'article',
                title: plan,
                url: `/resources/${plan.toLowerCase().replace(/\s+/g, '-')}`,
                difficulty: i === 0 ? 'beginner' : 'intermediate',
                estimatedTime: '30 mins',
                learningOutcome: `Master ${plan} concepts and applications`
            })),
            progress: averageScore,
            nextSteps: [
                "Review weak areas first",
                "Take practice tests in strong areas to maintain knowledge",
                "Schedule regular review sessions"
            ]
        };
        res.json(guide);
    }
    catch (error) {
        console.error("Error fetching study guide:", error);
        res.status(500).json({
            error: 'Failed to fetch study guide',
            details: error instanceof Error ? error.message : 'Unknown error',
            suggestion: 'Please try refreshing the page or contact support if the issue persists'
        });
    }
});
// Generate new study guide
router.post("/generate", async (req, res) => {
    try {
        const userId = 1; // TODO: Replace with actual user ID from auth
        const { focusAreas = [], timeAvailable } = req.body;
        // Get user's performance data with proper ordering
        const performance = await db_1.db
            .select()
            .from(schema_1.userProgress)
            .where((0, drizzle_orm_1.eq)(schema_1.userProgress.userId, userId))
            .orderBy(schema_1.userProgress.updatedAt, 'desc')
            .limit(10);
        // Analyze weak areas based on totalQuestions and correctAnswers
        const weakAreas = performance
            .filter(p => p.totalQuestions && p.correctAnswers && (p.correctAnswers / p.totalQuestions) < 0.7)
            .map(p => ({
            moduleId: p.moduleId?.toString(),
            score: Math.round((p.correctAnswers || 0) / (p.totalQuestions || 1) * 100),
            improvement: `Focus on core concepts`,
            suggestedApproach: timeAvailable ?
                `Review fundamentals and practice with ${Math.round(timeAvailable * 0.4)} minutes of targeted questions` :
                'Practice with targeted questions'
        }));
        const defaultWeakAreas = [
            { topic: "Fundamentals of Nursing", score: "60", improvement: "Review basic nursing concepts", suggestedApproach: "Spend 20 minutes reviewing fundamental concepts." },
            { topic: "Pharmacology", score: "55", improvement: "Focus on medication calculations and side effects", suggestedApproach: "Practice medication calculations and review common side effects of medications." }
        ];
        const nursingTopics = [
            "Fundamentals of Nursing",
            "Pharmacology",
            "Medical-Surgical Nursing",
            "Pediatric Nursing"
        ];
        const guide = {
            id: `sg-${Date.now()}`,
            createdAt: new Date().toISOString(),
            topics: nursingTopics.map((domain, index) => ({
                id: domain.toLowerCase().replace(/\s+/g, '-'),
                name: domain,
                priority: focusAreas.includes(domain) ? 'high' : 'medium',
                completed: false,
                estimatedTime: timeAvailable ? Math.floor(timeAvailable / 4) : 30,
                learningObjectives: [
                    `Understand key concepts in ${domain}`,
                    "Apply knowledge in practice questions",
                    "Review and reinforce learning"
                ]
            })),
            weakAreas: weakAreas.length > 0 ? weakAreas : defaultWeakAreas,
            strengthAreas: [],
            recommendedResources: focusAreas.map((plan, i) => ({
                id: `resource-${i}`,
                type: 'article',
                title: plan,
                url: `/resources/${plan.toLowerCase().replace(/\s+/g, '-')}`,
                difficulty: i === 0 ? 'beginner' : 'intermediate',
                estimatedTime: '30 mins',
                learningOutcome: `Master ${plan} concepts and applications`
            })),
            progress: 0,
            studyTips: [
                "Break study sessions into 25-minute focused intervals",
                "Review material regularly to reinforce learning",
                "Practice active recall through self-testing"
            ]
        };
        res.json(guide);
    }
    catch (error) {
        console.error("Error generating study guide:", error);
        res.status(500).json({
            error: 'Failed to generate study guide',
            details: error instanceof Error ? error.message : 'Unknown error',
            suggestion: 'Please try again or adjust your study preferences'
        });
    }
});
exports.default = router;
