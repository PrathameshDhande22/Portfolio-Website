import { getBlogs, getBlogContent } from "../service";
import { BlogCard } from "./blog-card";
import { BlogPagination } from "./blog-pagination";
import { readingMinutes } from "@/lib/format";

export async function BlogList({ currentPage }: { currentPage: number }) {
  const { items, pagination } = await getBlogs(currentPage);

  const posts = await Promise.all(
    items.map(async (blog) => {
      const content = await getBlogContent(blog.Slug);
      return { blog, minutes: readingMinutes(content?.Content) };
    })
  );

  return (
    <div>
      <div className="grid grid-cols-1 gap-3.5 tile:grid-cols-2 wide:grid-cols-3">
        {posts.map(({ blog, minutes }) => (
          <BlogCard key={blog.documentId} blog={blog} minutes={minutes} />
        ))}
      </div>

      <BlogPagination currentPage={pagination.page} pageCount={pagination.pageCount} />
    </div>
  );
}
