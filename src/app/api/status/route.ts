import { NextResponse } from 'next/server';
import { db } from '@/data/db';

export async function GET() {
  const allowPublicHealthCheck = process.env.ALLOW_PUBLIC_HEALTH_CHECK === 'true';

  if (!allowPublicHealthCheck) {
    return NextResponse.json(
      { error: 'Forbidden: Access restricted to internal network.' },
      { status: 403 }
    );
  }

  const timestamp = new Date().toISOString();
  
  try {
    await db.query('SELECT 1');
    
    return NextResponse.json(
      { 
        status: 'ok', 
        timestamp,
        build: {
          version: process.env.NEXT_PUBLIC_APP_VERSION,
          commit: process.env.NEXT_PUBLIC_COMMIT_HASH,
          time: process.env.NEXT_PUBLIC_BUILD_TIME,
        },
        server: {
          uptime: process.uptime(),
          status: 'running'
        },
        services: {
          database: 'connected'
        }
      }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        timestamp,
        server: {
          uptime: process.uptime(),
          status: 'running'
        },
        services: {
          database: 'disconnected',
          error: error instanceof Error ? error.message : String(error)
        }
      }, 
      { status: 503 }
    );
  }
}
