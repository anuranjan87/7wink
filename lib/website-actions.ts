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

    // Get the HTML content from the website table
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
