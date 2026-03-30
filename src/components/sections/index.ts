import { ComponentType } from 'react';
import { ColorMode } from '@/lib/types';

// About
import AboutCentered from './about/AboutCentered';
import AboutSplit from './about/AboutSplit';
import AboutTimeline from './about/AboutTimeline';
import AboutWithStats from './about/AboutWithStats';

// Banner
import BannerCookie from './banner/BannerCookie';
import BannerFloating from './banner/BannerFloating';
import BannerMinimal from './banner/BannerMinimal';
import BannerTop from './banner/BannerTop';

// Blog
import BlogFeatured from './blog/BlogFeatured';
import BlogGrid from './blog/BlogGrid';
import BlogList from './blog/BlogList';
import BlogMinimal from './blog/BlogMinimal';
import BlogWithCategories from './blog/BlogWithCategories';

// Comparison
import ComparisonSideBySide from './comparison/ComparisonSideBySide';
import ComparisonTable from './comparison/ComparisonTable';

// Contact
import ContactCards from './contact/ContactCards';
import ContactCentered from './contact/ContactCentered';
import ContactMinimal from './contact/ContactMinimal';
import ContactSplit from './contact/ContactSplit';
import ContactWithMap from './contact/ContactWithMap';

// Cta
import CtaBanner from './cta/CtaBanner';
import CtaCentered from './cta/CtaCentered';
import CtaNewsletter from './cta/CtaNewsletter';
import CtaSimple from './cta/CtaSimple';
import CtaWithImage from './cta/CtaWithImage';

// Downloads
import DownloadCards from './downloads/DownloadCards';
import DownloadSimple from './downloads/DownloadSimple';

// Error
import Error404 from './error/Error404';
import ErrorSimple from './error/ErrorSimple';

// Faq
import FaqAccordion from './faq/FaqAccordion';
import FaqCentered from './faq/FaqCentered';
import FaqSideTitle from './faq/FaqSideTitle';
import FaqTwoColumn from './faq/FaqTwoColumn';

// Features
import Features2Column from './features/Features2Column';
import FeaturesAccordion from './features/FeaturesAccordion';
import FeaturesAlternating from './features/FeaturesAlternating';
import FeaturesBento from './features/FeaturesBento';
import FeaturesGrid from './features/FeaturesGrid';
import FeaturesIconList from './features/FeaturesIconList';
import FeaturesWithImage from './features/FeaturesWithImage';

// Footer
import Footer4Col from './footer/Footer4Col';
import FooterCentered from './footer/FooterCentered';
import FooterMinimal from './footer/FooterMinimal';
import FooterSimple from './footer/FooterSimple';
import FooterWithNewsletter from './footer/FooterWithNewsletter';

// Gallery
import GalleryCarousel from './gallery/GalleryCarousel';
import GalleryGrid from './gallery/GalleryGrid';
import GalleryLightbox from './gallery/GalleryLightbox';
import GalleryMasonry from './gallery/GalleryMasonry';

// Header
import HeaderCentered from './header/HeaderCentered';
import HeaderMega from './header/HeaderMega';
import HeaderSimple from './header/HeaderSimple';
import HeaderWithCTA from './header/HeaderWithCTA';

// Hero
import HeroCentered from './hero/HeroCentered';
import HeroMinimal from './hero/HeroMinimal';
import HeroSplit from './hero/HeroSplit';
import HeroWithForm from './hero/HeroWithForm';
import HeroWithImage from './hero/HeroWithImage';

// Logos
import LogoGrid from './logos/LogoGrid';
import LogoSimple from './logos/LogoSimple';
import LogoWithTitle from './logos/LogoWithTitle';

// Pricing
import Pricing2Col from './pricing/Pricing2Col';
import Pricing3Col from './pricing/Pricing3Col';
import PricingComparison from './pricing/PricingComparison';
import PricingSimple from './pricing/PricingSimple';
import PricingToggle from './pricing/PricingToggle';

// Process
import ProcessSteps from './process/ProcessSteps';
import ProcessTimeline from './process/ProcessTimeline';

// Showcase
import ShowcaseCards from './showcase/ShowcaseCards';
import ShowcaseWithLinks from './showcase/ShowcaseWithLinks';

// Stats
import StatsCards from './stats/StatsCards';
import StatsRow from './stats/StatsRow';
import StatsWithDescription from './stats/StatsWithDescription';

// Store
import StoreGrid from './store/StoreGrid';
import StoreList from './store/StoreList';
import StoreSideFilters from './store/StoreSideFilters';
import StoreWithFilters from './store/StoreWithFilters';

// Team
import TeamCards from './team/TeamCards';
import TeamCompact from './team/TeamCompact';
import TeamGrid from './team/TeamGrid';
import TeamList from './team/TeamList';
import TeamWithBio from './team/TeamWithBio';

// Testimonials
import TestimonialsCards from './testimonials/TestimonialsCards';
import TestimonialsCarousel from './testimonials/TestimonialsCarousel';
import TestimonialsGrid from './testimonials/TestimonialsGrid';
import TestimonialsMinimal from './testimonials/TestimonialsMinimal';
import TestimonialsSingle from './testimonials/TestimonialsSingle';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SectionComponentProps = { content: any; colorMode?: ColorMode; sectionId?: string };

export const componentRegistry: Record<string, ComponentType<SectionComponentProps>> = {
  // About
  'about-centered': AboutCentered,
  'about-split': AboutSplit,
  'about-timeline': AboutTimeline,
  'about-with-stats': AboutWithStats,

  // Banner
  'banner-cookie': BannerCookie,
  'banner-floating': BannerFloating,
  'banner-minimal': BannerMinimal,
  'banner-top': BannerTop,

  // Blog
  'blog-featured': BlogFeatured,
  'blog-grid': BlogGrid,
  'blog-list': BlogList,
  'blog-minimal': BlogMinimal,
  'blog-with-categories': BlogWithCategories,

  // Comparison
  'comparison-side-by-side': ComparisonSideBySide,
  'comparison-table': ComparisonTable,

  // Contact
  'contact-cards': ContactCards,
  'contact-centered': ContactCentered,
  'contact-minimal': ContactMinimal,
  'contact-split': ContactSplit,
  'contact-with-map': ContactWithMap,

  // Cta
  'cta-banner': CtaBanner,
  'cta-centered': CtaCentered,
  'cta-newsletter': CtaNewsletter,
  'cta-simple': CtaSimple,
  'cta-with-image': CtaWithImage,

  // Downloads
  'downloads-cards': DownloadCards,
  'downloads-simple': DownloadSimple,

  // Error
  'error-404': Error404,
  'error-simple': ErrorSimple,

  // Faq
  'faq-accordion': FaqAccordion,
  'faq-centered': FaqCentered,
  'faq-side-title': FaqSideTitle,
  'faq-two-column': FaqTwoColumn,

  // Features
  'features-2column': Features2Column,
  'features-accordion': FeaturesAccordion,
  'features-alternating': FeaturesAlternating,
  'features-bento': FeaturesBento,
  'features-grid': FeaturesGrid,
  'features-icon-list': FeaturesIconList,
  'features-with-image': FeaturesWithImage,

  // Footer
  'footer-4col': Footer4Col,
  'footer-centered': FooterCentered,
  'footer-minimal': FooterMinimal,
  'footer-simple': FooterSimple,
  'footer-with-newsletter': FooterWithNewsletter,

  // Gallery
  'gallery-carousel': GalleryCarousel,
  'gallery-grid': GalleryGrid,
  'gallery-lightbox': GalleryLightbox,
  'gallery-masonry': GalleryMasonry,

  // Header
  'header-centered': HeaderCentered,
  'header-mega': HeaderMega,
  'header-simple': HeaderSimple,
  'header-with-cta': HeaderWithCTA,

  // Hero
  'hero-centered': HeroCentered,
  'hero-minimal': HeroMinimal,
  'hero-split': HeroSplit,
  'hero-with-form': HeroWithForm,
  'hero-with-image': HeroWithImage,

  // Logos
  'logos-grid': LogoGrid,
  'logos-simple': LogoSimple,
  'logos-with-title': LogoWithTitle,

  // Pricing
  'pricing-2col': Pricing2Col,
  'pricing-3col': Pricing3Col,
  'pricing-comparison': PricingComparison,
  'pricing-simple': PricingSimple,
  'pricing-toggle': PricingToggle,

  // Process
  'process-steps': ProcessSteps,
  'process-timeline': ProcessTimeline,

  // Showcase
  'showcase-cards': ShowcaseCards,
  'showcase-with-links': ShowcaseWithLinks,

  // Stats
  'stats-cards': StatsCards,
  'stats-row': StatsRow,
  'stats-with-description': StatsWithDescription,

  // Store
  'store-grid': StoreGrid,
  'store-list': StoreList,
  'store-side-filters': StoreSideFilters,
  'store-with-filters': StoreWithFilters,

  // Team
  'team-cards': TeamCards,
  'team-compact': TeamCompact,
  'team-grid': TeamGrid,
  'team-list': TeamList,
  'team-with-bio': TeamWithBio,

  // Testimonials
  'testimonials-cards': TestimonialsCards,
  'testimonials-carousel': TestimonialsCarousel,
  'testimonials-grid': TestimonialsGrid,
  'testimonials-minimal': TestimonialsMinimal,
  'testimonials-single': TestimonialsSingle,
};
