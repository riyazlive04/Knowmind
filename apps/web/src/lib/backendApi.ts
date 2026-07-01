// Utility for calling the backend API from the frontend
// In production, adjust BACKEND_URL to match your backend domain/port

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'

export async function callBackendApi(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${BACKEND_URL}${endpoint}`

  // Don't set Content-Type if body is FormData - let browser set multipart/form-data automatically
  const isFormData = options.body instanceof FormData

  return fetch(url, {
    ...options,
    headers: isFormData
      ? options.headers // FormData: don't set Content-Type, browser will handle it
      : {
          ...options.headers,
          'Content-Type': 'application/json',
        },
  })
}
