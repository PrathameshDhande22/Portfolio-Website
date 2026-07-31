# Next.JS Portfolio Website

Need to create the Portfolio website you will be provided with accurate information regarding how to create and which styling to use, how to write the code, where to look for the docs all will be provided to you. Just go through these complete plan for Implementation and follow as the plan says. Do not invent on your own. Follow the Proper instructions and act accordingly.

### Reference Site: https://prathameshsystenics.github.io/PrathameshPortfolio/
Here is the reference site of the Portfolio how it looks it is just the template you need to use the same CSS and structure but just load the data from the CMS. Read these site firstly before going to the plan. Fetch each page it contains every css and font. 

## Description

Portfolio website will completely depend on the strapi as the Content Manager System. All the content for the protfolio website will receive from these cms only. Strapi will create the pages dynamically from their own cms and similar it will render in these page. Strapi is completely the source of the truth for the complete data. 

## Instructions
- Firstly read the strapi structure carefully how it is being implemented.
- Read the NextJS folder structure. The application have already installed the required libraries like Strapi Client, ShadCN, TailwindCSS v4, Framer Motion aka Motion. If you need to install new libraries firstly consult with me regarding whether to install or not. Do not install any library on your own. 
- Read the plan throughly then firstly think what else is missing from these. 
- After reading firstly ask the questions if you have doubt regarding the implementation how it gonna clear those first only instead of asking later when starting the implementation. 
- Follow the Solid Principles properly whenever writing the code. Segration is important over these project because everything is being loaded from the Strapi only. 
- You will be provided with MCP Docs for **NextJS**, **Strapi**, **Shadcn**, and **Motion**. Read those docs whenever you find any difficulties while implementing do not invent on your own. 
- You will be provided with the screenshot regarding the portfolio website if you cannot fetch the website link correctly. 
- After understanding the task correctly if all investigation and planning is done then divide each task or say each page then implement one by one and let it be reviewed it by me. 
- The Portfolio website must be SEO friendly all the seo related data must be present and `sitemap.xml` must be up to date. 

## Coding Instructions
1. When ever you create the `page.tsx` or `layout.tsx` always use the type props which nextjs generate like `LayoutProps`, or `PageProps`. 
2. Do not Write the old tailwindcss which will say that these can be used instead of these. Use always new tailwindcss.
3. If you need to touch the strapi api server then firstly consult with me that what changes are you going to do in that strapi what it would result in. But try not to touch the Strapi Server code. 
4. Follow the exact folder structure that will be going to be provided to you. 
5. When you are going to add the new component from the shadcn then also consult from me also.
6. Do not write the comments on each single line through out the project. 
7. Do not write the function comments also, whenever creating a new function or component, but create the filename or function name in such a way that from name only it understand what that components or function does. 
8. Do not try to invent the function or create the new function every time try to reuse the function which you or we already have or used in the packages.  
9. If the implementation or work is getting in one line of code then use that approach only instead of creating the complex function which will not understand.
10. Keep it simple, allow the code to be understand by human clearly what it is written. 
11. Follow DRY principles whenever implementing. 
12. While writting the code try to write in a optimized way. The load time for loading the website must be minimal.
13. All the strapi client call must be on the server side only there should be not client side data loading via API. You will be explained with each pages how to implement those. 
14. Firstly Understand the Strapi how the data is being displayed below section will help to understand the Strapi Section correctly. You will be explained each collection type we have. 
15. Use the NextJS 16, the installed version is 16, make the use of the inbuilt functions, enable the `CacheComponents` whereever want to cache the data use the `use cache` directive read the docs regarding these and understand the concept. 
16. Use the server action wherever it is applicable because our most of the work will be based on the server side only. 
17. Make use of the typescript correctly. Do not use any in any function or type firstly always define the type. Which makes the code readable. 
18. Use the tailwindcss correctly without any error issue. 
19. Installed the React-Icons library use the icons from there only. 
20. Always use the `next/Font` library for loading and using the Font. 
21. Use the `next/Image` library for viewing the Image. 

## Strapi Explanation
Go through the strapi code `/cms` to understand how components and collection types are design.

**Site Settings**, **AI Settings** and **Robots** these are the single type settings which define, and it must be loaded when the site is loaded for the first time. Robots are basically the `robots.txt` which are directly served using the Strapi. 

We have **Pages** as the Collection Type where all the pages are stored and each entry in these is the separate page. Each have the component. With Data prefilled in it. It also contains the component Named as **Section** which have the type which specifies which type of data to load then according to it loads. 
Section Component can contain data like
    - Skills
    - Blog
    - Certification
    - Contact
    - Education
    - Experience
    - Project

**Blog** Page just display the title and etc, but not the blog content to read the Blog-Content need to call the collection Type for **BlogContent**. 

**Version** is the collection type where on specific page we will load all the version of these website with the changelog. 

Read each `schema.json` to understand throughly most important part is the `section` component which does all part of rendering. Also look for the component how they are defined and what types they have. 

Map the component easily from provided template website
- Divider -> Divider which contains left and right text
- Next Component
- Button Component with having the variant and text
- Hero for each page except the home page will have the different HomeHero as the component due to the data shown in the home page is totally different.
- Badge Component
- Link Component 

Related to SEO we already have the SEO Component which do care for each page seo like **OpenGraph**, **Structured Data**, **Twitter Card**, etc. 

## Implementation Plan

Create the Layout in such a way that it must render dynamically all page correctly. Follow the Project Structure in the feature wise skills: 
```
features -> skills
            -> services/services.ts
            -> components/ 
                        -> All skills related components
            -> hooks/
                    -> All skills related hooks (If applicable)
```
Similar to these and create a common page renderer `PageRenderer` which will render the any thing which will be present inside the `[...slug]/page.tsx`. Inside it `BlockRenderer` for rendering the component related components. For mapping the component or Block create the registry as `SectionRegistry` for fetching the component and loading the data related to section type. 
`BlockRegistery` for mapping the components rendering whcih we have in the **Pages** collection type. 

Follow these same Project Structure to maintain it clean. 

1. Firstly fetch the **SiteSettings** for getting all the data and Navigation also with slug like which page to display in the sidebar, similar we have the social links to display. 
2. Load the **AISettings** to check if the AI is enabled or not. 
3. Load the Logo and favicon from the cms only but favicon i will provide in the project only just let me know where to add that `ico`.
4. For the Home Page load the page and render all the HomeHero, Display the Contribution heatmap for the GithubUsername read the Home Hero and display it similar and create it similar from the provided template only. 
5. For all the navigation pages load the data by their slug which is fetched during the **Site Settings** under the navigation component. 
6. When clicked load its seo and data, data loading must be in the server only. 
7. Add the animation whereever it is applicable like on homepage the sphere is rotating. 
8. When Loading the Skills add the animation, timeline component to display the timeline and there also add the animation. 
9. For the `/blog/{slug}` data it must fetch the data from the **Blog Content** make these page as separate in the Next.JS
10. For the version load the directly from the **Version** but make sure these `/changelog` is not must be index or seo. 
11. Display the OpenGraph, structured data from the SEO content. 
12. In the Contact page we have the feature to send the email to me and set the data in the **Contact** collection type bascially create when clicked on the button for the contact. 
13. Create the Layout and page.tsx correctly. 
14. Add the `error.tsx` and `global-error.tsx` which must display the error for the development environment and in production just show the error page. 
15. Add the `not-found.tsx` page for not found the content. 

### Deployment
After implementing the portfolio website according to the plan. Then next is for deployment create the `Dockerfile` for both `/cms` and `/client` it must be optimized and must have the lower image size.

On the 



