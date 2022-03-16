import { useCallback, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";

import { authToken } from "../../utils/user-Data";
import useHttp from "../hooks/use-http";
import useDataRequests from "../hooks/useDataRequests";

import Header from "../Layout/Header/Header";
import ConfirmationModule from "../UI/ConfirmationModule";

import classes from './CreateOwn.module.css';

const CreateOwn = () => {
  const history = useHistory();

  const { error, sendRequest } = useHttp();
  const { spotifyError, createEmptyPlaylist, addArtistsTopTracksToPlaylist, getTopArtists, upsertPlaylistCollection } = useDataRequests();
  const [userId, setUserId] = useState('');
  
  const [isTitleValid, setTitleValid] = useState(true);
  const [isDescriptionValid, setDescriptionValid] = useState(true);

  const [topArtistsArray, setTopArtistsArray] = useState<{name: string, id: string, url: string}[]>([]);
  const [relatedArtistsArray, setRelatedArtistsArray] = useState<{name: string, id: string, url: string}[]>([]);
  const [checkedSet, setCheckedSet] = useState(() => new Set<string>());
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

  const processRelatedArtistsData = useCallback((data: any) => {
    const relatedArtistsResponse = data.artists;
    const relatedArtists: {name: string, id: string, url: string}[] = relatedArtistsResponse.reduce((acc: {}[], value: {name: string, id: string, images: {url: string}[]}) => {
      acc.push({
        name: value.name,
        id: value.id,
        url: value.images[1].url,
      });
      return acc;
    }, []);
    setRelatedArtistsArray(relatedArtists);
  }, []);

  const getRelatedArtists = useCallback((topArtists: {name: string, id: string, url: string}[]) => {
    const randomIndex = Math.floor(Math.random() * 4);
      const artistId = topArtists[randomIndex].id;
      sendRequest({
        url: `https://api.spotify.com/v1/artists/${artistId}/related-artists`,
        headers: {
          'Authorization': `Bearer ${authToken()}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }, processRelatedArtistsData);
      setTopArtistsArray(topArtists);
  }, [sendRequest, processRelatedArtistsData]);

  useEffect(() => {
    getTopArtists().then((topArtists)=>{
      getRelatedArtists(topArtists);
    });
  }, [getTopArtists, getRelatedArtists]);
  
  const totalArtistsArray = topArtistsArray.concat(relatedArtistsArray);

  const descriptionRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  const titleValidationHandler = () => {
    if(titleRef.current?.value.trim().length === 0) {
      setTitleValid(false);
      titleRef.current.focus();
    } else {
      setTitleValid(true);
    }
  }

  const descriptionValidationHandler = () => {
    if(descriptionRef.current?.value.trim().length === 0) {
      setDescriptionValid(false);
      descriptionRef.current.focus();
    } else {
      setDescriptionValid(true);
    }
  }

  const formIsValid = isDescriptionValid && isTitleValid;

  const titleInputClasses = isTitleValid ? `` : `invalid`;
  const descriptionInputClasses = isDescriptionValid ? `` : `invalid`;

  const handleCheckboxChange = (event: React.FormEvent<HTMLInputElement>) => {
    const artistId = event.currentTarget.id;
    checkedSet.has(artistId) ? 
    setCheckedSet(prev => {
      const next = new Set(prev); 
      next.delete(artistId); 
      return next;
    }) : 
    setCheckedSet(prev => new Set(prev).add(artistId));
  }

  const submitHandler = async (event: React.SyntheticEvent) => {
    event.preventDefault();

    const title = titleRef.current!.value;
    const description = descriptionRef.current!.value;

    if(!formIsValid) {
      return;
    } 
    const playlistId = await createEmptyPlaylist(title, description, userId);
    await addArtistsTopTracksToPlaylist(checkedSet, playlistId);
    playlistId && upsertPlaylistCollection(userId, playlistId, 'create-own-festival');
    setSubmitted(true);
  }

  const resetForm = () => {
    setCheckedSet(() => new Set());
    descriptionRef.current!.value="My favorite artists' top tracks";
    titleRef.current!.value="My playlist";
    setSubmitted(false); 
    window.scrollTo(0, 0);
  }

  const redirectToPage = () => {
    window.location.reload();
  }
  
  return (
    <>
      <Header onGetUserId={getUserIdHandler} />
      <main>
        <section className="main-section">
          <h1>Choose your favorite artists</h1>
          <form className="form form-desktop" id="create-own-form" onSubmit={submitHandler}>
            <div>
              <div className={titleInputClasses}>
                <label className="label" htmlFor="name">Name your playlist</label>
                <input 
                  ref={titleRef}
                  onBlur={titleValidationHandler}
                  className={`input small-input`} 
                  name="name" 
                  id="name" 
                  defaultValue={'My playlist'} 
                  placeholder="My playlist" 
                  type="text" />
                {!isTitleValid && <p className="small-p">Input cannot be empty</p>}
              </div>
              <div className={descriptionInputClasses}>
                <label className="label" htmlFor="description">Name your playlist</label>
                <input 
                  ref={descriptionRef} 
                  onBlur={descriptionValidationHandler}
                  className={`input small-input`}
                  name="description" 
                  id="description" 
                  defaultValue={'My favorite artists\' top tracks'} 
                  placeholder="My favorite artists' top tracks" 
                  type="text" />
                {!isDescriptionValid && <p className="small-p">Input cannot be empty</p>}
              </div>
            </div>
            <div className={classes["create-own-form-inner"]} role="group" aria-label="choose-artists">
            {totalArtistsArray && totalArtistsArray.map((artist) => {
              return (
                <label className={classes["checkbox-label"]} key={artist.id}>
                  <input 
                    type='checkbox' 
                    id={artist.id} 
                    name={artist.name}
                    onChange={handleCheckboxChange}
                    checked={checkedSet.has(artist.id)}
                    className={classes["default-checkbox"]}
                  />
                  <span className={classes["custom-checkbox"]}>
                    <img width='200' height='200' alt={artist.name} src={artist.url} />
                  </span>
                  <span className={classes["checkbox-artist-name"]}>{artist.name}</span>
                </label>
              );
            })}
            </div>
            <button type="submit" className="main-button">Submit</button>
          </form>
        </section>
        {(error || spotifyError) && <ConfirmationModule 
          message="Something went wrong, please try again later" 
          form="create-own-form" 
          success={false}
          clickHandler={redirectToPage}
        />}
        {submitted && (!error || !spotifyError) && <ConfirmationModule
          message="Your playlist has been created!"
          form="create-own-form" 
          success={true}
          clickHandler={resetForm}
        />}
      </main>
    </>
  );
}

export default CreateOwn;