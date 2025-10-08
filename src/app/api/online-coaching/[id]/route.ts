import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // TODO: Add database logic here when table is created
    // For now, just return success
    
    return NextResponse.json(
      { message: 'Registration deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting online coaching registration:', error);
    return NextResponse.json(
      { error: 'Failed to delete registration' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // TODO: Add database logic here when table is created
    // For now, return mock data
    
    return NextResponse.json({
      id,
      name: 'Mock User',
      email: 'mock@example.com',
      phone: '+40 722 123 456',
      status: 'active',
      program: '12 Week Program',
      notes: 'Mock registration details'
    });
  } catch (error) {
    console.error('Error fetching online coaching registration:', error);
    return NextResponse.json(
      { error: 'Failed to fetch registration' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await request.json();
    
    // TODO: Add database logic here when table is created
    // For now, just return success
    
    return NextResponse.json(
      { message: 'Registration updated successfully', data },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating online coaching registration:', error);
    return NextResponse.json(
      { error: 'Failed to update registration' },
      { status: 500 }
    );
  }
}

