import asyncio
import json
import os
import re
from enum import Enum
import uuid
from fastapi import HTTPException
from upstash_redis import Redis
from typing import List, Literal, Type
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


class CompanyVibesCharacterInfo(BaseModel):
    id: str
    company_name: str
    character_name: str
    character_image_url: str
    reasoning: str


class CharacterGenerator:
    def __init__(self):
        self.character_list: List[Character] = self._get_character_list()
        self.website_scraper = WebsiteScraper()
        self.character_name_to_image_url = {
            char.name: char.image_url for char in self.character_list
        }

    async def generate_characters_for_company(
        self, company_url: str, mode: Literal["yc_company", "any_url"]
    ) -> CompanyVibesCharacterInfo | CompanyCharacterInfo:
        if mode == "yc_company":
            return await self.generate_characters_for_yc_company(company_url)
        elif mode == "any_url":
            return await self.generate_characters_for_url(company_url)

    async def generate_characters_for_url(
        self, company_url: str
    ) -> CompanyVibesCharacterInfo:
        raw_text = await self.website_scraper.extract_general_url_data_using_http(
            company_url
        )
        company_character_internal = await self._assign_characters_to_general_url(
            company_url, raw_text
        )

        company_name = company_character_internal.company_name
        character_name = company_character_internal.character_name.value
        reasoning = company_character_internal.funnny_reasoning_text

        company_vibes_character_info = CompanyVibesCharacterInfo(
            id=uuid.uuid4().hex,
            company_name=company_name,
            character_name=character_name,
            character_image_url=self.character_name_to_image_url[character_name],
            reasoning=reasoning,
        )
        await self._persist_character_generation(company_vibes_character_info)
        return company_vibes_character_info

    async def generate_characters_for_yc_company(
        self, company_url: str
    ) -> CompanyCharacterInfo:

        company_info = await self.website_scraper.extract_yc_data_using_http(
            company_url
        )
        if company_info is None:
            raise Exception("Failed to extract company information")

        company_characters_internal = await self._assign_characters_to_yc_founders(
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
    ) -> CompanyCharacterInfo | CompanyVibesCharacterInfo:
        return await self._get_character_generation(generation_id)

    async def _persist_character_generation(
        self, company_characters_info: CompanyCharacterInfo | CompanyVibesCharacterInfo
    ):
        redis.set(
            company_characters_info.id,
            company_characters_info.model_dump_json(),
        )

    async def _get_character_generation(
        self, generation_id: str
    ) -> CompanyCharacterInfo | CompanyVibesCharacterInfo:
        company_characters_info = redis.get(generation_id)
        if company_characters_info:
            # Parse JSON to determine which type it is
            data = json.loads(company_characters_info)
            # CompanyCharacterInfo has 'characters' field, CompanyVibesCharacterInfo has 'character_name'
            if "characters" in data:
                return CompanyCharacterInfo.model_validate_json(company_characters_info)
            else:
                return CompanyVibesCharacterInfo.model_validate_json(
                    company_characters_info
                )
        else:
            raise HTTPException(
                status_code=404, detail="Company character generation not found"
            )

    async def _assign_characters_to_general_url(
        self, company_url: str, raw_text_from_url: str
    ) -> List[BaseModel]:
        CompanyCharacterInternal = self._create_url_character_internal_model()
        response = await client.responses.parse(
            model="gpt-4.1-nano",
            input=self._make_general_url_prompt_message(company_url, raw_text_from_url),
            text_format=CompanyCharacterInternal,
        )
        print("Company character for generic url: ", response.output_parsed)
        return response.output_parsed

    async def _assign_characters_to_yc_founders(
        self, company_info: YCCompanyInfo
    ) -> List[BaseModel]:
        CompanyCharactersInternal = self._create_founder_characters_internal_model()

        response = await client.responses.parse(
            model="gpt-4.1-nano",
            input=self._make_yc_prompt_message(company_info),
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

    def _create_url_character_internal_model(self) -> Type[BaseModel]:
        CharacterNameEnum = self._create_character_name_enum()

        return create_model(
            "CompanyCharacterInternal",
            company_name=(str, ...),
            character_name=(CharacterNameEnum, ...),
            funnny_reasoning_text=(str, ...),
        )

    def _create_founder_characters_internal_model(self) -> Type[BaseModel]:
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

    def _make_general_url_prompt_message(
        self, company_url: str, raw_text_from_url: str
    ) -> str:
        return f"""
You are a creative assistant that powers a fun game. You're given a url and text from that url and your goal is to extract the company name and assign a disney character to it with a funny & spicy reasoning for the character. The url will most likely be of a company website but sometimes it could be any random url.

If it is a random url then try to pretend like it is a company website and still play along. 

Don't include character name in the reasoning text. This text can include a funny note about how the company is like the disney character you assigned.

Here are some guidelines for the character assignment:
- The goal of this task is to ultimately generate a funny text along with character assignment, and not to pick the closest matching character based on company information. The character assignment can be based on the company information or be somewhat random (to increase the fun factor). 
- It is common for the company url to be of a tech company, so avoid over indexing on tech characters. It is more fun if character assignments change every run of the game.
- It is okay to roast in your reasoning if it is funny.

Don't include any citations in your response since this is fun game.

Here is the url: {company_url}

Here is the text from the url: 

{raw_text_from_url}
"""

    def _make_yc_prompt_message(self, company_info: YCCompanyInfo) -> str:
        return f"""
You are a creative assistant that powers a fun thanksgiving game for founders.

You're given information about a YC company and its founders. Assign a disney character to each founder. When you assign a character to each founder, provide a short funny & spicy text along with it. Don't include character name in this text. This text can include a funny note about how the founder is like the disney character you assigned and why you're thankful this thanksgiving season for the founder tackling the problem that the company is solving - all in a funny way. For the latter, switch up the phrasing so the text for each founder seems unique and don't use first person pronouns like "I".

Here are some guidelines for the character assignment:
- The goal of this task is to ultimately generate a funny text along with each character assignment, and not to pick the closest matching character based on company information. The character assignment can be based on the company information or be somewhat random (to increase the fun factor). 
- Since most YC companies are tech companies, avoid over indexing on tech characters. It is more fun if character assignments change every run of the game.
- Try to guess gender of founder based on name and assign a character that is relevant to the gender. 
- It is okay to roast the founder in your reasoning if it is funny.

Don't include any citations in your response since this is fun game.

Here is the company information: 

{company_info.model_dump_json(exclude={"company_small_logo_url"})}

"""
