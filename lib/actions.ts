"use server";

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function storeCharacter(name: string) {
  try {
    // Store character alias
    await sql`
      CREATE TABLE IF NOT EXISTS alias (
        id SERIAL PRIMARY KEY,
        name VARCHAR(10) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`INSERT INTO alias (name) VALUES (${name})`;

    // Dynamic table names (sanitized to prevent SQL injection)
    const safeName = name.toLowerCase().replace(/[^a-z0-9_]/g, "");
    const websiteTableName = `${safeName}_website`;
    const visitsTableName = `${safeName}_visits`;
     const enquiryTableName = `${safeName}_enquiry`;

    // Create website table
    await sql.query(`
      CREATE TABLE IF NOT EXISTS ${websiteTableName} (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL,
        code_script TEXT NOT NULL,
        code_data TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create visits table
    await sql.query(`
      CREATE TABLE IF NOT EXISTS ${visitsTableName} (
        id SERIAL PRIMARY KEY,
        entry VARCHAR(10) NOT NULL,
        visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip_address VARCHAR(45) NOT NULL
      )
    `);


     // Create enquiry table
    await sql.query(`
      CREATE TABLE IF NOT EXISTS ${enquiryTableName} (
        id SERIAL PRIMARY KEY,
        entry VARCHAR(300) NOT NULL,
        visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Dummy HTML, Script, and Data
    const dummyHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DeceptiConf - A Design Conference for the Dark Side</title>
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&display=swap');
    body { font-family: 'Inter', sans-serif; }
  </style>
</head>
<body>
  <div class="min-h-screen">
    <section class="min-h-screen flex items-center justify-center px-8 py-16 bg-gradient-to-b from-gray-50 to-white">
      <div class="max-w-5xl mx-auto text-center">
        <h1 id="section1-title" class="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 leading-[0.9] mb-12 tracking-tight"></h1>
        <div id="section1-paragraphs" class="space-y-6 text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-light leading-relaxed"></div>
      </div>
    </section>

    <section class="min-h-screen flex items-center justify-center px-8 py-16 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
      <div class="relative z-10 max-w-5xl mx-auto text-center">
        <h2 id="section2-title" class="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] mb-16 tracking-tight"></h2>
        <div id="section2-paragraphs" class="space-y-8 text-xl md:text-2xl max-w-4xl mx-auto font-light leading-relaxed"></div>
      </div>
    </section>
  </div>
  <script src="data.js"></script>
  <script src="script.js"></script>
</body>
</html>`.trim();

    const dummyScript = `// Logic for populating content in the DeceptiConf landing page

function populateSection1() {
  const titleElement = document.getElementById('section1-title');
  const paragraphsContainer = document.getElementById('section1-paragraphs');

  const titleContent = contentData.section1.title;
  titleElement.innerHTML = \`\${titleContent.part1}
    <span class="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">\${titleContent.highlight1}</span>
    \${titleContent.part2}
    <span class="text-red-600">\${titleContent.highlight2}</span>\${titleContent.part3}\`;

  paragraphsContainer.innerHTML = '';
  contentData.section1.paragraphs.forEach(paragraph => {
    const p = document.createElement('p');
    p.className = \`border-l-4 \${paragraph.borderColor} pl-6\`;
    p.textContent = paragraph.text;
    paragraphsContainer.appendChild(p);
  });
}

function populateSection2() {
  const titleElement = document.getElementById('section2-title');
  const paragraphsContainer = document.getElementById('section2-paragraphs');

  const titleContent = contentData.section2.title;
  titleElement.innerHTML = \`<span class="text-white">\${titleContent.part1}</span><br>
    <span class="text-white">\${titleContent.part2}</span>
    <span class="bg-gradient-to-r from-red-500 via-pink-500 to-red-600 bg-clip-text text-transparent">\${titleContent.highlight}</span>
    <span class="text-red-500">\${titleContent.part3}</span>\`;

  paragraphsContainer.innerHTML = '';
  contentData.section2.paragraphs.forEach(paragraph => {
    const p = document.createElement('p');
    p.className = \`text-gray-300 border-l-4 \${paragraph.borderColor} pl-6\`;
    if (paragraph.highlight) {
      p.innerHTML = paragraph.text.replace(
        paragraph.highlight,
        \`<span class="text-white font-semibold">\${paragraph.highlight}</span>\`
      );
    } else {
      p.textContent = paragraph.text;
    }
    paragraphsContainer.appendChild(p);
  });
}

function initializePage() {
  populateSection1();
  populateSection2();
}

document.addEventListener('DOMContentLoaded', initializePage);

function updateContent(newContentData) {
  Object.assign(contentData, newContentData);
  initializePage();
}`.trim();

    const dummyData = `const contentData = {
  section1: {
    title: {
      part1: "Our three day schedule is ",
      highlight1: "jam-packed",
      part2: " with brilliant, creative, ",
      highlight2: "evil geniuses",
      part3: "."
    },
    paragraphs: [
      {
        text: "The worst people in our industry giving the best talks you've ever seen.",
        borderColor: "border-blue-600"
      },
      {
        text: "Nothing will be recorded and every attendee has to sign an NDA to watch the talks.",
        borderColor: "border-red-600"
      }
    ]
  },
  section2: {
    title: {
      part1: "A design conference",
      part2: "for the ",
      highlight: "dark side",
      part3: "."
    },
    paragraphs: [
      {
        text: "The next generation of web users are tech-savvy and suspicious. They know how to use dev tools, they can detect a phishing scam from a mile away, and they certainly aren't accepting any checks from Western Union.",
        borderColor: "border-purple-500"
      },
      {
        text: "At DeceptiConf you'll learn about the latest dark patterns being developed to trick even the smartest visitors, and you'll learn how to deploy them without ever being detected.",
        borderColor: "border-red-500",
        highlight: "DeceptiConf"
      }
    ]
  }
};`.trim();

    // Insert dummy content
    await sql.query(
      `INSERT INTO ${websiteTableName} (code, code_script, code_data) VALUES ($1, $2, $3)`,
      [dummyHtml, dummyScript, dummyData]
    );

    return {
      success: true,
      message: `Name "${name}" stored, website and visits tables created successfully!`,
    };
  } catch (error) {
    console.error("Database error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Database operation failed",
    };
  }
}
