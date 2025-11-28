/**
 * Backend Connection Test Endpoint
 * GET /api/test
 * Tests connection to FastAPI backend
 */

export async function GET() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    
    if (!backendUrl) {
      return Response.json(
        { 
          success: false, 
          error: 'NEXT_PUBLIC_API_URL not configured',
          message: 'Backend URL is not set in environment variables'
        },
        { status: 500 }
      );
    }

    console.log(`[Backend Test] Connecting to: ${backendUrl}/test`);

    const response = await fetch(`${backendUrl}/test`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`[Backend Test] Failed - Status: ${response.status}`, data);
      return Response.json(
        { 
          success: false, 
          error: `Backend returned ${response.status}`,
          details: data
        },
        { status: response.status }
      );
    }

    console.log('[Backend Test] Success:', data);
    
    return Response.json({
      success: true,
      message: 'Backend connection successful',
      backendResponse: data,
      backendUrl: backendUrl,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Backend Test] Connection Error:', error.message);
    
    return Response.json(
      { 
        success: false, 
        error: 'Failed to connect to backend',
        message: error.message,
        hint: 'Make sure NEXT_PUBLIC_API_URL is correct and backend is running'
      },
      { status: 503 }
    );
  }
}
