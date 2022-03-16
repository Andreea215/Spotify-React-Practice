import { useCallback } from "react";

import useHttp from "./use-http";
import { authToken } from "../../utils/user-Data";

const useDataRequests = () => {
  const { error, sendRequest } = useHttp();

  const getPlaylistId = (data: any) => {
    return data.id;
  }
  
  const createEmptyPlaylist = async(title: string, description: string, userId: string) => {
    const playlistId = await sendRequest({
      url: `https://api.spotify.com/v1/users/${userId}/playlists`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken()}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: title,
        description: description,
        public: false,
      }),
    }, getPlaylistId, true);
    return playlistId;
  }

  const processTopArtistsData = useCallback((data: any) => {
    const topArtistsResponse = data.items;
    const topArtists: {name: string, id: string, url: string}[] = topArtistsResponse.reduce((acc: {}[], value: {name: string, id: string, images: {url: string}[]}) => {
      acc.push({
        name: value.name,
        id: value.id,
        url: value.images[1].url,
      });
      return acc;
    }, []);
    return topArtists;
  }, []);

  const getTopArtists = useCallback(async () => {
    const topArtists = await sendRequest({
      url: 'https://api.spotify.com/v1/me/top/artists?limit=10&time_range=long_term',
      headers: {
        'Authorization': `Bearer ${authToken()}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }, processTopArtistsData, true);
    return topArtists;
  }, [sendRequest, processTopArtistsData]);

  const processTracks = (data: any) => {
    const topTracks = data.tracks;
    const tracksUris = [];
    for (let track of topTracks) {
      tracksUris.push(track.uri);
    }
    return tracksUris;
  }

  const addArtistsTopTracksToPlaylist = async (artistsIds: Set<string> | string[], playlistId: string) => {
    for (let artistId of artistsIds.values()) {
      const tracksUris = await sendRequest({
        url: `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=RO`,
        headers: {
          'Authorization': `Bearer ${authToken()}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      }, processTracks, true);
      sendRequest({
        url: `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken()}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'uris': tracksUris,
        }),
      })
    }
  }

  const upsertPlaylistCollection = ( userId: string, playlistId: string, playlistType: string) => {
    sendRequest({
      url: `https://react-http-101b0-default-rtdb.europe-west1.firebasedatabase.app/playlistCollection/${userId}/${playlistId}.json`,
      method: 'PUT',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        playlistType,
      }),
    });
  }

  return {
    addArtistsTopTracksToPlaylist,
    createEmptyPlaylist,
    getTopArtists,
    upsertPlaylistCollection,
    spotifyError: error
  }
}

export default useDataRequests;