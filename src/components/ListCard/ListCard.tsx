//Utility
import { useToggle } from "@mantine/hooks";
import React, { useState} from "react";

//Components
import ListCardDetails from '../ListCardDetails/ListCardDetails'
import MemberIcon from '../MemberIcon/MemberIcon'

const ListCard = (): React.JSX.Element => {
	
	const [showDetails, toggleShowDetails] = useToggle([false, true]);

	return (
		<div
			id='ListCard'
			onClick={() => toggleShowDetails()}
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
				<MemberIcon name={"test"}/>
			</div>
			{ showDetails && <ListCardDetails/>}
		</div>
	);
};
export default ListCard;
