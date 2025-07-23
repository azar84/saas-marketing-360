#!/usr/bin/env node

/**
 * Typography Violations Checker
 * 
 * This script helps identify typography violations in the codebase
 * that need to be updated to use the design system.
 */

const fs = require('fs');
const path = require('path');

// Patterns to look for
const VIOLATIONS = {
  // Hardcoded text sizes
  textSizes: /text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)/g,
  
  // Hardcoded font weights
  fontWeights: /font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)/g,
  
  // Hardcoded text colors
  textColors: /text-(white|black|gray-\d+|red-\d+|blue-\d+|green-\d+|yellow-\d+|purple-\d+|pink-\d+|indigo-\d+)/g,
  
  // Hardcoded hex colors in styles
  hexColors: /(color\s*:\s*['"]#[0-9A-Fa-f]{3,6}['"])/g,
  
  // Hardcoded background colors in text
  bgColors: /(bg-\[#[0-9A-Fa-f]{3,6}\])/g
};

function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const violations = [];
    
    // Check for each violation type
    Object.entries(VIOLATIONS).forEach(([type, pattern]) => {
      const matches = [...content.matchAll(pattern)];
      if (matches.length > 0) {
        violations.push({
          type,
          count: matches.length,
          matches: matches.map(m => m[0]).slice(0, 5) // First 5 matches
        });
      }
    });
    
    return violations.length > 0 ? { filePath, violations } : null;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return null;
  }
}

function scanDirectory(dirPath, extensions = ['.tsx', '.ts', '.jsx', '.js']) {
  const results = [];
  
  function scanRecursive(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    items.forEach(item => {
      const itemPath = path.join(currentPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scanRecursive(itemPath);
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        const result = checkFile(itemPath);
        if (result) {
          results.push(result);
        }
      }
    });
  }
  
  scanRecursive(dirPath);
  return results;
}

// Main execution
console.log('🔍 Scanning for typography violations...\n');

const srcPath = path.join(process.cwd(), 'src');
const results = scanDirectory(srcPath);

if (results.length === 0) {
  console.log('✅ No typography violations found!');
} else {
  console.log(`❌ Found violations in ${results.length} files:\n`);
  
  // Sort by severity (number of violations)
  results.sort((a, b) => {
    const aTotal = a.violations.reduce((sum, v) => sum + v.count, 0);
    const bTotal = b.violations.reduce((sum, v) => sum + v.count, 0);
    return bTotal - aTotal;
  });
  
  results.forEach(({ filePath, violations }, index) => {
    const totalViolations = violations.reduce((sum, v) => sum + v.count, 0);
    console.log(`${index + 1}. ${filePath.replace(process.cwd(), '.')} (${totalViolations} violations)`);
    
    violations.forEach(({ type, count, matches }) => {
      console.log(`   - ${type}: ${count} violations`);
      if (matches.length > 0) {
        console.log(`     Examples: ${matches.join(', ')}`);
      }
    });
    console.log('');
  });
  
  // Summary
  const totalFiles = results.length;
  const totalViolations = results.reduce((sum, r) => 
    sum + r.violations.reduce((vSum, v) => vSum + v.count, 0), 0
  );
  
  console.log('📊 Summary:');
  console.log(`   Files with violations: ${totalFiles}`);
  console.log(`   Total violations: ${totalViolations}`);
  
  // Top violating patterns
  const patternCounts = {};
  results.forEach(({ violations }) => {
    violations.forEach(({ type, count }) => {
      patternCounts[type] = (patternCounts[type] || 0) + count;
    });
  });
  
  console.log('\n🎯 Most common violations:');
  Object.entries(patternCounts)
    .sort(([,a], [,b]) => b - a)
    .forEach(([type, count]) => {
      console.log(`   ${type}: ${count} occurrences`);
    });
}

console.log('\n💡 Next steps:');
console.log('   1. Start with files having the most violations');
console.log('   2. Use the Typography Design System Guide for patterns');
console.log('   3. Test components after updates');
console.log('   4. Run this script again to check progress'); 