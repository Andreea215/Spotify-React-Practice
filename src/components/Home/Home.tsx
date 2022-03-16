import Header from '../Layout/Header/Header';
import FlipCard from '../UI/FlipCard';

import classes from './Home.module.css';

const Home = () => {
  return (
    <>
      <Header />
      <main>
        <div className={classes.home}>
          <section className="main-section">
            <ul className={classes["menu-wrapper"]}>
              <li>
                <FlipCard 
                  title={'Create your own'}
                  description={'Listen to the top hits of your favorite artists'}
                  link={'./create-own'}
                />
              </li>
              <li>
                <FlipCard 
                  link={"./music-festival"} 
                  title={'Music Festival'}
                  description={'Receive a fully personalized festival just for you'}
                />
              </li>
              <li>
                <FlipCard 
                  link={"./around-world"} 
                  title={'Around the World'}
                  description={'Discover the top hits around the world'}
                />
              </li>
            </ul>
          </section>
        </div>
      </main>
    </>
  );
}

export default Home;