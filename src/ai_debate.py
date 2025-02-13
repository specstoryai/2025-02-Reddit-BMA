import anthropic
import os
from typing import TypedDict, Tuple
import logging

logger = logging.getLogger(__name__)

class DebatePositions(TypedDict):
    position_one: str
    position_two: str

class DebateArguments(TypedDict):
    argument_one: str
    argument_two: str

def get_debate_positions_and_arguments(topic: str) -> Tuple[DebatePositions, DebateArguments]:
    logger.info(f"Starting debate generation for topic: {topic}")
    
    api_key = os.getenv('ANTHROPIC_API_KEY')
    if not api_key:
        logger.error("ANTHROPIC_API_KEY not found in environment variables")
        raise ValueError("ANTHROPIC_API_KEY not found in environment variables")
        
    # Initialize the client with just the API key
    client = anthropic.Anthropic(
        api_key=api_key,
    )
    logger.info("Anthropic client initialized")
    
    # First, get the canonical positions
    logger.info("Requesting debate positions from Anthropic")
    positions_prompt = f"""
    For the debate topic: "{topic}"
    
    1. What are the two main opposing positions in this debate? 
    Provide them in a clear, concise format like this:
    
    Position 1: [first position]
    Position 2: [second position]
    
    Keep each position statement to one sentence.
    """
    
    positions_message = client.messages.create(
        model="claude-3-sonnet-20240229",
        max_tokens=300,
        temperature=0,
        system="You are a debate topic analyzer. Your role is to identify the two main opposing positions in a debate topic.",
        messages=[{"role": "user", "content": positions_prompt}]
    )
    logger.info("Received positions response from Anthropic")
    
    # Parse positions from the response
    positions_text = positions_message.content[0].text
    logger.debug(f"Raw positions response: {positions_text}")
    position_lines = [line for line in positions_text.split('\n') if line.startswith('Position')]
    positions = DebatePositions(
        position_one=position_lines[0].split(': ', 1)[1],
        position_two=position_lines[1].split(': ', 1)[1]
    )
    logger.info(f"Parsed positions: {positions}")
    
    # Now get opening arguments for each position
    logger.info("Requesting opening arguments from Anthropic")
    arguments_prompt = f"""
    For the debate topic: "{topic}"
    
    Provide opening arguments for both positions:
    Position 1: {positions['position_one']}
    Position 2: {positions['position_two']}
    
    Format your response exactly like this:
    
    ARGUMENT_ONE_START
    [1-3 paragraphs arguing for Position 1]
    ARGUMENT_ONE_END
    
    ARGUMENT_TWO_START
    [1-3 paragraphs arguing for Position 2]
    ARGUMENT_TWO_END
    
    Make each argument compelling and well-structured.
    """
    
    arguments_message = client.messages.create(
        model="claude-3-sonnet-20240229",
        max_tokens=1000,
        temperature=0.7,
        system="You are a master debater who can argue both sides of any topic persuasively.",
        messages=[{"role": "user", "content": arguments_prompt}]
    )
    logger.info("Received arguments response from Anthropic")
    
    # Parse arguments from the response
    arguments_text = arguments_message.content[0].text
    logger.debug(f"Raw arguments response: {arguments_text}")
    argument_one = arguments_text.split('ARGUMENT_ONE_START')[1].split('ARGUMENT_ONE_END')[0].strip()
    argument_two = arguments_text.split('ARGUMENT_TWO_START')[1].split('ARGUMENT_TWO_END')[0].strip()
    
    arguments = DebateArguments(
        argument_one=argument_one,
        argument_two=argument_two
    )
    logger.info("Successfully parsed arguments")
    logger.debug(f"Parsed arguments: {arguments}")
    
    return positions, arguments 