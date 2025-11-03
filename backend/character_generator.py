import asyncio
import json
import os
import re
from enum import Enum
from typing import List, Type
from dotenv import load_dotenv
from openai import AsyncOpenAI
from pydantic import BaseModel, create_model

from website_scraper import WebsiteScraper

load_dotenv()
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))


class YCFoudnerInfo(BaseModel):
    name: str
    description: str


class Character(BaseModel):
    name: str
    image_url: str


class CompanyCharacterExternal(BaseModel):
    founder_name: str
    character_name: str
    character_image_url: str
    reasoning: str


class CompanyCharacterInfo(BaseModel):
    company_name: str
    company_yc_url: str
    company_logo_url: str
    characters: List[CompanyCharacterExternal]


class CharacterGenerator:
    def __init__(self):
        self.character_list: List[Character] = self._get_character_list()
        self.website_scraper = WebsiteScraper()
        self.character_name_to_image_url = {
            char.name: char.image_url for char in self.character_list
        }

    async def generate_characters_for_company(
        self, company_url: str
    ) -> CompanyCharacterInfo:
        # Run website scraping and character assignment in parallel
        company_info, company_characters_internal = await asyncio.gather(
            self.website_scraper.extract_data(company_url),
            self._assign_characters_to_founders(company_url),
        )

        company_characters_external = []
        for character in company_characters_internal.characters:
            character_name = character.character_name.value
            company_characters_external.append(
                CompanyCharacterExternal(
                    founder_name=character.founder_name,
                    character_name=character_name,
                    character_image_url=self.character_name_to_image_url[
                        character_name
                    ],
                    reasoning=self._strip_citations(character.reasoning),
                )
            )

        return CompanyCharacterInfo(
            company_name=company_info.company_name,
            company_logo_url=company_info.company_small_logo_url,
            company_yc_url=company_url,
            characters=company_characters_external,
        )

    async def _assign_characters_to_founders(
        self, yc_company_url: str
    ) -> List[BaseModel]:
        CompanyCharactersInternal = self._create_company_characters_internal_model()

        response = await client.responses.parse(
            model="gpt-5-mini",
            tools=[{"type": "web_search"}],
            input=self._make_prompt_message(yc_company_url),
            text_format=CompanyCharactersInternal,
        )
        print("Company characters: ", response.output_parsed)
        return response.output_parsed

    def _get_character_list(self) -> List[Character]:
        characters = []
        with open("character_list.json", "r") as f:
            character_list = json.load(f)
            for character in character_list:
                characters.append(Character(name=character[0], image_url=character[1]))

        return characters

    def _create_company_characters_internal_model(self) -> Type[BaseModel]:
        CharacterNameEnum = self._create_character_name_enum()

        CompanyCharacterInternal = create_model(
            "CompanyCharacterInternal",
            founder_name=(str, ...),
            character_name=(CharacterNameEnum, ...),
            reasoning=(str, ...),
        )

        return create_model(
            "CompanyCharactersInternal",
            characters=(List[CompanyCharacterInternal], ...),
        )

    def _create_character_name_enum(self) -> Type[Enum]:
        """Create a dynamic Enum with all character names."""
        character_names = [char.name for char in self.character_list]
        # Create enum with name as both the key and value
        return Enum("CharacterName", {name: name for name in character_names})

    def _strip_citations(self, text: str) -> str:
        """Remove citation markers from text.

        Citations appear as Unicode patterns like: \ue200cite\ue202turn0view0\ue201
        """
        # Remove citation patterns: \ue200....\ue201
        cleaned_text = re.sub(r"\ue200[^\ue201]*\ue201", "", text)
        return cleaned_text.strip()

    def _make_prompt_message(self, yc_company_url: str) -> str:
        return f"""
You are a creative assistant that powers a fun halloween game for founders.

You're given a YC company URL that has information about the company and its founders. Use the web search tool to get this information. Then assign a disney character to each founder. When you assign a character to each founder, provide a short funny & spicy reasoning for your choice. Don't include chracter name in your reasoning. 

Here are some guidelines for the character assignment:
- The goal of this task is to ultimately generate a funny reasoning for each character assignment, and not to pick the closest matching character based on company information. The character assignment can be based on the company information or be somewhat random (to increase the fun factor). 
- Since most YC companies are tech companies, avoid over indexing on tech characters. It is more fun if character assignments change every run of the game.
- Try to guess geneder of founder based on name and assign a character that is relevant to the gender. 
- It is okay to roast the founder in your reasoning if it is funny.

Don't include any citations in your response since this is fun game.

Here is the YC company url: {yc_company_url}"""
