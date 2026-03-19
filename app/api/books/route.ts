import { NextRequest, NextResponse } from 'next/server';
import { getAllBooks } from '@/lib/books';

export async function GET(request: NextRequest) {
  try {
    const books = await getAllBooks();
    
    return NextResponse.json({
      success: true,
      data: books,
      count: books.length
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch books',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export const revalidate = 60; // Revalidate every 60 seconds