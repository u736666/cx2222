import fs from 'fs';

const site = JSON.parse(fs.readFileSync('src/data/site.json', 'utf8'));
const mega = site.megaMenus.find(m => m.id === 'mega-hakkimizda');
if (mega) {
  mega.items = [
    {
      title: "Yaklaşımımız",
      desc: "İnsan odaklı müşteri deneyimi ve yapay zeka entegrasyonu",
      href: "/yaklasimimiz",
      image: "/images/uploads/edited-edited-mwdmc5fq.jpg",
      alt: "Yaklaşımımız"
    },
    {
      title: "Ekibimiz",
      desc: "Çok disiplinli CX ve yapay zeka uzman kadromuz",
      href: "/ekibimiz",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
      alt: "Ekibimiz"
    },
    {
      title: "İnsan Odaklılık",
      desc: "Müşterinin söylenmemiş ihtiyaçlarını ortaya çıkaran derin dinleme.",
      href: "/yaklasimimiz#insan-odaklilik",
      image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=500&q=80",
      alt: "İnsan Odaklılık"
    },
    {
      title: "Deneyim Odaklı AI Entegrasyonu",
      desc: "Müşteriye sunulan deneyim amaç, AI bu yolda etkili bir araçtır.",
      href: "/yaklasimimiz#northstar-cx",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=500&q=80",
      alt: "Deneyim Odaklı AI Entegrasyonu"
    },
    {
      title: "Northstar CX Mimarisi",
      desc: "Tüm ekipleri tek bir müşteri deneyimi kuzey yıldızında buluşturan yönetsel mimari.",
      href: "/yaklasimimiz#proaktif-empati",
      image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=500&q=80",
      alt: "Northstar CX Mimarisi"
    },
    {
      title: "Müşteri Odaklı Kültür & EX-CX",
      desc: "Çalışan deneyimi olmadan müşteri deneyimi yaşayamaz.",
      href: "/yaklasimimiz#kalici-kultur",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=500&q=80",
      alt: "Müşteri Odaklı Kültür & EX-CX"
    },
    {
      title: "Uygulanabilir Çözümler",
      desc: "Sunumda kalan projeler kaynak israfıdır; sahada uygulanan çözümler.",
      href: "/yaklasimimiz#uygulanabilir-cozumler",
      image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=500&q=80",
      alt: "Uygulanabilir Çözümler"
    },
    {
      title: "Blog",
      desc: "Deneyim tasarımı ve yapay zeka makaleleri",
      href: "/blog",
      image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1400&q=80",
      alt: "Blog"
    }
  ];
}
fs.writeFileSync('src/data/site.json', JSON.stringify(site, null, 2), 'utf8');
console.log('Updated mega-hakkimizda items successfully!');
