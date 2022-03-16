import React, { useState, useCallback, useEffect } from 'react';
import { NavLink, useHistory } from 'react-router-dom';

import accessTimeout from "../../../utils/accessTimeout";
import { useAppContext } from "../../../context/AppProvider";
import { clearStorage } from "../../../context/AppReducer";
import { authToken } from "../../../utils/user-Data";
import useHttp from "../../hooks/use-http";

import classes from './Header.module.css';

const Header: React.FC<{onGetUserId?: (data: any) => Promise<void>}> = ({onGetUserId}) => {
  const history = useHistory();
  const { dispatch } = useAppContext();
  const { sendRequest } = useHttp();
  const [ userDisplayName, setUserDisplayName ] = useState('');
  const [ userId, setUserId ] = useState('');

  const [menuIsOpen, setMenuIsOpen] = useState(false);

  function openMenuHandler() {
    setMenuIsOpen(!menuIsOpen);
  }
  
  const getUserData = async (data: any) => {
    const userName = await data['display_name'];
    const currentUserId = await data.id;

    setUserDisplayName(userName);
    setUserId(currentUserId);
  };

  const getCurrentUserData = useCallback( async () => {  
    sendRequest({
      url: 'https://api.spotify.com/v1/me',
      headers: {
        'Authorization': `Bearer ${authToken()}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }, getUserData);
  }, [sendRequest]);

  useEffect(() => {
    const loggedIn = accessTimeout(dispatch);
    if (loggedIn) {
      setUserDisplayName('');
    }
  }, [dispatch]);

  useEffect(() => {
    if ( authToken() ) {
      getCurrentUserData();
    }
  }, [getCurrentUserData]);

  useEffect(() => {
    if (onGetUserId && userId) {
      onGetUserId(userId);
    }
  }, [userId, onGetUserId]);

  const logoutHandler = () => {
    dispatch(clearStorage());
    setUserDisplayName('');
    localStorage.setItem('access_token', '');
    localStorage.setItem('refresh_token', '');
    localStorage.setItem('expires_at', '');
    localStorage.setItem('code_verifier', '');
    history.push('./auth');
  }

  const hamburgerClasses = menuIsOpen ? `${classes.hamburger} ${classes.active}` : `${classes.hamburger}`;
  const navMenuClasses = menuIsOpen ? `${classes['nav-menu']} ${classes.active}` : `${classes['nav-menu']}`;

  return (
    <header className={classes.header}>
      <nav className={classes.navbar} id="navbar">
        <p className="big-p" id="greeting">{userDisplayName ? `Hello, ${userDisplayName}!` : 'Hello!'}</p>
        <ol className={navMenuClasses}>
          <li className={classes['nav-item']}>
            <NavLink to="./home"><p className="medium-p">Home</p></NavLink>
          </li>
          <li className={classes['nav-item']}>
            <NavLink to="./history"><p className="medium-p">My playlists</p></NavLink>
          </li>
          <li className={classes['nav-item']}>
            {userDisplayName ? <button className={classes['reset-button']} onClick={logoutHandler}><p className="medium-p">Log out</p></button>: <NavLink to="./auth"><p className="medium-p">Log in</p></NavLink>}
          </li>
        </ol>
        <div onClick={openMenuHandler} className={hamburgerClasses}>
          <span className={classes.bar}></span>
          <span className={classes.bar}></span>
          <span className={classes.bar}></span>
        </div>
      </nav>
    </header>
  );
}

export default Header;