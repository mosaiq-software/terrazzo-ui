import React from "react";
import {Button} from "@mantine/core";
import {modals} from "@mantine/modals";
import { FaBell } from "react-icons/fa";

const Navbar = () => {

	return (
		<div
			style={{
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center",
				backgroundColor: "black",
				color: "white",
				height: "6vh",
			}}>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					padding: "0 1rem",
					columnGap: "2rem",
				}}>
				<p
					style={{
						color: "hsl(0, 2%, 60%",
					}}>
					Terrazzo
				</p>
				<button
					className='WorkspaceButton'
					style={{
						backgroundColor: " black",
						color: " hsl(0, 2%, 60%)",
						border: " none",
					}}>
					Workspace
				</button>
				<Button
					className='CreateButton'
					style={{
						backgroundColor: " rgb(30, 111, 233)",
						color: " white",
						border: " none",
						borderRadius: " .5rem",
						padding: " .1rem 1.2rem",
					}}
					onClick={() =>
						modals.openContextModal({
							modal: 'board',
							title: 'Create Board',
							innerProps: {},
						})
					}
				>
					Create +
				</Button>
			</div>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					padding: "0 1rem",
					columnGap: "2rem",
				}}>
				<input
					className='searchbar'
					type='text'
					value='Search'
					onChange={() => {}}
					style={{
						backgroundColor: " hsl(0, 2%, 40%)",
						border: " 1px solid hsl(0, 2%, 60%)",
						borderRadius: " .5rem",
						padding: " .4rem",
						color: "hsl(0, 2%, 60%)",
					}}
				/>
				<FaBell />
				<button
					className='profilieIcon'
					style={{
						display: "flex",
						justifyContent: " center",
						backgroundColor: " hsl(0, 2%, 40%)",
						borderRadius: " 50%",
						border: " none",
						height: " 35px",
						width: " 35px",
						margin: " 0",
						padding: " 0",
						fontSize: " 22px",
						color: "white",
					}}>
					F
				</button>
			</div>
		</div>
	);
};

export default Navbar;
