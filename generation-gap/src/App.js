import { useState, useEffect } from 'react';
import './App.css';
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

  return (
    <div className="App">
      <div className="input-container">
        <div className="character-count">
          {text.length}/{maxTranslationLength} characters
        </div>
        <div className="input-text-container">
          <textarea
            value={text}
            onChange={handleTextChange}
            onKeyPress={handleKeyPress}
            maxLength={maxTranslationLength}
            placeholder="Give us something to say?"
            className="text-input"
            autoFocus
          />
        <div className="submit-button-container">
          <button 
            onClick={handleSubmit}
            className="submit-button"
            disabled={!text.trim() || Object.values(loading).some(Boolean)}
            >
          Speak
        </button>
        </div>
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
