import { Route, Switch, Redirect } from 'react-router-dom';

import Footer from './components/Layout/Footer/Footer';
import Home from './components/Home/Home';
import Auth from './components/Auth/Auth';
import CreateOwn from './components/CreateOwn/CreateOwn';
import MusicFestival from './components/MusicFestival/MusicFestival';
import AroundTheWorld from './components/AroundTheWorld/AroundTheWorld';
import History from './components/History/History';

import { AppWrapper } from './context/AppProvider';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <AppWrapper>
      <>
        <ScrollToTop />
        <Switch>
          <Route path='/' exact>
            <Redirect to='/home' />
          </Route>
          <Route path='/home'>
            <Home />
          </Route>
          <Route path='/auth'>
            <Auth />
          </Route>
          <Route path='/create-own'>
            <CreateOwn />
          </Route>
          <Route path='/music-festival'>
            <MusicFestival />
          </Route>
          <Route path='/around-world'>
            <AroundTheWorld />
          </Route>
          <Route path='/history'>
            <History />
          </Route>
        </Switch>
        <Footer />
      </>
    </AppWrapper>
  );
}

export default App;
