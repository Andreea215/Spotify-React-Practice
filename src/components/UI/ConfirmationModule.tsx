import React from "react";
import { NavLink } from "react-router-dom";

import classes from "./ConfirmationModule.module.css";

const ConfirmationModule: React.FC<{message: string, form:string, success: boolean, clickHandler: ()=>void}> = ({message, form, success, clickHandler}) => {
  return(
    <div className={classes["confirmation-overlay"]}>
      <div>
        <p className={classes["big-p confirmation-message"]}>{message}</p>
        {success && <div>
            <p className="medium-p">Open spotify to play it.</p>
            <p className="medium-p"><NavLink className="inline-link" to='./playlist-list'>Or click here to view your playlist</NavLink></p>
          </div>}
        <button onClick={clickHandler} form={form} className="main-button" type="button">{success ? 'Great!' : 'Okay'}</button>
      </div>
    </div>
  );
}

export default ConfirmationModule;