import { Book, BookVolume } from '../types/book';

export function mapBookVolume(raw: BookVolume): Book {
  const { volumeInfo } = raw;
  return {
    id: raw.id,
    title: volumeInfo.title,
    authors: volumeInfo.authors ?? [],
    description: volumeInfo.description,
    coverUrl: (volumeInfo.imageLinks?.thumbnail ?? volumeInfo.imageLinks?.smallThumbnail)?.replace('http://', 'https://'),
    categories: volumeInfo.categories,
    pageCount: volumeInfo.pageCount,
    publishedDate: volumeInfo.publishedDate,
    publisher: volumeInfo.publisher,
    language: volumeInfo.language,
  };
}
