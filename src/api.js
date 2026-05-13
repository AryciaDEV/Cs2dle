import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// LocalStorage'dan BrowserId'yi al, yoksa yeni oluştur ve kaydet
export const getBrowserId = () => {
  let browserId = localStorage.getItem('cs2dle_browser_id');
  if (!browserId) {
    browserId = uuidv4();
    localStorage.setItem('cs2dle_browser_id', browserId);
  }
  return browserId;
};

// Backend portunu kendi Visual Studio projene göre güncellemelisin (Örn: 5001 veya 7200 vs.)
const API_BASE_URL = 'https://localhost:7276/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});