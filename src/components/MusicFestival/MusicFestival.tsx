import { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";

import { authToken } from "../../utils/user-Data";
//import useHttp from "../hooks/use-http";
import useDataRequests from "../hooks/useDataRequests";

import Header from "../Layout/Header/Header";
import ConfirmationModule from "../UI/ConfirmationModule";

const MusicFestival = () => {
  const history = useHistory();

  const { spotifyError, createEmptyPlaylist, addArtistsTopTracksToPlaylist, getTopArtists, upsertPlaylistCollection } = useDataRequests();
  //const { error, sendRequest } = useHttp();
  
  const [isTitleValid, setTitleValid] = useState(true);
  const [isDescriptionValid, setDescriptionValid] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [userId, setUserId] = useState('');

  const [topArtistsArray, setTopArtistsArray] = useState<{name: string, id: string, url: string}[]>([]);

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

  const submitHandler = async (event: React.SyntheticEvent) => {
    event.preventDefault();

    const title = titleRef.current!.value;
    const description = descriptionRef.current!.value;

    if(!formIsValid) {
      return;
    } 
    const playlistId = await createEmptyPlaylist(title, description, userId);
    const topArtists = await getTopArtists();
    setTopArtistsArray(topArtists);
    const artistsIds: string[] = topArtists.reduce((acc: string[], value: {name: string, id: string, url: string}) => {
      acc.push(value.id);
      return acc;
    }, []);
    addArtistsTopTracksToPlaylist(artistsIds, playlistId);
    playlistId && upsertPlaylistCollection(userId, playlistId, 'music-festival');
    setOpenModal(true);
  }

  const resetForm = () => {
    descriptionRef.current!.value="The coolest playlist";
    titleRef.current!.value="My festival";
    setOpenModal(false); 
    setSubmitted(true);
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
          <h1>Your festival awaits!</h1>
          {!submitted && <form className="form form-desktop" id="create-own-form" onSubmit={submitHandler}>
            <div>
              <div className={titleInputClasses}>
                <label className="label" htmlFor="name">Name your playlist</label>
                <input 
                  ref={titleRef}
                  onBlur={titleValidationHandler}
                  className={`input small-input`} 
                  name="name" 
                  id="name" 
                  defaultValue={'My festival'} 
                  placeholder="My festival" 
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
                  defaultValue={'The coolest playlist'} 
                  placeholder="The coolest playlist" 
                  type="text" />
                {!isDescriptionValid && <p className="small-p">Input cannot be empty</p>}
              </div>
            </div>
            <button disabled={!formIsValid} type="submit" className="main-button">Submit</button>
          </form>}
          <div className="line-up-wrapper">
            {topArtistsArray && topArtistsArray.map((artist, index) => (
              <div className="artist-card" style={{backgroundImage: `url('${artist.url}')`}} key={index}>
                <p>{`${index + 10}-${index + 11}`}</p>
                <p>{artist.name}</p>
              </div>
            ))}
          </div>
        </section>
        {spotifyError && <ConfirmationModule 
          message="Something went wrong, please try again later" 
          form="create-own-form" 
          success={false}
          clickHandler={redirectToPage}
        />}
        {openModal && !spotifyError && <ConfirmationModule
          message="Your playlist has been created!"
          form="create-own-form" 
          success={true}
          clickHandler={resetForm}
        />}
      </main>
    </>
  )
}

export default MusicFestival;