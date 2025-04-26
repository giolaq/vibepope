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
    """Set up logging configuration"""
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
        'data/processed'
    ]
    
    for directory in directories:
        if not os.path.exists(directory):
            os.makedirs(directory)
            logger.info(f"Created directory: {directory}")

def get_page_content(url, retries=3, delay=1):
    """Get the content of a page with retry mechanism"""
    for attempt in range(retries):
        try:
            response = requests.get(url)
            response.raise_for_status()
            return response.text
        except Exception as e:
            logger.error(f"Error fetching {url} (attempt {attempt + 1}/{retries}): {str(e)}")
            if attempt < retries - 1:
                time.sleep(delay)
            else:
                return None

def save_html_to_file(html_content, filename):
    """Save HTML content to a file for inspection"""
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(html_content)
        logger.info(f"Saved HTML content to {filename}")
        return True
    except Exception as e:
        logger.error(f"Error saving HTML to {filename}: {str(e)}")
        return False

def extract_cardinals():
    """Extract cardinal information directly from the webpage"""
    url = 'https://press.vatican.va/content/salastampa/en/documentation/card_bio_typed/card_bio_ele.html'
    html_content = get_page_content(url)
    if not html_content:
        return []
    
    # Save the HTML content for inspection
    save_html_to_file(html_content, 'data/raw/vatican_cardinals.html')
    
    # Parse the HTML content
    soup = BeautifulSoup(html_content, 'html.parser')
    cardinals = []
    
    # Find all div elements with class "listTitle" which contain cardinal links
    list_titles = soup.find_all('div', class_='listTitle')
    logger.info(f"Found {len(list_titles)} elements with class 'listTitle'")
    
    # Process each cardinal
    for list_title in list_titles:
        # Get the link element
        link = list_title.find('a')
        if not link:
            continue
        
        # Extract name from link
        name = link.text.strip()
        
        # Skip if this is not a cardinal (e.g., section headers)
        if "Cardinals" in name and ("electors" in name or "80 years" in name or "Deceased" in name):
            continue
            
        # Extract URL
        href = link['href']
        if href.startswith('/'):
            full_url = f"https://press.vatican.va{href}"
        else:
            full_url = href
            
        # Get the parent row (tr) to extract additional information
        tr = list_title.find_parent('tr')
        if not tr:
            logger.warning(f"Could not find parent row for cardinal: {name}")
            continue
            
        # Find all td elements in the row
        tds = tr.find_all('td')
        
        # Extract birth date, appointing pope, and country
        birth_date = None
        appointing_pope = None
        country = None
        
        # We expect at least 5 td elements: empty, name, birth date, pope, country
        if len(tds) >= 5:
            # Birth date is typically in the 3rd td (index 2)
            birth_date_td = tds[2]
            if birth_date_td:
                birth_date = birth_date_td.text.strip()
                
            # Appointing pope is typically in the 4th td (index 3)
            pope_td = tds[3]
            if pope_td:
                appointing_pope = pope_td.text.strip()
                
            # Country is typically in the 5th td (index 4)
            country_td = tds[4]
            if country_td:
                country = country_td.text.strip()
        
        # Add to cardinals list
        cardinal = {
            'name': name,
            'biography_url': full_url,
            'birth_date': birth_date,
            'appointing_pope': appointing_pope,
            'country': country
        }
        
        cardinals.append(cardinal)
        logger.info(f"Extracted: {name} | Birth: {birth_date} | Pope: {appointing_pope} | Country: {country}")
    
    logger.info(f"Extraction complete. Found {len(cardinals)} cardinals.")
    return cardinals

def extract_cardinal_biography(bio_url):
    """
    Extract detailed biographical information from a cardinal's individual page
    
    Args:
        bio_url (str): URL for the cardinal's biography page
        
    Returns:
        dict: Dictionary containing detailed biographical information
    """
    logger.info(f"Extracting biography from {bio_url}")
    
    html_content = get_page_content(bio_url)
    if not html_content:
        logger.error(f"Failed to get content from {bio_url}")
        return {}
    
    # Save the biography page for debugging if needed
    filename = f"data/raw/bio_{bio_url.split('/')[-1]}"
    save_html_to_file(html_content, filename)
    
    soup = BeautifulSoup(html_content, 'html.parser')
    bio_info = {}
    
    # Extract photo URL - looking for img tag within the textimage section
    textimage_div = soup.find('div', class_='textimage')
    if textimage_div:
        img = textimage_div.find('img')
        if img and img.has_attr('src'):
            photo_url = img['src']
            if photo_url.startswith('/'):
                photo_url = f"https://press.vatican.va{photo_url}"
            bio_info['photo_url'] = photo_url
            logger.info(f"Found photo URL: {photo_url}")
    
    # Extract biographical text - looking for text within the textimage div
    if textimage_div:
        text_div = textimage_div.find('div', class_='text')
        if text_div:
            # Get all paragraphs from the text div
            paragraphs = text_div.find_all('p')
            bio_text = []
            for p in paragraphs:
                text = p.get_text(strip=True)
                if text:
                    bio_text.append(text)
            
            if bio_text:
                # Join paragraphs with newlines to create complete biography
                bio_info['biography_text'] = '\n'.join(bio_text)
                logger.info(f"Found biography text ({len(bio_text)} paragraphs)")
                
                # Also extract any lists that might contain positions or memberships
                lists = text_div.find_all('ul')
                for i, ul in enumerate(lists):
                    list_items = ul.find_all('li')
                    items = [li.get_text(strip=True) for li in list_items]
                    if items:
                        bio_info[f'list_{i+1}'] = items
                        logger.info(f"Found list {i+1} with {len(items)} items")
    
    logger.info(f"Completed biography extraction for {bio_url}")
    return bio_info

def main():
    # Set up logging
    global logger
    logger = setup_logging()
    logger.info("Starting cardinal data extraction")
    
    # Create directory structure
    create_directory_structure()
    
    # Extract cardinal information from main page
    cardinals = extract_cardinals()
    
    # Should we process biography pages?
    process_bios = True  # Set to False to skip biography processing
    
    if process_bios and cardinals:
        logger.info("Starting biography page extraction")
        # Process all cardinals
        total_cardinals = len(cardinals)
        for i, cardinal in enumerate(cardinals):
            logger.info(f"Processing biography {i+1}/{total_cardinals} ({cardinal['name']})")
            bio_url = cardinal.get('biography_url')
            if bio_url:
                bio_info = extract_cardinal_biography(bio_url)
                # Update the cardinal dict with biographical information
                cardinal.update(bio_info)
                # Save progress periodically (every 10 cardinals)
                if (i + 1) % 10 == 0 or (i + 1) == total_cardinals:
                    progress_file = f'data/raw/cardinals_progress_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
                    with open(progress_file, 'w', encoding='utf-8') as f:
                        json.dump(cardinals, f, ensure_ascii=False, indent=2)
                    logger.info(f"Saved progress ({i+1}/{total_cardinals}) to {progress_file}")
                # Add a small delay to avoid overwhelming the server
                time.sleep(1)
    
    # Save the final data
    output_file = f'data/raw/cardinals_complete_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(cardinals, f, ensure_ascii=False, indent=2)
    
    logger.info(f"Extraction complete. Processed {len(cardinals)} cardinals")
    logger.info(f"Final data saved to {output_file}")

if __name__ == "__main__":
    main() 