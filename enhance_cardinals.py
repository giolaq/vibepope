import json
import os
import time
import logging
from datetime import datetime
import requests
from bs4 import BeautifulSoup
import re

# Set up logging
def setup_logging():
    """Set up logging configuration"""
    if not os.path.exists('logs'):
        os.makedirs('logs')
    
    log_file = f'logs/enhance_cardinals_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'
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
        'data/processed',
        'data/enhanced'
    ]
    
    for directory in directories:
        if not os.path.exists(directory):
            os.makedirs(directory)
            logger.info(f"Created directory: {directory}")

def load_cardinals_data(file_path):
    """Load the cardinals data from a JSON file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        logger.info(f"Loaded {len(data)} cardinals from {file_path}")
        return data
    except Exception as e:
        logger.error(f"Error loading cardinals data from {file_path}: {str(e)}")
        return []

def format_cardinal_name(name):
    """Format the cardinal's name for better search results"""
    # Remove "Card." prefix
    name = re.sub(r'Card\.\s+', '', name)
    
    # Remove religious order suffixes (like S.I., O.F.M. Cap.)
    name = re.sub(r',\s+\w+\.\w+\.(\w+\.)*$', '', name)
    name = re.sub(r',\s+\w+\.?\w*\.?$', '', name)  # More aggressive order suffix removal
    
    # Remove any other commas and extra spaces
    name = name.replace(',', ' ')
    name = re.sub(r'\s+', ' ', name).strip()
    
    # Handle uppercase surnames (convert to title case)
    words = name.split()
    formatted_words = []
    
    for word in words:
        if word.isupper() and len(word) > 1:
            formatted_words.append(word.title())
        else:
            formatted_words.append(word)
    
    # Join words with spaces
    formatted_name = ' '.join(formatted_words)
    
    # Fix common name formatting issues
    formatted_name = formatted_name.replace('_', ' ')
    
    # For full name search, use all parts
    full_name = formatted_name
    
    # For simpler search, use first and last name parts only
    name_parts = formatted_name.split()
    if len(name_parts) > 1:
        simple_name = f"{name_parts[0]} {name_parts[-1]}"
    else:
        simple_name = formatted_name
    
    # For even simpler search, just use the most distinctive part (often last name)
    if len(name_parts) > 0:
        distinctive_name = name_parts[-1]
    else:
        distinctive_name = formatted_name
    
    return {
        'full_name': full_name,
        'simple_name': simple_name,
        'distinctive_name': distinctive_name
    }

def search_wikipedia(cardinal_name, country=None):
    """Search Wikipedia for information about a cardinal"""
    # Format the name for better search results
    name_formats = format_cardinal_name(cardinal_name)
    formatted_name = name_formats['full_name']
    simple_name = name_formats['simple_name']
    distinctive_name = name_formats['distinctive_name']
    
    logger.info(f"Searching Wikipedia for: {formatted_name} (simple: {simple_name})")
    
    try:
        # Set up headers and timeout
        user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        headers = {"User-Agent": user_agent}
        timeout = 5  # 5-second timeout
        
        # Try several search approaches
        wiki_url = None
        wiki_data = None
        
        # Approach 1: Direct API search with full name and "cardinal"
        try:
            search_query = f"{formatted_name} cardinal"
            search_url = f"https://en.wikipedia.org/w/api.php?action=opensearch&search={search_query.replace(' ', '+')}&limit=1&namespace=0&format=json"
            logger.info(f"Wikipedia search URL #1: {search_url}")
            search_response = requests.get(search_url, headers=headers, timeout=timeout)
            
            if search_response.status_code == 200:
                search_data = search_response.json()
                logger.info(f"Wikipedia API response #1: {str(search_data)[:200]}...")
                if search_data and len(search_data) > 3 and search_data[1] and search_data[3]:
                    wiki_url = search_data[3][0]
                    logger.info(f"Found Wikipedia URL: {wiki_url}")
        except requests.exceptions.RequestException as e:
            logger.warning(f"Error with first Wikipedia search approach: {str(e)}")
        
        # Approach 2: Try with simple name if full name didn't work
        if not wiki_url:
            try:
                search_query = f"{simple_name} cardinal"
                if country:
                    search_query += f" {country}"
                search_url = f"https://en.wikipedia.org/w/api.php?action=opensearch&search={search_query.replace(' ', '+')}&limit=1&namespace=0&format=json"
                logger.info(f"Wikipedia search URL #2: {search_url}")
                search_response = requests.get(search_url, headers=headers, timeout=timeout)
                
                if search_response.status_code == 200:
                    search_data = search_response.json()
                    logger.info(f"Wikipedia API response #2: {str(search_data)[:200]}...")
                    if search_data and len(search_data) > 3 and search_data[1] and search_data[3]:
                        wiki_url = search_data[3][0]
                        logger.info(f"Found Wikipedia URL with simple name: {wiki_url}")
            except requests.exceptions.RequestException as e:
                logger.warning(f"Error with second Wikipedia search approach: {str(e)}")
        
        # Approach 3: Try with just the distinctive part of the name
        if not wiki_url:
            try:
                search_query = f"{distinctive_name} cardinal"
                if country:
                    search_query += f" {country}"
                search_url = f"https://en.wikipedia.org/w/api.php?action=opensearch&search={search_query.replace(' ', '+')}&limit=1&namespace=0&format=json"
                logger.info(f"Wikipedia search URL #3: {search_url}")
                search_response = requests.get(search_url, headers=headers, timeout=timeout)
                
                if search_response.status_code == 200:
                    search_data = search_response.json()
                    logger.info(f"Wikipedia API response #3: {str(search_data)[:200]}...")
                    if search_data and len(search_data) > 3 and search_data[1] and search_data[3]:
                        wiki_url = search_data[3][0]
                        logger.info(f"Found Wikipedia URL with distinctive name: {wiki_url}")
            except requests.exceptions.RequestException as e:
                logger.warning(f"Error with third Wikipedia search approach: {str(e)}")
        
        # If we found a Wikipedia URL, fetch the page content
        if wiki_url:
            try:
                logger.info(f"Fetching Wikipedia page: {wiki_url}")
                page_response = requests.get(wiki_url, headers=headers, timeout=timeout)
                if page_response.status_code == 200:
                    soup = BeautifulSoup(page_response.text, 'html.parser')
                    
                    # Get the first paragraph (usually contains a brief biography)
                    first_para = None
                    for p in soup.find_all('p'):
                        if p.text.strip():
                            first_para = p.text.strip()
                            break
                    
                    # Get the infobox data (right sidebar with key facts)
                    infobox = soup.find('table', {'class': 'infobox'})
                    infobox_data = {}
                    
                    if infobox:
                        rows = infobox.find_all('tr')
                        for row in rows:
                            header = row.find('th')
                            value = row.find('td')
                            if header and value:
                                header_text = header.text.strip()
                                value_text = value.text.strip()
                                infobox_data[header_text] = value_text
                    
                    # Get the image URL if available
                    image_url = None
                    if infobox:
                        image = infobox.find('img')
                        if image and 'src' in image.attrs:
                            image_url = f"https:{image['src']}" if image['src'].startswith('//') else image['src']
                    
                    # Compile the results
                    wiki_info = {
                        'wikipedia_url': wiki_url,
                        'wikipedia_summary': first_para,
                        'wikipedia_infobox': infobox_data,
                        'wikipedia_image': image_url
                    }
                    
                    logger.info(f"Found Wikipedia information for {formatted_name}")
                    return wiki_info
            except requests.exceptions.RequestException as e:
                logger.warning(f"Error fetching Wikipedia page content: {str(e)}")
        
        logger.warning(f"No Wikipedia results found for {formatted_name}")
        return {}
    
    except Exception as e:
        logger.error(f"Error searching Wikipedia for {formatted_name}: {str(e)}")
        return {}

def search_news(cardinal_name, country=None):
    """Search for recent news about a cardinal"""
    # Format the name for better search results
    name_formats = format_cardinal_name(cardinal_name)
    formatted_name = name_formats['full_name']
    simple_name = name_formats['simple_name']
    distinctive_name = name_formats['distinctive_name']
    
    # Use the simpler name format for more results
    search_query = f"{simple_name} cardinal"
    if country:
        search_query += f" {country}"
    search_query += " news"
    
    logger.info(f"Searching news for: {search_query}")
    
    try:
        # Set up request headers and timeout
        user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        headers = {"User-Agent": user_agent}
        timeout = 5  # Set a 5-second timeout for all requests
        
        # Use Google News search (more reliable)
        url = f"https://www.google.com/search?q={search_query.replace(' ', '+')}&tbm=nws"
        logger.info(f"Google News search URL #1: {url}")
        articles = []
        
        try:
            response = requests.get(url, headers=headers, timeout=timeout)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Find news result divs
                result_divs = soup.find_all('div', class_='SoaBEf')
                
                # If we can't find results with that class, try some alternative selectors
                if not result_divs:
                    result_divs = soup.select("div.y6IFtc")
                
                if not result_divs:
                    result_divs = soup.select("div.v7W49e")
                
                logger.info(f"Found {len(result_divs)} news result divs with primary selectors")
                
                for div in result_divs[:5]:  # Limit to first 5 results
                    # Try to find the title element using different possible class names
                    title_element = div.find(['div', 'h3', 'a'], class_=['mCBkyc', 'DY5T1d'])
                    link_element = div.find('a')
                    
                    if title_element and link_element and 'href' in link_element.attrs:
                        title = title_element.text.strip()
                        link = link_element['href']
                        
                        # Extract source and date if available
                        source = None
                        date = None
                        source_element = div.find(['div', 'span'], class_=['CEMjEf', 'UMOHqf'])
                        if source_element:
                            source_text = source_element.text.strip()
                            if ' · ' in source_text:
                                parts = source_text.split(' · ')
                                source = parts[0]
                                if len(parts) > 1:
                                    date = parts[1]
                            else:
                                source = source_text
                        
                        articles.append({
                            'title': title,
                            'link': link,
                            'source': source,
                            'date': date
                        })
                
                logger.info(f"Found {len(articles)} news articles for {simple_name}")
                
        except requests.exceptions.RequestException as e:
            logger.warning(f"Error with Google News search for {simple_name}: {str(e)}")
            
        # If Google search failed or returned no results, try with the distinctive name
        if not articles:
            try:
                alternative_query = f"{distinctive_name} cardinal news"
                url = f"https://www.google.com/search?q={alternative_query.replace(' ', '+')}&tbm=nws"
                logger.info(f"Google News search URL #2: {url}")
                response = requests.get(url, headers=headers, timeout=timeout)
                
                if response.status_code == 200:
                    soup = BeautifulSoup(response.text, 'html.parser')
                    
                    # Similar processing as above
                    result_divs = soup.find_all('div', class_='SoaBEf')
                    
                    if not result_divs:
                        result_divs = soup.select("div.y6IFtc")
                    
                    if not result_divs:
                        result_divs = soup.select("div.v7W49e")
                    
                    logger.info(f"Found {len(result_divs)} news result divs with alternative selectors")
                    
                    for div in result_divs[:5]:
                        title_element = div.find(['div', 'h3', 'a'], class_=['mCBkyc', 'DY5T1d'])
                        link_element = div.find('a')
                        
                        if title_element and link_element and 'href' in link_element.attrs:
                            title = title_element.text.strip()
                            link = link_element['href']
                            
                            # Extract source and date if available
                            source = None
                            date = None
                            source_element = div.find(['div', 'span'], class_=['CEMjEf', 'UMOHqf'])
                            if source_element:
                                source_text = source_element.text.strip()
                                if ' · ' in source_text:
                                    parts = source_text.split(' · ')
                                    source = parts[0]
                                    if len(parts) > 1:
                                        date = parts[1]
                                else:
                                    source = source_text
                            
                            articles.append({
                                'title': title,
                                'link': link,
                                'source': source,
                                'date': date
                            })
                    
                    logger.info(f"Found {len(articles)} news articles for {distinctive_name}")
                    
            except requests.exceptions.RequestException as e:
                logger.warning(f"Error with alternative news search for {distinctive_name}: {str(e)}")
        
        # Return the results, even if empty
        news_info = {
            'search_url': url,
            'articles': articles
        }
        
        return news_info
    
    except Exception as e:
        logger.error(f"Error searching news for {simple_name}: {str(e)}")
        return {'articles': []}

def search_google(cardinal_name, country=None):
    """Search Google for general information about the cardinal"""
    # Format the name for better search results
    name_formats = format_cardinal_name(cardinal_name)
    formatted_name = name_formats['full_name']
    simple_name = name_formats['simple_name']
    distinctive_name = name_formats['distinctive_name']
    
    # Create search query
    search_query = f"{simple_name} cardinal"
    if country:
        search_query += f" {country}"
    
    logger.info(f"Searching Google for: {search_query}")
    
    try:
        # Using a simple direct search
        user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        headers = {"User-Agent": user_agent}
        timeout = 5  # 5-second timeout
        url = f"https://www.google.com/search?q={search_query.replace(' ', '+')}"
        logger.info(f"Google search URL #1: {url}")
        
        search_results = []
        
        try:
            response = requests.get(url, headers=headers, timeout=timeout)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Extract search results - try multiple selectors
                # Updated selector for Google search result containers
                result_divs = soup.find_all('div', class_=['g', 'tF2Cxc'])
                
                if not result_divs:
                    # Try alternative selectors
                    result_divs = soup.select("div.yuRUbf")
                
                if not result_divs:
                    # Try yet another selector that might contain results
                    result_divs = soup.select("div.v7W49e")
                
                logger.info(f"Found {len(result_divs)} Google result divs with primary selectors")
                
                for div in result_divs[:3]:  # Limit to first 3 results
                    # Find the title and link
                    title_element = div.find('h3')
                    link_element = div.find('a')
                    
                    if title_element and link_element and 'href' in link_element.attrs:
                        title = title_element.text.strip()
                        link = link_element['href']
                        
                        # Find snippet
                        snippet = ""
                        snippet_div = div.find(['div', 'span'], class_=['VwiC3b', 'aCOpRe', 'yXK7lf'])
                        if snippet_div:
                            snippet = snippet_div.text.strip()
                        
                        search_results.append({
                            'title': title,
                            'link': link,
                            'snippet': snippet
                        })
                
                logger.info(f"Found {len(search_results)} Google results for {simple_name}")
        
        except requests.exceptions.RequestException as e:
            logger.warning(f"Error with Google search for {simple_name}: {str(e)}")
        
        # If the first search returned no results, try with the distinctive name only
        if not search_results:
            try:
                alternative_query = f"{distinctive_name} cardinal"
                if country:
                    alternative_query += f" {country}"
                    
                url = f"https://www.google.com/search?q={alternative_query.replace(' ', '+')}"
                logger.info(f"Google search URL #2: {url}")
                response = requests.get(url, headers=headers, timeout=timeout)
                
                if response.status_code == 200:
                    soup = BeautifulSoup(response.text, 'html.parser')
                    
                    # Similar processing as above
                    result_divs = soup.find_all('div', class_=['g', 'tF2Cxc'])
                    
                    if not result_divs:
                        result_divs = soup.select("div.yuRUbf")
                    
                    if not result_divs:
                        result_divs = soup.select("div.v7W49e")
                    
                    logger.info(f"Found {len(result_divs)} Google result divs with alternative selectors")
                    
                    for div in result_divs[:3]:
                        title_element = div.find('h3')
                        link_element = div.find('a')
                        
                        if title_element and link_element and 'href' in link_element.attrs:
                            title = title_element.text.strip()
                            link = link_element['href']
                            
                            snippet = ""
                            snippet_div = div.find(['div', 'span'], class_=['VwiC3b', 'aCOpRe', 'yXK7lf'])
                            if snippet_div:
                                snippet = snippet_div.text.strip()
                            
                            search_results.append({
                                'title': title,
                                'link': link,
                                'snippet': snippet
                            })
                    
                    logger.info(f"Found {len(search_results)} Google results for {distinctive_name}")
                    
            except requests.exceptions.RequestException as e:
                logger.warning(f"Error with alternative Google search for {distinctive_name}: {str(e)}")
        
        # Return the results
        google_info = {
            'search_url': url,
            'results': search_results
        }
        
        return google_info
        
    except Exception as e:
        logger.error(f"Error searching Google for {simple_name}: {str(e)}")
        return {'results': []}

def enhance_cardinal_data(cardinal):
    """Enhance a cardinal's data with additional information from online sources"""
    enhanced_cardinal = cardinal.copy()
    
    # Initialize additional_info if not already present
    if 'additional_info' not in enhanced_cardinal:
        enhanced_cardinal['additional_info'] = {}
    
    # Search Wikipedia for additional information
    wiki_info = search_wikipedia(cardinal['name'], cardinal.get('country'))
    if wiki_info:
        enhanced_cardinal['additional_info']['wikipedia'] = wiki_info
    
    # Search for recent news about the cardinal
    news_info = search_news(cardinal['name'], cardinal.get('country'))
    if news_info and news_info.get('articles'):
        enhanced_cardinal['additional_info']['recent_news'] = news_info
    
    # Search Google for additional information
    google_info = search_google(cardinal['name'], cardinal.get('country'))
    if google_info and google_info.get('results'):
        enhanced_cardinal['additional_info']['google_results'] = google_info
    
    # Extract structured information from biography text
    if 'biography_text' in cardinal:
        structured_bio_info = extract_info_from_biography(cardinal['biography_text'])
        if structured_bio_info:
            enhanced_cardinal['additional_info']['structured_bio'] = structured_bio_info
    
    return enhanced_cardinal

def extract_info_from_biography(text):
    """Extract structured information from the biography text"""
    info = {}
    
    # Extract birth place
    birth_place_match = re.search(r'born (?:on [^,]+ )?in ([^,.]+)', text, re.IGNORECASE)
    if birth_place_match:
        info['birth_place'] = birth_place_match.group(1).strip()
    
    # Extract ordination date
    ordination_match = re.search(r'ordained (?:a )?priest (?:on|in) ([^,.]+)', text, re.IGNORECASE)
    if ordination_match:
        info['ordination_date'] = ordination_match.group(1).strip()
    
    # Extract episcopal consecration date
    consecration_match = re.search(r'(?:episcopal consecration|consecrated bishop) (?:on|in) ([^,.]+)', text, re.IGNORECASE)
    if consecration_match:
        info['episcopal_consecration_date'] = consecration_match.group(1).strip()
    
    # Extract cardinal creation date
    cardinal_match = re.search(r'created (?:and proclaimed )?cardinal (?:by[^,.]*)? (?:on|in) ([^,.]+)', text, re.IGNORECASE)
    if cardinal_match:
        info['cardinal_creation_date'] = cardinal_match.group(1).strip()
    
    # Extract education/degrees
    education_matches = re.findall(r'(?:doctorate|licentiate|degree) in ([^,.]+)', text, re.IGNORECASE)
    if education_matches:
        info['education'] = [match.strip() for match in education_matches]
    
    # Extract languages
    language_match = re.search(r'(?:speaks|fluent in) ([^,.]+)', text, re.IGNORECASE)
    if language_match:
        languages = language_match.group(1).strip()
        info['languages'] = [lang.strip() for lang in languages.split('and') if lang.strip()]
    
    return info

def main():
    # Set up logging
    global logger
    logger = setup_logging()
    logger.info("Starting cardinal data enhancement")
    
    # Create directory structure
    create_directory_structure()
    
    # Load the cardinals data
    cardinals = load_cardinals_data('data/backup/cardinals.json')
    
    if not cardinals:
        logger.error("No cardinal data found. Exiting.")
        return
    
    # Enhance each cardinal's data
    enhanced_cardinals = []
    total_cardinals = len(cardinals)
    
    for i, cardinal in enumerate(cardinals):
        cardinal_name = cardinal.get('name', f"Cardinal {i+1}")
        name_formats = format_cardinal_name(cardinal_name)
        logger.info(f"Enhancing data for {cardinal_name} ({i+1}/{total_cardinals}) - Simplified to: {name_formats['simple_name']}")
        
        # Enhance the cardinal's data
        enhanced_cardinal = enhance_cardinal_data(cardinal)
        enhanced_cardinals.append(enhanced_cardinal)
        
        # Save progress periodically (every 10 cardinals)
        if (i + 1) % 10 == 0 or (i + 1) == total_cardinals:
            progress_file = f'data/enhanced/cardinals_enhanced_progress_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
            with open(progress_file, 'w', encoding='utf-8') as f:
                json.dump(enhanced_cardinals, f, ensure_ascii=False, indent=2)
            logger.info(f"Saved progress ({i+1}/{total_cardinals}) to {progress_file}")
        
        # Add a delay to avoid overwhelming the servers
        time.sleep(2)
    
    # Save the final enhanced data
    output_file = f'data/enhanced/cardinals_enhanced_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(enhanced_cardinals, f, ensure_ascii=False, indent=2)
    
    logger.info(f"Enhancement complete. Processed {len(enhanced_cardinals)} cardinals")
    logger.info(f"Final enhanced data saved to {output_file}")

if __name__ == "__main__":
    main() 