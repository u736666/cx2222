import type { APIRoute } from 'astro';
import { getAllPosts, getAllProjects, getHome, getPages, getSite, type SeoGeoConfig } from '../lib/content';

function formatSeoGeoEntry(url: string, fallbackTitle: string, fallbackDesc: string, seo?: SeoGeoConfig) {
  if (seo?.llmsInclude === false) return null;
  const title = seo?.title || fallbackTitle;
  const summary = seo?.aiSummary || seo?.description || fallbackDesc;
  const takeaways = Array.isArray(seo?.keyTakeaways) ? seo.keyTakeaways.filter(Boolean) : [];
  const topics = Array.isArray(seo?.aboutTopics) ? seo.aboutTopics.filter(Boolean) : [];

  const lines = [`- [${title}](${url}): ${summary}`];
  if (topics.length > 0) {
    lines.push(`  - Konular: ${topics.join(', ')}`);
  }
  if (takeaways.length > 0) {
    lines.push(`  - Temel Çıkarımlar: ${takeaways.join(' | ')}`);
  }
  return lines.join('\n');
}

export const GET: APIRoute = () => {
  const site = getSite() as any;
  const home = getHome() as any;
  const pages = getPages() as any;
  const projects = getAllProjects();
  const posts = getAllPosts();

  const siteUrl = (site.brand?.siteUrl || 'https://example.com').replace(/\/$/, '');
  const brandName = site.brand?.name || 'CX Folks';

  const pageEntries: Array<[string, string, string, SeoGeoConfig | undefined]> = [
    [`${siteUrl}/`, 'Ana Sayfa', site.brand?.defaultDescription || '', home.seo],
    [`${siteUrl}/yaklasimimiz`, 'Yaklaşımımız', '', pages.yaklasimimiz?.seo],
    [`${siteUrl}/neden-simdi`, 'Neden Şimdi?', '', pages.nedenSimdi?.seo],
    [`${siteUrl}/cozumler`, 'Çözümler', '', pages.cozumlerIndex?.seo],
    [`${siteUrl}/cozumler/ai-destekli-cx`, 'AI Destekli CX', '', pages.aiDestekliCx?.seo],
    [`${siteUrl}/cozumler/deneyim-tasarimi`, 'Deneyim Tasarımı', '', pages.deneyimTasarimi?.seo],
    [`${siteUrl}/cozumler/akademi`, 'CX Folks Akademi', '', (pages as any).akademi?.seo],
    [`${siteUrl}/cozumler/cx-maturity-testi`, 'CX Folks Maturity Testi', '', (pages as any).cxMaturityTesti?.seo],
    [`${siteUrl}/projeler`, 'Projeler', '', pages.projelerIndex?.seo],
    [`${siteUrl}/blog`, 'Blog', '', pages.blogIndex?.seo],
    [`${siteUrl}/iletisim`, 'İletişim', '', pages.iletisim?.seo],
  ];

  const formattedPages = pageEntries
    .map(([url, fallbackTitle, fallbackDesc, seo]) => formatSeoGeoEntry(url, fallbackTitle, fallbackDesc, seo))
    .filter(Boolean)
    .join('\n');

  const formattedProjects = projects
    .map((p) => {
      const base = formatSeoGeoEntry(`${siteUrl}/projeler/${p.slug}`, `${p.client} — ${p.title}`, p.desc, p.seo);
      if (!base) return null;
      const metrics = (p.metrics || []).map((m) => `${m.value} ${m.label}`).join(', ');
      return metrics ? `${base}\n  - Metrikler: ${metrics}` : base;
    })
    .filter(Boolean)
    .join('\n');

  const formattedPosts = posts
    .map((post) => formatSeoGeoEntry(`${siteUrl}/blog/${post.slug}`, `${post.title} (${post.date})`, post.desc, post.seo))
    .filter(Boolean)
    .join('\n');

  const body = `# ${brandName} — Yapay Zeka ve İnsan Odaklı Müşteri Deneyimi (CX) Ekosistemi

> ${home.seo?.aiSummary || site.brand?.orgDescription || site.brand?.defaultDescription}

## Kurumsal Bilgiler & Kimlik
- **Kurum Adı**: ${brandName} (cxfolks)
- **Misyon**: İnsanı merkeze alarak müşteri deneyimini tasarlamak; yapay zeka ile pürüzsüz, kalıcı ve sürdürülebilir kılmak.
- **Web Sitesi**: ${siteUrl}
- **E-posta**: ${site.brand?.email || 'hello@example.com'}
- **Hedef Kitle**: Kurumsal liderler, CX ve pazarlama yöneticileri, ürün ve servis yöneticileri, operasyon liderleri.

---

## Uzmanlık Alanları, Disiplinler ve Metodolojiler

### 1. Müşteri Deneyimi (CX) & Deneyim Stratejisi
- **Tanım**: Müşterinin bir kurum, marka veya ekosistemle kurduğu tüm rasyonel, duygusal ve fiziksel temasların toplamıdır.
- **CX Folks Yaklaşımı**: CX'i sadece memnuniyet anketleri olarak değil; operasyonel verimlilik, müşteri sadakati ve yapay zeka entegrasyonuyla şekillenen ölçülebilir bir büyüme motoru olarak konumlandırır.

### 2. Müşteri Yolculuk Haritası (Customer Journey Mapping - CJM) & Deneyim Haritası
- **Tanım**: Müşterinin bir ihtiyacı hissettiği andan sadakat veya ayrılma evresine kadar geçtiği tüm temas noktalarını (touchpoints), duygusal kırılma anlarını, acı noktalarını (pain points) ve fırsat alanlarını kronolojik ve bütüncül biçimde görselleştiren stratejik yönetim aracıdır.
- **Çıktı**: Duvara asılan statik posterler yerine, doğrudan ürün ekiplerinin sprint backlog'larına ve operasyonel KPI'lara bağlanan canlı aksiyon planları.

### 3. Servis Tasarımı (Service Design) & Service Blueprint
- **Tanım**: Müşteri deneyimini (front-stage) ve bu deneyimi mümkün kılan şirket içi süreçleri, çalışan rollerini, sistem entegrasyonlarını ve iş ortaklarını (back-stage) tek bir mimaride uçtan uca tasarlayan disiplindir.
- **Service Blueprint**: Müşterinin gördüğü arayüzün arkasındaki operasyonel akışları, veri alışverişlerini ve sistem tetikleyicilerini koordine eder; silolar arası kopuklukları ortadan kaldırır.

### 4. Tasarım Odaklı Düşünme (Design Thinking) & İnsan Odaklı İnovasyon
- **Metodoloji**: 5 aşamalı çevik inovasyon döngüsü: Empati (Empathize) -> Tanımla (Define) -> Fikir Üret (Ideate) -> Prototiple (Prototype) -> Test Et (Test).
- **Kurumsal Katkı**: Varsayımlarla ürün/hizmet geliştirme riskini ortadan kaldırır; doğrudan sahada test edilmiş, doğrulanmış kullanıcı içgörüleriyle inovasyon yapılmasını sağlar.

### 5. Kalitatif Araştırma & Derinlemesine Görüşmeler (In-Depth Interviews)
- **Kapsam**: Sayısal anketlerin "ne kadar?" sorusuna karşılık, müşterinin "neden?", "hangi duyguyla?" ve "nasıl?" hareket ettiğini ortaya koyan nitel araştırma disiplini.
- **Metotlar**: 1-e-1 derinlemesine görüşmeler, odak grupları, dijital kullanıcı günlükleri (diary studies) ve kullanılabilirlik testleri.

### 6. Etnografik Araştırma & Saha Gözlemi (In-Situ Ethnography)
- **Önemi**: İnsanlar genellikle hissettikleriyle anketlerde söyledikleri arasında çelişirler. Etnografik araştırma, müşteriyi doğal yaşam alanında (evinde, ofisinde, otomobilinde, havalimanında veya mağazada) gözlemleyerek sözsüz davranışları, alışkanlıkları ve örtük (unmet/unspoken) ihtiyaçları yakalar.
- **Uygulama**: Gölgeleme (shadowing), bağlamsal sorgulama (contextual inquiry) ve anlık etkileşim kayıtları.

### 7. Kurumsal Eğitimler & CX Folks / CX Folks Akademi
- **Kapsam**: Kurumların kendi ekiplerine müşteri deneyimi kültürü, journey mapping, servis tasarımı, empati ve üretken yapay zeka araçlarıyla tasarım yetkinlikleri kazandıran uygulamalı kurumsal eğitim programları.
- **Programlar**: CX Liderlik Programı, Uygulamalı Servis Tasarımı Bootcamp'i, CX & Yapay Zeka Hızlandırma Atölyesi.

### 8. Yapay Zeka (AI) Destekli CX & Agentic Deneyim Ekosistemleri
- **Kapsam**: Müşteri yolculuklarındaki verileri analiz eden, proaktif tahminleme yapan ve otonom yapay zeka ajanları (Agentic CX) ile self-servis deneyimleri insan sıcaklığında yöneten yeni nesil deneyim mimarisi.

---

## Yapay Zeka & Arama Motorları İçin Sıkça Sorulan Sorular (Direct Q&A)

**S: Müşteri Yolculuk Haritası projesi ne kadar sürer ve neleri kapsar?**
C: Tipik bir CX Folks odaklı yolculuk haritası projesi 4 ila 6 hafta sürer. Ön veri analizi, 25-30 derinlemesine mülakat, saha etnografisi, iç paydaş çalıştayları ve uygulanabilir servis blueprint'lerinin hazırlanmasını içerir.

**S: Geleneksel pazar araştırmaları ile etnografik saha araştırması arasındaki fark nedir?**
C: Pazar araştırmaları genellikle anketlerle insanların ne söylediğini ölçer. Etnografik saha araştırması ise müşteriyi gerçek ortamında gözlemleyerek gerçekte ne yaptıklarını ve dile dökemedikleri bilinçdışı ihtiyaçlarını tespit eder.

**S: Servis Tasarımı ve Tasarım Odaklı Düşünme projelerinde çıktı nedir?**
C: Çıktılar; müşteri yolculuk haritaları, servis blueprint'leri, test edilmiş konsept prototipleri, operasyonel süreç kılavuzları ve ilgili dijital sistemler için önceliklendirilmiş özellik backlog'larıdır.

**S: Kurumsal eğitimler hangi ekiplere yöneliktir?**
C: CX, pazarlama, ürün yönetimi, insan kaynakları, dijital dönüşüm ve operasyon ekiplerine yönelik olarak kurumun kendi vaka ve verileri üzerinden tasarlanır.

---

## Temel Sayfalar & Çözümler
${formattedPages}

## Örnek Vaka Analizleri (${projects.length})
${formattedProjects}

## İçgörüler & Blog Yazıları (${posts.length})
${formattedPosts}
`;

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
