import express from "express";
import cors from "cors";
import axios from "axios";
import * as cheerio from "cheerio";
import * as simpleIcons from "simple-icons";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Accurate technology name mapping to simple-icons slugs
const techMapping = {
  // JavaScript & TypeScript
  'javascript': 'javascript',
  'js': 'javascript',
  'typescript': 'typescript',
  'ts': 'typescript',
  
  // Frontend Frameworks
  'react': 'react',
  'reactjs': 'react',
  'react.js': 'react',
  'vue': 'vuedotjs',
  'vuejs': 'vuedotjs',
  'vue.js': 'vuedotjs',
  'angular': 'angular',
  'angularjs': 'angular',
  'svelte': 'svelte',
  'next': 'nextdotjs',
  'nextjs': 'nextdotjs',
  'next.js': 'nextdotjs',
  'nuxt': 'nuxtdotjs',
  'nuxtjs': 'nuxtdotjs',
  'gatsby': 'gatsby',
  'remix': 'remix',
  
  // CSS Frameworks
  'tailwind': 'tailwindcss',
  'tailwindcss': 'tailwindcss',
  'tailwind css': 'tailwindcss',
  'bootstrap': 'bootstrap',
  'material ui': 'mui',
  'mui': 'mui',
  'chakra ui': 'chakraui',
  'chakra': 'chakraui',
  'sass': 'sass',
  'scss': 'sass',
  'less': 'less',
  
  // Build Tools & Bundlers
  'vite': 'vite',
  'webpack': 'webpack',
  'babel': 'babel',
  'rollup': 'rollupdotjs',
  'parcel': 'parcel',
  'esbuild': 'esbuild',
  'gulp': 'gulp',
  'grunt': 'grunt',
  
  // Backend & Runtime
  'node': 'nodedotjs',
  'nodejs': 'nodedotjs',
  'node.js': 'nodedotjs',
  'express': 'express',
  'expressjs': 'express',
  'express.js': 'express',
  'fastify': 'fastify',
  'nest': 'nestjs',
  'nestjs': 'nestjs',
  'koa': 'koa',
  'django': 'django',
  'flask': 'flask',
  'fastapi': 'fastapi',
  'spring': 'spring',
  'spring boot': 'springboot',
  'laravel': 'laravel',
  'ruby on rails': 'rubyonrails',
  'rails': 'rubyonrails',
  
  // Databases
  'mongodb': 'mongodb',
  'mongo': 'mongodb',
  'postgresql': 'postgresql',
  'postgres': 'postgresql',
  'mysql': 'mysql',
  'sqlite': 'sqlite',
  'redis': 'redis',
  'firebase': 'firebase',
  'supabase': 'supabase',
  'prisma': 'prisma',
  
  // Cloud & Deployment
  'aws': 'amazonwebservices',
  'amazon web services': 'amazonwebservices',
  'azure': 'microsoftazure',
  'gcp': 'googlecloud',
  'google cloud': 'googlecloud',
  'vercel': 'vercel',
  'netlify': 'netlify',
  'heroku': 'heroku',
  'digitalocean': 'digitalocean',
  'docker': 'docker',
  'kubernetes': 'kubernetes',
  'k8s': 'kubernetes',
  
  // State Management
  'redux': 'redux',
  'mobx': 'mobx',
  'recoil': 'recoil',
  'zustand': 'zustand',
  'pinia': 'pinia',
  'vuex': 'vuex',
  
  // HTTP Clients & APIs
  'axios': 'axios',
  'graphql': 'graphql',
  'apollo': 'apollographql',
  'rest': 'postman',
  'restapi': 'postman',
  'trpc': 'trpc',
  
  // Testing
  'jest': 'jest',
  'mocha': 'mocha',
  'chai': 'chai',
  'cypress': 'cypress',
  'playwright': 'playwright',
  'vitest': 'vitest',
  'testing library': 'testinglibrary',
  
  // Mobile
  'react native': 'react',
  'react-native': 'react',
  'flutter': 'flutter',
  'ionic': 'ionic',
  'expo': 'expo',
  
  // Other Tools
  'git': 'git',
  'github': 'github',
  'gitlab': 'gitlab',
  'bitbucket': 'bitbucket',
  'npm': 'npm',
  'yarn': 'yarn',
  'pnpm': 'pnpm',
  'eslint': 'eslint',
  'prettier': 'prettier',
  'webassembly': 'webassembly',
  'wasm': 'webassembly',
  'framer': 'framer',
  'framer motion': 'framer',
  'figma': 'figma',
  'storybook': 'storybook',
  'swr': 'swr',
  'react query': 'reactquery',
  'tanstack query': 'reactquery',
  
  // Languages
  'python': 'python',
  'java': 'openjdk',
  'ruby': 'ruby',
  'php': 'php',
  'go': 'go',
  'golang': 'go',
  'rust': 'rust',
  'c++': 'cplusplus',
  'c#': 'csharp',
  'csharp': 'csharp',
  'kotlin': 'kotlin',
  'swift': 'swift',
  'dart': 'dart',
};

// Debug function to check simple-icons structure
function debugIconSearch(searchTerm) {
  console.log(`\n🔍 Searching for: "${searchTerm}"`);
  console.log('Available keys in simpleIcons:', Object.keys(simpleIcons).slice(0, 10), '...');
  
  // Check if exists directly
  if (simpleIcons[searchTerm]) {
    console.log(`✅ Found directly: ${searchTerm}`);
    console.log(`   Title: ${simpleIcons[searchTerm].title}`);
    console.log(`   Hex: ${simpleIcons[searchTerm].hex}`);
    return true;
  }
  
  // Search by title
  for (const [key, icon] of Object.entries(simpleIcons)) {
    if (icon.title.toLowerCase() === searchTerm.toLowerCase()) {
      console.log(`✅ Found by title: ${key}`);
      console.log(`   Title: ${icon.title}`);
      console.log(`   Hex: ${icon.hex}`);
      return true;
    }
  }
  
  console.log(`❌ Not found: "${searchTerm}"`);
  return false;
}

// Helper function to get icon and color for a technology
function getTechInfo(techName) {
  try {
    const normalizedName = techName.toLowerCase().trim();
    console.log(`\n📌 Processing technology: "${techName}" (normalized: "${normalizedName}")`);
    
    // Step 1: Check direct mapping first
    if (techMapping[normalizedName]) {
      const slug = techMapping[normalizedName];
      console.log(`  ✓ Found in mapping: ${slug}`);
      
      // Get the icon from simple-icons
      const icon = simpleIcons[`si${slug.charAt(0).toUpperCase() + slug.slice(1)}`] || 
                   simpleIcons[slug];
      
      if (icon) {
        console.log(`  ✓ Icon found: ${icon.title}, Color: #${icon.hex}`);
        return {
          name: techName,
          icon: icon.slug,
          color: `#${icon.hex}`,
          svg: icon.svg
        };
      } else {
        console.log(`  ✗ Icon not found for slug: ${slug}`);
      }
    }
    
    // Step 2: Try to find in simple-icons by constructing the key
    // simple-icons keys are like 'siExpress', 'siReact', etc.
    const siKey = `si${normalizedName.charAt(0).toUpperCase() + normalizedName.slice(1).replace(/[^a-zA-Z0-9]/g, '')}`;
    console.log(`  Trying simple-icons key: ${siKey}`);
    
    if (simpleIcons[siKey]) {
      const icon = simpleIcons[siKey];
      console.log(`  ✓ Found by siKey: ${icon.title}, Color: #${icon.hex}`);
      return {
        name: techName,
        icon: icon.slug,
        color: `#${icon.hex}`,
        svg: icon.svg
      };
    }
    
    // Step 3: Search by title (case-insensitive)
    const searchTerm = normalizedName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    for (const [key, icon] of Object.entries(simpleIcons)) {
      const iconTitle = icon.title.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
      if (iconTitle === searchTerm || iconTitle.includes(searchTerm)) {
        console.log(`  ✓ Found by title search: ${icon.title}, Color: #${icon.hex}`);
        return {
          name: techName,
          icon: icon.slug,
          color: `#${icon.hex}`,
          svg: icon.svg
        };
      }
    }
    
    console.log(`  ✗ No icon found for: "${techName}"`);
    return {
      name: techName,
      icon: null,
      color: null,
      svg: null
    };
  } catch (error) {
    console.error(`  ✗ Error processing "${techName}":`, error.message);
    return {
      name: techName,
      icon: null,
      color: null,
      svg: null,
      error: "Failed to find icon"
    };
  }
}

app.get("/", async (req, res) => {
  const description = "Hello talha javed this api is working perfectly and i am proud of you";
  const title = "Meta Data API";

  res.setHeader("Content-Type", "text/html");
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="description" content="${description}" />
  <meta name="access" content="${access}" />
  <title>${title}</title>
</head>
<body>
  <h1>Nice API is working perfectly</h1>
</body>
</html>
  `);
});

app.get("/api/meta", async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({
      success: false,
      message: "Please provide a URL.",
      example: "/api/meta?url=https://example.com",
    });
  }

  try {
    const { data: html } = await axios.get(url, {
      timeout: 10000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/138 Safari/537.36",
      },
    });

    const $ = cheerio.load(html);

    const getMeta = (name) => $(`meta[name="${name}"]`).attr("content") || null;
    const getProperty = (property) =>
      $(`meta[property="${property}"]`).attr("content") || null;

    const favicon =
      $('link[rel="icon"]').attr("href") ||
      $('link[rel="shortcut icon"]').attr("href") ||
      $('link[rel="apple-touch-icon"]').attr("href") ||
      "/favicon.ico";

    const porfolio_access = "no";

    // Get technologies from meta tag
    const technologiesMeta = getMeta("technologies");
    console.log('\n📋 Technologies meta tag:', technologiesMeta);
    
    const technologyNames = technologiesMeta
      ? technologiesMeta.split(",").map((tech) => tech.trim()).filter(Boolean)
      : [];

    console.log('📋 Technology names:', technologyNames);

    // Map technologies with their icons and colors
    const technologiesWithIcons = technologyNames.map(getTechInfo);

    console.log('\n✅ Final technologies output:', JSON.stringify(technologiesWithIcons, null, 2));

    const result = {
      success: true,
      url,
      title: $("title").text().trim() || null,
      description: getMeta("description"),
      keywords: getMeta("keywords"),
      themeColor: getMeta("theme-color"),
      author: getMeta("author"),
      robots: getMeta("robots"),
      access: getMeta("access") || porfolio_access,
      
      technologies: technologiesWithIcons,
      
      og: {
        title: getProperty("og:title"),
        description: getProperty("og:description"),
        image: getProperty("og:image"),
        type: getProperty("og:type"),
        url: getProperty("og:url"),
        siteName: getProperty("og:site_name"),
      },

      twitter: {
        card: getMeta("twitter:card"),
        title: getMeta("twitter:title"),
        description: getMeta("twitter:description"),
        image: getMeta("twitter:image"),
      },

      favicon: new URL(favicon, url).href,
    };

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch website metadata.",
      error: error.message,
    });
  }
});

// Debug endpoint to check specific icon
app.get("/api/debug/icon/:name", (req, res) => {
  const { name } = req.params;
  console.log(`\n🔧 Debug endpoint called for: "${name}"`);
  
  const found = debugIconSearch(name);
  const techInfo = getTechInfo(name);
  
  res.json({
    success: found,
    searchTerm: name,
    found,
    techInfo,
    simpleIconsKeys: Object.keys(simpleIcons).filter(key => 
      key.toLowerCase().includes(name.toLowerCase().replace(/[^a-zA-Z]/g, ''))
    ).slice(0, 10)
  });
});

// Endpoint to search for specific icon
app.get("/api/icon/:name", (req, res) => {
  const { name } = req.params;
  
  if (!name) {
    return res.status(400).json({
      success: false,
      message: "Please provide an icon name.",
      example: "/api/icon/react"
    });
  }

  const techInfo = getTechInfo(name);
  
  if (techInfo.icon) {
    res.json({
      success: true,
      data: techInfo
    });
  } else {
    res.status(404).json({
      success: false,
      message: `No icon found for "${name}"`,
      searchTerm: name,
      suggestion: "Try /api/debug/icon/" + name + " to see what's available"
    });
  }
});

// Debug endpoint to see all available simple-icons
app.get("/api/icons/list", (req, res) => {
  const { search } = req.query;
  let icons = Object.entries(simpleIcons).map(([key, icon]) => ({
    slug: icon.slug,
    title: icon.title,
    hex: icon.hex,
    key: key
  }));
  
  if (search) {
    const searchLower = search.toLowerCase();
    icons = icons.filter(icon => 
      icon.title.toLowerCase().includes(searchLower) || 
      icon.slug.includes(searchLower)
    );
  }
  
  res.json({
    success: true,
    total: icons.length,
    icons: icons.slice(0, 20) // Limit to first 20 results
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log('📝 Debug endpoints:');
  console.log('   /api/debug/icon/:name - Debug specific icon search');
  console.log('   /api/icons/list?search=express - Search available icons');
  
  // Test Express icon on startup
  console.log('\n🧪 Testing Express icon lookup:');
  debugIconSearch('express');
  console.log('\n🧪 Testing Express.js icon lookup:');
  getTechInfo('Express.js');
});