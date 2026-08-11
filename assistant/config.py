from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Config(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    # Settings Configuration
    mistral_api_key: str = Field(description="Mistral API Key")
    gemini_api_key: str = Field(description="Gemini API Key")
    openai_api_key: str = Field(description="OpenAI API Key")
    azure_openai_api_key: str = Field(description="Azure OpenAI API Key")
    
    # DB Configuration
    postgres_connection_string: str = Field(description="PostgreSQL Connection String")
    
    # Strapi Configuration
    strapi_auth_token: str = Field(description="Strapi Auth Token")
    strapi_api_url: str = Field(description="Strapi API URL")

    # Langsmith Configuration
    langsmith_api_key: str = Field(description="Langsmith API Key")
    langsmith_tracing: bool = Field(
        default=False, description="Enable Langsmith Tracing"
    )
    langsmith_project: str = Field(
        default="default", description="Langsmith Project Name"
    )
    
    # Client Secret Configuration
    client_secret: str = Field(description="Client Secret for Authentication")


settings = Config()
