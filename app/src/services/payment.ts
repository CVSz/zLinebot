import QRCode from "qrcode";

export async function promptpayQR(amount: number) {
  const payload = `000201010211...${amount}`;
  return QRCode.toDataURL(payload);
}
