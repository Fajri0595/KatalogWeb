const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  // Hanya izinkan POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const pesanan = req.body;
    if (!pesanan || !pesanan.email) {
      return res.status(400).json({ success: false, message: 'Data pesanan tidak lengkap' });
    }

    // Jika SMTP dikonfigurasi di Environment Variable Vercel
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      const emailHtml = 
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #0F172A;">Konfirmasi Pesanan - </h2>
          <p>Halo <b></b>,</p>
          <p>Terima kasih! Pesanan Anda telah kami terima dan saat ini sedang menunggu verifikasi pembayaran.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0;">
          <p><b>Nomor Pesanan:</b> </p>
          <p><b>Total Pembayaran:</b> Rp </p>
          <p><b>Status:</b> </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0;">
          <p style="font-size: 13px; color: #64748B;">Admin akan memproses pesanan Anda secepatnya. Anda juga dapat mengecek status pesanan melalui menu Cek Status Pesanan di website.</p>
        </div>
      ;

      await transporter.sendMail({
        from: "" <>,
        to: pesanan.email,
        subject: [] Pesanan Anda Sedang Diproses,
        html: emailHtml
      });
    }

    return res.status(200).json({ success: true, message: 'Notifikasi berhasil diproses' });
  } catch (error) {
    console.error('Error notifikasi pesanan:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};