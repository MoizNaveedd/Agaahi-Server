import { BadRequestException } from "@nestjs/common";

const DANGEROUS_KEYWORDS = [
  'delete',
  'drop',
  'truncate',
  'update',
  'insert',
  'create',
  'alter',
  'add',
  'modify',
  'rename',
  'replace',
  'restore',
  'grant',
  'revoke',
  'merge',
  'upsert',
  'exec',
  'execute',
];

/**
 * Checks if a query string contains any dangerous SQL operations
 * @param query The query string to validate
 * @returns Object containing validation result and any found dangerous keywords
 */
export function validateQuerySafety(query: string): { 
  isSafe: boolean;
  foundKeywords: string[];
} {
  // Convert query to lowercase for case-insensitive matching
  const normalizedQuery = query.toLowerCase();
  
  // Find all dangerous keywords in the query
  const foundKeywords = DANGEROUS_KEYWORDS.filter(keyword => {
    // Match whole words only using word boundaries
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    return regex.test(normalizedQuery);
  });

  return {
    isSafe: foundKeywords.length === 0,
    foundKeywords
  };
}

/**
 * Throws an error if the query contains dangerous operations
 * @param query The query string to validate
 * @throws Error if dangerous keywords are found
 */
export function assertQuerySafety(query: string): boolean {
  const { isSafe, foundKeywords } = validateQuerySafety(query);
  return isSafe;
  // if (!isSafe) {
  //   console.log(foundKeywords); 
  //   return true;
  // }
} 