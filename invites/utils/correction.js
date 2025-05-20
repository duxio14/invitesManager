const axios = require('axios');

/**
 * Corrige un texte tout en préservant les placeholders du type {user.username}.
 * @param {string} text Le texte à corriger
 * @returns {string} Le texte corrigé
 */
module.exports = async function correctText(text) {
  const placeholderRegex = /\{[^}]+\}/g;
  const placeholders = [];
  let i = 0;

  // Remplace temporairement les placeholders par des tags uniques
  const protectedText = text.replace(placeholderRegex, (match) => {
    placeholders.push(match);
    return `__PLACEHOLDER_${i++}__`;
  });

  const params = new URLSearchParams();
  params.append('text', protectedText);
  params.append('language', 'fr');

  try {
    const response = await axios.post('https://api.languagetool.org/v2/check', params);
    const matches = response.data.matches;

    let correctedText = protectedText;

    // Appliquer les remplacements dans l'ordre inverse
    for (let i = matches.length - 1; i >= 0; i--) {
      const match = matches[i];
      const { offset, length, replacements } = match;
      if (replacements.length > 0) {
        const replacement = replacements[0].value;
        correctedText = correctedText.slice(0, offset) + replacement + correctedText.slice(offset + length);
      }
    }

    // Réinsère les placeholders dans le texte corrigé
    const finalText = correctedText.replace(/__PLACEHOLDER_(\d+)__/g, (_, index) => placeholders[index]);

    return finalText;
  } catch (err) {
    console.error('Erreur LanguageTool:', err.message);
    return text;
  }
}
