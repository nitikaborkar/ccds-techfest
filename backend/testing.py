from scholarly import scholarly

def search_google_scholar(query):
    """
    Searches Google Scholar for a given query and returns top results.
    """
    try:
        search_results = scholarly.search_pubs(query)
        results = []

        for i in range(5):  # Get top 3 results
            result = next(search_results)
            results.append({
                "title": result['bib']['title'],
                "url": result['pub_url'] if 'pub_url' in result else "No URL",
                "abstract": result['bib'].get('abstract', 'No abstract available')
            })
        
        return results
    except Exception as e:
        return f"Error: {e}"

# Example: Check if "Turmeric cures cancer" has scientific backing
claim = "Type 1 Diabetes Is Associated with Insulin Resistance and Beta-Cell Dysfunction"
scholar_results = search_google_scholar(claim)

for res in scholar_results:
    print(f"Title: {res['title']}\nURL: {res['url']}\nAbstract: {res['abstract']}\n")

import os
import time
import psutil
import asyncio
from urllib.parse import urlparse
from langchain_openai import ChatOpenAI
from browser_use import Agent
from browser_use import Browser, BrowserConfig
# Import from unicode_utils instead of main to break circular import
from unicode_utils import SYMBOLS, safe_print

# OpenAI API Key (Replace with a secure method)
OPENAI_API_KEY = "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"

# URLs to crawl
urls = ['https://pmc.ncbi.nlm.nih.gov/articles/PMC5723935/']  # Add URLs here

# Directory for raw content output
RAW_DIR = "raw_content"

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
    return os.path.join(RAW_DIR, f"url_2_raw.txt")  # Unique filename for each URL

# Main function to run the crawler for a URL
async def main(url, index):
    safe_print(f"{SYMBOLS['search']} Processing URL {index}/{len(urls)}: {url}")
    config = BrowserConfig(
        headless=False,
        disable_security=True
    )
    browser = Browser(config=config)
    llm = ChatOpenAI(model='gpt-4o', openai_api_key=OPENAI_API_KEY)
    planner = ChatOpenAI(model='o3-mini', openai_api_key= OPENAI_API_KEY)
    agent = Agent(
        browser=browser,
        task=f"""Go to {url} refute or support the claim that Type 1 Diabetes Is Associated with Insulin Resistance and Beta-Cell Dysfunction. give a detailed explanation.
        and describe the scientific evidence supporting your claim. also give a rating out of 10. 10 being accurate and 0 being inaccurate.
        use only the url and no other sources. If rating is less than 5, provide a counter argument and how its different from the original claim.
        """,
        llm=llm ,
        planner_llm=planner
    )

    history = await agent.run()
    raw_content = history.final_result()
    safe_print(f"{SYMBOLS['check']} Finished processing {url}")

    # Save directly to raw text file
    raw_filename = get_raw_filename(index)
    with open(raw_filename, "w", encoding="utf-8") as file:
        file.write(raw_content)
    
    safe_print(f"{SYMBOLS['save']} Saved raw content to {raw_filename}")
    return raw_filename  # Return filename for further processing

# Performance testing function (Runs URLs one by one)
async def benchmark_crawler():
    safe_print(f"{SYMBOLS['search']} Extracting raw content from Facebook pages...")
    clear_output_dir()  # Clear old files before running
    start_time = time.time()
    process = psutil.Process()
    start_cpu = process.cpu_percent(interval=None)
    start_memory = process.memory_info().rss  # Memory in bytes

    successful_extractions = 0
    for index, url in enumerate(urls, start=1):
        result = await main(url, index)  # Run one URL at a time
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
    safe_print(f"\n{SYMBOLS['data']} Benchmark Results:")
    safe_print(f"{SYMBOLS['success']} Pages Crawled: {successful_extractions}/{len(urls)}")
    safe_print(f"{SYMBOLS['loading']} Pages per Second: {pages_per_second:.2f}")
    safe_print(f"{SYMBOLS['clock']} Total Crawl Time: {total_time:.2f} sec")
    safe_print(f"{SYMBOLS['save']} Memory Usage: {memory_used:.2f} MB")
    safe_print(f"CPU Usage: {cpu_usage:.2f}%")
    safe_print(f"{SYMBOLS['error']} Error Rate: {error_rate:.2f}%\n")
    safe_print(f"{SYMBOLS['success']} Raw content files saved in the '{RAW_DIR}' directory")

# Run the crawler and benchmark
if __name__ == "__main__":
    asyncio.run(benchmark_crawler())  # Runs the async function properly