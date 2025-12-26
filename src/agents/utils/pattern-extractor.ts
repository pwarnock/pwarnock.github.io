/**
 * Pattern Extractor Utility
 *
 * Analyzes user feedback during review sessions and extracts
 * vocabulary words, sentence patterns, dos/don'ts, and style preferences.
 * Uses keyword matching and simple heuristics without external NLP libraries.
 */

export interface ExtractedPatterns {
  vocabulary: string[];
  sentencePatterns: string[];
  dos: string[];
  donts: string[];
  corrections: {
    original: string;
    improvement: string;
    category: string;
  }[];
}

/**
 * Feedback pattern categories for common corrections
 */
const FEEDBACK_PATTERNS = {
  conciseness: {
    keywords: ['too long', 'wordy', 'verbose', 'concise', 'shorter', 'brief', 'condense', 'trim'],
    action: 'Prefer concise, direct expressions over verbose explanations'
  },
  formality: {
    keywords: ['too formal', 'formal', 'academic', 'casual', 'conversational', 'informal'],
    action: 'Match formality level to context - prefer conversational tone'
  },
  aiPhrases: {
    keywords: ['ai-sounding', 'robotic', 'delve', 'tapestry', 'symphony', 'underscore', 'testament'],
    action: 'Avoid AI-writer phrases and cliches'
  },
  clarity: {
    keywords: ['unclear', 'confusing', 'clarify', 'clearer', 'simple', 'simplify'],
    action: 'Use clear, straightforward language'
  },
  detail: {
    keywords: ['more detail', 'expand', 'elaborate', 'depth', 'specific', 'example'],
    action: 'Provide specific examples and deeper explanations'
  },
  tone: {
    keywords: ['tone', 'voice', 'personality', 'authentic', 'personal'],
    action: 'Maintain authentic, personal voice throughout'
  },
  active: {
    keywords: ['passive voice', 'active voice', 'passive'],
    action: 'Use active voice instead of passive voice'
  }
};

/**
 * Vocabulary extraction patterns
 * Matches words in quotes, technical terms, or emphasized phrases
 */
const VOCAB_PATTERNS = [
  /["']([^"']+)["']/g,           // Words in quotes
  /\b(use|prefer|avoid|try|add)\s+(\w+(?:\s+\w+)?)/gi,  // Words after action verbs
  /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g  // Capitalized terms (potential technical terms)
];

/**
 * Sentence structure patterns
 */
const SENTENCE_PATTERNS = [
  {
    pattern: /start with/gi,
    description: 'Sentence starting patterns'
  },
  {
    pattern: /avoid starting/gi,
    description: 'Negative sentence starting patterns'
  },
  {
    pattern: /\b(I|we|you)\s+\w+/gi,
    description: 'Personal pronoun usage'
  }
];

/**
 * Positive feedback indicators
 */
const POSITIVE_INDICATORS = [
  'good', 'great', 'excellent', 'perfect', 'love', 'like', 'prefer',
  'keep', 'maintain', 'continue', 'more of this', 'well done'
];

/**
 * Negative feedback indicators
 */
const NEGATIVE_INDICATORS = [
  'bad', 'wrong', 'avoid', 'dont', "don't", 'change', 'fix', 'correct',
  'remove', 'delete', 'too', 'less', 'not'
];

/**
 * Extract vocabulary words from feedback
 */
export function extractVocabulary(feedback: string): string[] {
  const vocabulary: string[] = [];

  // Extract quoted phrases
  const quotedMatches = feedback.matchAll(/["']([^"']+)["']/g);
  for (const match of quotedMatches) {
    const phrase = match[1].trim();
    if (phrase.length > 1 && phrase.length < 50) {
      vocabulary.push(phrase);
    }
  }

  // Extract single words after action verbs (not entire phrases)
  const actionVerbMatches = feedback.matchAll(
    /\b(use|prefer|avoid|try|add|include|incorporate)\s+(\w+)/gi
  );
  for (const match of actionVerbMatches) {
    const word = match[2].trim();
    if (word.length > 1 && word.length < 50) {
      vocabulary.push(word);
    }
  }

  // Extract technical terms (capitalized words in context)
  const techMatches = feedback.matchAll(/\b[A-Z][a-z]+(?:[A-Z][a-z]+)*\b/g);
  for (const match of techMatches) {
    const term = match[0];
    if (term.length > 2 && term.length < 30) {
      vocabulary.push(term);
    }
  }

  return [...new Set(vocabulary)]; // Remove duplicates
}

/**
 * Extract sentence patterns from feedback
 */
export function extractSentencePatterns(feedback: string): string[] {
  const patterns: string[] = [];

  // Look for explicit pattern mentions
  const patternKeywords = [
    'start with', 'avoid starting', 'begin with', 'structure',
    'pattern', 'template', 'format', 'organization'
  ];

  const sentences = feedback.split(/[.!?]+/);
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (trimmed.length < 20 || trimmed.length > 200) continue;

    for (const keyword of patternKeywords) {
      if (trimmed.toLowerCase().includes(keyword)) {
        patterns.push(trimmed);
        break;
      }
    }
  }

  // Look for sentence structure examples
  const structureMatches = feedback.matchAll(
    /\b(?:use|prefer|avoid)\s+(?:the\s+)?["']?([^"'\.]{10,100})["']?\s+(?:pattern|structure|format)/gi
  );
  for (const match of structureMatches) {
    const pattern = match[1].trim();
    if (!patterns.includes(pattern)) {
      patterns.push(pattern);
    }
  }

  return [...new Set(patterns)];
}

/**
 * Classify feedback as positive or negative
 */
export function classifyFeedback(feedback: string): 'positive' | 'negative' | 'neutral' {
  const lower = feedback.toLowerCase();

  let positiveCount = 0;
  let negativeCount = 0;

  for (const indicator of POSITIVE_INDICATORS) {
    if (lower.includes(indicator)) positiveCount++;
  }

  for (const indicator of NEGATIVE_INDICATORS) {
    if (lower.includes(indicator)) negativeCount++;
  }

  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

/**
 * Extract dos and donts from feedback
 */
export function extractDosAndDonts(feedback: string): {
  dos: string[];
  donts: string[];
} {
  const dos: string[] = [];
  const donts: string[] = [];

  const classification = classifyFeedback(feedback);

  // Split into sentences for better processing
  const sentences = feedback.split(/[.!?]+/).filter(s => s.trim().length > 10);

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    const lower = trimmed.toLowerCase();

    // Explicit patterns
    if (lower.startsWith('do ') || lower.startsWith('always ')) {
      dos.push(trimmed);
      continue;
    }

    if (lower.startsWith("don't ") || lower.startsWith('dont ') ||
        lower.startsWith('never ') || lower.startsWith('avoid ')) {
      donts.push(trimmed);
      continue;
    }

    // Check for explicit positive indicators in this sentence
    const hasPositiveInSentence = POSITIVE_INDICATORS.some(ind => lower.includes(ind));
    // Check for explicit negative indicators in this sentence
    const hasNegativeInSentence = NEGATIVE_INDICATORS.some(ind => lower.includes(ind));

    // Sentence-level classification
    if (hasPositiveInSentence && !hasNegativeInSentence) {
      dos.push(trimmed);
    } else if (hasNegativeInSentence && !hasPositiveInSentence) {
      donts.push(trimmed);
    } else if (classification === 'positive' && !hasNegativeInSentence) {
      dos.push(trimmed);
    } else if (classification === 'negative' && !hasPositiveInSentence) {
      donts.push(trimmed);
    }
  }

  // Remove duplicates while preserving order
  return {
    dos: [...new Set(dos)],
    donts: [...new Set(donts)]
  };
}

/**
 * Identify correction patterns from feedback
 */
export function identifyCorrections(feedback: string): ExtractedPatterns['corrections'] {
  const corrections: ExtractedPatterns['corrections'] = [];

  // Check against known feedback patterns
  for (const [category, data] of Object.entries(FEEDBACK_PATTERNS)) {
    const lowerFeedback = feedback.toLowerCase();

    for (const keyword of data.keywords) {
      if (lowerFeedback.includes(keyword)) {
        corrections.push({
          original: feedback,
          improvement: data.action,
          category
        });
        break; // One correction per category
      }
    }
  }

  // Look for "make this more/less X" patterns
  const makePatterns = feedback.matchAll(
    /make (?:it|this|the) (?:more|less|less\s+\w+)\s+(\w+)/gi
  );
  for (const match of makePatterns) {
    const attribute = match[1];
    corrections.push({
      original: feedback,
      improvement: `Adjust content to be ${attribute}`,
      category: 'adjustment'
    });
  }

  // Look for "change X to Y" patterns
  const changePatterns = feedback.matchAll(
    /change\s+(["']?)([^"'\.]+)\1\s+to\s+(["']?)([^"'\.]+)\3/gi
  );
  for (const match of changePatterns) {
    corrections.push({
      original: match[2].trim(),
      improvement: match[4].trim(),
      category: 'replacement'
    });
  }

  return corrections;
}

/**
 * Main extraction function - analyzes feedback and extracts all patterns
 */
export function extractPatternsFromFeedback(feedback: string): ExtractedPatterns {
  // Normalize feedback
  const normalized = feedback.trim();

  return {
    vocabulary: extractVocabulary(normalized),
    sentencePatterns: extractSentencePatterns(normalized),
    dos: extractDosAndDonts(normalized).dos,
    donts: extractDosAndDonts(normalized).donts,
    corrections: identifyCorrections(normalized)
  };
}

/**
 * Merge extracted patterns with existing style documentation
 */
export function mergePatterns(
  existing: {
    vocabulary: string[];
    sentencePatterns: string[];
    dos: string[];
    donts: string[];
  },
  extracted: ExtractedPatterns
): {
  vocabulary: string[];
  sentencePatterns: string[];
  dos: string[];
  donts: string[];
} {
  return {
    vocabulary: [...new Set([...existing.vocabulary, ...extracted.vocabulary])],
    sentencePatterns: [...new Set([...existing.sentencePatterns, ...extracted.sentencePatterns])],
    dos: [...new Set([...existing.dos, ...extracted.dos])],
    donts: [...new Set([...existing.donts, ...extracted.donts])]
  };
}

/**
 * Generate a summary of extracted patterns for logging
 */
export function generatePatternSummary(extracted: ExtractedPatterns): string {
  const parts: string[] = [];

  if (extracted.vocabulary.length > 0) {
    parts.push(`${extracted.vocabulary.length} vocabulary terms`);
  }

  if (extracted.sentencePatterns.length > 0) {
    parts.push(`${extracted.sentencePatterns.length} sentence patterns`);
  }

  if (extracted.dos.length > 0) {
    parts.push(`${extracted.dos.length} dos`);
  }

  if (extracted.donts.length > 0) {
    parts.push(`${extracted.donts.length} donts`);
  }

  if (extracted.corrections.length > 0) {
    parts.push(`${extracted.corrections.length} corrections`);
  }

  return parts.length > 0 ? parts.join(', ') : 'No patterns extracted';
}
