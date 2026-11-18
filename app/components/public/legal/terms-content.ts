// app/components/public/legal/terms-content.ts
// Isi Syarat dan Ketentuan. Nama perusahaan dan kontak diambil dari pengaturan situs.
import type { SiteInfo } from '~/services/site.server';
import type { LegalSection } from './legal-types';

export function termsSections(site: SiteInfo): LegalSection[] {
  const name = site.companyName;
  const contact = [site.email && `Email: ${site.email}`, site.whatsapp && `WhatsApp: ${site.whatsapp}`, site.address && `Alamat: ${site.address}`].filter(Boolean) as string[];

  return [
    {
      id: 'penerimaan',
      title: 'Penerimaan ketentuan',
      body: [`Dengan mengakses dan menggunakan situs ${name}, Anda menyetujui syarat dan ketentuan ini. Bila Anda tidak setuju, mohon berhenti menggunakan situs.`],
    },
    {
      id: 'informasi-situs',
      title: 'Informasi di situs',
      body: [
        'Situs ini memuat informasi umum tentang layanan, portofolio, dan artikel kami. Kami berusaha menjaga informasi tetap akurat dan terkini, tetapi isi situs dapat berubah sewaktu-waktu tanpa pemberitahuan.',
        'Informasi di situs bukan penawaran yang mengikat. Rincian layanan, jadwal, dan harga untuk acara Anda ditetapkan dalam penawaran tertulis atau perjanjian tersendiri.',
      ],
    },
    {
      id: 'permintaan-konsultasi',
      title: 'Permintaan konsultasi',
      body: [
        'Mengirim formulir, pesan WhatsApp, email, atau telepon kepada kami adalah permintaan konsultasi, bukan pemesanan. Kerja sama dianggap sah setelah penawaran atau perjanjian disetujui kedua pihak dan ketentuan pembayaran dipenuhi sesuai kesepakatan.',
        'Anda wajib memberikan informasi yang benar dan dapat dihubungi agar kami dapat menanggapi dengan tepat.',
      ],
    },
    {
      id: 'kekayaan-intelektual',
      title: 'Hak kekayaan intelektual',
      body: [
        `Teks, foto, video, logo, desain, dan materi lain di situs ini adalah milik ${name} atau dipakai berdasarkan izin pemiliknya, dan dilindungi hukum hak cipta.`,
        'Anda tidak diperkenankan menyalin, memperbanyak, mengubah, atau menyebarkan materi tersebut untuk tujuan komersial tanpa izin tertulis dari kami. Kutipan singkat dengan mencantumkan sumber diperbolehkan.',
        'Foto acara pada portofolio ditampilkan dengan sepengetahuan pihak yang bersangkutan. Bila Anda merasa keberatan atas suatu materi, hubungi kami agar dapat kami tinjau dan tindak lanjuti.',
      ],
    },
    {
      id: 'penggunaan-terlarang',
      title: 'Penggunaan yang dilarang',
      body: [
        'Anda setuju untuk tidak:',
        {
          list: [
            'mengirim data palsu, pesan spam, atau konten yang melanggar hukum melalui formulir;',
            'menggunakan bot atau cara otomatis untuk mengakses atau mengirim data ke situs secara berlebihan;',
            'mencoba mengakses bagian situs yang tidak diperuntukkan bagi umum, atau mengganggu keamanan dan kinerja situs.',
          ],
        },
      ],
    },
    {
      id: 'pihak-ketiga',
      title: 'Tautan dan layanan pihak ketiga',
      body: ['Situs ini dapat memuat tautan atau tampilan dari pihak ketiga, seperti peta, WhatsApp, dan media sosial. Kami tidak mengendalikan dan tidak bertanggung jawab atas isi maupun kebijakan pihak ketiga tersebut.'],
    },
    {
      id: 'batasan-tanggung-jawab',
      title: 'Batasan tanggung jawab',
      body: [
        'Situs disediakan "sebagaimana adanya". Kami tidak menjamin situs selalu tersedia tanpa gangguan atau bebas dari kesalahan.',
        'Sejauh diizinkan hukum, kami tidak bertanggung jawab atas kerugian tidak langsung yang timbul dari penggunaan situs atau dari mengandalkan informasi di dalamnya. Tanggung jawab atas pelaksanaan acara diatur dalam perjanjian kerja sama tersendiri.',
      ],
    },
    {
      id: 'privasi',
      title: 'Privasi',
      body: ['Pengelolaan data pribadi Anda dijelaskan dalam Kebijakan Privasi kami, yang menjadi bagian dari ketentuan ini.'],
    },
    {
      id: 'perubahan',
      title: 'Perubahan ketentuan',
      body: ['Kami dapat memperbarui ketentuan ini sewaktu-waktu. Versi terbaru berlaku sejak dipublikasikan di halaman ini. Dengan tetap menggunakan situs, Anda dianggap menyetujui perubahan tersebut.'],
    },
    {
      id: 'hukum',
      title: 'Hukum yang berlaku',
      body: ['Ketentuan ini tunduk pada hukum Republik Indonesia. Bila terjadi perselisihan, kedua pihak akan mengupayakan penyelesaian secara musyawarah terlebih dahulu sebelum menempuh jalur pengadilan yang berwenang.'],
    },
    {
      id: 'kontak',
      title: 'Hubungi kami',
      body: ['Pertanyaan tentang ketentuan ini dapat disampaikan melalui:', ...(contact.length ? [{ list: contact }] : [])],
    },
  ];
}
