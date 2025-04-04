import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    // Extract the authorization header
    const authHeader = request.headers.get("Authorization")

    if (!authHeader) {
      return NextResponse.json({ message: "Authorization header missing" }, { status: 401 })
    }

    // Forward the request to the actual API
    const response = await fetch("https://api.phish.directory/user/me", {
      headers: {
        Authorization: authHeader,
      },
    })

    const data = await response.json()

    // Return the same status code and data
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("API proxy error:", error)
    return NextResponse.json({ message: "Failed to process request" }, { status: 500 })
  }
}

