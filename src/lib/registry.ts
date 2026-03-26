import { SectionDefinition } from './types';

const defaultHeaderContent = {
  logo: 'Wireframe',
  links: [
    { label: 'Features' },
    { label: 'Pricing' },
    { label: 'About' },
    { label: 'Contact' },
  ],
  ctaText: 'Get Started',
};

const defaultHeroContent = {
  title: 'Build something amazing today',
  subtitle: 'A short description of your product or service that explains the value proposition to your visitors.',
  ctaText: 'Get Started',
  ctaSecondaryText: 'Learn More',
};

const defaultFeaturesContent = {
  title: 'Everything you need',
  subtitle: 'Our platform provides all the tools you need to succeed.',
  features: [
    { title: 'Feature One', description: 'A brief description of this amazing feature and its benefits.' },
    { title: 'Feature Two', description: 'A brief description of this amazing feature and its benefits.' },
    { title: 'Feature Three', description: 'A brief description of this amazing feature and its benefits.' },
  ],
};

const defaultPricingPlans = [
  { name: 'Starter', price: '$9', period: '/month', description: 'For individuals', features: 'Feature one, Feature two, Feature three', ctaText: 'Get Started', highlighted: false },
  { name: 'Pro', price: '$29', period: '/month', description: 'For small teams', features: 'Everything in Starter, Feature four, Feature five, Feature six', ctaText: 'Get Started', highlighted: true },
  { name: 'Enterprise', price: '$99', period: '/month', description: 'For organizations', features: 'Everything in Pro, Feature seven, Feature eight, Priority support', ctaText: 'Contact Sales', highlighted: false },
];

const defaultTestimonials = [
  { quote: 'This product has completely transformed how we work. Highly recommended!', author: 'Jane Cooper', role: 'CEO at TechCorp' },
  { quote: 'The best investment we made this year. Outstanding support and features.', author: 'John Smith', role: 'CTO at StartupXYZ' },
  { quote: 'Simple, effective, and beautifully designed. We love using it every day.', author: 'Sarah Johnson', role: 'Designer at CreativeCo' },
];

const defaultFaqQuestions = [
  { question: 'How do I get started?', answer: 'Simply sign up for a free account and follow the onboarding guide.' },
  { question: 'Is there a free trial?', answer: 'Yes, we offer a 14-day free trial with full access to all features.' },
  { question: 'Can I cancel anytime?', answer: 'Absolutely. You can cancel your subscription at any time with no penalties.' },
  { question: 'Do you offer support?', answer: 'We provide 24/7 email support and live chat during business hours.' },
];

const defaultTeamMembers = [
  { name: 'Jane Cooper', role: 'CEO' },
  { name: 'John Smith', role: 'CTO' },
  { name: 'Sarah Johnson', role: 'Head of Design' },
  { name: 'Michael Brown', role: 'Lead Engineer' },
];

const defaultFooterColumns = [
  { title: 'Product', links: 'Features, Pricing, Changelog, Docs' },
  { title: 'Company', links: 'About, Blog, Careers, Contact' },
  { title: 'Resources', links: 'Help Center, Community, Guides, API' },
  { title: 'Legal', links: 'Privacy, Terms, Cookie Policy' },
];

const defaultLogos = [
  { name: 'Acme Corp' },
  { name: 'Globex' },
  { name: 'Initech' },
  { name: 'Umbrella' },
  { name: 'Stark Inc' },
  { name: 'Wayne Co' },
];

const defaultBlogPosts = [
  { title: 'Getting Started with Our Platform', excerpt: 'Learn how to set up your account and start building in minutes.', author: 'Jane Cooper', date: 'Mar 15, 2024' },
  { title: '10 Tips for Better Productivity', excerpt: 'Discover the best practices that will help you work smarter.', author: 'John Smith', date: 'Mar 12, 2024' },
  { title: 'What\'s New in Version 2.0', excerpt: 'Explore the latest features and improvements in our newest release.', author: 'Sarah Johnson', date: 'Mar 10, 2024' },
];

export const sectionRegistry: SectionDefinition[] = [
  // ── Header ──
  {
    category: 'header',
    categoryLabel: 'Header',
    icon: 'PanelTop',
    contentSchema: [
      { key: 'logo', label: 'Logo Text', type: 'text' },
      { key: 'links', label: 'Nav Links', type: 'items', itemFields: [
        { key: 'label', label: 'Label', type: 'text' },
      ]},
      { key: 'ctaText', label: 'CTA Button', type: 'text' },
    ],
    variants: [
      { variantId: 'header-simple', variantName: 'Simple', defaultContent: { ...defaultHeaderContent } },
      { variantId: 'header-centered', variantName: 'Centered', defaultContent: { ...defaultHeaderContent } },
      { variantId: 'header-with-cta', variantName: 'With Dual CTA', defaultContent: { ...defaultHeaderContent } },
      { variantId: 'header-mega', variantName: 'Mega Menu', defaultContent: { ...defaultHeaderContent } },
    ],
  },

  // ── Hero ──
  {
    category: 'hero',
    categoryLabel: 'Hero',
    icon: 'Sparkles',
    contentSchema: [
      { key: 'title', label: 'Headline', type: 'text' },
      { key: 'subtitle', label: 'Subtitle', type: 'textarea' },
      { key: 'showPrimaryButton', label: 'Show Primary Button', type: 'boolean' },
      { key: 'ctaText', label: 'Primary Button Text', type: 'text' },
      { key: 'showSecondaryButton', label: 'Show Secondary Button', type: 'boolean' },
      { key: 'ctaSecondaryText', label: 'Secondary Button Text', type: 'text' },
    ],
    variants: [
      { variantId: 'hero-centered', variantName: 'Centered', defaultContent: { ...defaultHeroContent, showPrimaryButton: true, showSecondaryButton: true } },
      { variantId: 'hero-split', variantName: 'Split with Image', defaultContent: { ...defaultHeroContent, showPrimaryButton: true, showSecondaryButton: true } },
      { variantId: 'hero-with-image', variantName: 'With Image Below', defaultContent: { ...defaultHeroContent, showPrimaryButton: true, showSecondaryButton: true } },
      { variantId: 'hero-minimal', variantName: 'Minimal', defaultContent: { title: 'Build something amazing today', subtitle: '', ctaText: 'Get Started', ctaSecondaryText: '', showPrimaryButton: true, showSecondaryButton: false } },
      { variantId: 'hero-with-form', variantName: 'With Signup Form', defaultContent: { ...defaultHeroContent, showPrimaryButton: true, showSecondaryButton: false } },
    ],
  },

  // ── Logo Cloud ──
  {
    category: 'logos',
    categoryLabel: 'Logo Cloud',
    icon: 'Building2',
    contentSchema: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'logos', label: 'Companies', type: 'items', itemFields: [
        { key: 'name', label: 'Company Name', type: 'text' },
      ]},
    ],
    variants: [
      { variantId: 'logos-simple', variantName: 'Simple Row', defaultContent: { title: 'Trusted by leading companies', logos: [...defaultLogos] } },
      { variantId: 'logos-with-title', variantName: 'With Side Title', defaultContent: { title: 'Trusted by leading companies', logos: [...defaultLogos] } },
      { variantId: 'logos-grid', variantName: 'Grid Cards', defaultContent: { title: 'Trusted by leading companies', logos: [...defaultLogos] } },
    ],
  },

  // ── Features ──
  {
    category: 'features',
    categoryLabel: 'Features',
    icon: 'LayoutGrid',
    contentSchema: [
      { key: 'title', label: 'Section Title', type: 'text' },
      { key: 'subtitle', label: 'Section Subtitle', type: 'textarea' },
      { key: 'features', label: 'Features', type: 'items', itemFields: [
        { key: 'title', label: 'Feature Title', type: 'text' },
        { key: 'description', label: 'Description', type: 'textarea' },
      ]},
    ],
    variants: [
      { variantId: 'features-grid', variantName: '3-Column Grid', defaultContent: { ...defaultFeaturesContent } },
      { variantId: 'features-alternating', variantName: 'Alternating Rows', defaultContent: { ...defaultFeaturesContent } },
      { variantId: 'features-2column', variantName: '2-Column', defaultContent: { ...defaultFeaturesContent } },
      { variantId: 'features-with-image', variantName: 'With Image', defaultContent: { ...defaultFeaturesContent } },
      { variantId: 'features-bento', variantName: 'Bento Grid', defaultContent: { ...defaultFeaturesContent, features: [...defaultFeaturesContent.features, { title: 'Feature Four', description: 'A brief description of this amazing feature.' }] } },
      { variantId: 'features-icon-list', variantName: 'Icon List', defaultContent: { ...defaultFeaturesContent } },
    ],
  },

  // ── Stats ──
  {
    category: 'stats',
    categoryLabel: 'Stats',
    icon: 'BarChart3',
    contentSchema: [
      { key: 'title', label: 'Section Title', type: 'text' },
      { key: 'stats', label: 'Stats', type: 'items', itemFields: [
        { key: 'value', label: 'Value', type: 'text' },
        { key: 'label', label: 'Label', type: 'text' },
      ]},
    ],
    variants: [
      { variantId: 'stats-row', variantName: '4-Column Row', defaultContent: { title: 'Trusted by thousands', stats: [{ value: '10K+', label: 'Active Users' }, { value: '99.9%', label: 'Uptime' }, { value: '150+', label: 'Countries' }, { value: '24/7', label: 'Support' }] } },
      { variantId: 'stats-with-description', variantName: 'With Background', defaultContent: { title: 'Our impact in numbers', stats: [{ value: '10K+', label: 'Active Users' }, { value: '99.9%', label: 'Uptime' }, { value: '150+', label: 'Countries' }] } },
      { variantId: 'stats-cards', variantName: 'Cards', defaultContent: { title: 'Trusted by thousands', stats: [{ value: '10K+', label: 'Active Users' }, { value: '99.9%', label: 'Uptime' }, { value: '150+', label: 'Countries' }, { value: '24/7', label: 'Support' }] } },
    ],
  },

  // ── Pricing ──
  {
    category: 'pricing',
    categoryLabel: 'Pricing',
    icon: 'CreditCard',
    contentSchema: [
      { key: 'title', label: 'Section Title', type: 'text' },
      { key: 'subtitle', label: 'Section Subtitle', type: 'textarea' },
      { key: 'plans', label: 'Plans', type: 'items', itemFields: [
        { key: 'name', label: 'Plan Name', type: 'text' },
        { key: 'price', label: 'Price', type: 'text' },
        { key: 'period', label: 'Period', type: 'text' },
        { key: 'description', label: 'Description', type: 'text' },
        { key: 'features', label: 'Features (comma-separated)', type: 'textarea' },
        { key: 'ctaText', label: 'Button Text', type: 'text' },
        { key: 'highlighted', label: 'Highlighted', type: 'boolean' },
      ]},
    ],
    variants: [
      { variantId: 'pricing-3col', variantName: '3-Column', defaultContent: { title: 'Simple, transparent pricing', subtitle: 'Choose the plan that works best for you.', plans: [...defaultPricingPlans] } },
      { variantId: 'pricing-2col', variantName: '2-Column', defaultContent: { title: 'Simple, transparent pricing', subtitle: 'Choose the plan that works best for you.', plans: defaultPricingPlans.slice(0, 2) } },
      { variantId: 'pricing-simple', variantName: 'Simple List', defaultContent: { title: 'Simple, transparent pricing', subtitle: 'Choose the plan that works best for you.', plans: [...defaultPricingPlans] } },
      { variantId: 'pricing-toggle', variantName: 'With Toggle', defaultContent: { title: 'Simple, transparent pricing', subtitle: 'Choose the plan that works best for you.', plans: [...defaultPricingPlans] } },
      { variantId: 'pricing-comparison', variantName: 'Comparison Table', defaultContent: { title: 'Compare plans', subtitle: 'See which plan is right for you.', plans: [...defaultPricingPlans] } },
    ],
  },

  // ── Testimonials ──
  {
    category: 'testimonials',
    categoryLabel: 'Testimonials',
    icon: 'Quote',
    contentSchema: [
      { key: 'title', label: 'Section Title', type: 'text' },
      { key: 'testimonials', label: 'Testimonials', type: 'items', itemFields: [
        { key: 'quote', label: 'Quote', type: 'textarea' },
        { key: 'author', label: 'Author Name', type: 'text' },
        { key: 'role', label: 'Author Role', type: 'text' },
      ]},
    ],
    variants: [
      { variantId: 'testimonials-cards', variantName: '3-Card Grid', defaultContent: { title: 'What our customers say', testimonials: [...defaultTestimonials] } },
      { variantId: 'testimonials-single', variantName: 'Single Highlight', defaultContent: { title: 'What our customers say', testimonials: [defaultTestimonials[0]] } },
      { variantId: 'testimonials-minimal', variantName: 'Minimal', defaultContent: { title: 'What our customers say', testimonials: [...defaultTestimonials] } },
      { variantId: 'testimonials-grid', variantName: '2x2 Grid', defaultContent: { title: 'What our customers say', testimonials: [...defaultTestimonials, { quote: 'Incredible tool that saves us hours every week. Cannot imagine working without it.', author: 'Alex Turner', role: 'PM at ScaleUp' }] } },
      { variantId: 'testimonials-carousel', variantName: 'Carousel', defaultContent: { title: 'What our customers say', testimonials: [...defaultTestimonials] } },
    ],
  },

  // ── FAQ ──
  {
    category: 'faq',
    categoryLabel: 'FAQ',
    icon: 'HelpCircle',
    contentSchema: [
      { key: 'title', label: 'Section Title', type: 'text' },
      { key: 'subtitle', label: 'Section Subtitle', type: 'textarea' },
      { key: 'questions', label: 'Questions', type: 'items', itemFields: [
        { key: 'question', label: 'Question', type: 'text' },
        { key: 'answer', label: 'Answer', type: 'textarea' },
      ]},
    ],
    variants: [
      { variantId: 'faq-accordion', variantName: 'Accordion', defaultContent: { title: 'Frequently asked questions', subtitle: 'Find answers to common questions about our product.', questions: [...defaultFaqQuestions] } },
      { variantId: 'faq-two-column', variantName: '2-Column', defaultContent: { title: 'Frequently asked questions', subtitle: 'Find answers to common questions.', questions: [...defaultFaqQuestions] } },
      { variantId: 'faq-centered', variantName: 'Centered Cards', defaultContent: { title: 'Frequently asked questions', subtitle: 'Find answers to common questions.', questions: [...defaultFaqQuestions] } },
      { variantId: 'faq-side-title', variantName: 'Side Title', defaultContent: { title: 'Frequently asked questions', subtitle: 'Find answers to common questions about our product.', questions: [...defaultFaqQuestions] } },
    ],
  },

  // ── CTA ──
  {
    category: 'cta',
    categoryLabel: 'CTA',
    icon: 'MousePointerClick',
    contentSchema: [
      { key: 'title', label: 'Headline', type: 'text' },
      { key: 'subtitle', label: 'Subtitle', type: 'textarea' },
      { key: 'showPrimaryButton', label: 'Show Primary Button', type: 'boolean' },
      { key: 'ctaText', label: 'Button Text', type: 'text' },
      { key: 'showSecondaryButton', label: 'Show Secondary Button', type: 'boolean' },
      { key: 'ctaSecondaryText', label: 'Secondary Button Text', type: 'text' },
    ],
    variants: [
      { variantId: 'cta-centered', variantName: 'Centered Dark', defaultContent: { title: 'Ready to get started?', subtitle: 'Join thousands of satisfied customers today.', ctaText: 'Start Free Trial', ctaSecondaryText: 'Contact Sales', showPrimaryButton: true, showSecondaryButton: true } },
      { variantId: 'cta-banner', variantName: 'Banner', defaultContent: { title: 'Ready to get started?', subtitle: 'Join thousands of satisfied customers today.', ctaText: 'Start Free Trial', ctaSecondaryText: '', showPrimaryButton: true, showSecondaryButton: false } },
      { variantId: 'cta-with-image', variantName: 'With Image', defaultContent: { title: 'Ready to get started?', subtitle: 'Join thousands of satisfied customers today.', ctaText: 'Start Free Trial', ctaSecondaryText: 'Learn More', showPrimaryButton: true, showSecondaryButton: true } },
      { variantId: 'cta-simple', variantName: 'Simple', defaultContent: { title: 'Ready to get started?', subtitle: 'Join thousands of satisfied customers today.', ctaText: 'Start Free Trial', ctaSecondaryText: '', showPrimaryButton: true, showSecondaryButton: false } },
      { variantId: 'cta-newsletter', variantName: 'Newsletter', defaultContent: { title: 'Stay in the loop', subtitle: 'Get the latest updates delivered to your inbox.', ctaText: 'Subscribe', ctaSecondaryText: '', showPrimaryButton: true, showSecondaryButton: false } },
    ],
  },

  // ── Blog ──
  {
    category: 'blog',
    categoryLabel: 'Blog',
    icon: 'FileText',
    contentSchema: [
      { key: 'title', label: 'Section Title', type: 'text' },
      { key: 'subtitle', label: 'Section Subtitle', type: 'textarea' },
      { key: 'posts', label: 'Posts', type: 'items', itemFields: [
        { key: 'title', label: 'Post Title', type: 'text' },
        { key: 'excerpt', label: 'Excerpt', type: 'textarea' },
        { key: 'author', label: 'Author', type: 'text' },
        { key: 'date', label: 'Date', type: 'text' },
      ]},
    ],
    variants: [
      { variantId: 'blog-grid', variantName: '3-Column Grid', defaultContent: { title: 'Latest from the blog', subtitle: 'Insights, tips, and news from our team.', posts: [...defaultBlogPosts] } },
      { variantId: 'blog-list', variantName: 'List', defaultContent: { title: 'Latest from the blog', subtitle: 'Insights, tips, and news from our team.', posts: [...defaultBlogPosts] } },
      { variantId: 'blog-featured', variantName: 'Featured', defaultContent: { title: 'Latest from the blog', subtitle: 'Insights, tips, and news from our team.', posts: [...defaultBlogPosts] } },
      { variantId: 'blog-minimal', variantName: 'Minimal', defaultContent: { title: 'Latest from the blog', subtitle: '', posts: [...defaultBlogPosts] } },
      { variantId: 'blog-with-categories', variantName: 'With Categories', defaultContent: { title: 'Latest from the blog', subtitle: 'Insights, tips, and news from our team.', posts: [...defaultBlogPosts] } },
    ],
  },

  // ── About ──
  {
    category: 'about',
    categoryLabel: 'About',
    icon: 'Users',
    contentSchema: [
      { key: 'title', label: 'Section Title', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'mission', label: 'Mission Statement', type: 'textarea' },
    ],
    variants: [
      { variantId: 'about-split', variantName: 'Split with Image', defaultContent: { title: 'About our company', description: 'We are a team of passionate individuals dedicated to building the best products for our customers. Founded in 2020, we have grown to serve thousands of users worldwide.', mission: 'Our mission is to make technology accessible to everyone.' } },
      { variantId: 'about-centered', variantName: 'Centered', defaultContent: { title: 'About our company', description: 'We are a team of passionate individuals dedicated to building the best products for our customers. Founded in 2020, we have grown to serve thousands of users worldwide.', mission: 'Our mission is to make technology accessible to everyone.' } },
      { variantId: 'about-with-stats', variantName: 'With Stats', defaultContent: { title: 'About our company', description: 'We are a team of passionate individuals dedicated to building the best products for our customers.', mission: 'Our mission is to make technology accessible to everyone.' } },
      { variantId: 'about-timeline', variantName: 'Timeline', defaultContent: { title: 'Our journey', description: 'From a small startup to a global platform, here is how we got here.', mission: 'Founded in 2020. Launched V1 in 2021. Reached 10K users in 2022. Series A in 2023.' } },
    ],
  },

  // ── Team ──
  {
    category: 'team',
    categoryLabel: 'Team',
    icon: 'Users2',
    contentSchema: [
      { key: 'title', label: 'Section Title', type: 'text' },
      { key: 'subtitle', label: 'Section Subtitle', type: 'textarea' },
      { key: 'members', label: 'Team Members', type: 'items', itemFields: [
        { key: 'name', label: 'Name', type: 'text' },
        { key: 'role', label: 'Role', type: 'text' },
      ]},
    ],
    variants: [
      { variantId: 'team-grid', variantName: 'Grid', defaultContent: { title: 'Meet our team', subtitle: 'The people behind the product.', members: [...defaultTeamMembers] } },
      { variantId: 'team-list', variantName: 'List', defaultContent: { title: 'Meet our team', subtitle: 'The people behind the product.', members: defaultTeamMembers.slice(0, 3) } },
      { variantId: 'team-cards', variantName: 'Cards', defaultContent: { title: 'Meet our team', subtitle: 'The people behind the product.', members: [...defaultTeamMembers] } },
      { variantId: 'team-compact', variantName: 'Compact', defaultContent: { title: 'Meet our team', subtitle: 'The people behind the product.', members: [...defaultTeamMembers, { name: 'Emily Davis', role: 'Marketing' }, { name: 'David Wilson', role: 'Sales' }] } },
      { variantId: 'team-with-bio', variantName: 'With Bio', defaultContent: { title: 'Meet our team', subtitle: 'The people behind the product.', members: [...defaultTeamMembers] } },
    ],
  },

  // ── Gallery ──
  {
    category: 'gallery',
    categoryLabel: 'Gallery',
    icon: 'Image',
    contentSchema: [
      { key: 'title', label: 'Section Title', type: 'text' },
      { key: 'subtitle', label: 'Section Subtitle', type: 'textarea' },
      { key: 'images', label: 'Images', type: 'items', itemFields: [
        { key: 'caption', label: 'Caption', type: 'text' },
      ]},
    ],
    variants: [
      { variantId: 'gallery-grid', variantName: '3-Column Grid', defaultContent: { title: 'Our work', subtitle: 'A showcase of what we have built.', images: [{ caption: 'Project Alpha' }, { caption: 'Project Beta' }, { caption: 'Project Gamma' }, { caption: 'Project Delta' }, { caption: 'Project Epsilon' }, { caption: 'Project Zeta' }] } },
      { variantId: 'gallery-masonry', variantName: 'Masonry', defaultContent: { title: 'Our work', subtitle: 'A showcase of what we have built.', images: [{ caption: 'Project Alpha' }, { caption: 'Project Beta' }, { caption: 'Project Gamma' }, { caption: 'Project Delta' }, { caption: 'Project Epsilon' }] } },
      { variantId: 'gallery-carousel', variantName: 'Carousel', defaultContent: { title: 'Our work', subtitle: '', images: [{ caption: 'Project Alpha' }, { caption: 'Project Beta' }, { caption: 'Project Gamma' }] } },
      { variantId: 'gallery-lightbox', variantName: 'Lightbox', defaultContent: { title: 'Our work', subtitle: 'A showcase of what we have built.', images: [{ caption: 'Project Alpha' }, { caption: 'Project Beta' }, { caption: 'Project Gamma' }, { caption: 'Project Delta' }, { caption: 'Project Epsilon' }, { caption: 'Project Zeta' }] } },
    ],
  },

  // ── Banner ──
  {
    category: 'banner',
    categoryLabel: 'Banner',
    icon: 'Flag',
    contentSchema: [
      { key: 'text', label: 'Banner Text', type: 'text' },
      { key: 'ctaText', label: 'Button Text', type: 'text' },
      { key: 'dismissible', label: 'Show Dismiss', type: 'boolean' },
    ],
    variants: [
      { variantId: 'banner-top', variantName: 'Top Bar', defaultContent: { text: 'We just launched v2.0! Check out the new features.', ctaText: 'Learn More', dismissible: true } },
      { variantId: 'banner-floating', variantName: 'Floating', defaultContent: { text: 'Limited time offer: 50% off all plans', ctaText: 'Claim Offer', dismissible: true } },
      { variantId: 'banner-minimal', variantName: 'Minimal', defaultContent: { text: 'New: AI-powered features are here', ctaText: '', dismissible: false } },
      { variantId: 'banner-cookie', variantName: 'Cookie Consent', defaultContent: { text: 'We use cookies to improve your experience. By continuing, you agree to our cookie policy.', ctaText: 'Accept', dismissible: true } },
    ],
  },

  // ── Contact ──
  {
    category: 'contact',
    categoryLabel: 'Contact',
    icon: 'Mail',
    contentSchema: [
      { key: 'title', label: 'Section Title', type: 'text' },
      { key: 'subtitle', label: 'Section Subtitle', type: 'textarea' },
      { key: 'email', label: 'Email', type: 'text' },
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'address', label: 'Address', type: 'text' },
    ],
    variants: [
      { variantId: 'contact-split', variantName: 'Split with Form', defaultContent: { title: 'Get in touch', subtitle: 'We would love to hear from you. Send us a message and we will respond as soon as possible.', email: 'hello@example.com', phone: '+1 (555) 123-4567', address: '123 Main St, City, State 12345' } },
      { variantId: 'contact-centered', variantName: 'Centered', defaultContent: { title: 'Get in touch', subtitle: 'We would love to hear from you.', email: 'hello@example.com', phone: '+1 (555) 123-4567', address: '123 Main St, City, State 12345' } },
      { variantId: 'contact-minimal', variantName: 'Minimal', defaultContent: { title: 'Get in touch', subtitle: '', email: 'hello@example.com', phone: '+1 (555) 123-4567', address: '123 Main St, City, State 12345' } },
      { variantId: 'contact-cards', variantName: 'Cards', defaultContent: { title: 'Get in touch', subtitle: 'Reach out through any of these channels.', email: 'hello@example.com', phone: '+1 (555) 123-4567', address: '123 Main St, City, State 12345' } },
      { variantId: 'contact-with-map', variantName: 'With Map', defaultContent: { title: 'Get in touch', subtitle: 'We would love to hear from you.', email: 'hello@example.com', phone: '+1 (555) 123-4567', address: '123 Main St, City, State 12345' } },
    ],
  },

  // ── Footer ──
  {
    category: 'footer',
    categoryLabel: 'Footer',
    icon: 'PanelBottom',
    contentSchema: [
      { key: 'logo', label: 'Logo Text', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'copyright', label: 'Copyright Text', type: 'text' },
      { key: 'columns', label: 'Link Columns', type: 'items', itemFields: [
        { key: 'title', label: 'Column Title', type: 'text' },
        { key: 'links', label: 'Links (comma-separated)', type: 'textarea' },
      ]},
    ],
    variants: [
      { variantId: 'footer-4col', variantName: '4-Column', defaultContent: { logo: 'Wireframe', description: 'Building the future of web design.', copyright: '2024 Wireframe. All rights reserved.', columns: [...defaultFooterColumns] } },
      { variantId: 'footer-simple', variantName: 'Simple', defaultContent: { logo: 'Wireframe', description: 'Building the future of web design.', copyright: '2024 Wireframe. All rights reserved.', columns: [{ title: 'Links', links: 'Features, Pricing, About, Contact' }] } },
      { variantId: 'footer-centered', variantName: 'Centered', defaultContent: { logo: 'Wireframe', description: 'Building the future of web design.', copyright: '2024 Wireframe. All rights reserved.', columns: [{ title: 'Links', links: 'Features, Pricing, About, Contact, Blog' }] } },
      { variantId: 'footer-minimal', variantName: 'Minimal', defaultContent: { logo: 'Wireframe', description: '', copyright: '2024 Wireframe. All rights reserved.', columns: [] } },
      { variantId: 'footer-with-newsletter', variantName: 'With Newsletter', defaultContent: { logo: 'Wireframe', description: 'Building the future of web design.', copyright: '2024 Wireframe. All rights reserved.', columns: [...defaultFooterColumns] } },
    ],
  },
];

export function getDefinition(category: string): SectionDefinition | undefined {
  return sectionRegistry.find(d => d.category === category);
}

export function getVariant(category: string, variantId: string) {
  const def = getDefinition(category);
  return def?.variants.find(v => v.variantId === variantId);
}
