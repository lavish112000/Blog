const fs = require('fs');
const path = require('path');

// Configuration
const SOURCE_DIR = path.join(__dirname, '../src');
const PAGES_DIR = path.join(SOURCE_DIR, 'pages');
const POST_TEMPLATE_PATH = path.join(PAGES_DIR, 'post.html');

// Categories and Months
const CATEGORIES = ['technology', 'design', 'business', 'lifestyle'];
const MONTHS = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
];

// Read blogData from src/js/posts-data.js
const POSTS_DATA_PATH = path.join(SOURCE_DIR, 'js/posts-data.js');
let blogData = [];

try {
    const postsDataContent = fs.readFileSync(POSTS_DATA_PATH, 'utf8');
    // Extract the array using regex
    const match = postsDataContent.match(/window\.blogData\s*=\s*(\[[\s\S]*?\]);/);
    if (match && match[1]) {
        // Safe evaluation of the array string
        // We use Function constructor as a safer alternative to direct eval, 
        // though for a build script eval is generally acceptable if source is trusted.
        // However, since the data is just an array of objects, we can use eval.
        blogData = eval(match[1]);
        console.log(`Loaded ${blogData.length} posts from posts-data.js`);
    } else {
        console.error('Could not extract blogData from posts-data.js');
        process.exit(1);
    }
} catch (error) {
    console.error('Error reading posts-data.js:', error);
    process.exit(1);
}

// Helper to slugify title
function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

// Helper to get month from date string (e.g., "Nov 24, 2024")
function getMonth(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('default', { month: 'long' }).toLowerCase();
}

// Content Generator (Simplified version of generatePostContent from main.js)
function generatePostContent(post) {
    return `
        <p class="lead">
            ${post.excerpt}
        </p>
        
        <p>
            In a world that is constantly evolving, the intersection of technology and humanity has never been more critical. 
            As we stand on the precipice of a new era, it is essential to understand the fundamental shifts occurring in our 
            daily lives. This article explores the deep implications of these changes and what they mean for our future.
        </p>

        <h2>The Core of the Issue</h2>
        <p>
            At the heart of the matter lies a simple truth: innovation is accelerating at an unprecedented pace. 
            Experts argue that we are currently witnessing a paradigm shift comparable to the Industrial Revolution. 
            "The speed of change is not just linear, it is exponential," says Dr. Elena Rodriguez, a leading researcher in the field.
        </p>

        <div class="article-quote">
            <i class="fas fa-quote-left"></i>
            <p>We are not just building new tools; we are reshaping the very fabric of how we interact with reality.</p>
        </div>

        <p>
            Consider the data. In the last five years alone, adoption rates for these technologies have tripled. 
            This isn't just a trend; it is a movement. From Silicon Valley to Singapore, the narrative is the same: 
            adapt or be left behind.
        </p>

        <h3>Key Takeaways</h3>
        <ul>
            <li><strong>Innovation is accelerating:</strong> We are seeing faster cycles of development and deployment.</li>
            <li><strong>Global impact:</strong> These changes are not localized; they affect every economy and society.</li>
            <li><strong>Human-centric design:</strong> The most successful solutions prioritize user experience and ethical considerations.</li>
        </ul>

        <h2>Looking Ahead</h2>
        <p>
            So, where do we go from here? The answer is complex, but it begins with education and awareness. 
            We must equip ourselves with the knowledge to navigate this new landscape. 
            Whether you are a professional in the industry or a curious observer, staying informed is your best defense against obsolescence.
        </p>

        <p>
            As we move forward, let us embrace these challenges not as obstacles, but as opportunities. 
            The future is not written; it is built, day by day, by people like you and me.
        </p>
    `;
}

// Main Execution
async function main() {
    console.log('Starting static site generation...');

    // 1. Create Directory Structure
    console.log('Creating directories...');
    CATEGORIES.forEach(category => {
        MONTHS.forEach(month => {
            const dirPath = path.join(PAGES_DIR, category, month);
            fs.mkdirSync(dirPath, { recursive: true });
        });
    });

    // 2. Read Template
    let template = fs.readFileSync(POST_TEMPLATE_PATH, 'utf8');

    // 3. Generate Files
    console.log('Generating post files...');
    const urlMapping = {};

    blogData.forEach(post => {
        const month = getMonth(post.date);
        const slug = slugify(post.title);
        const fileName = `${slug}.html`;
        const category = post.category.toLowerCase();

        // Construct new path
        const fileDir = path.join(PAGES_DIR, category, month);
        const filePath = path.join(fileDir, fileName);

        // Relative URL for the browser
        const relativeUrl = `pages/${category}/${month}/${fileName}`;
        urlMapping[post.id] = relativeUrl;

        // Customize Template
        let content = template;

        // Replace placeholders (We need to be careful with paths since we are deeper in the directory structure)
        // The template assumes it is in src/pages/post.html (depth 1)
        // New files are in src/pages/category/month/slug.html (depth 3)
        // So we need to adjust relative paths: ../../ vs ../../../

        // Fix CSS/JS paths
        content = content.replace(/href="\.\.\/css/g, 'href="../../../css');
        content = content.replace(/src="\.\.\/js/g, 'src="../../../js');
        content = content.replace(/href="\.\.\/index\.html"/g, 'href="../../../index.html"');

        // Inject Content
        // We'll use a simple replacement strategy assuming the template has specific IDs or markers
        // However, the current post.html uses JS to load content. 
        // We want to "bake" it in.

        // Let's replace the empty containers with actual content
        // Note: This is a bit hacky because we are modifying HTML string. 
        // Ideally, we'd use a proper template engine, but we are working with what we have.

        // Replace Title
        content = content.replace('<h1 class="post-title" id="post-title"></h1>', `<h1 class="post-title" id="post-title">${post.title}</h1>`);

        // Replace Meta
        content = content.replace('<span id="post-category"></span>', post.category);
        content = content.replace('<span id="post-date"></span>', post.date);
        content = content.replace('<span id="post-read-time"></span>', '5 min read');
        content = content.replace('<span id="post-views"></span>', post.views);

        // Replace Image
        // We need to find the img tag. It's likely empty or has a placeholder.
        // The template has: <img src="" alt="" id="post-image">
        content = content.replace('<img src="" alt="" id="post-image">', `<img src="${post.image}" alt="${post.title}" id="post-image">`);

        // Replace Author
        content = content.replace('<h4 id="post-author"></h4>', `<h4 id="post-author">${post.author}</h4>`);

        // Replace Body
        const bodyContent = generatePostContent(post);
        content = content.replace('<div class="post-body" id="post-body"></div>', `<div class="post-body" id="post-body">${bodyContent}</div>`);

        // Write file
        fs.writeFileSync(filePath, content);
        console.log(`Generated: ${relativeUrl}`);
    });

    // 4. Output Mapping for manual update of posts-data.js
    console.log('\nURL Mapping (Copy this to update posts-data.js):');
    console.log(JSON.stringify(urlMapping, null, 2));
}

main().catch(console.error);
