# Structr Figma Plugin

Import wireframes from Structr into Figma as proper frames with auto-layout, text styles, and grayscale wireframe aesthetics.

## Installation (Development)

1. Open Figma Desktop
2. Go to **Plugins > Development > Import plugin from manifest**
3. Select `figma-plugin/manifest.json` from this repo

## Usage

1. In Structr, click **Export > Export to Figma** (copies JSON to clipboard)
2. In Figma, run the Structr plugin (Plugins > Development > Structr)
3. Paste the JSON and click **Import to Figma**

The plugin will create:
- One Figma page per project page
- A vertical frame (1440px wide) per page with all sections stacked
- Each section uses auto-layout with proper spacing, typography, and grayscale colors
- Text nodes are named to match content fields for easy editing
- Dark/light color mode is respected per section

## Supported Section Types

All 16 categories: Header, Hero, Logo Cloud, Features, Stats, Pricing, Testimonials, FAQ, CTA, Blog, About, Team, Gallery, Banner, Contact, Footer.
