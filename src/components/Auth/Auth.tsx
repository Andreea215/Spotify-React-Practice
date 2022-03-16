import classes from './Auth.module.css';

import {
  useCallback,
  useEffect,
  useState
} from "react";

import { useAppContext } from "../../context/AppProvider";
import { setStorage } from "../../context/AppReducer";
import redirectToAuthEndpoint, {client_id, redirect_uri} from "../../utils/redirectToAuthEndpoint"; 
import useHttp from "../hooks/use-http";

export default function Auth() {
  const {state, dispatch} = useAppContext();
  const [isProcessed, setIsProcessed] = useState(false);

  const processTokenResponse = useCallback((data: any) => {
    const t = new Date();
    
    dispatch(setStorage({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: (t.setSeconds(t.getSeconds() + data.expires_in)).toString(),
    }));
    
    setIsProcessed(true);
  }, [dispatch]);

  useEffect(()=>{
    if(isProcessed) {
      localStorage.setItem('access_token', state.access_token);
      localStorage.setItem('refresh_token', state.refresh_token);
      localStorage.setItem('expires_at', state.expires_at);

      return () => setIsProcessed(false);
    }
  }, [isProcessed, state]);

  const { sendRequest } = useHttp();

  const exchangeToken = useCallback(async (code: string) => {
    const code_verifier = localStorage.getItem('code_verifier');
    await sendRequest({
      url: 'https://accounts.spotify.com/api/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id,
        grant_type: 'authorization_code',
        code,
        redirect_uri,
        code_verifier,
      } as any),
    }, processTokenResponse);

    window.history.replaceState({}, document.title, '/auth');
    window.location.replace('http://127.0.0.1:3000/home');
  }, [processTokenResponse, sendRequest]);

  // If the user has accepted the authorize request spotify will come back to your application with the code in the response query string
  // Example: http://127.0.0.1:8080/?code=NApCCg..BkWtQ&state=profile%2Factivity
  useEffect(() => {
    const args = new URLSearchParams(window.location.search);
    const code = args.get('code');

    if (code) {
      // we have received the code from spotify and will exchange it for a access_token
      exchangeToken(code);
    }
  }, [exchangeToken]);

  return (
    <div className={classes['auth-bg']}>
      <header>
        <section>
          <h1 className="main-title">Welcome to Festival Generator!</h1>
        </section>
      </header>
      <main>
        <section className="main-section">
          <button onClick={redirectToAuthEndpoint} aria-describedby="sign-in" type="button" className="main-button">
            Log in with Spotify
          </button>
        </section>
      </main>
    </div>
  )
}
