/**
 * Módulo de traducción usando MyMemory API (gratuita)
 */

import { getLang } from './i18n.js';

const cache = new Map();

export async function translateText(text, targetLang = null) {
  if (!text || typeof text !== 'string') return text;
  
  const lang = targetLang || getLang();
  if (lang === 'es') return text;
  
  const cacheKey = `${text}::${lang}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=es|${lang}`;
    const res = await fetch(url);
    
    if (!res.ok) {
      console.warn('MyMemory error:', res.status);
      return text;
    }
    
    const data = await res.json();
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      const translated = data.responseData.translatedText;
      cache.set(cacheKey, translated);
      return translated;
    }
    return text;
  } catch (err) {
    console.warn('Translation failed:', err.message);
    return text;
  }
}

export async function translateArray(texts, targetLang = null) {
  if (!texts || !texts.length) return texts;
  
  const lang = targetLang || getLang();
  if (lang === 'es') return texts;
  
  const results = await Promise.all(
    texts.map(t => translateText(t, lang))
  );
  return results;
}
