/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// See https://docusaurus.io/docs/site-config for all the possible
// site configuration options.

// List of projects/orgs using your project for the users page.
const users = [
  {
    caption: 'HPCC-Systems',
    // You will need to prepend the image path with your baseUrl
    // if it is not '/', like: '/test-site/img/image.jpg'.
    image: 'img/hpcc-systems.svg',
    infoLink: 'https://hpccsystems.com',
    pinned: true,
  },
  {
    caption: 'LexisNexis RISK',
    // You will need to prepend the image path with your baseUrl
    // if it is not '/', like: '/test-site/img/image.jpg'.
    image: 'https://risk.lexisnexis.com/-/media/images/lnrs/logos/logo_lexis.png?h=45&la=en-US&w=194&hash=79CBF7F0ABB92D80618AF0BEE94F0358247DF5F9',
    infoLink: 'https://risk.lexisnexis.com/',
    pinned: true,
  },
  {
    caption: 'RELX',
    // You will need to prepend the image path with your baseUrl
    // if it is not '/', like: '/test-site/img/image.jpg'.
    image: 'https://www.relx.com/~/media/Images/R/RELX-Group/logo/logo-v2.png?h=49&la=en&w=191',
    infoLink: 'https://www.relx.com/',
    pinned: true,
  },
];

const siteConfig = {
  title: '@hpcc-js', // Title for your website.
  tagline: 'HPCC-Systems JavaScript Packages',
  url: 'https://GordonSmith.github.io', // Your website URL
  baseUrl: '/Visualization/', // Base URL for your project */
  // For github.io type URLs, you would set the url and baseUrl like:
  //   url: 'https://facebook.github.io',
  //   baseUrl: '/test-site/',

  // Used for publishing and more
  projectName: 'Visualization',
  organizationName: 'GordonSmith',
  // For top-level user or org sites, the organization is still the same.
  // e.g., for the https://JoelMarcey.github.io site, it would be set like...
  //   organizationName: 'JoelMarcey'

  // For no header links in the top nav bar -> headerLinks: [],
  headerLinks: [
    { doc: 'installation', label: 'Docs' },
    { doc: 'doc4', label: 'API' },
    { href: 'https://github.com/hpcc-systems/Visualization', label: 'GitHub' },
    // { blog: true, label: 'Blog' },
  ],

  // If you have users set above, you add it here:
  users,

  /* path to images for header/footer */
  headerIcon: 'img/hpcc-systems-white.png',
  footerIcon: 'img/hpcc-systems.svg',
  favicon: 'img/favicon.ico',

  /* Colors for website */
  colors: {
    primaryColor: '#1A9BD7',
    secondaryColor: '#FF8102',
  },

  /* Custom fonts for website */
  /*
  fonts: {
    myFont: [
      "Times New Roman",
      "Serif"
    ],
    myOtherFont: [
      "-apple-system",
      "system-ui"
    ]
  },
  */

  // This copyright info is used in /core/Footer.js and blog RSS/Atom feeds.
  copyright: `Copyright © ${new Date().getFullYear()} hpcc-systems`,

  highlight: {
    // Highlight.js theme to use for syntax highlighting in code blocks.
    theme: 'default',
  },

  // Add custom scripts here that would be placed in <script> tags.
  scripts: [
    'https://buttons.github.io/buttons.js',
    'https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.0/clipboard.min.js',
    'https://unpkg.com/@hpcc-js/util',
    'https://unpkg.com/@hpcc-js/common',
    'https://unpkg.com/@hpcc-js/api',
    'https://unpkg.com/@hpcc-js/chart',
    '/Visualization/js/code-block-buttons.js',
  ],
  stylesheets: ['/Visualization/css/code-block-buttons.css'],

  // On page navigation for the current documentation page.
  onPageNav: 'separate',
  // No .html extensions for paths.
  cleanUrl: true,

  // Open Graph and Twitter card images.
  ogImage: 'img/undraw_online.svg',
  twitterImage: 'img/undraw_tweetstorm.svg',

  // Show documentation's last contributor's name.
  // enableUpdateBy: true,

  // Show documentation's last update time.
  // enableUpdateTime: true,

  // You may provide arbitrary config keys to be used as needed by your
  // template. For example, if you need your repo's URL...
  //   repoUrl: 'https://github.com/hpcc-systems/Visualization',
};



module.exports = siteConfig;
