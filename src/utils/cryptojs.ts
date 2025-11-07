import CryptoJS from 'crypto-js'
const key = CryptoJS.enc.Utf8.parse('123456789asdfghj') // 十六位十六进制数作为密钥
const iv = CryptoJS.enc.Utf8.parse('asdfghj123456789') // 十六位十六进制数作为密钥偏移量
/* 加密 */
export function encrypt(word: any) {
  const srcs = CryptoJS.enc.Utf8.parse(word)
  const encrypted = CryptoJS.AES.encrypt(srcs, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 })
  return encrypted.ciphertext.toString().toUpperCase()
}

/* 解密 */
export function decrypt(word: any) {
  const encryptedHexStr = CryptoJS.enc.Hex.parse(word)
  const srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr)
  const decrypt = CryptoJS.AES.decrypt(srcs, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 })
  const decryptedStr = decrypt.toString(CryptoJS.enc.Utf8)
  return decryptedStr.toString()
}