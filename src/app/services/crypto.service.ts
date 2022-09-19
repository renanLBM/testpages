import { Injectable } from '@angular/core';

import * as CryptoJS from 'crypto-js';
import { environment } from 'src/environments/environment';

const ENCRIPT_KEY = environment.ENCRIPT_KEY;

@Injectable({
  providedIn: 'root',
})
export class CryptoService {
  key = CryptoJS.enc.Utf8.parse(ENCRIPT_KEY);
  iv = CryptoJS.enc.Utf8.parse(ENCRIPT_KEY);

  constructor() {}

  msgCrypto(value: string): string {
    var encrypted = CryptoJS.AES.encrypt(
      CryptoJS.enc.Utf8.parse(value),
      this.key,
      {
        keySize: 16,
        iv: this.iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );

    return encrypted.toString();
  }

  msgDecrypto(value: string): string {
    var cipher = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Base64.parse(value.replace('"', '')),
    });
    var decrypted = CryptoJS.AES.decrypt(cipher, this.key, {
      keySize: 16,
      iv: this.iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    const decryptedValue = decrypted.toString(CryptoJS.enc.Utf8);
    return decryptedValue;
  }
}
