import classes from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={classes.footer}>
        <div className={classes.footer_first}>
          <p className={classes.footer_name}>Music Festival</p>
          <p className="big-p">An app that helps you create festival-like playlists</p>
          <p>&copy; Music Festival 2021</p>
        </div>
        
        <ul className={classes.footer_second}>
          <li>
          <h2>USEFUL LINKS</h2>
      
          <ul className={classes.nav__ul}>
            <li>
              <a href="./create-own.html">Create your own festival</a>
            </li>
    
            <li>
              <a href="./music-festival.html">Let us create your festival</a>
            </li>
                
            <li>
              <a href="./around-world.html">Discover music around the world</a>
            </li>

            <li>
              <a href="./playlists-list.html">My playlists history</a>
            </li>
          </ul>
        </li>
        <li>
          <h2 className="green_text">CONTACT US</h2>
          
          <ul className={`${classes.nav__ul} ${classes.nav_contact}`}>
            <li>
              <i className="fa fa-phone"></i>
              <a href="tel:0372-363-282">0372 363 282</a>
            </li>
            <li>
              <address>
                <i className="fa fa-map-marker"></i>
                <a href="https://goo.gl/maps/qGd82gseArFtuDms9">
                  United Business Center 1, Strada Teodor Mihali nr. 64, Cluj-Napoca 400616
                </a>
              </address>
            </li>
          </ul>
        </li>

        <li>
          <h2>LET'S GET SOCIAL</h2>
          
          <ul className={classes.nav__ul}>
            <li><a href="https://www.facebook.com/endava/">Facebook</a></li>
            <li><a href="https://www.instagram.com/endava/?hl=en">Instagram</a></li>
            <li><a href="https://twitter.com/endava">Twitter</a></li>
            <li><a href="https://www.linkedin.com/company/endava">LinkedIn</a></li>
            <li>
              <span>Made with ♥ <span className="green_text">remotely</span> from Cluj-Napoca</span>
            </li>
          </ul>
        </li>
        </ul>
    </footer>
  )
}