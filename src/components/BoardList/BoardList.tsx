// Utility
import React from "react";

//Components
import ListCard from "../ListCard/ListCard";

//Styling
import "./BoardList.css";

const BoardList = (): React.JSX.Element => {
	return (
		<div id='BoardList'>
			<h2>Title</h2>

			{/* Placeholders for Card Components */}
			<ListCard></ListCard>
			<button className='AddCardButton'>Add Card + </button>
		</div>
	);
};

export default BoardList;
