import React from 'react';
import './GenerationTimeline.css';
import character1 from '../assets/character-1.png';
import character2 from '../assets/character-2.png';
import character3 from '../assets/character-3.png';
import character4 from '../assets/character-4.png';
import character5 from '../assets/character-5.png';
import character6 from '../assets/character-6.png';

const GenerationTimeline = ({ translations, loading, submittedText }) => {
  const generations = [
    { name: "Silent Generation", period: "1928-1945", ages: "80-97", character: character6 },
    { name: "Baby Boomers", period: "1946-1964", ages: "61-79", character: character5 },
    { name: "Generation X", period: "1965-1980", ages: "45-60", character: character4 },
    { name: "Millennials", period: "1981-1996", ages: "29-44", character: character3 },
    { name: "Generation Z", period: "1997-2012", ages: "13-28", character: character2 },
    { name: "Generation Alpha", period: "2010-2024", ages: "1-15", character: character1 }
  ];

  return (
    <div className="timeline-container">
      <ul className="timeline-events">
        {generations.map((gen, index) => (
          <li key={gen.name} className={`timeline-event-years-${index + 3}`}>
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
            <div className="timeline-label">
              <h2>{gen.period}</h2>
              <h3>{gen.name}</h3>
              <p className="age-range">Ages {gen.ages} in 2025</p>
            </div>
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
        <li>2025</li>
      </ul>
    </div>
  );
};

export default GenerationTimeline; 