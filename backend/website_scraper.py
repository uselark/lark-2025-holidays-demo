import asyncio
import json
from firecrawl import AsyncFirecrawl
from pydantic import BaseModel
from dotenv import load_dotenv
import os
from bs4 import BeautifulSoup
import httpx
import html as ihtml


load_dotenv()


class YCCompanyInfo(BaseModel):
    company_name: str
    company_small_logo_url: str
    raw_text: str


class WebsiteScraper:
    def __init__(self):
        pass

    async def extract_data(self, url: str) -> YCCompanyInfo | None:
        return await self.extract_data_using_http(url)

    async def extract_data_using_http(self, url: str) -> YCCompanyInfo | None:
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()
            html_content = response.text

            soup = BeautifulSoup(html_content, "html.parser")
            name = None
            small_logo_url = None

            # 1) Preferred: parse the JSON in the big data-page attribute
            host = soup.select_one(
                'div[id^="ycdc_new/pages/Companies/ShowPage"][data-page]'
            )
            if host and host.has_attr("data-page"):
                raw = host["data-page"]
                try:
                    data = json.loads(ihtml.unescape(str(raw)))
                    company = data.get("props", {}).get("company", {})
                    name = company.get("name") or name
                    small_logo_url = company.get("small_logo_url") or small_logo_url
                except Exception:
                    pass  # fall back if JSON is malformed

            # 2) Fallbacks from visible DOM
            if not name:
                h1 = soup.select_one("h1")
                if h1:
                    name = h1.get_text(strip=True)

            if not small_logo_url:
                img = soup.select_one('img[src*="small_logos"]')
                if img and img.has_attr("src"):
                    small_logo_url = img["src"]

            if not name or not small_logo_url or not isinstance(small_logo_url, str):
                return None

            return YCCompanyInfo(
                company_name=name,
                company_small_logo_url=small_logo_url,
                raw_text=soup.get_text(strip=True),
            )


async def run():
    website_scraper = WebsiteScraper()
    company_info = await website_scraper.extract_data(
        "https://www.ycombinator.com/companies/lark"
    )
    print(company_info)


if __name__ == "__main__":
    asyncio.run(run())
