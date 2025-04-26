import requests
from bs4 import BeautifulSoup
import os
import json
import time
import logging
from datetime import datetime
import re

# Set up logging
def setup_logging():
    if not os.path.exists('logs'):
        os.makedirs('logs')
    
    log_file = f'logs/cardinal_scraper_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(log_file),
            logging.StreamHandler()
        ]
    )
    return logging.getLogger(__name__)

def create_directory_structure():
    """Create the necessary directory structure for storing data"""
    directories = [
        'data',
        'data/raw',
        'data/processed',
        'data/photos',
        'data/backup'
    ]
    
    for directory in directories:
        if not os.path.exists(directory):
            os.makedirs(directory)
            logger.info(f"Created directory: {directory}")

def get_page_content(url):
    """Get the content of a page with error handling"""
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.text
    except Exception as e:
        logger.error(f"Error fetching {url}: {str(e)}")
        return None

def extract_cardinal_info(bio_url):
    """Extract detailed information from a cardinal's biography page"""
    content = get_page_content(bio_url)
    if not content:
        return None
    
    soup = BeautifulSoup(content, 'html.parser')
    info = {}
    
    # Extract photo URL
    img = soup.find('img', {'class': 'foto'})
    if img and 'src' in img.attrs:
        photo_url = img['src']
        if not photo_url.startswith('http'):
            photo_url = f"https://press.vatican.va{photo_url}"
        info['photo_url'] = photo_url
    
    # Extract biographical information
    content_div = soup.find('div', {'class': 'content'})
    if content_div:
        # Extract name and title
        name_elem = content_div.find('h1')
        if name_elem:
            info['full_name'] = name_elem.get_text(strip=True)
        
        # Extract biographical text
        paragraphs = content_div.find_all('p')
        bio_text = []
        for p in paragraphs:
            text = p.get_text(strip=True)
            if text:
                bio_text.append(text)
        info['biography'] = '\n'.join(bio_text)
        
        # Try to extract specific information using regex
        for text in bio_text:
            # Extract birth date
            birth_match = re.search(r'born on (\d{1,2} [A-Za-z]+ \d{4})', text)
            if birth_match:
                info['birth_date'] = birth_match.group(1)
            
            # Extract birth place
            birth_place_match = re.search(r'born in ([^,\.]+)', text)
            if birth_place_match:
                info['birth_place'] = birth_place_match.group(1)
            
            # Extract ordination date
            ordination_match = re.search(r'ordained priest on (\d{1,2} [A-Za-z]+ \d{4})', text)
            if ordination_match:
                info['ordination_date'] = ordination_match.group(1)
            
            # Extract cardinal creation date
            cardinal_match = re.search(r'created cardinal on (\d{1,2} [A-Za-z]+ \d{4})', text)
            if cardinal_match:
                info['cardinal_creation_date'] = cardinal_match.group(1)
    
    return info

def get_all_cardinals():
    """Scrape all cardinal information from the Vatican website"""
    base_url = 'https://press.vatican.va/content/salastampa/en/documentation/card_bio_typed.html'
    content = get_page_content(base_url)
    if not content:
        return []
    
    soup = BeautifulSoup(content, 'html.parser')
    cardinals = []
    
    # Find all links to cardinal biographies
    links = soup.find_all('a', href=True)
    for link in links:
        if 'card_bio' in link['href']:
            full_url = f"https://press.vatican.va{link['href']}"
            cardinal_name = link.get_text(strip=True)
            
            logger.info(f"Processing cardinal: {cardinal_name}")
            
            # Get detailed information
            cardinal_info = extract_cardinal_info(full_url)
            if cardinal_info:
                cardinal_info['name'] = cardinal_name
                cardinal_info['biography_url'] = full_url
                cardinals.append(cardinal_info)
            
            # Add delay to avoid overwhelming the server
            time.sleep(1)
    
    return cardinals

def main():
    # Set up logging
    global logger
    logger = setup_logging()
    logger.info("Starting cardinal data collection")
    
    # Create directory structure
    create_directory_structure()
    
    # Get all cardinals
    cardinals = get_all_cardinals()
    
    # Save raw data
    raw_data_file = f'data/raw/cardinals_raw_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
    with open(raw_data_file, 'w', encoding='utf-8') as f:
        json.dump(cardinals, f, ensure_ascii=False, indent=2)
    
    logger.info(f"Found {len(cardinals)} cardinals")
    logger.info(f"Raw data saved to {raw_data_file}")

if __name__ == "__main__":
    main()