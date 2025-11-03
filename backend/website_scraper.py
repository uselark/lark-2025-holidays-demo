import asyncio
from firecrawl import AsyncFirecrawl
from pydantic import BaseModel

app = AsyncFirecrawl(api_key="fc-62dc4d86d1494082be4426ebbc35c453")


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
