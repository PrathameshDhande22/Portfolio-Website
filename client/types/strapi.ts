export interface StrapiEntity {
  id: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export type StrapiImageFormatName = "thumbnail" | "small" | "medium" | "large";

export interface StrapiImageFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  width: number;
  height: number;
  size: number;
  url: string;
}

export interface StrapiMedia extends StrapiEntity {
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  formats: Partial<Record<StrapiImageFormatName, StrapiImageFormat>> | null;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null;
}

export interface StrapiPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface StrapiCollectionResponse<T> {
  data: T[];
  meta: { pagination: StrapiPagination };
}

export interface StrapiSingleResponse<T> {
  data: T;
  meta: Record<string, never>;
}

export interface Paginated<T> {
  items: T[];
  pagination: StrapiPagination;
}
