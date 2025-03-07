import asyncio
from playwright.async_api import async_playwright
from markdownify import markdownify

async def download_markdown(url, markdown_path="globe_prepaid_promos.md"):
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)  # Change to False for debugging
        page = await browser.new_page()

        # Set headers to appear as a real user
        await page.set_extra_http_headers({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9",
            "Referer": "https://www.google.com/",
        })

        # Navigate to the page and wait for the content to load
        await page.goto(url, wait_until="domcontentloaded")

        # Wait for 20 seconds before scraping
        print("Waiting for 20 seconds before scraping...")
        await page.wait_for_timeout(2000)  # 5000 ms = 5 seconds

        # Wait for specific content to appear
        await page.wait_for_selector("body")  # Ensure page is fully loaded

        # Extract only the visible page content
        page_html = await page.inner_html("body")  

        # Convert HTML to Markdown
        page_markdown = markdownify(page_html)

        # Save to file
        with open(markdown_path, "w", encoding="utf-8") as f:
            f.write(page_markdown)

        print(f"Markdown saved to {markdown_path}")
        await browser.close()

# URL to scrape
url = "https://pmc.ncbi.nlm.nih.gov/articles/PMC10208110/"

# Run the function
asyncio.run(download_markdown(url))
