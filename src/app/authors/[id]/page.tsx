'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Author {
  id: string;
  name: string;
  email: string;
  bio?: string;
  nationality?: string;
  birthYear?: number;
  createdAt: string;
  updatedAt: string;
  books?: Book[];
}

interface Book {
  id: string;
  title: string;
  description?: string;
  isbn?: string;
  publishedYear?: number;
  genre?: string;
  pages?: number;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthorStats {
  authorId: string;
  authorName: string;
  totalBooks: number;
  firstBook: {
    title: string;
    year: number;
  } | null;
  latestBook: {
    title: string;
    year: number;
  } | null;
  averagePages: number | null;
  genres: string[];
  longestBook: {
    title: string;
    pages: number;
  } | null;
  shortestBook: {
    title: string;
    pages: number;
  } | null;
}

export default function AuthorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [author, setAuthor] = useState<Author | null>(null);
  const [stats, setStats] = useState<AuthorStats | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showBookForm, setShowBookForm] = useState(false);
  const [genres, setGenres] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    nationality: '',
    birthYear: '',
  });

  const [bookFormData, setBookFormData] = useState({
    title: '',
    description: '',
    isbn: '',
    publishedYear: '',
    genre: '',
    pages: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (id) {
      fetchAuthor();
      fetchStats();
      fetchBooks();
    }
  }, [id]);

  const fetchAuthor = async () => {
    try {
      const response = await fetch(`/api/authors/${id}`);
      if (response.ok) {
        const data = await response.json();
        setAuthor(data);
        setFormData({
          name: data.name,
          email: data.email,
          bio: data.bio || '',
          nationality: data.nationality || '',
          birthYear: data.birthYear?.toString() || '',
        });
      } else {
        setError('Autor no encontrado');
      }
    } catch (error) {
      setError('Error al cargar el autor');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/authors/${id}/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchBooks = async () => {
    try {
      const response = await fetch(`/api/authors/${id}/books`);
      if (response.ok) {
        const data = await response.json();
        setBooks(data.books || []);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  useEffect(() => {
    const uniqueGenres = Array.from(
      new Set(books.map(book => book.genre).filter((genre): genre is string => genre !== null && genre !== undefined))
    ).sort();
    setGenres(uniqueGenres);
  }, [books]);

  const handleUpdateAuthor = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/authors/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          birthYear: formData.birthYear ? parseInt(formData.birthYear) : null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Autor actualizado correctamente');
        setShowEditForm(false);
        fetchAuthor();
        fetchStats();
      } else {
        setError(data.error || 'Error al actualizar el autor');
      }
    } catch (error) {
      setError('Error al actualizar el autor');
    }
  };

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...bookFormData,
          authorId: id,
          publishedYear: bookFormData.publishedYear ? parseInt(bookFormData.publishedYear) : null,
          pages: bookFormData.pages ? parseInt(bookFormData.pages) : null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Libro creado correctamente');
        setShowBookForm(false);
        setBookFormData({
          title: '',
          description: '',
          isbn: '',
          publishedYear: '',
          genre: '',
          pages: '',
        });
        fetchBooks();
        fetchStats();
      } else {
        setError(data.error || 'Error al crear el libro');
      }
    } catch (error) {
      setError('Error al crear el libro');
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este libro?')) {
      return;
    }

    try {
      const response = await fetch(`/api/books/${bookId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Libro eliminado correctamente');
        fetchBooks();
        fetchStats();
      } else {
        const data = await response.json();
        setError(data.error || 'Error al eliminar el libro');
      }
    } catch (error) {
      setError('Error al eliminar el libro');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Autor no encontrado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => router.push('/')}
          className="mb-4 text-blue-600 hover:text-blue-800 flex items-center gap-2"
        >
          ← Volver al Dashboard
        </button>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">{author.name}</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Información del Autor</h2>
                <button
                  onClick={() => setShowEditForm(!showEditForm)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  {showEditForm ? 'Cancelar' : 'Editar'}
                </button>
              </div>

              {!showEditForm ? (
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Email:</span>
                    <p className="text-gray-900">{author.email}</p>
                  </div>
                  {author.bio && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Biografía:</span>
                      <p className="text-gray-900">{author.bio}</p>
                    </div>
                  )}
                  {author.nationality && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Nacionalidad:</span>
                      <p className="text-gray-900">{author.nationality}</p>
                    </div>
                  )}
                  {author.birthYear && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Año de Nacimiento:</span>
                      <p className="text-gray-900">{author.birthYear}</p>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleUpdateAuthor} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Biografía
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nacionalidad
                    </label>
                    <input
                      type="text"
                      value={formData.nationality}
                      onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Año de Nacimiento
                    </label>
                    <input
                      type="number"
                      value={formData.birthYear}
                      onChange={(e) => setFormData({ ...formData, birthYear: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Actualizar
                  </button>
                </form>
              )}
            </div>

            {stats && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Estadísticas</h2>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Total de Libros:</span>
                    <p className="text-xl font-bold text-gray-900">{stats.totalBooks}</p>
                  </div>
                  {stats.averagePages !== null && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Promedio de Páginas:</span>
                      <p className="text-xl font-bold text-gray-900">{stats.averagePages}</p>
                    </div>
                  )}
                  {stats.genres.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Géneros:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {stats.genres.map((genre) => (
                          <span
                            key={genre}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {stats.firstBook && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Primer Libro:</span>
                      <p className="text-gray-900">
                        {stats.firstBook.title} ({stats.firstBook.year})
                      </p>
                    </div>
                  )}
                  {stats.latestBook && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Último Libro:</span>
                      <p className="text-gray-900">
                        {stats.latestBook.title} ({stats.latestBook.year})
                      </p>
                    </div>
                  )}
                  {stats.longestBook && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Libro Más Largo:</span>
                      <p className="text-gray-900">
                        {stats.longestBook.title} ({stats.longestBook.pages} páginas)
                      </p>
                    </div>
                  )}
                  {stats.shortestBook && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Libro Más Corto:</span>
                      <p className="text-gray-900">
                        {stats.shortestBook.title} ({stats.shortestBook.pages} páginas)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Libros del Autor</h2>
                <button
                  onClick={() => setShowBookForm(!showBookForm)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  {showBookForm ? 'Cancelar' : '+ Agregar Libro'}
                </button>
              </div>
            </div>

            {showBookForm && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Nuevo Libro</h3>
                <form onSubmit={handleCreateBook} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Título *
                      </label>
                      <input
                        type="text"
                        required
                        value={bookFormData.title}
                        onChange={(e) => setBookFormData({ ...bookFormData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ISBN
                      </label>
                      <input
                        type="text"
                        value={bookFormData.isbn}
                        onChange={(e) => setBookFormData({ ...bookFormData, isbn: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Género
                      </label>
                      <input
                        type="text"
                        value={bookFormData.genre}
                        onChange={(e) => setBookFormData({ ...bookFormData, genre: e.target.value })}
                        list="genres-list"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      />
                      <datalist id="genres-list">
                        {genres.map((genre) => (
                          <option key={genre} value={genre} />
                        ))}
                      </datalist>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Año de Publicación
                      </label>
                      <input
                        type="number"
                        value={bookFormData.publishedYear}
                        onChange={(e) => setBookFormData({ ...bookFormData, publishedYear: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Páginas
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={bookFormData.pages}
                        onChange={(e) => setBookFormData({ ...bookFormData, pages: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      value={bookFormData.description}
                      onChange={(e) => setBookFormData({ ...bookFormData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      rows={3}
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Crear Libro
                  </button>
                </form>
              </div>
            )}

            <div className="bg-white rounded-lg shadow p-6">
              {books.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Este autor no tiene libros registrados
                </div>
              ) : (
                <div className="space-y-4">
                  {books.map((book) => (
                    <div key={book.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {book.title}
                          </h3>
                          {book.description && (
                            <p className="text-gray-600 mb-3 text-sm">{book.description}</p>
                          )}
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            {book.genre && (
                              <span>
                                <strong>Género:</strong> {book.genre}
                              </span>
                            )}
                            {book.publishedYear && (
                              <span>
                                <strong>Año:</strong> {book.publishedYear}
                              </span>
                            )}
                            {book.pages && (
                              <span>
                                <strong>Páginas:</strong> {book.pages}
                              </span>
                            )}
                            {book.isbn && (
                              <span>
                                <strong>ISBN:</strong> {book.isbn}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteBook(book.id)}
                          className="ml-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

