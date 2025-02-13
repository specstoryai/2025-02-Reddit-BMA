from flask import Flask, jsonify, render_template, session, redirect, url_for, request
import json
import os
import re
from dotenv import load_dotenv
import logging
from .ai_debate import get_debate_positions_and_arguments

load_dotenv()  # Load environment variables from .env file

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('debug.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = 'your-secret-key-here'  # Required for session management

# Load topics from JSON file
def load_topics():
    with open(os.path.join(os.path.dirname(__file__), 'data/topics.json')) as f:
        return json.load(f)

def slugify(text):
    # Convert to lowercase and replace spaces with hyphens
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text

@app.route('/')
def index():
    # Set default mode to player-vs-ai if not set
    if 'mode' not in session:
        session['mode'] = 'player-vs-ai'
    topics = load_topics()
    return render_template('index.html', topics=topics['topics'], current_mode=session['mode'])

@app.route('/mode/<mode_name>/')
def set_mode(mode_name):
    if mode_name in ['player-vs-player', 'player-vs-ai', 'ai-vs-ai']:
        session['mode'] = mode_name
    return redirect(url_for('index'))

@app.route('/custom-debate', methods=['POST'])
def custom_debate():
    topic = request.form.get('topic')
    if not topic:
        return redirect(url_for('index'))
    
    custom_topic = {
        'id': f'custom-{slugify(topic)}',
        'title': topic,
        'category': 'custom'
    }
    session['custom_topic'] = custom_topic
    return redirect(url_for('debate', topic_id=custom_topic['id']))

@app.route('/debate/<topic_id>')
def debate(topic_id):
    if topic_id.startswith('custom-'):
        topic = session.get('custom_topic')
        if not topic:
            return redirect(url_for('index'))
    else:
        topics = load_topics()
        topic = next((t for t in topics['topics'] if t['id'] == topic_id), None)
        if topic is None:
            return "Topic not found", 404
    
    return render_template('debate.html', 
                         topic=topic, 
                         mode=session.get('mode', 'player-vs-ai'))

@app.route('/api/get-ai-responses', methods=['POST'])
def get_ai_responses():
    logger.info(f"Received request data: {request.get_data(as_text=True)}")
    logger.info(f"Request content type: {request.content_type}")
    logger.info(f"Request JSON: {request.json}")
    
    topic = request.json.get('topic')
    logger.info(f"Extracted topic: {topic}")
    
    if not topic:
        logger.error("No topic provided in request")
        return jsonify({'error': 'No topic provided'}), 400, {'Content-Type': 'application/json'}
    
    try:
        positions, arguments = get_debate_positions_and_arguments(topic)
        return jsonify({
            'positions': positions,
            'arguments': arguments
        }), 200, {'Content-Type': 'application/json'}
    except Exception as e:
        logger.error(f"Error getting AI responses: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500, {'Content-Type': 'application/json'}

if __name__ == '__main__':
    app.run(debug=True) 