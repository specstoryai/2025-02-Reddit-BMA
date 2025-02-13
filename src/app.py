from flask import Flask, jsonify, render_template, session, redirect, url_for, request
import json
import os
import re

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
    # Check if it's a custom topic
    if topic_id.startswith('custom-'):
        topic = session.get('custom_topic')
        if not topic:
            return redirect(url_for('index'))
    else:
        # Load from regular topics
        topics = load_topics()
        topic = next((t for t in topics['topics'] if t['id'] == topic_id), None)
        if topic is None:
            return "Topic not found", 404
    
    return render_template('debate.html', topic=topic, mode=session.get('mode', 'player-vs-ai'))

if __name__ == '__main__':
    app.run(debug=True) 