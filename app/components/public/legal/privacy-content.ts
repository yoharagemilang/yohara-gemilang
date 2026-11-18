// app/components/public/legal/privacy-content.ts
// Isi Kebijakan Privasi. Nama perusahaan dan kontak diambil dari pengaturan situs.
import type { SiteInfo } from '~/services/site.server';
import type { LegalSection } from './legal-types';

export function privacySections(site: SiteInfo): LegalSection[] {
  const name = site.companyName;
  const contact = [site.email && `Email: ${site.email}`, site.whatsapp && `WhatsApp: ${site.whatsapp}`, site.address && `Alamat: ${site.address}`].filter(Boolean) as string[];

  return [
    {
      id: 'pendahuluan',
      title: 'Pendahuluan',
      body: [
        `${name} ("kami") menghargai privasi Anda. Kebijakan ini menjelaskan data pribadi apa yang kami kumpulkan melalui situs ini, untuk apa data itu dipakai, dan hak yang Anda miliki atas data tersebut, sesuai Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi.`,
        'Dengan menggunakan situs ini atau mengirim formulir kontak, Anda menyatakan telah membaca kebijakan ini.',
      ],
    },
    {
      id: 'data-yang-dikumpulkan',
      title: 'Data yang kami kumpulkan',
      body: [
        'Kami hanya mengumpulkan data yang Anda berikan sendiri atau yang diperlukan agar situs berjalan:',
        {
          list: [
            'Data yang Anda isi di formulir kontak: nama, alamat email, nomor telepon atau WhatsApp, jenis dan tanggal acara, serta isi pesan.',
            'Pesan yang Anda kirim langsung kepada kami melalui WhatsApp, telepon, atau email.',
            'Data teknis dasar yang tercatat otomatis oleh server, seperti alamat IP, jenis peramban, dan waktu akses, untuk menjaga keamanan dan kestabilan situs.',
          ],
        },
        'Kami tidak meminta data sensitif seperti nomor identitas, data keuangan, atau data kesehatan melalui situs ini.',
      ],
    },
    {
      id: 'tujuan-penggunaan',
      title: 'Tujuan penggunaan data',
      body: [
        {
          list: [
            'Menanggapi pertanyaan dan permintaan konsultasi Anda.',
            'Menyusun gambaran konsep dan penawaran untuk acara Anda.',
            'Menghubungi Anda kembali terkait permintaan yang Anda ajukan.',
            'Mencegah penyalahgunaan, termasuk pesan spam, dan menjaga keamanan situs.',
          ],
        },
        'Kami tidak menjual data pribadi Anda dan tidak memakainya untuk iklan pihak lain.',
      ],
    },
    {
      id: 'dasar-pemrosesan',
      title: 'Dasar pemrosesan',
      body: [
        'Kami memproses data Anda berdasarkan persetujuan yang Anda berikan saat mengirim formulir atau menghubungi kami, serta kepentingan sah kami untuk menjaga keamanan situs. Anda dapat menarik persetujuan kapan saja dengan menghubungi kami.',
      ],
    },
    {
      id: 'pihak-ketiga',
      title: 'Layanan pihak ketiga',
      body: [
        'Untuk menjalankan situs, kami memakai penyedia layanan berikut. Data Anda hanya diteruskan sebatas yang dibutuhkan untuk layanan tersebut:',
        {
          list: [
            'Vercel untuk hosting situs.',
            'Neon untuk penyimpanan basis data.',
            'Resend untuk mengirim email notifikasi dan balasan.',
            'Cloudinary untuk menyimpan dan menampilkan gambar.',
            'Google Maps untuk menampilkan peta lokasi di halaman Kontak.',
            'WhatsApp, bila Anda memilih menghubungi kami lewat tombol WhatsApp. Percakapan tunduk pada kebijakan WhatsApp.',
          ],
        },
        'Penyedia layanan ini memiliki kebijakan privasi sendiri. Sebagian dari mereka dapat memproses data di luar Indonesia.',
      ],
    },
    {
      id: 'cookie',
      title: 'Cookie',
      body: [
        'Situs ini tidak memasang cookie pelacak atau iklan. Cookie yang kami pakai hanya cookie teknis yang diperlukan agar fitur situs berjalan, misalnya sesi login pengelola situs.',
        'Peta Google di halaman Kontak dapat memasang cookie dari Google ketika dimuat. Anda dapat mengatur atau menghapus cookie melalui pengaturan peramban.',
      ],
    },
    {
      id: 'penyimpanan-keamanan',
      title: 'Penyimpanan dan keamanan',
      body: [
        'Kami menyimpan data Anda selama diperlukan untuk menanggapi permintaan Anda dan menjalankan kerja sama yang mengikutinya, atau selama diwajibkan oleh peraturan yang berlaku. Setelah tidak diperlukan, data dihapus atau dianonimkan.',
        'Kami menerapkan langkah pengamanan yang wajar, seperti koneksi terenkripsi (HTTPS) dan pembatasan akses ke data hanya bagi pihak yang berkepentingan. Meski demikian, tidak ada sistem yang sepenuhnya bebas risiko.',
      ],
    },
    {
      id: 'hak-anda',
      title: 'Hak Anda',
      body: [
        'Sebagai pemilik data pribadi, Anda berhak untuk:',
        {
          list: [
            'meminta akses dan salinan data pribadi Anda yang kami simpan;',
            'meminta perbaikan data yang tidak akurat;',
            'meminta penghapusan data atau menarik persetujuan pemrosesan;',
            'mengajukan keberatan atas pemrosesan data Anda.',
          ],
        },
        'Kami akan menanggapi permintaan tersebut dalam waktu yang wajar setelah identitas Anda kami pastikan.',
      ],
    },
    {
      id: 'anak',
      title: 'Data anak',
      body: ['Situs ini ditujukan bagi orang dewasa. Kami tidak sengaja mengumpulkan data pribadi anak. Bila Anda mengetahui ada data anak yang terkirim kepada kami, hubungi kami agar dapat segera dihapus.'],
    },
    {
      id: 'perubahan',
      title: 'Perubahan kebijakan',
      body: ['Kami dapat memperbarui kebijakan ini sewaktu-waktu. Versi terbaru selalu ada di halaman ini, dengan tanggal pembaruan di bagian atas.'],
    },
    {
      id: 'kontak',
      title: 'Hubungi kami',
      body: ['Untuk pertanyaan atau permintaan terkait data pribadi Anda, hubungi kami melalui:', ...(contact.length ? [{ list: contact }] : [])],
    },
  ];
}
