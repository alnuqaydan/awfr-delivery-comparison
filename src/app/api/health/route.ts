import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Basic health check
    const healthStatus: any = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NEXT_PUBLIC_APP_ENVIRONMENT || 'development',
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform,
    };

    // Check if we're in production and add additional checks
    if (process.env.NODE_ENV === 'production') {
      // Add database connectivity check if applicable
      // Add external service checks if applicable
      healthStatus.production = true;
    }

    return NextResponse.json(healthStatus, { status: 200 });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}

export async function HEAD(request: NextRequest) {
  // Simple health check for load balancers
  return new NextResponse(null, { status: 200 });
}
