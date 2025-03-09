from scholarly import scholarly
import os
import time
import psutil
import asyncio
import json
from datetime import datetime
from langchain_openai import ChatOpenAI
from unicode_utils import SYMBOLS, safe_print
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig, CacheMode
from crawl4ai.extraction_strategy import LLMExtractionStrategy
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv(override=True)
# OpenAI API Key (Replace with a secure method)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Directory for raw content output
RAW_DIR = "raw_content"

# Timeout for crawling a single URL (in seconds)
CRAWL_TIMEOUT = 120  # Adjust as needed

class Product(BaseModel):
    url: str
    author: str
    claim: str
    rating: float
    scientific_evidence: str
    counter_claim: str

def search_google_scholar(query):
    """
    Searches Google Scholar for a given query and returns top results.
    """
    try:
        search_results = scholarly.search_pubs(query)
        results = []

        for i in range(5):  # Get top 5 results
            try:
                result = next(search_results)
                results.append({
                    "title": result['bib']['title'],
                    "url": result['pub_url'] if 'pub_url' in result else "No URL",
                    "abstract": result['bib'].get('abstract', 'No abstract available')
                })
            except StopIteration:
                break  # No more results
            except Exception as e:
                print(f"Error processing search result: {e}")
                continue
        
        return results
    except Exception as e:
        print(f"Error searching Google Scholar: {e}")
        return []

# Ensure output directory is empty before starting
def clear_output_dir():
    if os.path.exists(RAW_DIR):
        for file in os.listdir(RAW_DIR):
            file_path = os.path.join(RAW_DIR, file)
            if os.path.isfile(file_path):
                os.remove(file_path)
    else:
        os.makedirs(RAW_DIR)

# Function to create safe filenames
def get_raw_filename(index):
    return os.path.join(RAW_DIR, f"url_{index}_raw.txt")  # Unique filename for each URL

# Main function to run the crawler for a URL
async def process_url(url, index, claim, total_urls):
    safe_print(f"{SYMBOLS['search']} Processing URL {index}/{total_urls}: {url}")

    # Define the LLM extraction strategy
    llm_strategy = LLMExtractionStrategy(
        provider="openai/gpt-4o-mini",
        api_token=OPENAI_API_KEY,
        schema=Product.model_json_schema(),
        extraction_type="schema",
        instruction=f"""
    
        You are tasked with evaluating a specific claim based on scientific evidence from a provided URL. Follow these instructions carefully:

        Instructions:
        Evaluate the claim: "{claim}" using ONLY the information from the provided URL.
        Structure your response as follows:
        Begin with a clear statement of whether you support or refute the claim
        Provide a detailed explanation of your evaluation:
        Describe the specific scientific evidence from the URL that supports your position
        Assign a numerical rating from 0-10, where:
        10 = Complete agreement with the claim
        0 = Complete disagreement with the claim
        If your rating is less than 5:
        Provide a counter-argument to the original claim
        Explain specifically how the evidence contradicts or differs from the claim

        Provide only ONE rating for the entire evaluation.
        If the content does not contain relevant information, you may rate it as -1.
        """,
        overlap_rate=0.0,
        apply_chunking=False,
        input_format="markdown",
        extra_args={"temperature": 0.0, "max_tokens": 800}
    )

    # Build the crawler config
    crawl_config = CrawlerRunConfig(
        extraction_strategy=llm_strategy,
        cache_mode=CacheMode.BYPASS
    )

    # Create a browser config
    browser_cfg = BrowserConfig(headless=True)

    async with AsyncWebCrawler(config=browser_cfg) as crawler:
        try:
            # Crawl the URL
            result = await asyncio.wait_for(
                crawler.arun(url=url, config=crawl_config),
                timeout=CRAWL_TIMEOUT
            )

            if result.success:
                data = json.loads(result.extracted_content)
                raw_content = json.dumps(data, indent=4)

                safe_print(f"{SYMBOLS['check']} Finished processing {url}")

                # Save directly to raw text file
                raw_filename = get_raw_filename(index)
                with open(raw_filename, "w", encoding="utf-8") as file:
                    file.write(raw_content)
                
                safe_print(f"{SYMBOLS['save']} Saved raw content to {raw_filename}")
                return raw_filename  # Return filename for further processing
            else:
                safe_print(f"{SYMBOLS['error']} Error extracting data from {url}: {result.error_message}")
                return None
        except asyncio.TimeoutError:
            safe_print(f"{SYMBOLS['error']} Timeout while processing {url}. Quitting...")
            return None
        except Exception as e:
            safe_print(f"{SYMBOLS['error']} Error processing {url}: {e}")
            return None

async def process_claim(claim):
    """
    Process a claim by searching for relevant papers and analyzing them.
    
    Args:
        claim (str): The claim to verify
        
    Returns:
        int: Number of successful extractions
    """
    # Search Google Scholar for the claim
    scholar_results = search_google_scholar(claim)
    urls = [result['url'] for result in scholar_results if result['url'] != "No URL"]
    
    if not urls:
        safe_print(f"{SYMBOLS['error']} No valid URLs found for the claim.")
        return 0
    
    # Clear output directory
    clear_output_dir()
    
    # Process URLs
    safe_print(f"{SYMBOLS['search']} Extracting raw content from URLs...")
    start_time = time.time()
    process = psutil.Process()
    start_cpu = process.cpu_percent(interval=None)
    start_memory = process.memory_info().rss  # Memory in bytes

    successful_extractions = 0
    for index, url in enumerate(urls, start=1):
        result = await process_url(url, index, claim, len(urls))  # Run one URL at a time
        if result is not None:
            successful_extractions += 1

    end_time = time.time()
    end_cpu = process.cpu_percent(interval=None)
    end_memory = process.memory_info().rss

    # Calculate Metrics
    total_time = end_time - start_time
    errors = len(urls) - successful_extractions
    pages_per_second = successful_extractions / total_time if total_time > 0 else 0
    memory_used = (end_memory - start_memory) / (1024 * 1024)  # Convert to MB
    cpu_usage = end_cpu - start_cpu
    error_rate = (errors / len(urls)) * 100 if len(urls) > 0 else 0

    # Print benchmark results
    safe_print(f"\n{SYMBOLS['data']} Processing Results:")
    safe_print(f"{SYMBOLS['success']} Pages Crawled: {successful_extractions}/{len(urls)}")
    safe_print(f"{SYMBOLS['loading']} Pages per Second: {pages_per_second:.2f}")
    safe_print(f"{SYMBOLS['clock']} Total Processing Time: {total_time:.2f} sec")
    safe_print(f"{SYMBOLS['save']} Memory Usage: {memory_used:.2f} MB")
    safe_print(f"CPU Usage: {cpu_usage:.2f}%")
    safe_print(f"{SYMBOLS['error']} Error Rate: {error_rate:.2f}%\n")
    safe_print(f"{SYMBOLS['success']} Raw content files saved in the '{RAW_DIR}' directory")
    
    return successful_extractions