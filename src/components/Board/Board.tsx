//Utility
import React from "react";

//Components
import BoardList from "../BoardList/BoardList";

const Board = (): React.JSX.Element => {
	return (
		<div
			id='Board'
			style={{
				display: "flex",
				backgroundColor: "hsl(0, 2%, 24%)",
				height: "94vh",
				overflowX: "scroll",

			}}>

			{/* Sideboard rendered for layout purposes. This should be a separate component at some point */}
			<div
				className='sidebar'
				style={{
					display: "flex",
					position: "sticky",
					left: "0",
					flexDirection: "column",
					justifyContent: "space-between",
					alignItems: "center",
					backgroundColor: "hsl(0, 2%, 17%)",
					width: "14rem",
					height: "94vh",
					color: "white",
					borderRight: "1px solid hsl(0, 2%, 40%)"
				}}>
				<div
					className='organizations'
					style={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						backgroundColor: "hsl(0, 2%, 17%)",
						width: "14rem",
						height: "100vh",
					}}>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-around",
							padding: "0 1rem",
							borderBottom: "1px solid hsl(0, 2%, 40%)",
							width: "100%",
						}}>
						<p>organization Placeholder</p>
						<div
							className='hamburgermenu'
							style={{
								display: "flex",
								flexDirection: "column",
								margin: ".2rem .2rem",
							}}>
							<div
								id='line1'
								className='line'
								style={{
									height: "0.2rem",
									width: "1rem",
									backgroundColor: "white",
								}}></div>
							<div
								id='line2'
								className='line'
								style={{
									height: "0.2rem",
									width: "1rem",
									backgroundColor: "white",
								}}></div>
							<div
								id='line3'
								className='line'
								style={{
									height: "0.2rem",
									width: "1rem",
									backgroundColor: "white",
								}}></div>
						</div>
					</div>
					<div
						className='boards'
						style={{
							display: "flex",
							flexDirection: "column",
							borderBottom: "1px solid hsl(0, 2%, 40%)",
							width: "100%",
						}}>
						{/* Placeholder for Board links */}
						<div
							style={{
								margin: ".3rem 0",
							}}>
							Board 1
						</div>
						<div
							style={{
								margin: ".3rem 0",
							}}>
							Board 2
						</div>
					</div>
					<div
						className='workspaces'
						style={{
							display: "flex",
							flexDirection: "column",
							borderBottom: "1px solid hsl(0, 2%, 40%)",
							width: "100%",
						}}>
						{/* Placeholder for Workspace links */}
						<div
							style={{
								margin: ".3rem 0",
							}}>
							WorkSpace 1
						</div>
						<div
							style={{
								margin: ".3rem 0",
							}}>
							WorkSpace 2
						</div>
					</div>
				</div>
				<div>
					{/* Placeholder for settings functionality */}
					<div
						className='settings'
						style={{
							textAlign: "center",
							marginBottom: "1rem",
						}}>
						<button>Settings</button>
					</div>
				</div>
			</div>

			<div
				className='cardContainer'
				style={{
					display: "flex",
					justifyContent: "start",
					paddingTop: "2rem",
				}}>
				{/* Placeholder for List Components. Will be replaced with an array of mapped BoardList components*/}
				<BoardList></BoardList>
				<BoardList></BoardList>
				<BoardList></BoardList>
				<BoardList></BoardList>
				<button
					className='AddListButton'
					style={{
						color: "black",
						width: "15rem",
						height: "5rem",
						margin: "0 0 0 2rem",
						borderRadius: ".5rem",
					}}>
					+ Add New List
				</button>
			</div>
		</div>
	);
};

export default Board;
