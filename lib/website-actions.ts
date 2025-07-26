"use server"

import { neon } from "@neondatabase/serverless"

import OpenAI from "openai"

const sql = neon(process.env.DATABASE_URL!)

export interface WebsiteContent {
  html: string
  script: string
  data: string
}


const openai = new OpenAI({
  apiKey: "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",
})


export async function generateCodeWithAI(currentCode: string, prompt: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      stream: true,
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
          content: `Current HTML code:\n${currentCode}\n\nUser request: ${prompt}\n\nPlease modify the HTML code according to the user's request and return the complete updated HTML code.`,
        },
      ],
      max_tokens: 4000,
      temperature: 1,
    })

let generatedCode = '';

for await (const chunk of completion) {
  const content = chunk.choices[0]?.delta?.content;
  if (content) {
    generatedCode += content;
  }
}
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


export async function getWebsiteContent(username: string): Promise<WebsiteContent | null> {
  try {
    const tableName = `${username.toLowerCase()}_website`;

    // Check if the table exists
    const tableExists = await sql.query(
      `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = $1
      )
    `,
      [tableName]
    );

    if (!tableExists[0]?.exists) {
      return null;
    }

    // Get latest content
    const result = await sql.query(
      `SELECT code, code_script, code_data FROM ${tableName} ORDER BY created_at DESC LIMIT 1`
    );

    if (result.length === 0) {
      return null;
    }

    return {
      html: result[0].code || "",
      script: result[0].code_script || "",
      data: result[0].code_data || "",
    };
  } catch (error) {
    console.error("Error fetching website content:", error);
    return null;
  }
}


export async function getWebsiteHTML(username: string): Promise<string | null> {
  try {
    const content = await getWebsiteContent(username)
    if (!content) return null

    // Combine HTML with inline script and data
    let combinedHTML = content.html

    // Inject data script before other scripts
    if (content.data) {
      const dataScript = `<script>${content.data}</script>`
      combinedHTML = combinedHTML.replace("</head>", `${dataScript}\n</head>`)
    }

    // Replace script.js reference with inline script
    if (content.script) {
      const inlineScript = `<script>${content.script}</script>`
      combinedHTML = combinedHTML.replace('<script src="script.js"></script>', inlineScript)
    }

    return combinedHTML
  } catch (error) {
    console.error("Error getting combined HTML:", error)
    return null
  }
}


export async function updateWebsiteContent(username: string, html: string, script: string, data: string) {
  try {
    const tableName = `${username.toLowerCase()}_website`

    // Insert new content (creates a new version)
    await sql.query(
      `
      INSERT INTO ${tableName} (code, code_script, code_data) 
      VALUES ($1, $2, $3)
    `,
      [html, script, data],
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
    const result = await sql.query(`
      SELECT name FROM alias ORDER BY created_at DESC
    `)

    return result.map((row: any) => row.name)
  } catch (error) {
    console.error("Error fetching usernames:", error)
    return []
  }
}


export async function getWebsiteTemplates() {
  try {
    const templates = await sql.query(`
      SELECT id, name, code, code_script, code_data
      FROM website_template
      ORDER BY id ASC
    `)

    return templates
  } catch (error) {
    console.error("Failed to fetch website templates:", error)
    return []
  }
}


export async function applyTemplateToUserWebsite(username: string, templateCode: string) {
  const sanitizedUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, '')
  const tableName = `${sanitizedUsername}_website`
console.log("hello")
console.log(sanitizedUsername)
console.log(templateCode)
  try {
    // Insert the template code into the user's website table
  



 await sql.query(
      `
      INSERT INTO ${tableName} (html_content) 
      VALUES ($1)
    `,
      [templateCode],
    )

    return {
      success: true,
      message: "Template applied successfully!",
      username: sanitizedUsername,
    }
  } catch (error) {
    console.error(`Failed to apply template for ${username}:`, error)
    return {
      success: false,
      error: "Could not apply the template. Please try again.",
    }
  }
}