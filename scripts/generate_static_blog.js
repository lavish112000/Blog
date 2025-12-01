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

// Mock Data (Copying from posts-data.js for simplicity in this script)
const blogData = [
    // TECHNOLOGY
    {
        id: 1,
        title: "The AI Revolution: How GPT-5 Will Change Everything",
        excerpt: "Artificial General Intelligence is closer than we think. Here's what the next generation of AI models means for developers and creators.",
        author: "Lalit",
        date: "Nov 24, 2024",
        category: "technology",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
        featured: true,
        views: "12.5k"
    },
    {
        id: 2,
        title: "Quantum Computing: The End of Encryption as We Know It?",
        excerpt: "With Google and IBM racing towards quantum supremacy, cybersecurity faces its biggest challenge yet. Are we ready?",
        author: "Sarah Chen",
        date: "Nov 23, 2024",
        category: "technology",
        image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
        featured: false,
        views: "8.2k"
    },
    {
        id: 3,
        title: "WebAssembly vs. JavaScript: The Battle for the Browser",
        excerpt: "Is Wasm the killer of JS, or its best friend? A deep dive into the future of high-performance web applications.",
        author: "James Wilson",
        date: "Nov 21, 2024",
        category: "technology",
        image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80",
        featured: false,
        views: "10.1k"
    },
    {
        id: 4,
        title: "The Rise of Edge Computing in 5G Era",
        excerpt: "Why processing data closer to the source is the key to unlocking the full potential of IoT and autonomous vehicles.",
        author: "Lalit",
        date: "Nov 19, 2024",
        category: "technology",
        image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
        featured: false,
        views: "6.5k"
    },
    {
        id: 5,
        title: "Cybersecurity in 2025: Zero Trust Architecture",
        excerpt: "Why 'trust but verify' is dead. The new standard for securing enterprise networks in a remote-first world.",
        author: "Alex Rivera",
        date: "Nov 15, 2024",
        category: "technology",
        image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
        featured: false,
        views: "9.3k"
    },
    {
        id: 6,
        title: "VR vs AR: Where Should Developers Focus?",
        excerpt: "Apple's Vision Pro changed the game. Here is why Spatial Computing is the next frontier for app developers.",
        author: "Sarah Chen",
        date: "Nov 10, 2024",
        category: "technology",
        image: "https://images.unsplash.com/photo-1592478411213-61535fdd861d?w=800&q=80",
        featured: false,
        views: "15k"
    },

    // DESIGN
    {
        id: 7,
        title: "Neumorphism is Dead. Long Live Glassmorphism.",
        excerpt: "Design trends cycle fast. Discover why the frosted glass effect is dominating modern UI design and how to implement it correctly.",
        author: "Jessica Lee",
        date: "Nov 22, 2024",
        category: "design",
        image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&q=80",
        featured: true,
        views: "22k"
    },
    {
        id: 8,
        title: "Typography Trends for 2025: Big, Bold, and Brutalist",
        excerpt: "How to use massive type to make a statement. Moving away from safe sans-serifs to character-rich fonts.",
        author: "Michael Chang",
        date: "Nov 20, 2024",
        category: "design",
        image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
        featured: false,
        views: "11.4k"
    },
    {
        id: 9,
        title: "Designing for Accessibility: It's Not Optional Anymore",
        excerpt: "New regulations are coming. Here is your checklist to ensure your web apps are usable by everyone, everywhere.",
        author: "Jessica Lee",
        date: "Nov 18, 2024",
        category: "design",
        image: "https://images.unsplash.com/photo-1586717791821-3f44a5638d0f?w=800&q=80",
        featured: false,
        views: "7.8k"
    },
    {
        id: 10,
        title: "Color Theory in Dark Mode: You're Doing It Wrong",
        excerpt: "Why pure black is a mistake and how to create a soothing, battery-saving dark theme that pops.",
        author: "Michael Chang",
        date: "Nov 14, 2024",
        category: "design",
        image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80",
        featured: false,
        views: "18.2k"
    },
    {
        id: 11,
        title: "Micro-Interactions: The Secret to Addictive UX",
        excerpt: "From like buttons to loading spinners, how small animations create emotional connections with your users.",
        author: "Jessica Lee",
        date: "Nov 08, 2024",
        category: "design",
        image: "https://images.unsplash.com/photo-1550439062-609e1531270e?w=800&q=80",
        featured: false,
        views: "14.5k"
    },
    {
        id: 12,
        title: "Figma vs. Sketch vs. Adobe XD: The 2025 Verdict",
        excerpt: "The design tool wars are over. Here is who won and why you should probably switch your workflow now.",
        author: "Michael Chang",
        date: "Nov 05, 2024",
        category: "design",
        image: "https://images.unsplash.com/photo-1542744094-24638eff58bb?w=800&q=80",
        featured: false,
        views: "9.9k"
    },

    // BUSINESS
    {
        id: 13,
        title: "The 4-Day Work Week: Productivity Myth or Reality?",
        excerpt: "Results from the massive global pilot program are in. The data on employee happiness and output will shock you.",
        author: "James Peterson",
        date: "Nov 24, 2024",
        category: "business",
        image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
        featured: true,
        views: "35k"
    },
    {
        id: 14,
        title: "Bootstrapping vs. VC: Choosing Your Startup's Path",
        excerpt: "Money isn't free. Understanding the true cost of venture capital and when you should just build it yourself.",
        author: "Robert Chen",
        date: "Nov 21, 2024",
        category: "business",
        image: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&q=80",
        featured: false,
        views: "12k"
    },
    {
        id: 15,
        title: "Remote Leadership: Managing Teams You Never Meet",
        excerpt: "The old management playbook is broken. Here are the new rules for building culture and accountability in distributed teams.",
        author: "James Peterson",
        date: "Nov 17, 2024",
        category: "business",
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
        featured: false,
        views: "8.7k"
    },
    {
        id: 16,
        title: "The Creator Economy Bubble: Is It Bursting?",
        excerpt: "With millions of influencers fighting for attention, monetization is getting harder. Where is the smart money going?",
        author: "Robert Chen",
        date: "Nov 13, 2024",
        category: "business",
        image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80",
        featured: false,
        views: "16.1k"
    },
    {
        id: 17,
        title: "Crypto Regulation: What It Means for Your Portfolio",
        excerpt: "Governments are finally stepping in. Here is how new laws in the EU and US will impact Bitcoin and DeFi markets.",
        author: "James Peterson",
        date: "Nov 09, 2024",
        category: "business",
        image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&q=80",
        featured: false,
        views: "20.3k"
    },
    {
        id: 18,
        title: "Sustainable Business Models for 2025",
        excerpt: "Greenwashing won't cut it. Consumers demand real impact. How to build a profitable company that actually helps the planet.",
        author: "Robert Chen",
        date: "Nov 06, 2024",
        category: "business",
        image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80",
        featured: false,
        views: "7.4k"
    },

    // LIFESTYLE
    {
        id: 19,
        title: "Digital Nomad Visas: The Top 10 Countries for 2025",
        excerpt: "Stop dreaming and start packing. These countries offer the best tax breaks, internet speeds, and quality of life for remote workers.",
        author: "Emma Davis",
        date: "Nov 23, 2024",
        category: "lifestyle",
        image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80",
        featured: true,
        views: "42k"
    },
    {
        id: 20,
        title: "Biohacking Your Sleep: Science-Backed Tips",
        excerpt: "Sleep is the new status symbol. From cold plunges to blue light blockers, here is how to optimize your recovery.",
        author: "David Chen",
        date: "Nov 19, 2024",
        category: "lifestyle",
        image: "https://images.unsplash.com/photo-1541781777621-af1187514026?w=800&q=80",
        featured: false,
        views: "13.8k"
    },
    {
        id: 21,
        title: "Minimalism in a Maximalist World",
        excerpt: "How to declutter your digital and physical life to find focus and peace in an age of constant distraction.",
        author: "Emma Davis",
        date: "Nov 16, 2024",
        category: "lifestyle",
        image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=800&q=80",
        featured: false,
        views: "9.2k"
    },
    {
        id: 22,
        title: "The Plant-Based Athlete: Fueling Performance",
        excerpt: "You don't need meat to build muscle. Top athletes share their nutrition secrets for peak performance on a vegan diet.",
        author: "David Chen",
        date: "Nov 12, 2024",
        category: "lifestyle",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
        featured: false,
        views: "11.1k"
    },
    {
        id: 23,
        title: "Urban Gardening: Growing Food in Small Spaces",
        excerpt: "Turn your balcony into a farm. A beginner's guide to growing your own organic vegetables in the city.",
        author: "Emma Davis",
        date: "Nov 08, 2024",
        category: "lifestyle",
        image: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&q=80",
        featured: false,
        views: "6.9k"
    },
    {
        id: 24,
        title: "Mindfulness for the Anxious Generation",
        excerpt: "Meditation apps are just the start. Practical techniques to manage anxiety and build resilience in a chaotic world.",
        author: "David Chen",
        date: "Nov 04, 2024",
        category: "lifestyle",
        image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
        featured: false,
        views: "15.6k"
    }
];

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
