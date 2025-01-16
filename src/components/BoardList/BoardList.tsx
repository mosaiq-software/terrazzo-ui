// Utility
import React from "react";

//Components
import ListCard from "../ListCard/ListCard";

const BoardList = (): React.JSX.Element => {
	return (
		<div
			id='BoardList'
			style={{
				display: " flex",
				flexDirection: "column",
				backgroundColor: " black",
				width: " 20rem",
				margin: " 0 0 0 2rem",
				borderRadius: " .5rem",
				color: "white",
				height: " fit-content",
			}}>
			<h2
				style={{
					margin: " 0",
					padding: " 0 .5rem",
				}}>
				Title
			</h2>

			{/* Placeholders for Card Components */}
			<ListCard></ListCard>
			<button
				className='AddCardButton'
				style={{
					margin: "1rem",
				}}>
				Add Card +{" "}
			</button>
		</div>
	);
};

export default BoardList;
