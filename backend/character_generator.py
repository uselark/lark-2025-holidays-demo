import json
import os
from enum import Enum
from typing import List, Type
from dotenv import load_dotenv
from openai import OpenAI
from pydantic import BaseModel, create_model

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


class YCFoudnerInfo(BaseModel):
    name: str
    description: str


class YCCompanyInfo(BaseModel):
    company_name: str
    description: str
    founders: List[YCFoudnerInfo]


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
        self.character_name_to_image_url = {
            char.name: char.image_url for char in self.character_list
        }

    def generate_characters_for_company(self, company_url: str) -> CompanyCharacterInfo:
        company_characters_internal = self._assign_characters_to_founders(company_url)

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
                    reasoning=character.reasoning,
                )
            )

        return CompanyCharacterInfo(
            company_name=company_characters_internal.company_name,
            company_logo_url=company_characters_internal.company_logo_image_url,
            company_yc_url=company_url,
            characters=company_characters_external,
        )

    # def _fetch_company_info(self, company_url: str) -> YCCompanyInfo:
    #     response = client.responses.parse(
    #         model="gpt-5",
    #         tools=[{"type": "web_search"}],
    #         input=f"Get the company info for {company_url}",
    #         text_format=YCCompanyInfo,
    #     )
    #     print("Company info: ", response.output_parsed)
    #     return response.output_parsed

    def _assign_characters_to_founders(self, yc_company_url: str) -> List[BaseModel]:
        CompanyCharactersInternal = self._create_company_characters_internal_model()

        response = client.responses.parse(
            model="gpt-5-mini",
            tools=[{"type": "web_search"}],
            input=self._make_promot_message(yc_company_url),
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
            company_name=(str, ...),
            company_logo_image_url=(str, ...),
            characters=(List[CompanyCharacterInternal], ...),
        )

    def _create_character_name_enum(self) -> Type[Enum]:
        """Create a dynamic Enum with all character names."""
        character_names = [char.name for char in self.character_list]
        # Create enum with name as both the key and value
        return Enum("CharacterName", {name: name for name in character_names})

    def _make_promot_message(self, yc_company_url: str) -> str:
        return f"""
You are a creative assistant that powers a fun halloween game for YC founders.

You're given a YC company URL that has information about the company and its founders. Use the web search tool to get this information. Then assign a disney character to each founder based on the information you have.

Be creative, fun, and spicy for this task. When you assign a character to each founder, provide a short funny & spicy reasoning for your choice. Don't include chracter name in your reasoning. Try to guess geneder of founder based on name and assign a character that is relevant to the gender.

In your response you will include the company founder character assignments and some information about the company that you extracted from the web search. Don't include any citations in your response since this is fun game. Company logo url will be of type `https://bookface-images.s3.amazonaws.com/...`. For company name, use the name that is displayed on the company page.

Here is the YC company url: {yc_company_url}"""
