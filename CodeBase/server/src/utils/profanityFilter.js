// Basic profanity word list — extend as needed
const BLOCKED_WORDS = [
  'fuck', 'shit', 'bitch', 'ass', 'asshole', 'bastard',
  'dick', 'pussy', 'cunt', 'slut', 'whore', 'fag', 'nigger',
  'nigga', 'retard', 'rape', 'molest', 'porn', 'sex',
];

// Build regex: match whole words, case-insensitive
// Also catches leet-speak variants like f*ck, sh1t, a$$
function buildRegex(word) {
  const leetMap = {
    a: '[a@4]', e: '[e3]', i: '[i1!]', o: '[o0]', s: '[s$5]',
    t: '[t7]', l: '[l1]', g: '[g9]',
  };
  const pattern = word
    .split('')
    .map(ch => leetMap[ch] || ch)
    .join('[\\s._-]*'); // allow separators between chars like f-u-c-k
  return new RegExp(`\\b${pattern}\\b`, 'i');
}

const BLOCKED_REGEXES = BLOCKED_WORDS.map(buildRegex);

export function containsProfanity(text) {
  if (!text) return false;
  return BLOCKED_REGEXES.some(regex => regex.test(text));
}

export function filterProfanity(text) {
  if (!text) return text;
  let filtered = text;
  for (const regex of BLOCKED_REGEXES) {
    filtered = filtered.replace(regex, (match) => match[0] + '*'.repeat(match.length - 1));
  }
  return filtered;
}

// Extract profanity words found in text for hybrid moderation
export function extractProfanityWords(text) {
  if (!text) return [];
  const words = text.toLowerCase().split(/\s+/);
  const foundWords = [];
  
  words.forEach(word => {
    BLOCKED_REGEXES.forEach((regex, index) => {
      if (regex.test(word) && !foundWords.includes(BLOCKED_WORDS[index])) {
        foundWords.push(BLOCKED_WORDS[index]);
      }
    });
  });
  
  return foundWords;
}

// Get the profanity words list for server moderation
export function getProfanityWords() {
  return BLOCKED_WORDS;
}
