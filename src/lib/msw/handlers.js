// src/lib/msw/handlers.js
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('/api/admin/schools', async ({ request }) => {
    const data = await request.json();
    console.log('MSW: Received school onboarding data:', data);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simple validation example
    if (!data.schoolDetails || !data.schoolDetails.name) {
      return new HttpResponse(JSON.stringify({ message: 'School name is required' }), { status: 400 });
    }

    // Simulate a successful response
    return HttpResponse.json(
      {
        schoolId: `school_${Math.random().toString(36).substring(7)}`,
        message: 'School onboarded successfully and credentials provisioned.',
      },
      { status: 201 }
    );
  }),
];