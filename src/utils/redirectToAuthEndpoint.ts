// Your client id from your app in the spotify dashboard:
// https://developer.spotify.com/dashboard/applications
export const client_id = 'b6d8b343eb144555a940154101c4f479';
export const redirect_uri = 'http://127.0.0.1:3000/auth'; // Your redirect uri

export function generateRandomString(length: number): string {
  let text = '';
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function generateCodeChallenge(codeVerifier: string) {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(codeVerifier)
  );

  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function generateUrlWithSearchParams(url: string, params: {}) {
  const urlObject = new URL(url);
  urlObject.search = new URLSearchParams(params).toString();

  return urlObject.toString();
}

export default async function redirectToAuthEndpoint() {
  const codeVerifier = generateRandomString(64);

  const code_challenge = await generateCodeChallenge(codeVerifier);
  localStorage.setItem('code_verifier', codeVerifier);

  // Redirect to example:
  // GET https://accounts.spotify.com/authorize?response_type=code&client_id=77e602fc63fa4b96acff255ed33428d3&redirect_uri=http%3A%2F%2Flocalhost&scope=user-follow-modify&state=e21392da45dbf4&code_challenge=KADwyz1X~HIdcAG20lnXitK6k51xBP4pEMEZHmCneHD1JhrcHjE1P3yU_NjhBz4TdhV6acGo16PCd10xLwMJJ4uCutQZHw&code_challenge_method=S256

  window.location.href = generateUrlWithSearchParams(
    'https://accounts.spotify.com/authorize',
    {
      response_type: 'code',
      client_id,
      scope:
        'user-modify-playback-state user-read-private user-read-email playlist-modify-public playlist-modify-private user-top-read playlist-read-private',
      code_challenge_method: 'S256',
      code_challenge,
      redirect_uri,
    }
  );
}