const BLOCKED_WORDS = [
  'fuck', 'shit', 'bitch', 'ass', 'asshole', 'bastard', 'damn',
  'dick', 'pussy', 'cunt', 'slut', 'whore', 'fag', 'nigger',
  'nigga', 'retard', 'rape', 'molest', 'porn', 'sex',
];

const LEET_MAP = {
  a: '[a@4]', e: '[e3]', i: '[i1!]', o: '[o0]', s: '[s$5]',
  t: '[t7]', l: '[l1]', g: '[g9]',
};

function buildRegex(word) {
  const pattern = word
    .split('')
    .map(ch => LEET_MAP[ch] || ch)
    .join('[\\s._-]*');
  return new RegExp(`\\b${pattern}\\b`, 'i');
}

const BLOCKED_REGEXES = BLOCKED_WORDS.map(buildRegex);

export function containsProfanity(text) {
  if (!text) return false;
  return BLOCKED_REGEXES.some(regex => regex.test(text));
}
