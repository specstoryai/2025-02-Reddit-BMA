import { useState, useEffect } from 'react';
import './App.css';
import character1 from './assets/character-1.png';
import character2 from './assets/character-2.png';
import character3 from './assets/character-3.png';
import character4 from './assets/character-4.png';
import character5 from './assets/character-5.png';
import character6 from './assets/character-6.png';
import { translateText } from './utils/anthropicClient';
import GenerationTimeline from './components/GenerationTimeline';
import generationsData from './data/generations.json';

function App() {
  const [text, setText] = useState('');
  const [submittedText, setSubmittedText] = useState('');
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState({});
  const { maxTranslationLength } = generationsData.timelineConfig;

  const handleSubmit = async () => {
    if (text.trim()) {
      setSubmittedText(text);
      // Reset translations
      setTranslations({});
      
      // Translate for each generation
      generationsData.generations.forEach(async (generation) => {
        setLoading(prev => ({ ...prev, [generation.name]: true }));
        try {
          const translated = await translateText(text, generation);
          setTranslations(prev => ({
            ...prev,
            [generation.name]: translated
          }));
        } catch (error) {
          console.error(`Translation error for ${generation.name}:`, error);
          setTranslations(prev => ({
            ...prev,
            [generation.name]: `Error: ${error.message}`
          }));
        } finally {
          setLoading(prev => ({ ...prev, [generation.name]: false }));
        }
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextChange = (e) => {
    const input = e.target.value;
    if (input.length <= maxTranslationLength) {
      setText(input);
    }
  };

  // Set CSS variable for grid width
  useEffect(() => {
    document.documentElement.style.setProperty('--timeline-grid-width', generationsData.timelineConfig.gridWidth);
  }, []);

  const CharacterWithSpeechBubble = ({ image, alt, text, generation, index }) => (
    <div className="character-wrapper">
      {text && (
        <div className="speech-bubble">
          <div className="translated-text">
            {loading[generation.name] ? (
              <div className="loading">Translating...</div>
            ) : translations[generation.name] ? (
              translations[generation.name]
            ) : (
              "Waiting for translation..."
            )}
          </div>
        </div>
      )}
      <img src={image} alt={alt} className="character" />
      <div className="generation-label">
        <div className="generation-name">{generation.name}</div>
        <div className="generation-period">{generation.period}</div>
      </div>
    </div>
  );

  const characterImages = [
    character1, // Generation Alpha (leftmost)
    character2, // Generation Z
    character3, // Silent Generation
    character4, // Baby Boomers
    character5, // Generation X (rightmost)
    character6  // Not shown in timeline
  ];

  return (
    <div className="App">
      <div className="input-container">
        <textarea
          value={text}
          onChange={handleTextChange}
          onKeyPress={handleKeyPress}
          maxLength={maxTranslationLength}
          placeholder="Give us something to say?"
          className="text-input"
          autoFocus
        />
        <div className="input-footer">
          <div className="character-count">
            {text.length}/{maxTranslationLength} characters
          </div>
          <button 
            onClick={handleSubmit}
            className="submit-button"
            disabled={!text.trim() || Object.values(loading).some(Boolean)}
          >
            Translate
          </button>
        </div>
      </div>
      <div className="timeline-content-wrapper">
        <div className="timeline-scroll-container">
          <GenerationTimeline 
            translations={translations}
            loading={loading}
            submittedText={submittedText}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
