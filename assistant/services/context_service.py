import logging
from typing import Any, List

from models import RetrievalFilter, RetrievalSource
from strapi import strapi_client

logger = logging.getLogger(__name__)


async def fetch_source(source: RetrievalSource, filters: RetrievalFilter) -> str:
    logger.info("Reading source=%s filters=%s", source, filters.model_dump(exclude_none=True))

    match source:
        case "skills":
            if filters.name:
                response = await strapi_client.get_skills(by="Skills", name=filters.name)
                names = ", ".join(skill.Name for skill in response.data)
                return f"## Skills\n\n{names}" if names else ""

            response = await strapi_client.get_skills(by="Category", name=filters.category)
            lines = ["## Skills"]
            for category in response.data:
                if not category.Visible:
                    continue
                names = ", ".join(skill.Name for skill in category.Skills or [])
                lines.append(f"\n### {category.Name}\n\n{names or 'None listed'}")
            return "\n".join(lines) if len(lines) > 1 else ""

        case "projects":
            response = await strapi_client.get_projects(
                tag=filters.tag, name=filters.name, category=filters.category
            )
            lines = ["## Projects"]
            for project in response.data:
                lines.append(f"\n### {project.Title}")
                lines.append(f"\nCategory: {project.Category}")
                years = " to ".join(
                    str(year.year) for year in (project.StartYear, project.EndYear) if year
                )
                if years:
                    lines.append(f"Years: {years}")
                lines.append(f"\n{project.Description}")
                technologies = ", ".join(
                    tag.Tag or (tag.Technology.Name if tag.Technology else "")
                    for tag in project.Tags or []
                )
                if technologies:
                    lines.append(f"\nTechnologies: {technologies}")
                for link in project.Links or []:
                    lines.append(f"Link: [{link.Text}]({link.Url})")
            return "\n".join(lines) if len(lines) > 1 else ""

        case "experience":
            response = await strapi_client.get_experiences(name=filters.name)
            return render_timelines(
                "Experience", [entry.Experience for entry in response.data]
            )

        case "education":
            response = await strapi_client.get_education()
            return render_timelines(
                "Education", [entry.Timeline for entry in response.data]
            )

        case "timeline":
            response = await strapi_client.get_timeline()
            return render_timelines(
                "Timeline", [entry.Timeline for entry in response.data]
            )

        case "certifications":
            response = await strapi_client.get_certifications(name=filters.name)
            lines = ["## Certifications"]
            for certification in response.data:
                lines.append(f"\n### {certification.Title}")
                if certification.Certifier:
                    lines.append(f"\nIssued by: {certification.Certifier}")
                if certification.Issued:
                    lines.append(f"Issued: {certification.Issued.isoformat()}")
                if certification.Expires:
                    lines.append(f"Expires: {certification.Expires.isoformat()}")
                if certification.Description:
                    lines.append(f"\n{certification.Description}")
                if certification.VerifyLink:
                    lines.append(f"\nVerify: {certification.VerifyLink.Url}")
            return "\n".join(lines) if len(lines) > 1 else ""

        case "blogs":
            response = await strapi_client.get_blogs(name=filters.name)
            lines = ["## Blog articles"]
            for blog in response.data:
                lines.append(f"\n### {blog.Title}")
                if blog.Description:
                    lines.append(f"\n{blog.Description}")
                lines.append(f"\nSlug: {blog.Slug}")
            return "\n".join(lines) if len(lines) > 1 else ""

        case "site":
            response = await strapi_client.get_site_settings()
            site = response.data
            lines = [
                "## Site",
                f"\nName: {site.SiteName}",
                f"Designation: {site.Designation}",
                f"Location: {site.Location}",
                f"Email: {site.Email}",
            ]
            if site.AvailabilityStatus:
                lines.append(f"Availability: {site.AvailabilityStatus}")
            if site.Resume:
                lines.append(f"Resume: {site.Resume}")
            for link in site.SocialLinks or []:
                if link.Visible:
                    lines.append(f"{link.Platform}: {link.Url}")
            return "\n".join(lines)

        case _:
            logger.warning("Unknown source=%s requested by the planner", source)
            return ""


def render_timelines(heading: str, timelines: List[Any]) -> str:
    lines = [f"## {heading}"]
    for timeline in timelines:
        if timeline is None:
            continue
        title = timeline.Title
        if timeline.SubTitle:
            title = f"{title} - {timeline.SubTitle}"
        lines.append(f"\n### {title}")
        if timeline.ShortTitle:
            lines.append(f"\n{timeline.ShortTitle}")
        if timeline.Description:
            lines.append(f"\n{timeline.Description}")
        badges = ", ".join(
            badge.Skill.Name for badge in timeline.Badges or [] if badge.Skill
        )
        if badges:
            lines.append(f"\nSkills: {badges}")
    return "\n".join(lines) if len(lines) > 1 else ""
