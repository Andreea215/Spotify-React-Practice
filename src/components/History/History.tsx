import { useEffect, useState, useCallback } from "react";
import { NavLink, useHistory } from "react-router-dom";

import useHttp from "../hooks/use-http";
import { authToken } from "../../utils/user-Data";

import Header from "../Layout/Header/Header";
import ConfirmationModule from "../UI/ConfirmationModule";

import happyBird from "./happy-bird.svg";

const History = () => {
  const history = useHistory();
  const { error, sendRequest } = useHttp();

  const [playlistsObj, setPlaylistsObj] = useState<{url: string, img: string, name: string}[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const [userId, setUserId] = useState('');

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

  const processUserPlaylistsIds = (data: any) => {
    const userPlaylistsIdsSet = new Set<string>();
    for(const playlistId in data) {
      userPlaylistsIdsSet.add(playlistId);
    }
    return userPlaylistsIdsSet;
  }

  const getDBUserPlaylistsIds = useCallback(async(userId: string) => {
    const dbUserPlaylistsIdsSet = await sendRequest({
      url:`https://react-http-101b0-default-rtdb.europe-west1.firebasedatabase.app/playlistCollection/${userId}/.json`,
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
      },
    }, processUserPlaylistsIds, true);
    return dbUserPlaylistsIdsSet;
  }, [sendRequest]);

  const getIds = (data: any) => {
    return data.items;
  }

  const getSpotifyUserPlaylistsIdsSet = useCallback(async() => {
    const spotifyUserPlaylistsIds = await sendRequest({
      url: 'https://api.spotify.com/v1/me/playlists?limit=50',
      'headers': {
        'Authorization': `Bearer ${authToken()}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }, getIds, true);
    return spotifyUserPlaylistsIds;
  }, [sendRequest]);

  const removeDeletedPlaylists = useCallback((removedPlaylistsIds: Set<string>) => {
    console.log(...removedPlaylistsIds);
    for (const playlistId of removedPlaylistsIds) {
      if (playlistId && userId) {
      console.log('delete from firebase', playlistId);
        sendRequest({
          url: `https://react-http-101b0-default-rtdb.europe-west1.firebasedatabase.app/playlistCollection/${userId}/${playlistId}.json`,
          method: 'DELETE',
          headers: {
            'Accept': '*/*',
            'Content-Type': 'application/json',
          },
        });
      }
    }
  }, [sendRequest, userId]);
  

  const updatePlaylistsIdsList = useCallback(async() => {
    const dbUserPlaylistsIdsSet: Set<string> = await getDBUserPlaylistsIds(userId);
    const spotifyUserPlaylists = await getSpotifyUserPlaylistsIdsSet();
    
    for (const playlist of spotifyUserPlaylists) {
      if (dbUserPlaylistsIdsSet.has(playlist.id)) {
        setPlaylistsObj((prev) => { return [...prev, {
          url: playlist.external_urls.spotify, 
          img: playlist.images[0].url,
          name: playlist.name
        }]});
        dbUserPlaylistsIdsSet.delete(playlist.id);
      }
    }
    removeDeletedPlaylists(dbUserPlaylistsIdsSet);
    setIsLoaded(true);

  }, [getDBUserPlaylistsIds, getSpotifyUserPlaylistsIdsSet, removeDeletedPlaylists, userId]);

  useEffect(() => {
    if (userId) {
      updatePlaylistsIdsList();
    }
  }, [userId, updatePlaylistsIdsList]);

  const redirectToPage = () => {
    history.push('./home');
  }

  return (
    <>
      <Header onGetUserId={getUserIdHandler} />
      <main>
        <section className="main-section">
          <h1>History</h1>
          <div className="playlist-list-wrapper">
            {playlistsObj && playlistsObj.map((playlist, index) => (
            <div 
              className="artist-card open-playlist" 
              style={{backgroundImage: `url('${playlist.img}')`}} 
              onClick={()=>{window.open(playlist.url, '_blank')?.focus()}}
              key={index}
            >
              <p>{playlist.name}</p>
            </div>))}
          </div>
          {isLoaded && !playlistsObj.length && <div className="happy-bird">
            <img alt='name' src={happyBird}/>
            <div className="message">
              <p className="big-p">You have no playlists</p>
              <NavLink to="./home" className="inline-link">
                <p className="big-p">Let's create some!</p>
              </NavLink>
            </div>
          </div>}
        </section>
        {(error) ? <ConfirmationModule 
          message="Something went wrong, please try again later" 
          form="create-own-form" 
          success={false}
          clickHandler={redirectToPage}
        />: ''}
      </main>
    </>
  );
}

export default History;