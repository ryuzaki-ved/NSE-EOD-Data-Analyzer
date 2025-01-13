import requests
import json
import pandas as pd
import os
from pathlib import Path

def read_csv_files_from_folder(folder_path):
    """Read all CSV files from a folder and return their content as a string"""
    csv_contents = []
    
    # Check if folder exists
    if not os.path.exists(folder_path):
        print(f"Folder '{folder_path}' not found!")
        return ""
    
    # Get all CSV files in the folder
    csv_files = Path(folder_path).glob('*.csv')
    
    for csv_file in csv_files:
        try:
            # Read CSV file
            df = pd.read_csv(csv_file)
            
            # Convert to string format with file name as header
            file_content = f"\n--- File: {csv_file.name} ---\n"
            file_content += df.to_string(index=False)
            
            csv_contents.append(file_content)
            print(f"Loaded: {csv_file.name}")
            
        except Exception as e:
            print(f"Error reading {csv_file.name}: {e}")
    
    return "\n\n".join(csv_contents)

# Read all CSV files from fii_der folder
folder_path = "part_w_oi"
csv_context = read_csv_files_from_folder(folder_path)

# Prepare the message with context
user_question = """Calculate the OI sentiment score using the following steps:

1. Get the latest date's participant OI data for all participants (Client, FII, DII, Pro)

2. For each participant, extract these position values:
   - Call Long: option_index_call_long
   - Put Long: option_index_put_long
   - Call Short: option_index_call_short
   - Put Short: option_index_put_short

3. Calculate total positions across all participants:
   total_call_long = sum of all participants' call_long
   total_put_long = sum of all participants' put_long
   total_call_short = sum of all participants' call_short
   total_put_short = sum of all participants' put_short
   grand_total = total_call_long + total_put_long + total_call_short + total_put_short

4. Calculate percentage for each participant-position combination:
   percentage = (participant_position_value / grand_total) * 100

5. Calculate final sentiment score:
   score = 0
   for each participant:
       score += call_long_percentage
       score += put_short_percentage
       score -= call_short_percentage
       score -= put_long_percentage

6. Classify sentiment based on score:
   - ≤ -30: Highly Bearish
   - -30 to -10: Bearish
   - -10 to -5: Slightly Bearish
   - -5 to 5: Neutral
   - 5 to 10: Slightly Bullish
   - 10 to 30: Bullish
   - ≥ 30: Highly Bullish

The score represents market sentiment where positive values indicate bullish positioning and negative values indicate bearish positioning."""  # Your actual question

# Create a message with context
if csv_context:
    message_content = f"""Based on the following data from CSV files:

{csv_context}

Question: {user_question}"""
else:
    message_content = user_question

# Make the API request
response = requests.post(
    url="https://openrouter.ai/api/v1/chat/completions",
    headers={
        "Authorization": "Bearer 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",
        "Content-Type": "application/json",
        # "HTTP-Referer": "<YOUR_SITE_URL>",  # Optional
        # "X-Title": "<YOUR_SITE_NAME>",  # Optional
    },
    data=json.dumps({
        "model": "deepseek/deepseek-r1-0528-qwen3-8b:free",
        "messages": [
            {
                "role": "system",
                "content": "You are a helpful assistant that analyzes data from CSV files and answers questions based on that data."
            },
            {
                "role": "user",
                "content": message_content
            }
        ]
    })
)
import json
import textwrap

# IMPORTANT: Convert response to JSON
response_json = response.json()

def print_response_neatly(response_data):
    """Print the API response in a readable format"""
    
    print("="*80)
    print("API RESPONSE DETAILS")
    print("="*80)
    
    # Basic Information
    print("\n📋 BASIC INFO:")
    print(f"  • ID: {response_data.get('id', 'N/A')}")
    print(f"  • Model: {response_data.get('model', 'N/A')}")
    print(f"  • Provider: {response_data.get('provider', 'N/A')}")
    print(f"  • Created: {response_data.get('created', 'N/A')}")
    
    # Token Usage
    if 'usage' in response_data:
        print("\n📊 TOKEN USAGE:")
        usage = response_data['usage']
        print(f"  • Prompt Tokens: {usage.get('prompt_tokens', 0):,}")
        print(f"  • Completion Tokens: {usage.get('completion_tokens', 0):,}")
        print(f"  • Total Tokens: {usage.get('total_tokens', 0):,}")
    
    # Main Content
    if 'choices' in response_data and response_data['choices']:
        choice = response_data['choices'][0]
        message = choice.get('message', {})
        content = message.get('content', '')
        
        print("\n" + "="*80)
        print("ASSISTANT'S RESPONSE")
        print("="*80)
        
        # Print the formatted content
        print(content)
        
        # Additional Details
        print("\n" + "-"*80)
        print("ADDITIONAL DETAILS")
        print("-"*80)
        
        print(f"\n• Finish Reason: {choice.get('finish_reason', 'N/A')}")
        print(f"• Role: {message.get('role', 'N/A')}")
        
        # If there's reasoning data
        if 'reasoning' in message:
            print("\n📝 REASONING PROVIDED:")
            reasoning_text = message.get('reasoning', '')
            # Wrap long text for better readability
            wrapped_text = textwrap.fill(reasoning_text, width=78, initial_indent="  ", subsequent_indent="  ")
            print(wrapped_text[:500] + "..." if len(wrapped_text) > 500 else wrapped_text)
    
    print("\n" + "="*80)

def print_main_content(response_data):
    """Extract and print only the main content from the response"""
    
    if 'choices' in response_data and response_data['choices']:
        content = response_data['choices'][0]['message']['content']
        
        print("\n" + "="*80)
        print("OI SENTIMENT ANALYSIS RESULT")
        print("="*80 + "\n")
        
        # Print the content as-is (it's already well-formatted)
        print(content)
        
        # Print token usage at the end
        if 'usage' in response_data:
            print("\n" + "-"*80)
            print(f"Tokens Used: {response_data['usage']['total_tokens']:,} total")
            print("-"*80)
    else:
        print("No content found in response")

# Check if request was successful
if response.status_code == 200:
    # Use the converted JSON data
    print_response_neatly(response_json)
    
    # Or if you prefer just the main content:
    # print_main_content(response_json)
else:
    print(f"Error: {response.status_code}")
    print(response.text)