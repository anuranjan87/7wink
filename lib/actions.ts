"use server"

import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function storeCharacter(name: string) {
  try {
    // Create the alias table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS alias (
        id SERIAL PRIMARY KEY,
        name VARCHAR(10) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Insert the character into the alias table
    await sql`
      INSERT INTO alias (name) VALUES (${name})
    `

    // Create table names
    const websiteTableName = `${name.toLowerCase()}_website`
    const visitsTableName = `${name.toLowerCase()}_visits`

    // Create the website table using sql.query for dynamic table names
    await sql.query(`
      CREATE TABLE IF NOT EXISTS ${websiteTableName} (
        id SERIAL PRIMARY KEY,
        html_content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create the visits table
    await sql.query(`
      CREATE TABLE IF NOT EXISTS ${visitsTableName} (
        id SERIAL PRIMARY KEY,
        entry VARCHAR(10) NOT NULL,
        visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Generate dummy HTML content
    const dummyHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name}'s Website</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container { 
            background: rgba(255,255,255,0.1); 
            padding: 30px; 
            border-radius: 10px;
            backdrop-filter: blur(10px);
        }
        h1 { color: #fff; text-align: center; }
        .welcome { text-align: center; margin: 20px 0; }
        .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 30px; }
        .feature { background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to ${name}'s Website</h1>
        <div class="welcome">
            <p>Hello! This is ${name}'s personal website. Thanks for visiting!</p>
            <p>This page was automatically generated and stored in the database.</p>
        </div>
        <div class="features">
            <div class="feature">
                <h3>About ${name}</h3>
                <p>This is ${name}'s personal space on the web.</p>
            </div>
            <div class="feature">
                <h3>Contact</h3>
                <p>Feel free to reach out to ${name} anytime!</p>
            </div>
            <div class="feature">
                <h3>Projects</h3>
                <p>${name} is working on exciting projects!</p>
            </div>
        </div>
        <footer style="text-align: center; margin-top: 40px; opacity: 0.8;">
            <p>&copy; 2024 ${name}'s Website. Generated automatically.</p>
        </footer>
    </div>
</body>
</html>
`.trim()

    // Insert the dummy HTML into the website table using sql.query
    await sql.query(`INSERT INTO ${websiteTableName} (html_content) VALUES ($1)`, [dummyHtml])

    return {
      success: true,
      message: `Name "${name}" stored, website and visits tables created successfully!`,
    }
  } catch (error) {
    console.error("Database error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Database operation failed",
    }
  }
}
