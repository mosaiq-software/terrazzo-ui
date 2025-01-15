// Utility
import React from "react";
import { faBell } from "@fortawesome/free-solid-svg-icons";

//Components
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

//Styling
import "./Navbar.css";

const Navbar = () => {
	return (
		<div id='Navbar'>
			<div>
				<p id="WorkspaceTitle">Terrazzo</p>
				<button className="WorkspaceButton">Workspace</button>
				<button className="CreateButton">Create +</button>
			</div>
			<div>
				<input className="searchbar" type='text' placeholder='Search' />
                <FontAwesomeIcon icon={faBell} className="fa-xl"/>
                <button className="profilieIcon">F</button>
			</div>
		</div>
	);
};

export default Navbar;
