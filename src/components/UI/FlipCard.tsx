import React from "react";
import { NavLink } from "react-router-dom";

import classes from './FlipCard.module.css';

const FlipCard: React.FC<{title: string; description: string; link: string}> = ({title, description, link}) => {
  return (
    <NavLink id="create-own" to={`${link}`} className={classes["flip-card"]}>
      <div className={classes["flip-card-inner"]}>
        <div className={classes["flip-card-front"]}>
          <h2>{title}</h2>
        </div>
        <div className={classes["flip-card-back"]}>
          <p className="big-p">{description}</p>
        </div>
      </div>
    </NavLink>
  );
}

export default FlipCard;