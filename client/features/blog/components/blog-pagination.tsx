import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

function hrefFor(page: number) {
  return page <= 1 ? "/blog" : `/blog?page=${page}`;
}

export function BlogPagination({ currentPage, pageCount }: { currentPage: number; pageCount: number }) {
  if (pageCount <= 1) return null;

  const pages = Array.from({ length: pageCount }, (_, index) => index + 1);

  return (
    <Pagination className="mt-10">
      <PaginationContent>
        {currentPage > 1 ? (
          <PaginationItem>
            <PaginationPrevious href={hrefFor(currentPage - 1)} />
          </PaginationItem>
        ) : null}

        {pages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink href={hrefFor(page)} isActive={page === currentPage}>
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        {currentPage < pageCount ? (
          <PaginationItem>
            <PaginationNext href={hrefFor(currentPage + 1)} />
          </PaginationItem>
        ) : null}
      </PaginationContent>
    </Pagination>
  );
}
