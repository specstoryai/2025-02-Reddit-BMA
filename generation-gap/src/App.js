import { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import character1 from './assets/character-1.png';
import character2 from './assets/character-2.png';
import character3 from './assets/character-3.png';
import character4 from './assets/character-4.png';
import character5 from './assets/character-5.png';
import character6 from './assets/character-6.png';
import { generations, getRandomGenerations } from './utils/generations';
import { translateText } from './utils/anthropicClient';

function App() {
  const [text, setText] = useState('');
  const [submittedText, setSubmittedText] = useState('');
  const [activeGenerations, setActiveGenerations] = useState([]);
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState({});
  const maxLength = 140;
  const numCharacters = 6;

  useEffect(() => {
    // Set random generations on mount
    setActiveGenerations(getRandomGenerations(numCharacters));
  }, []);

  const handleSubmit = async () => {
    if (text.trim()) {
      setSubmittedText(text);
      // Reset translations
      setTranslations({});
      
      // Translate for each generation
      activeGenerations.forEach(async (generation) => {
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
    if (input.length <= maxLength) {
      setText(input);
    }
  };

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

  const characterImages = [character1, character2, character3, character4, character5, character6];

  return (
    <div className="App">
      <div className="input-container">
        <textarea
          value={text}
          onChange={handleTextChange}
          onKeyPress={handleKeyPress}
          maxLength={maxLength}
          placeholder="Type something to see how different generations would say it! (140 characters max)"
          className="text-input"
        />
        <div className="input-footer">
          <div className="character-count">
            {text.length}/{maxLength} characters
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
      <div className="characters-container">
        {activeGenerations.map((generation, index) => (
          <CharacterWithSpeechBubble
            key={generation.name}
            image={characterImages[index]}
            alt={`Character ${index + 1}`}
            text={submittedText}
            generation={generation}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
