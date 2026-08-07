from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Config(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # Settings Configuration
    mistral_api_key: str = Field(description="Mistral API Key")
    gemini_api_key: str = Field(description="Gemini API Key")
    openai_api_key: str = Field(description="OpenAI API Key")
    azure_openai_api_key: str = Field(description="Azure OpenAI API Key")
    strapi_auth_token: str = Field(description="Strapi Auth Token")
    strapi_api_url: str = Field(description="Strapi API URL")
    postgres_connection_string: str = Field(description="Postgres Connection String")


settings = Config()