//Utility
import React from "react";
import { useParams } from "react-router";

//Components
import MemberIcon from "../MemberIcon/MemberIcon";


const ListCardDetails = (): React.JSX.Element => {

	const cardId = useParams().cardId;

	//Replace the below information with data returned by call to API getting specific card information based on cardId above.

	const members = ["Member 1", "Member 2", "Member 3"];
	const labels = ["label 1", "label 2", "label 3"];
	const cardNumber = "abc123";
	const description = "";
	const activity = "";

	const iconComponents = members.map( member => (
		<MemberIcon name={member}/>
	))


	return (
		<div
			id='ListCardDetails'
			style={{
				position: "absolute",
				width: "100vw",
				height: "100vh",
				left: "0",
				marginLeft: "auto",
				right: "0",
				marginRight: "auto",
				top: "0",
				backdropFilter: "blur(4px)",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
			}}>
			<div
				style={{
					backgroundColor: " hsl(0, 2%, 17%)",
					width: "50%",
					height: "90%",
					position: "relative",
					borderRadius: ".5rem",
					padding: "1rem 1rem",
				}}>
				<div>
					<h1
						style={{
							padding: "0",
							margin: "0",
							display: "block",
						}}>
						Terrazzo
					</h1>
				</div>
				<div
					style={{
						display: "flex",
						border: "1px solid blue",
						height: "90%",
						position: "relative",
					}}>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							justifyContent: "space-between",
							width: "75%"
						}}>
						<div
							style={{
								border: "1px solid hsl(0, 2%, 60%)",
								width: "100%",
								display: "flex",
								columnGap: "2rem"
							}}>
							<div style={{
								display: "flex",
								flexDirection: "column"
							}}>
								<p style={{
									fontSize: "12px"
								}}>Members</p>
								<div style={{ display: "flex", columnGap: ".5rem"}}>
								{iconComponents}
								<MemberIcon name={"+"}/>
								</div>
							</div>
							<div style={{
								display: "flex",
								flexDirection: "column"
							}}>
								<p style={{
									fontSize: "12px"
								}}>Labels</p>
								<div style={{
									display: "flex"
								}}>

									{ labels.map( label => (
										<button>{label}</button>
									))}
									</div>
							</div>
							<div style={{
								display: "flex",
								flexDirection: "column"
							}}>
								<p style={{
									fontSize: "12px"
								}}>Card Number</p>
								<div><p>{cardNumber}</p></div>
							</div>
						</div>
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								border: "1px solid hsl(0, 2%, 60%)",
							}}>
							<h3>Description</h3>
							<input type='textarea' style={{ height: "10rem"}}/>
						</div>
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								border: "1px solid hsl(0, 2%, 60%)",
							}}>
							<h3>Activity</h3>
							<input type='textarea' style={{ height: "10rem"}}/>
						</div>
					</div>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							border: "1px solid hsl(0, 2%, 60%)",
							width: "25%"
						}}>
						<ul style={{
							listStyle: "none"
						}}>
							<li>Terrazzo</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ListCardDetails;
