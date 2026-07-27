export interface Book {
  id: string;
  title: string;
  authors: string[];
  description?: string;
  coverUrl?: string;
  categories?: string[];
  pageCount?: number;
  publishedDate?: string;
  publisher?: string;
  language?: string;
}

export interface BookVolume {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    categories?: string[];
    imageLinks?: { thumbnail?: string; smallThumbnail?: string };
    publishedDate?: string;
    pageCount?: number;
    publisher?: string;
    language?: string;
  };
}

export interface BooksResponse {
  totalItems: number;
  items: BookVolume[];
}
