import fs from 'fs';
import path from 'path';

const baseDir = 'c:/Users/QP/Desktop/cx-clone/src/data';
const outDir = path.join(baseDir, 'pages');

const home = JSON.parse(fs.readFileSync(path.join(baseDir, 'home.json'), 'utf8'));
const pages = JSON.parse(fs.readFileSync(path.join(baseDir, 'pages.json'), 'utf8'));

// 1. Home Page (slug: 'index')
const homePage = {
  meta: { title: 'Ana Sayfa', slug: '', status: 'yayında' },
  seo: home.seo,
  status: 'yayında',
  blocks: [
    {
      id: 'hero',
      type: 'hero',
      visible: true,
      data: {
        slides: home.heroSlides,
        headingTag: home.heroHeadingTag || 'h1'
      },
      style: { surface: 'siteBg' }
    },
    {
      id: 'manifesto-human',
      type: 'manifesto',
      visible: true,
      data: home.manifesto,
      style: { surface: 'siteBg' }
    },
    {
      id: 'logos-section',
      type: 'logoMarquee',
      visible: true,
      data: home.logos,
      style: { surface: 'siteBg' }
    },
    {
      id: 'why-now',
      type: 'accordion',
      visible: true,
      data: home.whyNow,
      style: { surface: 'richBlack' }
    },
    {
      id: 'solutions',
      type: 'featureCards',
      visible: true,
      data: home.solutionsSection,
      style: { surface: 'siteBg' }
    },
    {
      id: 'projects-stacked',
      type: 'projectShowcase',
      visible: true,
      data: home.projectsSection,
      style: { surface: 'siteBg' }
    },
    {
      id: 'blog-section',
      type: 'blogShowcase',
      visible: true,
      data: home.blogSection,
      style: { surface: 'richBlack' }
    },
    {
      id: 'contact-section',
      type: 'contactForm',
      visible: true,
      data: {},
      style: { surface: 'siteBg' }
    }
  ]
};
fs.writeFileSync(path.join(outDir, 'home.json'), JSON.stringify(homePage, null, 2), 'utf8');

// 2. Yaklaşımımız
const yaklasimData = pages.yaklasimimiz;
const yaklasimPage = {
  meta: { title: 'Yaklaşımımız', slug: 'yaklasimimiz', status: 'yayında' },
  seo: yaklasimData.seo,
  status: 'yayında',
  blocks: [
    {
      id: 'approach-manifesto',
      type: 'approachManifesto',
      visible: true,
      data: {
        hero: yaklasimData.hero,
        pillars: yaklasimData.pillars,
        manifesto: yaklasimData.manifesto,
        matrix: yaklasimData.matrix
      },
      style: { surface: 'siteBg' }
    },
    {
      id: 'faq',
      type: 'faq',
      visible: true,
      data: {
        title: yaklasimData.faqTitle,
        subtitle: yaklasimData.faqSubtitle,
        items: yaklasimData.faqs
      },
      style: { surface: 'siteBg' }
    },
    {
      id: 'cta',
      type: 'ctaBanner',
      visible: true,
      data: {},
      style: { surface: 'brandAccent' }
    }
  ]
};
fs.writeFileSync(path.join(outDir, 'yaklasimimiz.json'), JSON.stringify(yaklasimPage, null, 2), 'utf8');

// 3. Neden Şimdi
const nedenData = pages.nedenSimdi;
const nedenPage = {
  meta: { title: 'Neden Şimdi?', slug: 'neden-simdi', status: 'yayında' },
  seo: nedenData.seo,
  status: 'yayında',
  blocks: [
    {
      id: 'hero',
      type: 'hero',
      visible: true,
      data: {
        ...nedenData.hero,
        bgImage: nedenData.hero.bgImage
      },
      style: { surface: 'platinum' }
    },
    {
      id: 'shifts',
      type: 'shiftsComparison',
      visible: true,
      data: { items: nedenData.shifts },
      style: { surface: 'siteBg' }
    },
    {
      id: 'faq',
      type: 'faq',
      visible: true,
      data: {
        title: nedenData.faqTitle,
        subtitle: nedenData.faqSubtitle,
        items: nedenData.faqs
      },
      style: { surface: 'siteBg' }
    },
    {
      id: 'cta',
      type: 'ctaBanner',
      visible: true,
      data: nedenData.cta || {},
      style: { surface: 'brandAccent' }
    }
  ]
};
fs.writeFileSync(path.join(outDir, 'neden-simdi.json'), JSON.stringify(nedenPage, null, 2), 'utf8');

// 4. Çözümler Index
const cozumlerData = pages.cozumlerIndex;
const cozumlerPage = {
  meta: { title: 'Çözümler', slug: 'cozumler', status: 'yayında' },
  seo: cozumlerData.seo,
  status: 'yayında',
  blocks: [
    {
      id: 'hero',
      type: 'hero',
      visible: true,
      data: cozumlerData.hero,
      style: { surface: 'platinum' }
    },
    {
      id: 'solutions-list',
      type: 'solutionsList',
      visible: true,
      data: { items: cozumlerData.solutions },
      style: { surface: 'siteBg' }
    },
    {
      id: 'faq',
      type: 'faq',
      visible: true,
      data: {
        title: cozumlerData.faqTitle,
        items: cozumlerData.faqs
      },
      style: { surface: 'siteBg' }
    },
    {
      id: 'cta',
      type: 'ctaBanner',
      visible: true,
      data: {},
      style: { surface: 'brandAccent' }
    }
  ]
};
fs.writeFileSync(path.join(outDir, 'cozumler.json'), JSON.stringify(cozumlerPage, null, 2), 'utf8');

// 5. AI Destekli CX
const aiData = pages.aiDestekliCx;
const aiPage = {
  meta: { title: 'AI Destekli CX', slug: 'cozumler/ai-destekli-cx', status: 'yayında' },
  seo: aiData.seo,
  status: 'yayında',
  blocks: [
    {
      id: 'hero',
      type: 'hero',
      visible: true,
      data: aiData.hero,
      style: { surface: 'platinum' }
    },
    {
      id: 'capabilities',
      type: 'capabilitiesGrid',
      visible: true,
      data: { items: aiData.capabilities, columns: 2 },
      style: { surface: 'siteBg' }
    },
    {
      id: 'faq',
      type: 'faq',
      visible: true,
      data: {
        title: aiData.faqTitle,
        items: aiData.faqs
      },
      style: { surface: 'siteBg' }
    },
    {
      id: 'cta',
      type: 'ctaBanner',
      visible: true,
      data: aiData.cta || {},
      style: { surface: 'brandAccent' }
    }
  ]
};
fs.writeFileSync(path.join(outDir, 'cozumler-ai-destekli-cx.json'), JSON.stringify(aiPage, null, 2), 'utf8');

// 6. Deneyim Tasarımı
const cxData = pages.deneyimTasarimi;
const cxPage = {
  meta: { title: 'Deneyim Tasarımı', slug: 'cozumler/deneyim-tasarimi', status: 'yayında' },
  seo: cxData.seo,
  status: 'yayında',
  blocks: [
    {
      id: 'hero',
      type: 'hero',
      visible: true,
      data: cxData.hero,
      style: { surface: 'platinum' }
    },
    {
      id: 'capabilities',
      type: 'capabilitiesGrid',
      visible: true,
      data: { items: cxData.capabilities, columns: 2 },
      style: { surface: 'siteBg' }
    },
    {
      id: 'faq',
      type: 'faq',
      visible: true,
      data: {
        title: cxData.faqTitle,
        items: cxData.faqs
      },
      style: { surface: 'siteBg' }
    },
    {
      id: 'cta',
      type: 'ctaBanner',
      visible: true,
      data: cxData.cta || {},
      style: { surface: 'brandAccent' }
    }
  ]
};
fs.writeFileSync(path.join(outDir, 'cozumler-deneyim-tasarimi.json'), JSON.stringify(cxPage, null, 2), 'utf8');

// 7. Akademi
const akademiData = pages.akademi || pages.cxFolksAkademi;
const akademiPage = {
  meta: { title: 'cx2222 Akademi', slug: 'cozumler/akademi', status: 'yayında' },
  seo: akademiData.seo,
  status: 'yayında',
  blocks: [
    {
      id: 'hero',
      type: 'hero',
      visible: true,
      data: akademiData.hero,
      style: { surface: 'brandAccent' }
    },
    {
      id: 'capabilities',
      type: 'capabilitiesGrid',
      visible: true,
      data: { items: akademiData.capabilities, columns: 2 },
      style: { surface: 'siteBg' }
    },
    {
      id: 'faq',
      type: 'faq',
      visible: true,
      data: {
        title: akademiData.faqTitle,
        items: akademiData.faqs
      },
      style: { surface: 'siteBg' }
    },
    {
      id: 'cta',
      type: 'ctaBanner',
      visible: true,
      data: akademiData.cta || {},
      style: { surface: 'brandAccent' }
    }
  ]
};
fs.writeFileSync(path.join(outDir, 'cozumler-akademi.json'), JSON.stringify(akademiPage, null, 2), 'utf8');

// 8. Maturity Testi
const maturityData = pages.cxMaturityTesti;
const maturityPage = {
  meta: { title: 'cx2222 Maturity Testi', slug: 'cozumler/cx-maturity-testi', status: 'yayında' },
  seo: maturityData.seo,
  status: 'yayında',
  blocks: [
    {
      id: 'hero',
      type: 'hero',
      visible: true,
      data: maturityData.hero,
      style: { surface: 'platinum' }
    },
    {
      id: 'maturity-test',
      type: 'maturityTest',
      visible: true,
      data: {
        questions: maturityData.questions,
        results: maturityData.results
      },
      style: { surface: 'siteBg' }
    },
    {
      id: 'faq',
      type: 'faq',
      visible: true,
      data: {
        title: maturityData.faqTitle,
        items: maturityData.faqs
      },
      style: { surface: 'siteBg' }
    },
    {
      id: 'cta',
      type: 'ctaBanner',
      visible: true,
      data: {},
      style: { surface: 'brandAccent' }
    }
  ]
};
fs.writeFileSync(path.join(outDir, 'cozumler-cx-maturity-testi.json'), JSON.stringify(maturityPage, null, 2), 'utf8');

// 9. Projeler Index
const projelerData = pages.projelerIndex;
const projelerPage = {
  meta: { title: 'Projeler', slug: 'projeler', status: 'yayında' },
  seo: projelerData.seo,
  status: 'yayında',
  blocks: [
    {
      id: 'hero',
      type: 'hero',
      visible: true,
      data: projelerData.hero,
      style: { surface: 'platinum' }
    },
    {
      id: 'projects-list',
      type: 'projectsList',
      visible: true,
      data: { cardCtaText: projelerData.cardCtaText },
      style: { surface: 'siteBg' }
    },
    {
      id: 'faq',
      type: 'faq',
      visible: true,
      data: {
        title: projelerData.faqTitle,
        items: projelerData.faqs || []
      },
      style: { surface: 'siteBg' }
    },
    {
      id: 'cta',
      type: 'ctaBanner',
      visible: true,
      data: {},
      style: { surface: 'brandAccent' }
    }
  ]
};
fs.writeFileSync(path.join(outDir, 'projeler.json'), JSON.stringify(projelerPage, null, 2), 'utf8');

// 10. Blog Index
const blogData = pages.blogIndex;
const blogPage = {
  meta: { title: 'Blog', slug: 'blog', status: 'yayında' },
  seo: blogData.seo,
  status: 'yayında',
  blocks: [
    {
      id: 'hero',
      type: 'hero',
      visible: true,
      data: {
        ...blogData.hero,
        bgImage: blogData.hero.bgImage
      },
      style: { surface: 'platinum' }
    },
    {
      id: 'articles-list',
      type: 'articlesList',
      visible: true,
      data: { readMoreText: blogData.readMoreText },
      style: { surface: 'platinum' }
    },
    {
      id: 'faq',
      type: 'faq',
      visible: true,
      data: {
        title: blogData.faqTitle,
        items: blogData.faqs || []
      },
      style: { surface: 'siteBg' }
    },
    {
      id: 'cta',
      type: 'ctaBanner',
      visible: true,
      data: {},
      style: { surface: 'brandAccent' }
    }
  ]
};
fs.writeFileSync(path.join(outDir, 'blog.json'), JSON.stringify(blogPage, null, 2), 'utf8');

// 11. İletişim
const iletisimData = pages.iletisim;
const iletisimPage = {
  meta: { title: 'İletişim', slug: 'iletisim', status: 'yayında' },
  seo: iletisimData.seo,
  status: 'yayında',
  blocks: [
    {
      id: 'contact-hero',
      type: 'contactHero',
      visible: true,
      data: iletisimData.hero,
      style: { surface: 'platinum' }
    },
    {
      id: 'contact-form',
      type: 'contactForm',
      visible: true,
      data: {},
      style: { surface: 'siteBg' }
    },
    {
      id: 'faq',
      type: 'faq',
      visible: true,
      data: {
        title: iletisimData.faqTitle,
        items: iletisimData.faqs
      },
      style: { surface: 'siteBg' }
    }
  ]
};
fs.writeFileSync(path.join(outDir, 'iletisim.json'), JSON.stringify(iletisimPage, null, 2), 'utf8');

// 12. 404
const notFoundData = pages.notFound;
const notFoundPage = {
  meta: { title: '404', slug: '404', status: 'yayında' },
  seo: notFoundData.seo,
  status: 'yayında',
  blocks: [
    {
      id: 'not-found',
      type: 'notFound',
      visible: true,
      data: notFoundData,
      style: { surface: 'platinum' }
    }
  ]
};
fs.writeFileSync(path.join(outDir, '404.json'), JSON.stringify(notFoundPage, null, 2), 'utf8');

console.log('Successfully created all 12 block-based page JSON files in src/data/pages/');
