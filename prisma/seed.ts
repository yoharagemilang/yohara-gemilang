// prisma/seed.ts
import 'dotenv/config';
import { hash } from '@node-rs/argon2';
import { PrismaNeon } from '@prisma/adapter-neon';

import { PrismaClient } from '../app/generated/prisma/client';

const connectionString = process.env.DATABASE_URL;
const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD;
const resetAdmin = process.argv.includes('--reset-admin');

if (!connectionString) {
  throw new Error('DATABASE_URL belum diisi di .env');
}
if (!adminEmail || !adminPassword) {
  throw new Error('ADMIN_EMAIL dan ADMIN_PASSWORD belum diisi di .env');
}
if (adminPassword.length < 10) {
  throw new Error('ADMIN_PASSWORD minimal 10 karakter');
}

const db = new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });

async function seedAdmin() {
  const passwordHash = await hash(adminPassword!);
  await db.admin.upsert({
    where: { email: adminEmail! },
    update: resetAdmin ? { passwordHash, sessionVersion: { increment: 1 } } : {},
    create: { email: adminEmail!, name: 'Admin', passwordHash },
  });
  console.log(resetAdmin ? 'admin: password direset' : 'admin: siap');
}

async function seedSingletons() {
  await db.siteSetting.upsert({
    where: { id: 'main' },
    update: {},
    create: {
      id: 'main',
      companyName: 'CV Yohara Gemilang Management',
      tagline: 'Event organizer',
      address: 'Jl. Gatot Subroto No. 128, Medan, Sumatera Utara 20112',
      phone: '+62 812-6047-3391',
      whatsapp: '6281260473391',
      email: 'halo@yoharagemilang.com',
      openingHours: 'Senin sampai Sabtu, 09.00 sampai 17.00 WIB',
      mapQuery: 'Jl. Gatot Subroto Medan',
      seoTitle: 'Yohara Gemilang Management | Event Organizer',
      seoDescription: 'Event organizer untuk acara korporat, pernikahan, konser, seminar, gathering, dan peresmian. Konsultasi pertama gratis.',
    },
  });

  await db.hero.upsert({
    where: { id: 'main' },
    update: {},
    create: {
      id: 'main',
      eyebrow: 'Event Organizer',
      heading: 'Acara korporat, pernikahan, dan konser yang',
      headingAccent: 'berjalan sesuai rencana.',
      description: 'Kami mengurus konsep, anggaran, vendor, dan pelaksanaan di lokasi. Anda cukup menentukan tanggal dan tujuan acaranya.',
      primaryLabel: 'Konsultasi gratis',
      primaryHref: '/kontak',
      secondaryLabel: 'Lihat portofolio',
      secondaryHref: '/portofolio',
    },
  });

  await db.aboutPage.upsert({
    where: { id: 'main' },
    update: {},
    create: {
      id: 'main',
      title: 'Tentang Yohara Gemilang',
      subtitle: 'Event organizer yang menyusun acara dari konsep sampai hari pelaksanaan.',
      contentHtml:
        '<p>Yohara Gemilang Management menangani acara korporat, pernikahan, konser, seminar, gathering, dan peresmian. Setiap acara dipegang satu koordinator utama agar komunikasi sederhana dan keputusan cepat diambil.</p><p>Kami memulai dari tujuan acara dan anggaran, lalu menyusun konsep, memilih vendor, dan menjalankan hari-H sesuai rundown yang sudah disepakati.</p>',
      vision: 'Menjadi event organizer yang dipercaya karena acaranya berjalan tepat waktu dan sesuai kesepakatan.',
      mission: 'Menyusun perencanaan yang jelas, bekerja dengan vendor yang teruji, dan menjaga komunikasi terbuka dengan klien dari awal sampai acara selesai.',
    },
  });
}

async function seedServices() {
  if ((await db.service.count()) > 0) return;
  await db.service.createMany({
    data: [
      {
        title: 'Corporate Event',
        iconKey: 'briefcase',
        description: 'Product launching, annual meeting, dan penghargaan karyawan dengan identitas brand yang konsisten.',
      },
      {
        title: 'Wedding',
        iconKey: 'heart',
        description: 'Pernikahan adat maupun modern, intimate sampai ballroom, dengan satu koordinator yang mendampingi keluarga.',
      },
      {
        title: 'Konser & Festival',
        iconKey: 'music',
        description: 'Panggung, sound, lighting, ticketing, dan pengaturan massa untuk acara berskala besar.',
      },
      {
        title: 'Seminar & Konferensi',
        iconKey: 'presentation',
        description: 'Registrasi peserta, ruang paralel, MC, penerjemah, dan dokumentasi untuk forum bisnis dan pendidikan.',
      },
      {
        title: 'Gathering & Outing',
        iconKey: 'users',
        description: 'Family gathering, team building, dan trip insentif lengkap dengan transportasi dan akomodasi.',
      },
      {
        title: 'Peresmian & Grand Opening',
        iconKey: 'building',
        description: 'Pemotongan pita, groundbreaking, dan pembukaan gerai dengan protokoler dan liputan media yang tertata.',
      },
    ].map((item, index) => ({ ...item, sortOrder: index })),
  });
  console.log('layanan: 6 data dibuat');
}

async function seedPartners() {
  if ((await db.partner.count()) > 0) return;
  const names = ['Arunika Group', 'Bumi Sentosa Persada', 'Teluk Mas Hotel', 'Sumatera Cakra Energi', 'Lintas Baruna', 'Dharma Kencana', 'Graha Harmoni', 'Sinar Pratama Motor'];
  await db.partner.createMany({
    data: names.map((name, index) => ({ name, sortOrder: index })),
  });
  console.log('partner: 8 data dibuat');
}

async function seedFaqs() {
  if ((await db.faq.count()) > 0) return;
  await db.faq.createMany({
    data: [
      {
        question: 'Berapa lama waktu persiapan yang dibutuhkan?',
        answer: 'Acara korporat kecil cukup 3 sampai 4 minggu. Pernikahan dan konferensi besar sebaiknya mulai 4 sampai 6 bulan sebelumnya agar venue dan vendor utama masih tersedia.',
      },
      {
        question: 'Apakah ada batas minimal anggaran?',
        answer: 'Tidak ada angka baku. Kami mulai dari anggaran Anda, lalu menjelaskan konsep apa yang realistis dengan dana tersebut.',
      },
      {
        question: 'Bolehkah memakai vendor pilihan sendiri?',
        answer: 'Boleh. Kami cek kecocokan teknisnya dan koordinasikan dengan vendor lain. Jika belum punya, kami punya daftar rekanan yang sudah pernah bekerja dengan tim kami.',
      },
      {
        question: 'Apakah melayani acara di luar kota?',
        answer: 'Ya. Untuk lokasi baru, tim survei venue lebih dulu sebelum penawaran dikirim.',
      },
      {
        question: 'Bagaimana sistem pembayarannya?',
        answer: 'Pembayaran dibagi beberapa tahap: uang muka saat kontrak, pembayaran bertahap sesuai progres, dan pelunasan sebelum hari acara. Rinciannya tertulis di penawaran.',
      },
      {
        question: 'Bagaimana jika ada perubahan mendadak saat acara?',
        answer: 'Setiap acara punya rencana cadangan untuk cuaca, jadwal, dan peralatan. Koordinator lapangan berwenang mengambil keputusan di tempat.',
      },
    ].map((item, index) => ({ ...item, sortOrder: index })),
  });
  console.log('faq: 6 data dibuat');
}

async function seedPortfolio() {
  const services = await db.service.findMany({
    select: { id: true, title: true },
  });
  const serviceId = (title: string) => services.find((service) => service.title === title)?.id ?? null;

  const projects = [
    {
      slug: 'peluncuran-armada-lintas-baruna',
      title: 'Peluncuran Armada Lintas Baruna',
      summary: 'Peluncuran armada baru dengan panggung utama, layar LED, dan area undangan media.',
      city: 'Medan',
      year: 2026,
      guestCount: 420,
      service: 'Corporate Event',
      publishedAt: new Date('2026-09-20'),
    },
    {
      slug: 'resepsi-adat-karo-aditya-maharani',
      title: 'Resepsi Adat Karo, Aditya & Maharani',
      summary: 'Resepsi pernikahan adat Karo dengan prosesi keluarga dan dekorasi bernuansa putih.',
      city: 'Berastagi',
      year: 2026,
      guestCount: 800,
      service: 'Wedding',
      publishedAt: new Date('2026-08-15'),
    },
    {
      slug: 'pesta-tepian-danau',
      title: 'Pesta Tepian Danau',
      summary: 'Festival musik dua hari di tepi danau dengan panggung utama dan area kuliner.',
      city: 'Parapat',
      year: 2025,
      guestCount: 12400,
      service: 'Konser & Festival',
      publishedAt: new Date('2025-12-10'),
    },
    {
      slug: 'forum-energi-sumatera',
      title: 'Forum Energi Sumatera',
      summary: 'Forum dengan sesi paralel, registrasi digital, dan penerjemah untuk delegasi.',
      city: 'Jakarta',
      year: 2025,
      guestCount: 1150,
      service: 'Seminar & Konferensi',
      publishedAt: new Date('2025-10-05'),
    },
  ];

  for (const [index, project] of projects.entries()) {
    const { service, ...data } = project;
    await db.portfolioProject.upsert({
      where: { slug: data.slug },
      update: {},
      create: {
        ...data,
        contentHtml: `<p>${data.summary}</p>`,
        serviceId: serviceId(service),
        status: 'PUBLISHED',
        isFeatured: true,
        sortOrder: index,
      },
    });
  }
  console.log('portofolio: 4 contoh siap');
}

async function seedArticles() {
  const articles = [
    {
      slug: 'cara-menyusun-rundown-12-jam-yang-tetap-fleksibel',
      title: 'Cara menyusun rundown 12 jam yang tetap fleksibel',
      category: 'Perencanaan',
      excerpt: 'Jadwal yang terlalu rapat berantakan saat ada satu keterlambatan. Ini cara menyisipkan waktu cadangan tanpa memperlambat acara.',
      readingMinutes: 3,
      publishedAt: new Date('2026-11-04'),
      contentHtml:
        '<p>Rundown yang baik bukan yang paling padat, tetapi yang masih berjalan ketika satu bagian molor. Mulai dengan menentukan titik yang tidak boleh bergeser, seperti kedatangan tamu utama, makan malam, dan penutupan.</p><h2>Sisipkan waktu cadangan</h2><p>Beri jeda 10 sampai 15 menit setelah segmen yang paling berisiko terlambat, misalnya registrasi dan sesi sambutan. Jeda ini menyerap keterlambatan sehingga segmen berikutnya tetap tepat waktu.</p><h2>Tunjuk satu pemegang jam</h2><p>Satu orang di lapangan memegang rundown dan berwenang memotong atau menunda segmen. Tanpa itu, keputusan memakan waktu lebih lama daripada keterlambatannya.</p>',
    },
    {
      slug: 'cara-menghitung-jumlah-tamu-undangan-pernikahan',
      title: 'Cara menghitung jumlah tamu undangan pernikahan',
      category: 'Wedding',
      excerpt: 'Tidak semua undangan hadir. Ini cara memperkirakan jumlah tamu agar katering dan kursi tidak kurang atau berlebih.',
      readingMinutes: 4,
      publishedAt: new Date('2026-10-28'),
      contentHtml:
        '<p>Jumlah undangan dan jumlah tamu yang hadir hampir selalu berbeda. Catat konfirmasi kehadiran sejak undangan disebar, lalu pisahkan tamu keluarga, kolega, dan tamu umum karena tingkat kehadirannya berbeda.</p><h2>Siapkan cadangan</h2><p>Tambahkan cadangan kursi dan porsi katering sekitar 5 sampai 10 persen di atas konfirmasi. Angka ini bisa disesuaikan dengan kebiasaan keluarga dan jenis acaranya.</p><h2>Tutup data lebih awal</h2><p>Tetapkan batas akhir konfirmasi satu minggu sebelum acara supaya katering dan penataan ruangan bisa dikunci.</p>',
    },
    {
      slug: 'lima-pertanyaan-untuk-venue-sebelum-tanda-tangan-kontrak',
      title: 'Lima pertanyaan untuk venue sebelum tanda tangan kontrak',
      category: 'Produksi',
      excerpt: 'Beberapa hal teknis sering baru diketahui setelah kontrak ditandatangani. Tanyakan lima hal ini lebih dulu.',
      readingMinutes: 3,
      publishedAt: new Date('2026-10-19'),
      contentHtml:
        '<p>Venue yang bagus belum tentu cocok untuk acara Anda. Ajukan pertanyaan berikut sebelum menandatangani kontrak.</p><ol><li>Berapa kapasitas daya listrik dan apakah genset diperbolehkan?</li><li>Jam berapa area boleh diakses untuk set up dan harus dikosongkan?</li><li>Apakah ada batasan vendor luar, terutama katering dan sound?</li><li>Bagaimana akses bongkar muat dan area parkir?</li><li>Apa kebijakan jika acara melewati jam yang disepakati?</li></ol>',
    },
  ];

  for (const article of articles) {
    await db.article.upsert({
      where: { slug: article.slug },
      update: {},
      create: { ...article, status: 'PUBLISHED' },
    });
  }
  console.log('artikel: 3 contoh siap');
}

async function main() {
  await seedAdmin();
  await seedSingletons();
  await seedServices();
  await seedPartners();
  await seedFaqs();
  await seedPortfolio();
  await seedArticles();
  console.log('seed selesai');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
