//Utility
import React from "react";

//Components
import BoardList from "../BoardList/BoardList";

//Styling
import "./Board.css";

const Board = (): React.JSX.Element => {
	return (
		<div id='Board'>
			<div className='sidebar'>
				<div className='organizations'>
					<div>
						<p>organization Placeholder</p>
						<div className='hamburgermenu'>
							<div id='line1' className='line'></div>
							<div id='line2' className='line'></div>
							<div id='line3' className='line'></div>
						</div>
					</div>
					<div className='boards'>
						{/* Placeholder for Board links */}
						<div>Board 1</div>
						<div>Board 2</div>
					</div>
					<div className='workspaces'>
						{/* Placeholder for Workspace links */}
						<div>WorkSpace 1</div>
						<div>WorkSpace 2</div>
					</div>
				</div>
				<div>
					{/* Placeholder for settings functionality */}
					<div className='settings'>
						<button>Settings</button>
					</div>
				</div>
			</div>

			<div className='cardContainer'>
				{/* Placeholder for List Components. Will be replaced with an array of mapped BoardList components*/}
				<BoardList></BoardList>
				<BoardList></BoardList>
					<button className="AddListButton">+ Add Another List</button>
			</div>
		</div>
	);
};

export default Board;
