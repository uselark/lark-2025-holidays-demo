import asyncio
import json
import os
import re
from enum import Enum
import uuid
from fastapi import HTTPException
from upstash_redis import Redis
from typing import List, Type
from dotenv import load_dotenv
from openai import AsyncOpenAI
from pydantic import BaseModel, create_model

from website_scraper import WebsiteScraper, YCCompanyInfo

load_dotenv()
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
redis = Redis.from_env()


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
    id: str
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

        company_info = await self.website_scraper.extract_data(company_url)
        if company_info is None:
            raise Exception("Failed to extract company information")

        company_characters_internal = await self._assign_characters_to_founders(
            company_info
        )

        if company_info is None:
            raise Exception("Failed to extract company information")

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
                    reasoning=self._strip_citations(character.founder_funnny_text),
                )
            )

        company_characters_info = CompanyCharacterInfo(
            id=uuid.uuid4().hex,
            company_name=company_info.company_name,
            company_logo_url=company_info.company_small_logo_url,
            company_yc_url=company_url,
            characters=company_characters_external,
        )
        await self._persist_character_generation(company_characters_info)
        return company_characters_info

    async def get_character_generation(
        self, generation_id: str
    ) -> CompanyCharacterInfo:
        return await self._get_character_generation(generation_id)

    async def _persist_character_generation(
        self, company_characters_info: CompanyCharacterInfo
    ):
        redis.set(
            company_characters_info.id,
            company_characters_info.model_dump_json(),
        )

    async def _get_character_generation(
        self, generation_id: str
    ) -> CompanyCharacterInfo:
        company_characters_info = redis.get(generation_id)
        if company_characters_info:
            return CompanyCharacterInfo.model_validate_json(company_characters_info)
        else:
            raise HTTPException(
                status_code=404, detail="Company character generation not found"
            )

    async def _assign_characters_to_founders(
        self, company_info: YCCompanyInfo
    ) -> List[BaseModel]:
        CompanyCharactersInternal = self._create_company_characters_internal_model()

        response = await client.responses.parse(
            model="gpt-5-nano",
            input=self._make_prompt_message(company_info),
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
            founder_funnny_text=(str, ...),
        )

        return create_model(
            "CompanyCharactersInternal",
            characters=(List[CompanyCharacterInternal], ...),
        )

    def _create_character_name_enum(self) -> Enum:
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

    def _make_prompt_message(self, company_info: YCCompanyInfo) -> str:
        return f"""
You are a creative assistant that powers a fun thanksgiving game for founders.

You're given information about a YC company and its founders. Assign a disney character to each founder. When you assign a character to each founder, provide a short funny & spicy text along with it. Don't include character name in this text. This text can include a funny note about how the founder is like the disney character you assigned and why you're thankful this thanksgiving season for the founder tackling the problem that the company is solving - all in a funny way. For the latter, switch up the phrasing so the text for each founder seems unique.

Here are some guidelines for the character assignment:
- The goal of this task is to ultimately generate a funny text along with each character assignment, and not to pick the closest matching character based on company information. The character assignment can be based on the company information or be somewhat random (to increase the fun factor). 
- Since most YC companies are tech companies, avoid over indexing on tech characters. It is more fun if character assignments change every run of the game.
- Try to guess geneder of founder based on name and assign a character that is relevant to the gender. 
- It is okay to roast the founder in your reasoning if it is funny.

Don't include any citations in your response since this is fun game.

Here is the company information: 

{company_info.model_dump_json(exclude={"company_small_logo_url"})}

"""
