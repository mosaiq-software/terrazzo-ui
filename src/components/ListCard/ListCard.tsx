//Utility
import React from "react";

//Components

//Styling
import "./ListCard.css";

const ListCard = (): React.JSX.Element => {
	return (
		<div id='ListCard'>
			<div className='CategoryTags'>
				{/* Placeholders for category tags. Replace with mapped array of category Tags */}
				<div className='CategoryTag'>Terrazzo</div>
				<div className='CategoryTag'>Terrazzo</div>
				<div className='CategoryTag'>Terrazzo</div>
			</div>
			<p className="cardDescription">Workspace UI </p>
			<div className="ListCard-bottomContainer">
				<p>TRZ-##</p>
                <p>A</p>
			</div>
		</div>
	);
};
export default ListCard;
