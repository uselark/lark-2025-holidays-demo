import asyncio
from firecrawl import AsyncFirecrawl
from pydantic import BaseModel
from dotenv import load_dotenv
import os

load_dotenv()
FIRECRAWL_API_KEY = os.getenv("FIRECRAWL_API_KEY")
assert FIRECRAWL_API_KEY is not None

app = AsyncFirecrawl(api_key=FIRECRAWL_API_KEY)


class YCCompanyInfo(BaseModel):
    company_name: str
    company_small_logo_url: str


class WebsiteScraper:
    def __init__(self):
        pass

    async def extract_data(self, url: str):
        result = await app.scrape(
            url,
            formats=[{"type": "json", "schema": YCCompanyInfo.model_json_schema()}],
            only_main_content=False,
            timeout=120000,
        )

        scraped_data = result.json
        return YCCompanyInfo(**scraped_data)


async def run():
    website_scraper = WebsiteScraper()
    company_info = await website_scraper.extract_data(
        "https://www.ycombinator.com/companies/moss", YCCompanyInfo
    )
    print(company_info)


if __name__ == "__main__":
    asyncio.run(run())
