'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export function useSpeechSynthesis() {
  const [isSupported, setIsSupported] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentText, setCurrentText] = useState<string | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsPlaying(false);
    setCurrentText(null);
  }, []);

  const speak = useCallback((text: string, rate: number = 0.95, pitch: number = 1.0) => {
    if (!synthRef.current) return;

    // Clean text: strip markdown, filler brackets or ellipses
    const cleanedText = text
      .replace(/\[.*?\]/g, '')
      .replace(/\.\.\./g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanedText) return;

    // If already playing the same text, toggle off (stop)
    if (isPlaying && currentText === text) {
      stop();
      return;
    }

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.lang = 'th-TH';
    utterance.rate = rate; // 0.95 for professional speaking clarity
    utterance.pitch = pitch;

    // Pick Thai voice if available
    const voices = synthRef.current.getVoices();
    const thaiVoice = voices.find(v => v.lang.startsWith('th') || v.name.toLowerCase().includes('thai'));
    if (thaiVoice) {
      utterance.voice = thaiVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setCurrentText(text);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setCurrentText(null);
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      setIsPlaying(false);
      setCurrentText(null);
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  }, [isPlaying, currentText, stop]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  return {
    isSupported,
    isPlaying,
    currentText,
    speak,
    stop
  };
}
