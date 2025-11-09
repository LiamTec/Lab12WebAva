import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const author = await prisma.author.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
      },
    });

    if (!author) {
      return NextResponse.json(
        { error: "Autor no encontrado" },
        { status: 404 }
      );
    }

    const books = await prisma.book.findMany({
      where: { authorId: id },
      select: {
        title: true,
        publishedYear: true,
        pages: true,
        genre: true,
      },
    });

    const totalBooks = books.length;
    const booksWithYear = books.filter((book) => book.publishedYear !== null);
    const firstBook = booksWithYear.length > 0
      ? booksWithYear.reduce((earliest, book) => {
          if (!earliest.publishedYear || !book.publishedYear) return earliest;
          return book.publishedYear < earliest.publishedYear ? book : earliest;
        })
      : null;

    const latestBook = booksWithYear.length > 0
      ? booksWithYear.reduce((latest, book) => {
          if (!latest.publishedYear || !book.publishedYear) return latest;
          return book.publishedYear > latest.publishedYear ? book : latest;
        })
      : null;

    const booksWithPages = books.filter((book) => book.pages !== null);
    const averagePages =
      booksWithPages.length > 0
        ? Math.round(
            booksWithPages.reduce((sum, book) => sum + (book.pages || 0), 0) /
              booksWithPages.length
          )
        : null;

    const genres = Array.from(
      new Set(books.map((book) => book.genre).filter((genre) => genre !== null))
    ) as string[];

    const longestBook = booksWithPages.length > 0
      ? booksWithPages.reduce((longest, book) => {
          if (!longest.pages || !book.pages) return longest;
          return book.pages > longest.pages ? book : longest;
        })
      : null;

    const shortestBook = booksWithPages.length > 0
      ? booksWithPages.reduce((shortest, book) => {
          if (!shortest.pages || !book.pages) return shortest;
          return book.pages < shortest.pages ? book : shortest;
        })
      : null;

    const response = {
      authorId: author.id,
      authorName: author.name,
      totalBooks,
      firstBook: firstBook && firstBook.publishedYear
        ? {
            title: firstBook.title,
            year: firstBook.publishedYear,
          }
        : null,
      latestBook: latestBook && latestBook.publishedYear
        ? {
            title: latestBook.title,
            year: latestBook.publishedYear,
          }
        : null,
      averagePages: averagePages,
      genres: genres,
      longestBook: longestBook && longestBook.pages
        ? {
            title: longestBook.title,
            pages: longestBook.pages,
          }
        : null,
      shortestBook: shortestBook && shortestBook.pages
        ? {
            title: shortestBook.title,
            pages: shortestBook.pages,
          }
        : null,
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener estadísticas del autor" },
      { status: 500 }
    );
  }
}

