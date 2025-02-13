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

# Print all registered routes for debugging
print("Registered Routes:")
for rule in app.url_map.iter_rules():
    print(f"{rule.endpoint}: {rule.rule}")

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

@app.route('/mode/<mode_name>/')  # Added trailing slash
def set_mode(mode_name):
    if mode_name in ['player-vs-player', 'player-vs-ai', 'ai-vs-ai']:
        session['mode'] = mode_name
    return redirect(url_for('index'))

@app.route('/custom-debate', methods=['POST'])
def custom_debate():
    topic = request.form.get('topic')
    
    if not topic:
        return redirect(url_for('index'))
    
    # Create a custom topic object
    custom_topic = {
        'id': f'custom-{slugify(topic)}',
        'title': topic,
        'category': 'custom'  # Default category for custom topics
    }
    
    # Store in session for later use
    session['custom_topic'] = custom_topic
    
    return redirect(url_for('debate', topic_id=custom_topic['id']))

@app.route('/debate/<topic_id>')
def debate(topic_id):
    logger.info(f"Entering debate route with topic_id: {topic_id}, mode: {session.get('mode')}")
    logger.debug(f"Session contents: {dict(session)}")
    
    if topic_id.startswith('custom-'):
        topic = session.get('custom_topic')
        logger.info(f"Custom topic: {topic}")
        if not topic:
            logger.warning("No custom topic found in session")
            return redirect(url_for('index'))
    else:
        topics = load_topics()
        topic = next((t for t in topics['topics'] if t['id'] == topic_id), None)
        logger.info(f"Found topic: {topic}")
        if topic is None:
            logger.error(f"Topic not found: {topic_id}")
            return "Topic not found", 404
    
    # For AI vs. AI mode, get the initial positions and arguments
    initial_state = None
    if session.get('mode') == 'ai-vs-ai':
        logger.info("AI vs. AI mode detected, preparing to call Anthropic API")
        try:
            logger.info(f"Calling Anthropic API for topic: {topic['title']}")
            positions, arguments = get_debate_positions_and_arguments(topic['title'])
            logger.debug(f"Raw positions response: {positions}")
            logger.debug(f"Raw arguments response: {arguments}")
            initial_state = {
                'positions': positions,
                'arguments': arguments
            }
            logger.info("Successfully created initial state")
            logger.debug(f"Initial state: {initial_state}")
        except Exception as e:
            logger.error(f"Error in AI vs. AI mode: {str(e)}", exc_info=True)
            app.logger.error(f"Error getting AI debate content: {str(e)}")
            initial_state = {'error': str(e)}
    else:
        logger.info(f"Not in AI vs. AI mode, current mode: {session.get('mode')}")
    
    logger.info(f"Rendering debate template with initial_state: {initial_state}")
    return render_template('debate.html', 
                         topic=topic, 
                         mode=session.get('mode', 'player-vs-ai'),
                         initial_state=initial_state)

if __name__ == '__main__':
    app.run(debug=True) 