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
          
          content: `You are a helpful JavaScript content editing assistant. You will be given a JavaScript data object definition and a user request to modify it.
Always return complete, valid JavaScript code.

Do NOT change the variable name, object keys, or structure.

Only modify the content values (strings, arrays, numbers, booleans) as requested by the user.

Preserve the overall skeleton and hierarchy exactly as it is.

Ensure all JavaScript syntax is valid (proper commas, brackets, and quotes).

Do not add or remove properties unless explicitly asked.

Do not include explanations or markdown formatting — return only the updated JavaScript code.

The content represents website copy, so ensure the tone and style are appropriate for web presentation.`,
        },
        {
          role: "user",
          content: `Current JavaScript data object code:\n${currentCode}\n\nUser request: ${prompt}\n\nPlease modify the JavaScript data object according to the user's request and return the complete JavaScript data object, also maintaig the word countsame as in current code. `,
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


export async function trackVisit(username: string, ipAddress?: string): Promise<void> {
  try {
    const visitsTableName = `${username.toLowerCase()}_visits`
console.log(ipAddress)
console.log("hue hue")
    // Insert a visit record with IP address
    await sql.query(
      `INSERT INTO ${visitsTableName} (entry, visited_at, ip_address) 
      VALUES ($1, CURRENT_TIMESTAMP, $2)`,
      ["yes", ipAddress || "unknown"],
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


export async function getVisitChartData(username: string): Promise<
  { date: string; visits: number }[]
> {
  try {
    const visitsTableName = `${username.toLowerCase()}_visits`

    // ✅ Check if the visits table exists
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
      return []
    }

    // ✅ Generate daily series, pad missing days with 0, keep timestamp-style output
    const result = await sql.query(
      `
      WITH date_series AS (
        SELECT generate_series(
          (SELECT MIN(visited_at)::date FROM ${visitsTableName}),
          GREATEST((SELECT MAX(visited_at)::date FROM ${visitsTableName}), NOW()::date),
          interval '1 day'
        )::timestamp AS date
      )
      SELECT 
        TO_CHAR(ds.date, 'YYYY-MM-DD HH24:MI:SS') AS date,
        COALESCE(COUNT(v.visited_at), 0) AS visits
      FROM date_series ds
      LEFT JOIN ${visitsTableName} v
        ON ds.date::date = v.visited_at::date
      GROUP BY ds.date
      ORDER BY ds.date
      `,
    )
    console.log(result)

    return result.map((row: any) => ({
      date: row.date,
      visits: Number(row.visits),
    }))
  } catch (error) {
    console.error("Error fetching visit chart data:", error)
    return []
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



export async function copyTemplateToUser(templateID: number, username: string) {
  console.log("[v0] Starting copyTemplateToUser with templateID:", templateID, "username:", username)

  try {
    const templateRes = await sql.query(
      `SELECT code, code_script, code_data 
       FROM website_template 
       WHERE id = $1`,
      [templateID],
    )

    if (!templateRes || templateRes.length === 0) {
      return { success: false, error: `Template with ID ${templateID} not found` }
    }

    const { code, code_script, code_data } = templateRes[0]

    const userTable = `${username.toLowerCase()}_website`
    await sql.query(
      `INSERT INTO ${userTable} (code, code_script, code_data) 
       VALUES ($1, $2, $3)`,
      [code, code_script, code_data],
    )

    return { success: true }
  } catch (error) {
    console.error("[v0] Error in copyTemplateToUser:", error)
    return { success: false, error: String(error) }
  }
}


export async function sendEnquiry(username: string, formData: FormData) {
  const enquiryTableName = `${username}_enquiry`

  // Extract values safely
  const email = formData.get("email") as string
  const message = formData.get("your_message") as string

  // Format the form data as a single entry string
  const entryData = `Email: ${email}, Message: ${message}`

  // Insert into the user-specific enquiry table
  await sql.query(
    `
    INSERT INTO ${enquiryTableName} (entry)
    VALUES ($1)
  `,
    [entryData],
  )

  console.log("Enquiry inserted into database:", {
    table: enquiryTableName,
    entry: entryData,
    timestamp: new Date().toISOString(),
  })

  return {
    success: true,
    message: "Enquiry submitted successfully",
  }
}