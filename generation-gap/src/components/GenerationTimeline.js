import React from 'react';
import './GenerationTimeline.css';
import character1 from '../assets/character-1.png';
import character2 from '../assets/character-2.png';
import character3 from '../assets/character-3.png';
import character4 from '../assets/character-4.png';
import character5 from '../assets/character-5.png';
import character6 from '../assets/character-6.png';
import generationsData from '../data/generations.json';

const characterMap = {
  "Generation Alpha": character1,
  "Generation Z": character2,
  "Millennials": character3,
  "Generation X": character4,
  "Baby Boomers": character5,
  "Silent Generation": character6
};

const GenerationTimeline = ({ translations, loading, submittedText }) => {
  const { generations, timelineConfig } = generationsData;

  return (
    <div className="timeline-container">
      <ul className="timeline-events">
        {generations.map((gen) => (
          <li key={gen.name} className={`timeline-${gen.slug}`}>
            {submittedText && (
              <div className="speech-bubble">
                <div className="translated-text">
                  {loading?.[gen.name] ? (
                    <div className="loading">
                      <div className="dot"></div>
                      <div className="dot"></div>
                      <div className="dot"></div>
                    </div>
                  ) : translations?.[gen.name] ? (
                    translations[gen.name]
                  ) : (
                    "Waiting for translation..."
                  )}
                </div>
              </div>
            )}
            <img src={characterMap[gen.name]} alt={gen.name} className="timeline-character" />
            <div className="timeline-label">
              <h2>{gen.name}</h2>
              <h3>{gen.period}</h3>
              <p className="age-range">Ages {gen.ages} in {gen.agesReferenceYear}</p>
            </div>
          </li>
        ))}
      </ul>
      <ul className="timelines-years">
        {timelineConfig.yearMarkers.map(year => (
          <li key={year}>{year}</li>
        ))}
      </ul>
    </div>
  );
};

export default GenerationTimeline; 