import { ComponentType } from 'react';
import { SectionContent, ColorMode } from '@/lib/types';

// Header
import HeaderSimple from './header/HeaderSimple';
import HeaderCentered from './header/HeaderCentered';
import HeaderWithCTA from './header/HeaderWithCTA';
import HeaderMega from './header/HeaderMega';

// Hero
import HeroCentered from './hero/HeroCentered';
import HeroSplit from './hero/HeroSplit';
import HeroWithImage from './hero/HeroWithImage';
import HeroMinimal from './hero/HeroMinimal';
import HeroWithForm from './hero/HeroWithForm';

// Logo Cloud
import LogoSimple from './logos/LogoSimple';
import LogoWithTitle from './logos/LogoWithTitle';
import LogoGrid from './logos/LogoGrid';

// Features
import FeaturesGrid from './features/FeaturesGrid';
import FeaturesAlternating from './features/FeaturesAlternating';
import Features2Column from './features/Features2Column';
import FeaturesWithImage from './features/FeaturesWithImage';
import FeaturesBento from './features/FeaturesBento';
import FeaturesIconList from './features/FeaturesIconList';

// Stats
import StatsRow from './stats/StatsRow';
import StatsWithDescription from './stats/StatsWithDescription';
import StatsCards from './stats/StatsCards';

// Pricing
import Pricing3Col from './pricing/Pricing3Col';
import Pricing2Col from './pricing/Pricing2Col';
import PricingSimple from './pricing/PricingSimple';
import PricingToggle from './pricing/PricingToggle';
import PricingComparison from './pricing/PricingComparison';

// Testimonials
import TestimonialsCards from './testimonials/TestimonialsCards';
import TestimonialsSingle from './testimonials/TestimonialsSingle';
import TestimonialsMinimal from './testimonials/TestimonialsMinimal';
import TestimonialsGrid from './testimonials/TestimonialsGrid';
import TestimonialsCarousel from './testimonials/TestimonialsCarousel';

// FAQ
import FaqAccordion from './faq/FaqAccordion';
import FaqTwoColumn from './faq/FaqTwoColumn';
import FaqCentered from './faq/FaqCentered';
import FaqSideTitle from './faq/FaqSideTitle';

// CTA
import CtaCentered from './cta/CtaCentered';
import CtaBanner from './cta/CtaBanner';
import CtaWithImage from './cta/CtaWithImage';
import CtaSimple from './cta/CtaSimple';
import CtaNewsletter from './cta/CtaNewsletter';

// Blog
import BlogGrid from './blog/BlogGrid';
import BlogList from './blog/BlogList';
import BlogFeatured from './blog/BlogFeatured';
import BlogMinimal from './blog/BlogMinimal';
import BlogWithCategories from './blog/BlogWithCategories';

// About
import AboutSplit from './about/AboutSplit';
import AboutCentered from './about/AboutCentered';
import AboutWithStats from './about/AboutWithStats';
import AboutTimeline from './about/AboutTimeline';

// Team
import TeamGrid from './team/TeamGrid';
import TeamList from './team/TeamList';
import TeamCards from './team/TeamCards';
import TeamCompact from './team/TeamCompact';
import TeamWithBio from './team/TeamWithBio';

// Gallery
import GalleryGrid from './gallery/GalleryGrid';
import GalleryMasonry from './gallery/GalleryMasonry';
import GalleryCarousel from './gallery/GalleryCarousel';
import GalleryLightbox from './gallery/GalleryLightbox';

// Contact
import ContactSplit from './contact/ContactSplit';
import ContactCentered from './contact/ContactCentered';
import ContactMinimal from './contact/ContactMinimal';
import ContactCards from './contact/ContactCards';
import ContactWithMap from './contact/ContactWithMap';

// Banner
import BannerTop from './banner/BannerTop';
import BannerFloating from './banner/BannerFloating';
import BannerMinimal from './banner/BannerMinimal';
import BannerCookie from './banner/BannerCookie';

// Footer
import Footer4Col from './footer/Footer4Col';
import FooterSimple from './footer/FooterSimple';
import FooterCentered from './footer/FooterCentered';
import FooterMinimal from './footer/FooterMinimal';
import FooterWithNewsletter from './footer/FooterWithNewsletter';

// Showcase
import ShowcaseCards from './showcase/ShowcaseCards';
import ShowcaseWithLinks from './showcase/ShowcaseWithLinks';

// Features (additional)
import FeaturesAccordion from './features/FeaturesAccordion';

// Error
import Error404 from './error/Error404';
import ErrorSimple from './error/ErrorSimple';

// Process
import ProcessSteps from './process/ProcessSteps';
import ProcessTimeline from './process/ProcessTimeline';

// Downloads
import DownloadCards from './downloads/DownloadCards';
import DownloadSimple from './downloads/DownloadSimple';

// Comparison
import ComparisonTable from './comparison/ComparisonTable';
import ComparisonSideBySide from './comparison/ComparisonSideBySide';

// Store
import StoreGrid from './store/StoreGrid';
import StoreList from './store/StoreList';
import StoreWithFilters from './store/StoreWithFilters';
import StoreSideFilters from './store/StoreSideFilters';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SectionComponentProps = { content: any; colorMode?: ColorMode; sectionId?: string };

export const componentRegistry: Record<string, ComponentType<SectionComponentProps>> = {
  // Header
  'header-simple': HeaderSimple,
  'header-centered': HeaderCentered,
  'header-with-cta': HeaderWithCTA,
  'header-mega': HeaderMega,

  // Hero
  'hero-centered': HeroCentered,
  'hero-split': HeroSplit,
  'hero-with-image': HeroWithImage,
  'hero-minimal': HeroMinimal,
  'hero-with-form': HeroWithForm,

  // Logo Cloud
  'logos-simple': LogoSimple,
  'logos-with-title': LogoWithTitle,
  'logos-grid': LogoGrid,

  // Features
  'features-grid': FeaturesGrid,
  'features-alternating': FeaturesAlternating,
  'features-2column': Features2Column,
  'features-with-image': FeaturesWithImage,
  'features-bento': FeaturesBento,
  'features-icon-list': FeaturesIconList,

  // Stats
  'stats-row': StatsRow,
  'stats-with-description': StatsWithDescription,
  'stats-cards': StatsCards,

  // Pricing
  'pricing-3col': Pricing3Col,
  'pricing-2col': Pricing2Col,
  'pricing-simple': PricingSimple,
  'pricing-toggle': PricingToggle,
  'pricing-comparison': PricingComparison,

  // Testimonials
  'testimonials-cards': TestimonialsCards,
  'testimonials-single': TestimonialsSingle,
  'testimonials-minimal': TestimonialsMinimal,
  'testimonials-grid': TestimonialsGrid,
  'testimonials-carousel': TestimonialsCarousel,

  // FAQ
  'faq-accordion': FaqAccordion,
  'faq-two-column': FaqTwoColumn,
  'faq-centered': FaqCentered,
  'faq-side-title': FaqSideTitle,

  // CTA
  'cta-centered': CtaCentered,
  'cta-banner': CtaBanner,
  'cta-with-image': CtaWithImage,
  'cta-simple': CtaSimple,
  'cta-newsletter': CtaNewsletter,

  // Blog
  'blog-grid': BlogGrid,
  'blog-list': BlogList,
  'blog-featured': BlogFeatured,
  'blog-minimal': BlogMinimal,
  'blog-with-categories': BlogWithCategories,

  // About
  'about-split': AboutSplit,
  'about-centered': AboutCentered,
  'about-with-stats': AboutWithStats,
  'about-timeline': AboutTimeline,

  // Team
  'team-grid': TeamGrid,
  'team-list': TeamList,
  'team-cards': TeamCards,
  'team-compact': TeamCompact,
  'team-with-bio': TeamWithBio,

  // Gallery
  'gallery-grid': GalleryGrid,
  'gallery-masonry': GalleryMasonry,
  'gallery-carousel': GalleryCarousel,
  'gallery-lightbox': GalleryLightbox,

  // Contact
  'contact-split': ContactSplit,
  'contact-centered': ContactCentered,
  'contact-minimal': ContactMinimal,
  'contact-cards': ContactCards,
  'contact-with-map': ContactWithMap,

  // Banner
  'banner-top': BannerTop,
  'banner-floating': BannerFloating,
  'banner-minimal': BannerMinimal,
  'banner-cookie': BannerCookie,

  // Footer
  'footer-4col': Footer4Col,
  'footer-simple': FooterSimple,
  'footer-centered': FooterCentered,
  'footer-minimal': FooterMinimal,
  'footer-with-newsletter': FooterWithNewsletter,

  // Showcase
  'showcase-cards': ShowcaseCards,
  'showcase-with-links': ShowcaseWithLinks,

  // Features (additional)
  'features-accordion': FeaturesAccordion,

  // Error
  'error-404': Error404,
  'error-simple': ErrorSimple,

  // Process
  'process-steps': ProcessSteps,
  'process-timeline': ProcessTimeline,

  // Downloads
  'downloads-cards': DownloadCards,
  'downloads-simple': DownloadSimple,

  // Comparison
  'comparison-table': ComparisonTable,
  'comparison-side-by-side': ComparisonSideBySide,

  // Store
  'store-grid': StoreGrid,
  'store-list': StoreList,
  'store-with-filters': StoreWithFilters,
  'store-side-filters': StoreSideFilters,
};
