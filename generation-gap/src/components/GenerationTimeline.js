import React from 'react';
import './GenerationTimeline.css';
import character1 from '../assets/character-1.png';
import character2 from '../assets/character-2.png';
import character3 from '../assets/character-3.png';
import character4 from '../assets/character-4.png';
import character5 from '../assets/character-5.png';

const GenerationTimeline = ({ translations, loading, submittedText }) => {
  const generations = [
    { name: "Silent Generation", period: "1928-1945", character: character3 },
    { name: "Baby Boomers", period: "1946-1964", character: character4 },
    { name: "Generation X", period: "1965-1980", character: character5 },
    { name: "Generation Z", period: "1997-2009", character: character2 },
    { name: "Generation Alpha", period: "2010s-mid-2020s", character: character1 }
  ];

  return (
    <div className="timeline-container">
      <h1>Generation Timeline</h1>
      <ul className="timeline-events">
        {generations.map((gen, index) => (
          <li key={gen.name} className={`timeline-event-years-${index === 0 ? 7 : index === 1 ? 6 : index === 2 ? 4 : 3}`}>
            {submittedText && (
              <div className="speech-bubble">
                <div className="translated-text">
                  {loading?.[gen.name] ? (
                    <div className="loading">Translating...</div>
                  ) : translations?.[gen.name] ? (
                    translations[gen.name]
                  ) : (
                    "Waiting for translation..."
                  )}
                </div>
              </div>
            )}
            <img src={gen.character} alt={gen.name} className="timeline-character" />
            <h2>{gen.period}</h2>
            <h3>{gen.name}</h3>
          </li>
        ))}
      </ul>
      <ul className="timelines-years">
        <li>1920</li>
        <li>1930</li>
        <li>1940</li>
        <li>1950</li>
        <li>1960</li>
        <li>1970</li>
        <li>1980</li>
        <li>1990</li>
        <li>2000</li>
        <li>2010</li>
        <li>2020</li>
      </ul>
    </div>
  );
};

export default GenerationTimeline; 