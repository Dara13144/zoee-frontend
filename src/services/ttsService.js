/**
 * Voice AI & Text-to-Speech (TTS) Service with Khmer (ភាសាខ្មែរ) & Multi-language Support
 * Includes natural numeral pronunciation, automatic Khmer Unicode detection, bilingual announcements, and anti-overlap queue
 */
class TTSService {
  constructor() {
    this.queue = [];
    this.isSpeaking = false;
    this.voices = [];

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        this.voices = window.speechSynthesis.getVoices();
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  /**
   * Check if text contains Khmer Unicode characters
   */
  isKhmer(text) {
    if (!text) return false;
    return /[\u1780-\u17FF\u19E0-\u19FF]/.test(text);
  }

  /**
   * Convert numbers to spoken Khmer text
   */
  toKhmerSpokenAmount(rawAmount, currency = 'USD') {
    const num = parseFloat(rawAmount) || 0;
    if (currency === 'KHR') {
      if (num >= 10000 && num % 10000 === 0) {
        const meun = num / 10000;
        return `${meun} ម៉ឺន រៀល`;
      }
      if (num >= 1000 && num % 1000 === 0) {
        const poan = num / 1000;
        return `${poan} ពាន់ រៀល`;
      }
      return `${num.toLocaleString()} រៀល`;
    }

    // USD Currency
    const dollars = Math.floor(num);
    const cents = Math.round((num - dollars) * 100);

    if (cents > 0) {
      return `${dollars} ដុល្លារ ${cents} សេន`;
    }
    return `${dollars} ដុល្លារ`;
  }

  /**
   * Convert numbers to spoken English text
   */
  toEnglishSpokenAmount(rawAmount, currency = 'USD') {
    const num = parseFloat(rawAmount) || 0;
    if (currency === 'KHR') {
      return `${num.toLocaleString()} Riel`;
    }

    const dollars = Math.floor(num);
    const cents = Math.round((num - dollars) * 100);

    if (cents > 0) {
      return `${dollars} dollars and ${cents} cents`;
    }
    return `${dollars} dollar${dollars === 1 ? '' : 's'}`;
  }

  /**
   * Get available TTS voices
   */
  getAvailableVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (this.voices.length === 0) {
        this.voices = window.speechSynthesis.getVoices();
      }
    }
    return this.voices;
  }

  /**
   * Find best matching voice for language & style
   */
  findVoice(voicePreset, isKhmerText) {
    if (!this.voices || this.voices.length === 0) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        this.voices = window.speechSynthesis.getVoices();
      }
    }

    // 1. If Khmer is requested or detected, look for km-KH / km / Khmer voice
    if (voicePreset?.includes('khmer') || isKhmerText) {
      const khmerVoice = this.voices.find(v =>
        v.lang === 'km-KH' ||
        v.lang === 'km' ||
        v.name.toLowerCase().includes('khmer') ||
        v.name.toLowerCase().includes('cambodia')
      );
      if (khmerVoice) return khmerVoice;
    }

    // 2. Look for specified voice preset
    if (voicePreset && voicePreset !== 'default') {
      const match = this.voices.find(v =>
        v.name.toLowerCase().includes(voicePreset.toLowerCase()) ||
        v.lang.toLowerCase().includes(voicePreset.toLowerCase())
      );
      if (match) return match;
    }

    // 3. Fallback: English or default system voice
    const defaultVoice = this.voices.find(v => v.lang.startsWith('en') && v.default) ||
      this.voices.find(v => v.lang.startsWith('en')) ||
      this.voices[0] ||
      null;

    return defaultVoice;
  }

  /**
   * Queue a donation message to be read aloud by Voice AI with real amount pronunciation
   */
  speak({ text, donorName = 'Anonymous', amount = 0, currency = 'USD', rate = 1.0, pitch = 1.0, voice = 'khmer_natural', template = '', streamerName = '', minAmount = 0 }) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (amount !== undefined && Number(amount) < Number(minAmount)) return;

    // Clean text before reading (remove URLs, raw emojis, harmful tokens)
    const cleanText = (text || '')
      .replace(/https?:\/\/\S+/gi, '')
      .replace(/[\u{1F600}-\u{1F6FF}]/gu, '')
      .slice(0, 255);

    const isKhmerText = this.isKhmer(cleanText) || this.isKhmer(donorName) || this.isKhmer(template) || voice?.includes('khmer');

    let speechText = '';
    let speechLang = 'en-US';

    const spokenKhmerAmt = this.toKhmerSpokenAmount(amount, currency);
    const spokenEnglishAmt = this.toEnglishSpokenAmount(amount, currency);

    if (template && template.trim()) {
      // Use streamer's custom Thank-You template with real amount
      const targetAmount = isKhmerText ? spokenKhmerAmt : spokenEnglishAmt;
      speechText = template
        .replace(/\{donorName\}/g, donorName)
        .replace(/\{amount\}/g, targetAmount)
        .replace(/\{currency\}/g, currency)
        .replace(/\{streamerName\}/g, streamerName || 'Streamer')
        .replace(/\{message\}/g, cleanText);
      speechLang = isKhmerText ? 'km-KH' : 'en-US';
    } else if (isKhmerText) {
      // Natural Khmer Announcement: Name + Money Number + Message for Streamer
      speechLang = 'km-KH';
      speechText = cleanText
        ? `${donorName} បានឧបត្ថម្ភចំនួន ${spokenKhmerAmt}។ សារជូនពរ៖ ${cleanText}`
        : `${donorName} បានឧបត្ថម្ភចំនួន ${spokenKhmerAmt}។ អរគុណច្រើនសម្រាប់ការឧបត្ថម្ភ និងការគាំទ្រ!`;
    } else {
      // Natural English Announcement: Name + Money Number + Message for Streamer
      speechLang = 'en-US';
      speechText = cleanText
        ? `${donorName} donated ${spokenEnglishAmt}. Message for streamer: ${cleanText}`
        : `Thank you ${donorName} for donating ${spokenEnglishAmt}!`;
    }

    // Voice Pitch / Rate Adjustments based on Preset
    let effectivePitch = pitch || 1.0;
    let effectiveRate = rate || 1.0;

    if (voice === 'khmer_female') {
      effectivePitch = 1.15;
      effectiveRate = 0.95;
    } else if (voice === 'khmer_male') {
      effectivePitch = 0.85;
      effectiveRate = 0.92;
    }

    this.queue.push({
      text: speechText,
      lang: speechLang,
      rate: effectiveRate,
      pitch: effectivePitch,
      voicePreset: voice,
      isKhmer: isKhmerText
    });

    this.processQueue();
  }

  /**
   * Process speech queue sequentially
   */
  processQueue() {
    if (this.isSpeaking || this.queue.length === 0) return;

    const item = this.queue.shift();
    this.isSpeaking = true;

    try {
      const utterance = new SpeechSynthesisUtterance(item.text);
      utterance.rate = item.rate || 1.0;
      utterance.pitch = item.pitch || 1.0;
      utterance.lang = item.lang || (item.isKhmer ? 'km-KH' : 'en-US');

      const matchedVoice = this.findVoice(item.voicePreset, item.isKhmer);
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onend = () => {
        this.isSpeaking = false;
        setTimeout(() => this.processQueue(), 150);
      };

      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis error:', e);
        this.isSpeaking = false;
        setTimeout(() => this.processQueue(), 100);
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('TTS error:', err);
      this.isSpeaking = false;
      this.processQueue();
    }
  }

  /**
   * Preview a voice sample immediately
   */
  previewVoice(text, voicePreset = 'khmer_natural') {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    this.stop();

    const isKhmerText = this.isKhmer(text) || voicePreset.includes('khmer');
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = isKhmerText ? 'km-KH' : 'en-US';

    if (voicePreset === 'khmer_female') {
      utterance.pitch = 1.15;
      utterance.rate = 0.95;
    } else if (voicePreset === 'khmer_male') {
      utterance.pitch = 0.85;
      utterance.rate = 0.92;
    } else {
      utterance.pitch = 1.0;
      utterance.rate = 1.0;
    }

    const matchedVoice = this.findVoice(voicePreset, isKhmerText);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    window.speechSynthesis.speak(utterance);
  }

  stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.queue = [];
    this.isSpeaking = false;
  }
}

export default new TTSService();
