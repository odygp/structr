import MarketingNav from '@/components/marketing/MarketingNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacy Policy' };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <MarketingNav />

      <div className="max-w-[700px] mx-auto px-8 pt-16 pb-20">
        <h1 className="text-[36px] font-bold text-[#1a1a1a] mb-2">Privacy Policy</h1>
        <p className="text-[14px] text-[#808080] mb-10">Last updated: March 29, 2026</p>

        <div className="prose prose-sm max-w-none text-[#444] leading-relaxed [&_h2]:text-[18px] [&_h2]:font-semibold [&_h2]:text-[#1a1a1a] [&_h2]:mt-8 [&_h2]:mb-3 [&_p]:mb-4 [&_ul]:mb-4 [&_li]:mb-1">
          <p>Structr (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share information when you use our wireframe builder service at structr.holy.black (the &ldquo;Service&rdquo;).</p>

          <h2>Information We Collect</h2>
          <p><strong>Account information:</strong> When you create an account, we collect your email address, display name, and password (hashed). We use Supabase for authentication and data storage.</p>
          <p><strong>Project data:</strong> We store your wireframe projects, pages, sections, comments, and settings in our database. This includes any text content you create or that AI generates for you.</p>
          <p><strong>Usage data:</strong> We track AI feature usage including which endpoints are called, token counts, and associated costs. This helps us monitor service quality and manage the star credit system.</p>
          <p><strong>Technical data:</strong> We automatically collect standard web analytics data including IP address, browser type, and page views through our hosting provider (Vercel).</p>

          <h2>How We Use Your Information</h2>
          <ul>
            <li>To provide and maintain the Service</li>
            <li>To manage your account and star credit balance</li>
            <li>To process AI requests through Anthropic&apos;s Claude API</li>
            <li>To enable collaboration features (sharing, comments, activity feeds)</li>
            <li>To improve the Service and fix bugs</li>
            <li>To communicate important updates about the Service</li>
          </ul>

          <h2>AI Processing</h2>
          <p>When you use AI features (generation, import, editing), your prompts and project content are sent to Anthropic&apos;s Claude API for processing. Anthropic&apos;s data retention and privacy policies apply to this processing. We do not use your content to train AI models.</p>

          <h2>Data Storage</h2>
          <p>Your data is stored in Supabase (PostgreSQL) with row-level security policies ensuring you can only access your own data. Projects shared with you are accessible based on the permissions set by the project owner.</p>

          <h2>Published Projects</h2>
          <p>When you publish a project, its content becomes publicly accessible at a URL you choose. Anyone with the link can view the published version. Unpublishing removes public access but retains the data in your account.</p>

          <h2>Data Sharing</h2>
          <p>We do not sell your personal data. We share data only with:</p>
          <ul>
            <li><strong>Supabase:</strong> Database and authentication provider</li>
            <li><strong>Anthropic:</strong> AI processing for generation and editing features</li>
            <li><strong>Vercel:</strong> Hosting and deployment</li>
          </ul>

          <h2>Data Retention</h2>
          <p>We retain your data for as long as your account is active. You can delete individual projects at any time. If you wish to delete your account and all associated data, please contact us.</p>

          <h2>Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal data. You can export your projects as JSON at any time through the builder&apos;s export feature.</p>

          <h2>Cookies</h2>
          <p>We use essential cookies for authentication (Supabase session tokens) and theme preferences. We do not use tracking or advertising cookies.</p>

          <h2>Changes</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a notice on the Service.</p>

          <h2>Contact</h2>
          <p>For questions about this Privacy Policy, please contact us at privacy@holy.gd.</p>
        </div>
      </div>

      <MarketingFooter />
    </div>
  );
}
