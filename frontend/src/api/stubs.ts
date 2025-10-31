import { CompanyCharacterInfo } from "./api";

export const sampleFetchCompanyCharactersResponse: CompanyCharacterInfo = {
  company_name: "Lark",
  company_yc_url: "https://www.ycombinator.com/companies/lark",
  company_logo_url:
    "https://bookface-images.s3.amazonaws.com/small_logos/67710e46a3214b779fb0c410b22c7dd1f1f89778.png",
  characters: [
    {
      founder_name: "Vijit Dhingra",
      character_name: "Iron Man",
      character_image_url:
        "https://cdn.s7.shopdisney.eu/is/image/ShopDisneyEMEA/33631_iron_man_character_sq_l?$characterImageSizeDesktop1x$&fit=constrain",
      reasoning:
        "Iron Man — the builder with arc‑reactor energy: he shipped usage‑based billing, payments, and disputes at a major provider, and now armors AI companies with a flexible pricing engine and AI billing agents so ops don’t explode.",
    },
    {
      founder_name: "Jack Brown",
      character_name: "Buzz Lightyear",
      character_image_url:
        "https://cdn.s7.shopdisney.eu/is/image/ShopDisneyEMEA/33631_buzz_lightyear_character_sq_l?$characterImageSizeDesktop1x$&fit=constrain",
      reasoning:
        "Buzz Lightyear — the lead who wrangled usage‑based billing for the biggest AI companies; at Lark it’s to infinity (and per‑unit) as they smooth subscription support and even land customers like Midjourney.",
    },
  ],
};
