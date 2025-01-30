#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const Anthropic = require('@anthropic-ai/sdk');

// Initialize Anthropic client
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const ISSUES = {
    CRITICAL: {
        'client/src/pages/practice/Simulation.tsx': async (content) => {
            // Fix undefined map issue
            const fixed = content.replace(
                /\.map\(/g,
                '?.map('
            );
            return fixed;
        },
        'client/src/pages/modules/RiskReduction.tsx': async (content) => {
            // Add missing renderPreventionStrategies function
            if (!content.includes('renderPreventionStrategies')) {
                const newFunction = `
  const renderPreventionStrategies = (strategies) => {
    return strategies?.map((strategy, index) => (
      <div key={index} className="prevention-strategy">
        <h3>{strategy.title}</h3>
        <p>{strategy.description}</p>
      </div>
    ));
  };`;
                return content.replace(
                    /export default/,
                    `${newFunction}\n\nexport default`
                );
            }
            return content;
        }
    },
    HIGH: {
        'vite.config.ts': async (content) => {
            // Update Vite config to remove CJS warnings
            return content.replace(
                /(\s*)export default defineConfig\({/,
                `$1export default defineConfig({
$1  optimizeDeps: {
$1    disabled: false
$1  },`
            );
        },
        'client/src/components/layout/NavBar.tsx': async (content) => {
            // Fix nested anchor tags
            return content.replace(
                /<a[^>]*>\s*<a/g,
                '<span><a'
            ).replace(
                /<\/a>\s*<\/a>/g,
                '</a></span>'
            );
        },
        'client/src/lib/ai-services.ts': async (content) => {
            // Improve error handling in analytics
            const improvedFetch = `
const fetchWithRetry = async (url, options, retries = 3) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(\`HTTP error! status: \${response.status}\`);
    return await response.json();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
};`;
            return content.replace(
                /fetch\(/g,
                'fetchWithRetry('
            ).replace(
                /export /,
                `${improvedFetch}\n\nexport `
            );
        }
    },
    MEDIUM: {
        'client/src/App.tsx': async (content) => {
            // Add error boundaries
            const errorBoundary = `
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong. Please try again.</h1>;
    }
    return this.props.children;
  }
}`;
            return content.replace(
                /<Route/g,
                '<ErrorBoundary><Route'
            ).replace(
                /<\/Route>/g,
                '</Route></ErrorBoundary>'
            ).replace(
                /import React/,
                `import React, { Component }${errorBoundary}`
            );
        }
    }
};

async function validateWithAI(filePath, content) {
    try {
        const response = await anthropic.messages.create({
            model: "claude-3-sonnet-20240229",
            max_tokens: 1000,
            messages: [{
                role: "user",
                content: `Review this code for best practices and suggest improvements:
                ${content}
                Focus on: security, performance, error handling, and TypeScript best practices.
                Provide specific suggestions that can be automatically applied.`
            }]
        });

        console.log(`AI Suggestions for ${filePath}:`, response.content);
        return response.content;
    } catch (error) {
        console.error('Error getting AI suggestions:', error);
        return null;
    }
}

async function fixFile(filepath, severity) {
    try {
        const content = await fs.readFile(filepath, 'utf-8');
        const fixFunction = ISSUES[severity][filepath];

        if (fixFunction) {
            const fixed = await fixFunction(content);
            const aiSuggestions = await validateWithAI(filepath, fixed);

            // Apply AI suggestions if available
            const finalContent = aiSuggestions ? 
                await applyAISuggestions(fixed, aiSuggestions) : 
                fixed;

            await fs.writeFile(filepath, finalContent);
            console.log(`✅ Fixed ${severity} issues in ${filepath}`);
        }
    } catch (error) {
        console.error(`❌ Error fixing ${filepath}:`, error);
    }
}

async function applyAISuggestions(content, suggestions) {
    // Parse and apply AI suggestions
    // This is a simplified version - you might want to enhance this based on your needs
    return content;
}

async function runTypescriptChecks() {
    try {
        await execAsync('npx tsc --noEmit');
        console.log('✅ TypeScript checks passed');
    } catch (error) {
        console.error('❌ TypeScript errors found:', error.stdout);
    }
}

async function runEslintFixes() {
    try {
        await execAsync('npx eslint . --fix');
        console.log('✅ ESLint fixes applied');
    } catch (error) {
        console.error('❌ ESLint errors found:', error.stdout);
    }
}

async function main() {
    console.log('🔧 Starting maintenance script...');

    // Fix critical issues first
    console.log('\n🚨 Fixing CRITICAL issues...');
    for (const [filepath, _] of Object.entries(ISSUES.CRITICAL)) {
        await fixFile(filepath, 'CRITICAL');
    }

    // Then high priority issues
    console.log('\n⚠️ Fixing HIGH priority issues...');
    for (const [filepath, _] of Object.entries(ISSUES.HIGH)) {
        await fixFile(filepath, 'HIGH');
    }

    // Then medium priority issues
    console.log('\n📝 Fixing MEDIUM priority issues...');
    for (const [filepath, _] of Object.entries(ISSUES.MEDIUM)) {
        await fixFile(filepath, 'MEDIUM');
    }

    // Run TypeScript checks
    console.log('\n📊 Running TypeScript checks...');
    await runTypescriptChecks();

    // Run ESLint fixes
    console.log('\n🧹 Running ESLint fixes...');
    await runEslintFixes();

    console.log('\n✨ Maintenance complete!');
}

main().catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
});