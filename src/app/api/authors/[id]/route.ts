import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Asegúrate de que esta sea la ruta correcta a tu instancia de Prisma

// //////////////////////////////////////////////////////
// // GET - Obtener un autor específico por ID
// //////////////////////////////////////////////////////
export async function GET(request: Request, context: { params: any }) {
  const params = await context.params;
  try {
    const author = await prisma.author.findUnique({
      where: {
        id: params.id,
      },
      include: {
        books: {
          orderBy: {
            publishedYear: 'desc',
          },
        },
        // Se comenta el conteo para no afectar el objeto `author` principal.
        // _count: {
        //   select: { books: true }
        // }
      },
    });

    if (!author) {
      return NextResponse.json(
        { error: 'Autor no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(author);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Error al obtener autor' },
      { status: 500 }
    );
  }
}

// //////////////////////////////////////////////////////
// // PUT - Actualizar un autor
// //////////////////////////////////////////////////////
export async function PUT(request: Request, context: { params: any }) {
  const params = await context.params;
  try {
    const body = await request.json();
    const { name, email, bio, nationality, birthYear } = body;

    // Validación de email si se proporciona
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Email inválido' },
          { status: 400 }
        );
      }
    }

    const author = await prisma.author.update({
      where: {
        id: params.id,
      },
      data: {
        name,
        email,
        bio,
        nationality,
        birthYear: birthYear ? parseInt(birthYear) : null,
      },
      include: {
        books: true,
      },
    });

    return NextResponse.json(author);
  } catch (error: any) {
    if (error.code === 'P2025') { // P2025: Record to update not found
      return NextResponse.json(
        { error: 'Autor no encontrado' },
        { status: 404 }
      );
    }
    if (error.code === 'P2002') { // P2002: Unique constraint violation (email ya existe)
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 409 } // 409 Conflict
      );
    }

    console.error(error);
    return NextResponse.json(
      { error: 'Error al actualizar autor' },
      { status: 500 }
    );
  }
}

// //////////////////////////////////////////////////////
// // DELETE - Eliminar un autor
// //////////////////////////////////////////////////////
export async function DELETE(request: Request, context: { params: any }) {
  const params = await context.params;
  try {
    await prisma.author.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({
      message: 'Autor eliminado correctamente',
    });
  } catch (error: any) {
    if (error.code === 'P2025') { // P2025: Record to delete not found
      return NextResponse.json(
        { error: 'Autor no encontrado' },
        { status: 404 }
      );
    }

    console.error(error);
    return NextResponse.json(
      { error: 'Error al eliminar autor' },
      { status: 500 }
    );
  }
}