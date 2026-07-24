## Strapi CMS Data Required

Link to the Chat: https://chatgpt.com/share/6a5f6f20-f0b4-83ee-a92f-a97b2d00cc7a

1. Pages - Collection Type Single
 - Sections (Dynamic Zone)
 - SEO Component

2. Site Settings
 Collection Type: Single

 - SiteName
 - SiteTagLine
 - Designation
 - ProfileImage
 - Resume
 - CopyrightText
 - Email
 - Phone
 - Location
 - Favicon
 - Logo
 - SeO (Component) - Will be decided later
 - AvailabilityStatus Text
 - AIEnabled
  - Text
 
 - navigation (Component)
  - Title, sectionId, Order, Visible, Icon
 - Social Links (Component)
  - Platform, Url, Icon, Order, Visible
 - Footer Links (Component)
  - Title, Url, OpeninnewTab, Order




2. HomeHero Section (Component)
 
 ---- Hero ------
 - Name
 - Tagline
 - TypingTexts (Repeatable Component)
  - Text
  - Start Text
 - Description
 - ProfileImage (Media)
 - Buttons (Repeatable Component)
  - Primary Button => text,url,openinnewtab,variant (primary), icon-align
  - Secondary Button => text, icon, url,variant (secondary), icon-align
 
 --- About ----
 - Title
 - Company
 - Description

 -- Open to new roles
 - Description
 
 -- Contribution --
 - GitHub UserName

3. Skills Section (Component)
 
 - CollectionName (Component) Same in 4 
 - Seo Component
 
 -- Hero-- (Component)
 - Badge
	- Left Text
	- Right Text
 - Title
 - Description
 - Additional text

 --- Skill Category -- 
 Collection Type: Skill Category
 
 - Name
 - Order
 - Visible
 - Color

 --- Skills ---
 Collection Type: Skill
 
 - Name
 - Category (Relation -> Skill Category)
 - Icon (Media)
 - Icon Class
 - Order

 --- next ----
 Next (Component)
 - Badge Component
 - Text
 - Button Component


4. Projects Section (Component).

 Collection Type: Single

 - Hero Section (Component) (Same in 3)
 - SEO (Component)
 - Badge (Component)
  - Title
  - left Text
 
 --- Project ---
 Collection Type : project
 
 - Title
 - Order
 - Category
 - Start Year
 - End Year
 - Description
 - Thumbnail
 - Screenshots
 - Technologies (Relation -> Skills)
 - Tag (list)
 - Links (Component)
  - Title
  - Text
  - Open in new Tab
  - Icon
  - IconAlign

 - Next Page(Component) in 3


5. Experience Section (Component)
	- Badge Component
	- Hero Section (Same in 3)
	- SEO
	- Badge Component
	
	-- Experiences --- (Component)
	Collection Type: Experiences

	- Designation
	- Company Name
	- Location
	- Work Type (Full time/WFH)
	- Start Year
	- End Year
	- Currently Working
	- Description (Rich Text)
	- Tech (Component)
		- Text (Relation -> Skills)
		- Order
		- HighLight
 
 
6. TimeLine Section (Component)
	- Use the same Experiences Component

7. Education Section (Component)
	- use the same Experiences Component
	--- Card -- (Component)
	- year
	- Title
	- Description

8. Certifications Section (Component)
	--- Card --- (Component)
	- Title
	- Active
	- Certifier
	- Description
	- Issued
	- Expires
	- ID
	- Verify Link (Component)

9. Blog Section (Component)
	- Enable Search

	--- Blogs ---
	Collection Type: Blogs

	- Title
	- Slug
	- Programming Language (Relatation -> skills)
	- PulishedAt
	- ShortDescription
	- Thumbnail (Media)
	
	
	-- Blog Content ----
	Collection Type: Blog Content

	- Blog (Relation -> blogs)
	- Content
	- Next 
		- Text
		- Url
		- Openinnewtab

10. Contact Section (Component)

	- Resume (Component)
	- PDF Link
	
	- Social Links (Component)
	- SendNote Boolean
	- Fit Component
		- Secondary Button





 