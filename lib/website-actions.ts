"use server"

import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function getWebsiteContent(username: string): Promise<string | null> {
  try {
    const tableName = `${username.toLowerCase()}_website`

    // Check if the table exists first
    const tableExists = await sql.query(
      `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = $1
      )
    `,
      [tableName],
    )

    if (!tableExists[0]?.exists) {
      return null
    }

    // Get the HTML content from the website table (latest entry)
    const result = await sql.query(`
      SELECT html_content 
      FROM ${tableName} 
      ORDER BY created_at DESC 
      LIMIT 1
    `)

    if (result.length === 0) {
      return null
    }

    return result[0].html_content
  } catch (error) {
    console.error("Error fetching website content:", error)
    return null
  }
}

export async function updateWebsiteContent(username: string, htmlContent: string) {
  try {
    const tableName = `${username.toLowerCase()}_website`

    // Insert new HTML content (this creates a new version)
    await sql.query(
      `
      INSERT INTO ${tableName} (html_content) 
      VALUES ($1)
    `,
      [htmlContent],
    )

    return {
      success: true,
      message: "Website content updated successfully!",
    }
  } catch (error) {
    console.error("Error updating website content:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update website content",
    }
  }
}

export async function generateCodeWithAI(currentCode: string, prompt: string) {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer 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`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a helpful HTML/CSS/JavaScript code assistant. You will be given existing HTML code and a user request to modify it. 

Rules:
1. Always return complete, valid HTML code
2. Preserve the overall structure unless specifically asked to change it
3. Make only the changes requested by the user
4. Include proper HTML5 structure with <!DOCTYPE html>
5. Ensure the code is clean and well-formatted
6. If adding styles, use inline CSS or <style> tags within the HTML
7. If adding JavaScript, use <script> tags within the HTML
8. Return ONLY the HTML code, no explanations or markdown formatting
9. Make sure all HTML tags are properly closed
10. Use modern CSS and HTML best practices`,
          },
          {
            role: "user",
            content: `Current HTML code:
${currentCode}

User request: ${prompt}

Please modify the HTML code according to the user's request and return the complete updated HTML code.`,
          },
        ],
        max_tokens: 4000,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || "OpenAI API request failed")
    }

    const data = await response.json()
    const generatedCode = data.choices[0]?.message?.content

    if (!generatedCode) {
      throw new Error("No code generated from OpenAI")
    }

    return {
      success: true,
      generatedCode: generatedCode.trim(),
    }
  } catch (error) {
    console.error("Error generating code with AI:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate code with AI",
    }
  }
}

export async function trackVisit(username: string): Promise<void> {
  try {
    const visitsTableName = `${username.toLowerCase()}_visits`

    // Insert a visit record
    await sql.query(
      `
      INSERT INTO ${visitsTableName} (entry, visited_at) 
      VALUES ($1, CURRENT_TIMESTAMP)
    `,
      ["yes"],
    )
  } catch (error) {
    console.error("Error tracking visit:", error)
  }
}

export async function getVisitCount(username: string): Promise<number> {
  try {
    const visitsTableName = `${username.toLowerCase()}_visits`

    // Check if the visits table exists
    const tableExists = await sql.query(
      `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = $1
      )
    `,
      [visitsTableName],
    )

    if (!tableExists[0]?.exists) {
      return 0
    }

    // Get the count of visits
    const result = await sql.query(`
      SELECT COUNT(*) as count FROM ${visitsTableName}
    `)

    return Number.parseInt(result[0]?.count || "0")
  } catch (error) {
    console.error("Error fetching visit count:", error)
    return 0
  }
}

export async function getAllUsernames(): Promise<string[]> {
  try {
    const result = await sql`
      SELECT name FROM alias ORDER BY created_at DESC
    `

    return result.map((row: any) => row.name)
  } catch (error) {
    console.error("Error fetching usernames:", error)
    return []
  }
}
