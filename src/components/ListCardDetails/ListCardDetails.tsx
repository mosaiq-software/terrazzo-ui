//Utility
import React from "react";
import { useParams } from "react-router";

//Components
import MemberIcon from "../MemberIcon/MemberIcon";

/**ListCardDetails Component
 *
 * State: none
 *
 * Props: {
 * id => unique id that maps to Terrazzo database
 * toggle => toggle function passed from ListCard parent
 * }
 */

interface Props {
	id: Number;
	toggle: () => void;
}

const ListCardDetails = ({ id, toggle }: Props): React.JSX.Element => {
	//Replace the below information with data returned by call to API getting specific card information based on cardId above.
	const members = ["Member 1", "Member 2", "Member 3"];
	const labels = ["label 1", "label 2", "label 3"];
	const cardNumber = "abc123";
	const description = "";
	const activity = "";

	const iconComponents = members.map((member) => <MemberIcon name={member} />);

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
					border: "1px solid hsl(0, 2%, 60%)",
				}}>
				<div style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center"
				}}>
					<h1
						style={{
							margin: "0",
							display: "block",
							padding: "1rem 1rem",
						}}>
						Terrazzo
					</h1>
					<div style={{
						padding: "1rem",
						fontSize: "24px"
					}}>
						<button onClick={toggle} style={{
							background: "none",
							border: "none",
							color: "white"
						}}>X</button>
					</div>
				</div>
				<div
					style={{
						display: "flex",
						height: "90%",
						position: "relative",
					}}>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							width: "75%",
						}}>
						<div
							style={{
								borderTop: "1px solid hsl(0, 2%, 60%)",
								borderBottom: "1px solid hsl(0, 2%, 60%)",
								width: "100%",
								display: "flex",
								justifyContent: "space-evenly",
								columnGap: "2rem",
								padding: "1rem 1rem",
							}}>
							<div
								style={{
									display: "flex",
									flexDirection: "column",
								}}>
								<p
									style={{
										fontSize: "12px",
									}}>
									Members
								</p>
								<div style={{ display: "flex", columnGap: ".5rem" }}>
									{iconComponents}
									<MemberIcon name={"+"} />
								</div>
							</div>
							<div
								style={{
									display: "flex",
									flexDirection: "column",
								}}>
								<p
									style={{
										fontSize: "12px",
									}}>
									Labels
								</p>
								<div
									style={{
										display: "flex",
										columnGap: "1rem",
									}}>
									{labels.map((label) => (
										<button>{label}</button>
									))}
								</div>
							</div>
							<div
								style={{
									display: "flex",
									flexDirection: "column",
								}}>
								<p
									style={{
										fontSize: "12px",
									}}>
									Card Number
								</p>
								<div>
									<p>{cardNumber}</p>
								</div>
							</div>
							<div>
								<p
									style={{
										fontSize: "12px",
									}}>
									Priority
								</p>
								<select>
									<option value="Low">Low</option>
									<option value="Medium">Medium</option>
									<option value="High">High</option>
								</select>
							</div>
						</div>
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								padding: "1rem 1rem",
							}}>
							<h3>Description</h3>
							<input type='textarea' style={{ height: "10rem" }} />
						</div>
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								padding: "1rem 1rem",
							}}>
							<h3>Activity</h3>
							<input type='textarea' style={{ height: "10rem" }} />
						</div>
					</div>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							border: "1px solid hsl(0, 2%, 60%)",
							width: "25%",
							padding: "1rem",
							rowGap: "1rem"
						}}>
							<button style={{
								backgroundColor: " hsl(0, 2%, 60%)",
								border: "none",
								borderRadius: ".1rem",
								color: "white",
							}
							}> Placeholder </button>

					</div>
				</div>
			</div>
		</div>
	);
};

export default ListCardDetails;
