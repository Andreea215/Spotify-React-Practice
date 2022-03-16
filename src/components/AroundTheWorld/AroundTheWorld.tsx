import { useEffect, useState, useRef } from "react";
import { useHistory } from "react-router-dom";

import useHttp from "../hooks/use-http";
import useDataRequests from "../hooks/useDataRequests";
import { categoryIdMap, getCountryCodesMap } from "../../utils/MarketData";
import { authToken } from "../../utils/user-Data";

import ConfirmationModule from "../UI/ConfirmationModule";
import Header from "../Layout/Header/Header";

const AroundTheWorld = () => {
  const history = useHistory();

  const { error, sendRequest } = useHttp();
  const { spotifyError, upsertPlaylistCollection } = useDataRequests();
  
  const [userId, setUserId] = useState('');
  const [marketCodes, setMarketCodes] = useState(() => new Map<string, string>());
  const [submitted, setSubmitted] = useState(false);

  const getUserIdHandler = async (currentUserId: string) => {
    if (currentUserId) {
      setUserId(currentUserId);
    } else {
      history.replace('./auth');
    }
  };

  useEffect(() => {
    const accessToken = authToken();
    if ( !accessToken ) {
      history.replace('./auth');
    }
  }, [history]);

  const asyncMarketCodes = async() => {
    const marketCodesMap = await getCountryCodesMap();
    setMarketCodes(() => marketCodesMap);
  }

  useEffect(() => {
    asyncMarketCodes();
  }, []);

  const followCountryPlaylist = async (data: any) => {
    const totalPlaylists = data.playlists.items.length;
    const randomNum = Math.floor(Math.random() * (totalPlaylists));
    const playlistId = data.playlists.items[randomNum].id;
    sendRequest({
      url: `https://api.spotify.com/v1/playlists/${playlistId}/followers`,
      method:'PUT', 
      headers: {
        'Authorization':`Bearer ${authToken()}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    return playlistId;
  }

  const countryRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLInputElement>(null);

  const submitHandler = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    const country = countryRef.current?.value;
    const category = categoryRef.current?.value;
    
    if (country && category) {
      const countryCode = marketCodes.get(country);
      const categoryId = categoryIdMap.get(category);
      const playlistId = await sendRequest({
        url: `https://api.spotify.com/v1/browse/categories/${categoryId}/playlists?country=${countryCode}&limit=2`,
        headers: {
          'Authorization':`Bearer ${authToken()}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'}
      }, followCountryPlaylist, true);
      playlistId && upsertPlaylistCollection(userId, playlistId, 'around-the-world');
    } else {
      return;
    }
    setSubmitted(true);
  }

  const resetForm = () => {
    countryRef.current!.value="";
    categoryRef.current!.value="";
    setSubmitted(false); 
    window.scrollTo(0, 0);
  }

  const redirectToPage = () => {
    window.location.reload();
  }

  const renderCountryOptions = () => {
    let optionsArray: JSX.Element[] = [];
    marketCodes.forEach((code, name) => optionsArray.push(<option key={code} value={name}></option>));
    return optionsArray;
  }

  const renderCategoryOptions = () => {
    let optionsArray: JSX.Element[] = [];
    categoryIdMap.forEach((id, name) => optionsArray.push(<option key={id} value={name}></option>));
    return optionsArray;
  }
  
  return (
    <>
      <Header onGetUserId={getUserIdHandler} />
      <main>
        <section className="main-section">
          <form onSubmit={submitHandler} className="form">
            <h1>Your festival awaits</h1>
            <label className="label required" htmlFor="country">Country </label>
            <input className="input" list="countriesList" ref={countryRef} autoComplete="off" required />
            <datalist id="countriesList">
              {marketCodes && renderCountryOptions()}
            </datalist>
            <label className="label required" htmlFor="category">Category </label>
            <input className="input" list="categoryList" ref={categoryRef} autoComplete="off" required />
            <datalist id="categoryList">
              {categoryIdMap && renderCategoryOptions()}
            </datalist>
            <button type="submit" className="main-button">Submit</button>
          </form>
        </section>
        {(spotifyError || error) ? <ConfirmationModule 
          message="Something went wrong, please try again later" 
          form="create-own-form" 
          success={false}
          clickHandler={redirectToPage}
        />: ''}
        {submitted && (!spotifyError && !error) && <ConfirmationModule
          message="Your playlist has been created!"
          form="create-own-form" 
          success={true}
          clickHandler={resetForm}
        />}
      </main>
    </>
  );
}

export default AroundTheWorld;