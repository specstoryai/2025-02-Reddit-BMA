import re
from datetime import datetime, timedelta
import nltk
from nltk.tokenize import word_tokenize, sent_tokenize
from textblob import TextBlob
from rake_nltk import Rake
import json
import pandas as pd
import matplotlib.pyplot as plt
from collections import Counter
import logging
import os
import sys
import traceback

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

def ensure_nltk_data():
    """Ensure all required NLTK data is downloaded"""
    logger.info("Checking and downloading required NLTK data...")
    required_packages = {
        'punkt': 'tokenizers/punkt',
        'stopwords': 'corpora/stopwords',
        'averaged_perceptron_tagger': 'taggers/averaged_perceptron_tagger',
        'punkt_tab': 'tokenizers/punkt_tab'  # Added this required package
    }
    
    # First try downloading everything
    for package, path in required_packages.items():
        try:
            logger.info(f"Checking {package}...")
            nltk.data.find(path)
            logger.info(f"{package} already downloaded")
        except LookupError:
            logger.info(f"{package} not found, downloading...")
            try:
                nltk.download(package)
                logger.info(f"Successfully downloaded {package}")
            except Exception as e:
                logger.error(f"Error downloading {package}: {str(e)}")
                raise RuntimeError(f"Failed to download required NLTK data: {package}") from e

class SimpleTokenizer:
    """Fallback tokenizer when NLTK fails"""
    @staticmethod
    def tokenize(text):
        # Simple sentence splitting on common punctuation
        sentences = re.split(r'[.!?]+\s+', text)
        return [s.strip() for s in sentences if s.strip()]

class SimpleKeywordExtractor:
    """Fallback keyword extractor when RAKE fails"""
    def __init__(self):
        self.common_words = set(['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 
                               'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at'])
        
    def extract_keywords(self, text):
        # Simple word frequency-based extraction
        words = re.findall(r'\b\w+\b', text.lower())
        # Filter out common words and short words
        keywords = [w for w in words if w not in self.common_words and len(w) > 3]
        # Count frequencies
        freq = Counter(keywords)
        # Return top phrases (single words in this case)
        return [word for word, count in freq.most_common(5)]

class TranscriptAnalyzer:
    def __init__(self, vtt_file):
        self.vtt_file = vtt_file
        self.segments = []
        
        # Initialize NLTK components first
        try:
            from nltk.tokenize import sent_tokenize, RegexpTokenizer
            from nltk.corpus import stopwords
            
            # Get English stopwords and add custom ones for this context
            stop_words = list(stopwords.words('english'))
            stop_words.extend(['uh', 'um', 'like', 'yeah', 'hey', 'okay', 'oh', 'gonna'])
            
            # Create a custom tokenizer that handles speech patterns better
            word_tokenizer = RegexpTokenizer(r'\w+')
            
            # Initialize RAKE with our custom settings
            self.rake = Rake(
                stopwords=stop_words,
                punctuations=r'[.!?,;:\-\"\']\s*',
                language='english',  # Explicitly set language
                ranking_metric=1,    # Use degree to frequency ratio
                min_length=2,        # Minimum phrase length
                max_length=4         # Maximum phrase length
            )
            
            # Test RAKE initialization with a more complex test
            test_text = "This is a complex test sentence for RAKE initialization. It includes multiple phrases and some key terms."
            self.rake.extract_keywords_from_text(test_text)
            test_phrases = self.rake.get_ranked_phrases()
            if not test_phrases:
                raise RuntimeError("RAKE initialization failed - no phrases extracted from test text")
            logger.info(f"Successfully initialized RAKE - test phrases: {test_phrases[:2]}")
            
        except Exception as e:
            logger.error(f"Failed to initialize RAKE properly: {str(e)}")
            logger.error("This is a critical error - RAKE is required for analysis")
            raise

        self.df = None
        logger.info(f"Initialized TranscriptAnalyzer with file: {vtt_file}")
        
    def parse_timestamp(self, timestamp):
        """Convert VTT timestamp to datetime object"""
        try:
            logger.debug(f"Parsing timestamp: {timestamp}")
            # Handle potential alignment info in timestamp
            timestamp = timestamp.split(' ')[0]  # Remove alignment info if present
            
            # Split the timestamp
            parts = timestamp.split(':')
            if len(parts) == 3:
                hours, minutes, seconds = parts
            elif len(parts) == 2:
                # If only minutes:seconds format, assume 0 hours
                hours = "00"
                minutes, seconds = parts
            else:
                raise ValueError(f"Invalid timestamp format: {timestamp}")
            
            # Split seconds and milliseconds
            if '.' in seconds:
                seconds, milliseconds = seconds.split('.')
                # Ensure milliseconds is 3 digits
                milliseconds = milliseconds.ljust(3, '0')[:3]
            else:
                milliseconds = "000"
            
            # Convert to integers with error checking
            try:
                hours = int(hours)
                minutes = int(minutes)
                seconds = int(seconds)
                milliseconds = int(milliseconds)
            except ValueError as e:
                logger.error(f"Invalid numeric values in timestamp: {timestamp}")
                raise
            
            # Validate ranges
            if not (0 <= hours <= 23 and 0 <= minutes <= 59 and 0 <= seconds <= 59 and 0 <= milliseconds <= 999):
                raise ValueError(f"Timestamp values out of range: {timestamp}")
            
            return timedelta(
                hours=hours,
                minutes=minutes,
                seconds=seconds,
                milliseconds=milliseconds
            )
        except Exception as e:
            logger.error(f"Error parsing timestamp '{timestamp}': {str(e)}")
            # Return a default value instead of raising
            logger.warning("Using default timestamp of 0")
            return timedelta(seconds=0)
    
    def parse_vtt(self):
        """Parse VTT file into segments"""
        logger.info("Starting VTT file parsing...")
        try:
            if not os.path.exists(self.vtt_file):
                raise FileNotFoundError(f"VTT file not found: {self.vtt_file}")
                
            with open(self.vtt_file, 'r', encoding='utf-8') as f:
                content = f.read()
                logger.info(f"Successfully read {len(content)} bytes from {self.vtt_file}")
            
            if not content.strip():
                raise ValueError("VTT file is empty")
            
            if 'WEBVTT' not in content:
                logger.warning("File may not be a valid WEBVTT file (missing WEBVTT header)")
            
            # Split into blocks
            blocks = content.split('\n\n')
            logger.info(f"Found {len(blocks)} blocks in VTT file")
            
            # Skip header blocks (WEBVTT and metadata)
            content_blocks = [b for b in blocks if '-->' in b]
            logger.info(f"Found {len(content_blocks)} content blocks with timestamps")
            
            if not content_blocks:
                raise ValueError("No valid content blocks found in VTT file")
            
            for i, block in enumerate(content_blocks, 1):
                try:
                    lines = block.strip().split('\n')
                    if len(lines) >= 2:
                        # Parse timestamp line
                        if '-->' in lines[0]:
                            timestamp_line = lines[0]
                            start_time, end_time = [t.strip() for t in timestamp_line.split('-->')]
                            
                            # Get text content
                            text = ' '.join(lines[1:])
                            # Remove HTML-style tags
                            text = re.sub(r'<[^>]+>', '', text)
                            # Remove speaker labels in brackets
                            text = re.sub(r'\[[^\]]+\]', '', text)
                            
                            if text.strip():
                                segment = {
                                    'start_time': self.parse_timestamp(start_time),
                                    'end_time': self.parse_timestamp(end_time),
                                    'text': text.strip()
                                }
                                self.segments.append(segment)
                                logger.debug(f"Processed segment {i}: {start_time} -> {end_time}")
                except Exception as e:
                    logger.error(f"Error processing block {i}: {str(e)}\nBlock content: {block}")
                    continue
            
            if not self.segments:
                raise ValueError("No valid segments extracted from VTT file")
                
            logger.info(f"Successfully parsed {len(self.segments)} segments")
            
        except Exception as e:
            logger.error(f"Error parsing VTT file: {str(e)}")
            raise
    
    def preprocess_text(self, text):
        """Clean and preprocess text for analysis"""
        # Remove repeated phrases (common in transcripts)
        words = text.split()
        cleaned_words = []
        i = 0
        while i < len(words):
            # Look for repeated phrases up to 5 words long
            repeated = False
            for phrase_len in range(5, 0, -1):
                if i + phrase_len * 2 <= len(words):
                    phrase1 = ' '.join(words[i:i+phrase_len])
                    phrase2 = ' '.join(words[i+phrase_len:i+phrase_len*2])
                    if phrase1 == phrase2:
                        cleaned_words.extend(words[i:i+phrase_len])
                        i += phrase_len * 2
                        repeated = True
                        break
            if not repeated:
                cleaned_words.append(words[i])
                i += 1
        
        # Join words back together
        cleaned_text = ' '.join(cleaned_words)
        
        # Additional cleaning
        cleaned_text = re.sub(r'\s+', ' ', cleaned_text)  # Remove extra whitespace
        cleaned_text = re.sub(r'[^\w\s.,!?-]', '', cleaned_text)  # Remove special characters
        cleaned_text = cleaned_text.strip()
        
        return cleaned_text

    def analyze_text(self, text):
        """Analyze a piece of text for key phrases and sentiment"""
        if not text.strip():
            logger.warning("Empty text provided for analysis")
            return {
                'text': text,
                'key_phrases': [],
                'sentiment': {'polarity': 0.0, 'subjectivity': 0.5}
            }

        try:
            # Clean and preprocess the text
            cleaned_text = self.preprocess_text(text)
            if not cleaned_text:
                logger.warning("Text was empty after preprocessing")
                return {
                    'text': text,
                    'key_phrases': [],
                    'sentiment': {'polarity': 0.0, 'subjectivity': 0.5}
                }
            
            # RAKE analysis
            self.rake.extract_keywords_from_text(cleaned_text)
            key_phrases = self.rake.get_ranked_phrases()[:5]
            if not key_phrases:
                logger.warning(f"No key phrases found in text: {cleaned_text[:100]}...")
            
            # Sentiment analysis
            blob = TextBlob(cleaned_text)
            sentiment = {
                'polarity': blob.sentiment.polarity,
                'subjectivity': blob.sentiment.subjectivity
            }
            
            # Log analysis results for debugging
            logger.debug(f"Original text: {text[:100]}...")
            logger.debug(f"Cleaned text: {cleaned_text[:100]}...")
            logger.debug(f"Key phrases: {key_phrases}")
            logger.debug(f"Sentiment: {sentiment}")
            
            return {
                'text': cleaned_text,
                'key_phrases': key_phrases,
                'sentiment': sentiment
            }
        except Exception as e:
            logger.error(f"Error in text analysis: {str(e)}")
            logger.error(f"Problematic text: {text[:100]}...")
            raise
    
    def analyze_segments(self, window_size=timedelta(seconds=30)):
        """Analyze segments in time windows"""
        logger.info(f"Starting segment analysis with {window_size} window size...")
        results = []
        if not self.segments:
            logger.warning("No segments to analyze!")
            return results
            
        current_window_start = self.segments[0]['start_time']
        current_window_end = current_window_start + window_size
        current_window_text = []
        
        total_segments = len(self.segments)
        for i, segment in enumerate(self.segments, 1):
            logger.debug(f"Processing segment {i}/{total_segments}")
            while segment['start_time'] >= current_window_end:
                # Analyze current window if we have text
                if current_window_text:
                    window_text = ' '.join(current_window_text)
                    analysis = self.analyze_text(window_text)
                    results.append({
                        'start_time': current_window_start,
                        'end_time': current_window_end,
                        **analysis
                    })
                    logger.debug(f"Analyzed window: {current_window_start} -> {current_window_end}")
                
                # Move to next window
                current_window_start = current_window_end
                current_window_end = current_window_start + window_size
                current_window_text = []
            
            current_window_text.append(segment['text'])
        
        # Analyze final window
        if current_window_text:
            window_text = ' '.join(current_window_text)
            analysis = self.analyze_text(window_text)
            results.append({
                'start_time': current_window_start,
                'end_time': current_window_end,
                **analysis
            })
            logger.debug("Analyzed final window")
        
        # Convert results to DataFrame for easier analysis
        try:
            self.df = pd.DataFrame(results)
        except Exception as e:
            logger.error(f"Failed to create DataFrame: {str(e)}")
            # Create a minimal DataFrame with just the essential columns
            self.df = pd.DataFrame({
                'start_time': [r['start_time'] for r in results],
                'end_time': [r['end_time'] for r in results],
                'text': [r['text'] for r in results]
            })
        
        logger.info(f"Completed analysis of {len(results)} windows")
        return results
    
    def visualize_results(self, results):
        """Create visualizations of the analysis"""
        logger.info("Starting visualization generation...")
        if not results or self.df is None:
            logger.warning("No results to visualize!")
            return
            
        try:
            # Create figure with subplots
            fig = plt.figure(figsize=(15, 15))
            gs = fig.add_gridspec(3, 1, height_ratios=[2, 2, 1])
            logger.info("Created figure layout")
            
            try:
                # 1. Sentiment over time
                logger.info("Generating sentiment over time plot...")
                ax1 = fig.add_subplot(gs[0])
                times = self.df['start_time'].apply(lambda x: x.total_seconds() / 60)
                sentiments = pd.DataFrame([s for s in self.df['sentiment']])
                
                ax1.plot(times, sentiments['polarity'], label='Polarity', color='blue', marker='o')
                ax1.plot(times, sentiments['subjectivity'], label='Subjectivity', color='red', marker='s')
                ax1.set_xlabel('Time (minutes)')
                ax1.set_ylabel('Score')
                ax1.set_title('Sentiment Analysis Over Time')
                ax1.grid(True, alpha=0.3)
                ax1.legend()
            except Exception as e:
                logger.error(f"Failed to create sentiment plot: {str(e)}")
            
            try:
                # 2. Key phrases frequency
                logger.info("Generating key phrases frequency plot...")
                ax2 = fig.add_subplot(gs[1])
                all_phrases = [phrase for phrases in self.df['key_phrases'] for phrase in phrases]
                phrase_series = pd.Series(all_phrases)
                top_phrases = phrase_series.value_counts().head(10)
                
                bars = ax2.barh(range(len(top_phrases)), top_phrases.values, color='skyblue')
                ax2.set_yticks(range(len(top_phrases)))
                ax2.set_yticklabels(top_phrases.index)
                ax2.invert_yaxis()
                ax2.set_title('Top Key Phrases')
                
                # Add value labels on bars
                for i, v in enumerate(top_phrases.values):
                    ax2.text(v, i, f' {v}', va='center')
            except Exception as e:
                logger.error(f"Failed to create key phrases plot: {str(e)}")
            
            try:
                # 3. Rolling sentiment (smoothed trend)
                logger.info("Generating smoothed sentiment trends...")
                ax3 = fig.add_subplot(gs[2])
                window = min(3, len(sentiments))  # Ensure window size doesn't exceed data length
                rolling_polarity = sentiments['polarity'].rolling(window=window, center=True).mean()
                rolling_subjectivity = sentiments['subjectivity'].rolling(window=window, center=True).mean()
                
                ax3.plot(times, rolling_polarity, label='Polarity Trend', color='blue', linestyle='--')
                ax3.plot(times, rolling_subjectivity, label='Subjectivity Trend', color='red', linestyle='--')
                ax3.set_xlabel('Time (minutes)')
                ax3.set_ylabel('Score')
                ax3.set_title('Smoothed Sentiment Trends')
                ax3.grid(True, alpha=0.3)
                ax3.legend()
            except Exception as e:
                logger.error(f"Failed to create smoothed trends plot: {str(e)}")
            
            plt.tight_layout()
            plt.savefig('transcript_analysis.png', dpi=300, bbox_inches='tight')
            logger.info("Saved visualization to transcript_analysis.png")
            
        except Exception as e:
            logger.error(f"Failed to create visualizations: {str(e)}")
            # Try to create a simple figure with just text
            try:
                plt.figure(figsize=(10, 5))
                plt.text(0.5, 0.5, "Error creating visualizations\nPlease check the logs", 
                        ha='center', va='center')
                plt.axis('off')
                plt.savefig('transcript_analysis.png')
            except Exception as viz_error:
                logger.error(f"Failed to create error visualization: {str(viz_error)}")
        
        try:
            # Save detailed results to JSON
            logger.info("Saving detailed results to JSON...")
            with open('transcript_analysis.json', 'w') as f:
                # Convert timedelta objects to strings for JSON serialization
                json_results = []
                for r in results:
                    r_copy = r.copy()
                    r_copy['start_time'] = str(r_copy['start_time'])
                    r_copy['end_time'] = str(r_copy['end_time'])
                    json_results.append(r_copy)
                json.dump(json_results, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save results JSON: {str(e)}")
        
        try:
            # Generate additional statistics
            logger.info("Generating statistics...")
            stats = {
                'total_duration_minutes': (self.df['end_time'].max() - self.df['start_time'].min()).total_seconds() / 60,
                'average_polarity': sentiments['polarity'].mean(),
                'average_subjectivity': sentiments['subjectivity'].mean(),
                'most_positive_moment': {
                    'time': str(self.df.loc[sentiments['polarity'].idxmax(), 'start_time']),
                    'text': self.df.loc[sentiments['polarity'].idxmax(), 'text'],
                    'polarity': sentiments['polarity'].max()
                },
                'most_negative_moment': {
                    'time': str(self.df.loc[sentiments['polarity'].idxmin(), 'start_time']),
                    'text': self.df.loc[sentiments['polarity'].idxmin(), 'text'],
                    'polarity': sentiments['polarity'].min()
                },
                'top_phrases': top_phrases.to_dict()
            }
            
            # Save statistics to a separate file
            with open('transcript_stats.json', 'w') as f:
                json.dump(stats, f, indent=2)
            logger.info("Saved statistics to transcript_stats.json")
        except Exception as e:
            logger.error(f"Failed to save statistics: {str(e)}")

def main():
    try:
        logger.info("Starting transcript analysis...")
        # Ensure NLTK data is available
        ensure_nltk_data()
        
        # Initialize analyzer
        analyzer = TranscriptAnalyzer('WillFerrellSpeech.vtt')
        
        # Parse VTT file
        try:
            analyzer.parse_vtt()
        except FileNotFoundError:
            logger.error("VTT file not found. Please ensure the file exists in the correct location.")
            sys.exit(1)
        except Exception as e:
            logger.error(f"Failed to parse VTT file: {str(e)}")
            sys.exit(1)
        
        # Analyze segments
        try:
            results = analyzer.analyze_segments()
        except Exception as e:
            logger.error(f"Failed to analyze segments: {str(e)}")
            sys.exit(1)
        
        # Generate visualizations and save results
        try:
            analyzer.visualize_results(results)
        except Exception as e:
            logger.error(f"Failed to generate visualizations: {str(e)}")
        
        logger.info("Analysis complete! Output files generated:")
        logger.info("- transcript_analysis.png (visualizations)")
        logger.info("- transcript_analysis.json (detailed results)")
        logger.info("- transcript_stats.json (summary statistics)")
    except Exception as e:
        logger.error(f"Error during analysis: {str(e)}")
        logger.error("Full traceback:")
        logger.error(traceback.format_exc())
        sys.exit(1)

if __name__ == "__main__":
    main() 