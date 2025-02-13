import { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import character1 from './assets/character-1.png';
import character2 from './assets/character-2.png';
import character3 from './assets/character-3.png';
import character4 from './assets/character-4.png';
import character5 from './assets/character-5.png';
import character6 from './assets/character-6.png';

function App() {
  const [text, setText] = useState('');
  const maxLength = 140;

  const handleTextChange = (e) => {
    const input = e.target.value;
    if (input.length <= maxLength) {
      setText(input);
    }
  };

  return (
    <div className="App">
      <div className="input-container">
        <textarea
          value={text}
          onChange={handleTextChange}
          maxLength={maxLength}
          placeholder="Paste your snippet here (140 characters max)"
          className="text-input"
        />
        <div className="character-count">
          {text.length}/{maxLength} characters
        </div>
      </div>
      <div className="characters-container">
        <img src={character1} alt="Character 1" className="character" />
        <img src={character2} alt="Character 2" className="character" />
        <img src={character3} alt="Character 3" className="character" />
        <img src={character4} alt="Character 4" className="character" />
        <img src={character5} alt="Character 5" className="character" />
        <img src={character6} alt="Character 6" className="character" />
      </div>
    </div>
  );
}

export default App;
