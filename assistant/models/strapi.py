from datetime import date, datetime
from typing import Any, Generic, List, Literal, Optional, TypeVar, NewType
from pydantic import BaseModel, Field

T = TypeVar("T")


class StrapiPagination(BaseModel):
    page: Optional[int] = None
    pageSize: Optional[int] = None
    pageCount: Optional[int] = None
    start: Optional[int] = None
    limit: Optional[int] = None
    total: Optional[int] = None


class StrapiMeta(BaseModel):
    pagination: Optional[StrapiPagination] = None


class StrapiResponse(BaseModel, Generic[T]):
    data: T
    meta: StrapiMeta = Field(default_factory=StrapiMeta)


class StrapiData(BaseModel):
    id: int
    documentId: str
    createdAt: datetime
    updatedAt: datetime
    publishedAt: datetime


class ModelConfiguration(BaseModel):
    id: int
    Connector: Literal["OpenAI", "AzureOpenAI", "Mistral", "Gemini"]
    SystemPrompt: str
    BaseURL: Optional[str]
    Temperature: float
    MaxTokens: Optional[int]
    Model_Name: str


class LLMSettings(StrapiData):
    MaxDailyResponses: int
    Planner: ModelConfiguration
    Response: ModelConfiguration
    Embedding: ModelConfiguration


class SkillCategory(StrapiData):
    Name: str
    Visible: bool = True
    Order: int = 1
    Skills: Optional[List["Skill"]] = None


class Skill(StrapiData):
    Name: str
    IconClass: Optional[str] = None
    Order: int = 1
    Category: Optional[SkillCategory] = None


SkillCategory.model_rebuild()


class StrapiLink(BaseModel):
    id: int
    Title: str
    Text: str
    Url: str
    Icon: Optional[str] = None
    OpenInNewTab: bool = False


class ProjectTag(StrapiData):
    Tag: Optional[str] = None
    Technology: Optional[Skill] = None


class Project(StrapiData):
    Title: str
    Order: Optional[int] = None
    Category: str
    Description: str
    StartYear: Optional[date] = None
    EndYear: Optional[date] = None
    Tags: Optional[List[ProjectTag]] = None
    Links: Optional[List[StrapiLink]] = None


class BadgeTag(BaseModel):
    id: int
    Order: int = 1
    Highlight: bool = False
    Skill: Optional[Skill] = None


class TimelineComponent(BaseModel):
    id: int
    Title: str
    SubTitle: Optional[str] = None
    ShortTitle: Optional[str] = None
    Description: Optional[str] = None
    Badges: Optional[List[BadgeTag]] = None


class Education(StrapiData):
    Timeline: TimelineComponent


class Certification(StrapiData):
    Title: str
    Description: Optional[str] = None
    Active: bool = True
    CertificateID: Optional[str] = None
    Certifier: Optional[str] = None
    Issued: Optional[date] = None
    Expires: Optional[date] = None
    VerifyLink: Optional[StrapiLink] = None


class TimeLine(StrapiData):
    Timeline: TimelineComponent


class Experience(StrapiData):
    Experience: TimelineComponent


class Page(StrapiData):
    Title: str
    Slug: str
    SEO: Optional[Any] = None
    Content: Optional[List[Any]] = None


class SocialLink(BaseModel):
    id: int
    Platform: Literal[
        "github",
        "linkedin",
        "twitter",
        "instagram",
        "facebook",
        "youtube",
        "medium",
        "devto",
        "stackoverflow",
        "leetcode",
        "hackerrank",
        "codepen",
        "behance",
        "dribbble",
        "email",
        "website",
    ]
    Icon: str
    Url: str
    Order: int = 1
    Visible: bool = True


class FooterLink(BaseModel):
    id: int
    Title: str
    Url: str
    OpenInNewTab: bool = True
    Order: int = 0


class SiteSettings(StrapiData):
    SiteName: str
    Designation: str
    Resume: str
    Location: str
    Email: str
    CopyRightText: Optional[str] = None
    AvailabilityStatus: Optional[str] = None
    AskAI: Optional[Any] = None
    Navigation: Optional[List[Any]] = None
    SocialLinks: Optional[List[SocialLink]] = None
    Footer: Optional[List[FooterLink]] = None


class StrapiMedia(StrapiData):
    name: str
    alternativeText: Optional[str] = None
    caption: Optional[str] = None
    focalPoint: Optional[Any] = None
    width: Optional[int] = None
    height: Optional[int] = None
    formats: Optional[dict[str, Any]] = None
    hash: str
    ext: str
    mime: str
    size: float
    url: str
    previewUrl: Optional[str] = None
    provider: str
    provider_metadata: Optional[dict[str, Any]] = None


class AIKnowledge(StrapiData):
    Title: str
    SourceType: Literal["Resume", "Blog", "Custom", "FAQ"]
    Media: Optional[StrapiMedia] = None
    Content: Optional[str] = None


class Blog(StrapiData):
    Title: str
    Slug: str
    Description: Optional[str] = None
    Skill: Optional[Skill] = None
    Thumbnail: Optional[StrapiMedia] = None


BlogArticle = Blog


class BlogContent(StrapiData):
    Blog: Optional[BlogArticle] = None
    Content: Optional[str] = None
