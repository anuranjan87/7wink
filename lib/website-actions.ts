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
   console.log("ldldmmld")
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

The content represents website copy, so ensure the tone and style are appropriate for web presentation. You never chage image urls based on user prompt, keep them unchanged-strictly`,
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

export async function generateCodeWithAIBlank(currentCode: string, prompt: string) {

  
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      stream: true,
      messages: [
        {
          role: "system",
          
          content: `create code in html 5, generate stunning website in a single page, and always use tailwind css.Do not include explanations or markdown formatting — return only the updated, do not have any action button or contact section, use this url for image urls - https://picsum.photos/720/720?random=12, where random=12 has 12 number as random generated number, if thres are three pictures in the out put please have three different random numbers in the url and 720/720 is the dimention of the image in the url,`,
        },
        {
          role: "user",
          content: `Current code:\n${currentCode}\n\nUser request: ${prompt}\n\n, if ${currentCode} is empty, generate new code, otherwise Please modify it the user's request and return the complete code `,
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
      return []
    }

    // ✅ Use generate_series to pad missing days with 0
   const result = await sql.query(
  `
  WITH date_series AS (
    SELECT generate_series(
      (SELECT MIN(visited_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')::date FROM ${visitsTableName}),
      (SELECT MAX(visited_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')::date FROM ${visitsTableName}),
      interval '1 day'
    )::date AS date
  )
  SELECT 
    TO_CHAR(ds.date, 'YYYY-MM-DD') AS date,
    COALESCE(COUNT(v.visited_at), 0) AS visits
  FROM date_series ds
  LEFT JOIN ${visitsTableName} v
    ON ds.date = (v.visited_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')::date
  GROUP BY ds.date
  ORDER BY ds.date
  `,
)
console.log(username)
        console.log("username")
console.log(result)
    // Format into chartData array
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


export async function getWebsiteTemplates(templateID: number) {
  try {
    console.log("[v0] Fetching template with ID:", templateID)
    const templates = await sql`
      SELECT code, code_script, code_data 
      FROM website_template 
      WHERE id = ${templateID}
    `
    console.log("[v0] Templates fetched:", templates.length)
    return templates
  } catch (error) {
    console.error("Failed to fetch website templates:", error)
    // Return mock data for development
    return [
      {
        code: `<div>Template ${templateID} Preview</div>`,
        code_script: `console.log('Template ${templateID} script');`,
        code_data: `{"templateId": ${templateID}, "name": "Sample Template"}`,
      },
    ]
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

export async function getEnquiries(username: string) {
  const enquiryTableName = `${username}_enquiry`;

  const rows: any[] = await sql.query(
    `SELECT id, entry, visited_at FROM ${enquiryTableName} ORDER BY visited_at DESC`
  );
console.log("helloe")
  const enquiries = rows.map((row) => {
    const emailMatch = row.entry.match(/Email:\s*([^,]+)/);
    const messageMatch = row.entry.match(/Message:\s*(.*)/);

    return {
      id: row.id,
      email: emailMatch ? emailMatch[1].trim() : null,
      message: messageMatch ? messageMatch[1].trim() : null,
      created_at: row.visited_at,
    };
  });

  return enquiries;
}
