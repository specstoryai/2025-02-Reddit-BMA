import { useState } from 'react';
import logo from './logo.svg';
import './App.css';

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
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
