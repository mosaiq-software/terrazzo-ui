//Utility
import React from "react";

const ListCard = (): React.JSX.Element => {
	return (
		<div
			id='ListCard'
			style={{
				backgroundColor: " hsl(0, 2%, 17%)",
				margin: " .5rem",
				padding: " .4rem",
				borderRadius: " .5rem",
				border: "1px solid hsl(0,2%, 40%"
			}}>
			<div
				className='CategoryTags'
				style={{
					display: " flex",
				}}>
				{/* Placeholders for category tags. Replace with mapped array of category Tags */}
				<div
					className='CategoryTag'
					style={{
						backgroundColor: " white",
						borderRadius: " .3rem",
						margin: " 0 .2rem",
						padding: " 0 .6rem",
						color: " black",
					}}>
					Terrazzo
				</div>
				<div
					className='CategoryTag'
					style={{
						backgroundColor: " white",
						borderRadius: " .3rem",
						margin: " 0 .2rem",
						padding: " 0 .6rem",
						color: " black",
					}}>
					Terrazzo
				</div>
				<div
					className='CategoryTag'
					style={{
						backgroundColor: " white",
						borderRadius: " .3rem",
						margin: " 0 .2rem",
						padding: " 0 .6rem",
						color: " black",
					}}>
					Terrazzo
				</div>
			</div>
			<p
				className='cardDescription'
				style={{
					color: "white",
					padding: " 0 1rem",
				}}>
				Workspace UI{" "}
			</p>
			<div
				className='ListCard-bottomContainer'
				style={{
					display: " flex",
					justifyContent: " space-between",
					padding: " 0 1rem",
					color: " white",
				}}>
				<p
					style={{
						margin: " 0",
					}}>
					TRZ-##
				</p>
				<p
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						margin: " 0",
						width: "35px",
						height: "35px",
						borderRadius: "50%",
						textAlign: "center",
						backgroundColor: "hsl(0, 2%, 80%)",
						fontSize: "25px",
						color: "hsl(0, 2%, 17%",
					}}>
					A
				</p>
			</div>
		</div>
	);
};
export default ListCard;
