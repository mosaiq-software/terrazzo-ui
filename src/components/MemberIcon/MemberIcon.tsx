import React from "react";

interface Props{
    name: string
}
const MemberIcon = ({ name }: Props): React.JSX.Element => {
    return (
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
                        {name[0].toUpperCase()}
				</p>
    )
}

export default MemberIcon