import { clearStorage } from "../context/AppReducer";

export default function accessTimeout(clearContext: (callback: {}) => any) {
  const expires_in: string | null = localStorage.getItem('expires_at');
  
  if (!(expires_in?.trim().length === 0)) {
    const expirationTime = parseInt(expires_in as string);
    const presentTime = new Date().getTime();
    const remainingTime = expirationTime - presentTime;
    
    if (remainingTime < 6000) {
      clearContext(clearStorage());
      localStorage.setItem('access_token', '');
      localStorage.setItem('refresh_token', '');
      localStorage.setItem('expires_at', '');
      localStorage.setItem('code_verifier', '');
      return true;
    }
  }
  return false;
}