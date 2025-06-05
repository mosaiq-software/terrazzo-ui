import React, {useEffect, useRef, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {useSocket} from "@trz/contexts/socket-context";
import {BoardHeader, BoardId, CardId, ListId, UID} from "@mosaiq/terrazzo-common/types";
import { useTRZ } from "@trz/contexts/TRZ-context";
import { Box, Button, Divider, Group, Space, Stack, Textarea, TextInput, Title } from "@mantine/core";
import { RoomType, ServerSE } from "@mosaiq/terrazzo-common/socketTypes";
import { useRoom } from "@trz/hooks/useRoom";
import { getBoardData, updateBoardField } from "@trz/emitters/all";
import { NoteType, notify } from "@trz/util/notifications";
import { useSocketListener } from "@trz/hooks/useSocketListener";
import { updateBaseFromPartial } from "@mosaiq/terrazzo-common/utils/arrayUtils";
import { DEFAULT_AUTHED_ROUTE } from "@trz/contexts/user-context";


const BoardSettingsPage = (): React.JSX.Element => {
	const [editedSettings, setEditedSettings] = useState<Partial<BoardHeader>>({});
	const [boardData, setBoardData] = useState<BoardHeader | undefined>();
	const params = useParams();
	const boardId = params.boardId as BoardId;
	const sockCtx = useSocket();
	const trz = useTRZ();
	const navigate = useNavigate();
	useRoom(RoomType.DATA, boardId, false);

	useEffect(() => {
		let strictIgnore = false;
		const fetchBoardData = async () => {
			await new Promise((resolve)=>setTimeout(resolve, 0));
			if(strictIgnore || !boardId || !sockCtx.connected){
				return;
			}
			try{
				const boardRes = await getBoardData(sockCtx, boardId);
				setBoardData(boardRes);
			} catch(err) {
				notify(NoteType.BOARD_DATA_ERROR, err);
				navigate("/dashboard");
				return;
			}
		};
		fetchBoardData();
		return ()=>{
			strictIgnore = true;
		}
	}, [boardId, sockCtx.connected]);

	useSocketListener<ServerSE.UPDATE_BOARD_FIELD>(ServerSE.UPDATE_BOARD_FIELD, (payload)=>{
		setBoardData(prev => {
			if(!prev) {return prev;}
			return updateBaseFromPartial<BoardHeader>(prev, payload);
		});
	});
	
	return (
		<Box style={{
			width: "80%",
			display: "flex",
			flexDirection: 'column',
			flexWrap: 'nowrap',
			alignItems: 'flex-start',
			justifyContent: 'flex-start',
		}}>
			<Box style={{
				width: "100%",
				display: "flex",
				justifyContent: "center"
			}}>
				<Stack style={{
					width: "40rem"
				}}>
					<Group>
						<Button 
							variant="outline"
							// disabled={props.myMembershipRecord.userRole < Role.ADMIN}
							onClick={()=>{
							}}
						>
							Cancel
						</Button>
						<Button 
							variant="filled"
							// disabled={props.myMembershipRecord.userRole < Role.ADMIN}
							onClick={async ()=>{
								// if(props.myMembershipRecord.userRole < Role.ADMIN){
								// 	notify(NoteType.UNAUTHORIZED);
								// 	return;
								// }
								try {
									updateBoardField(sockCtx, boardId, editedSettings);
									notify(NoteType.CHANGES_SAVED);
								} catch (e) {
									notify(NoteType.PROJECT_DATA_ERROR, e);
								}

							}}
						>
							Save
						</Button>
					</Group>
					<Divider/>
					<Space/>
					<Group gap="sm">
						<Button 
							variant="light"
							color="red"
							w="min-content"
							// disabled={props.myMembershipRecord.userRole < Role.OWNER}
							onClick={async ()=>{
								// if(props.myMembershipRecord.userRole < Role.OWNER){
									// notify(NoteType.UNAUTHORIZED);
									// return;
								// }
								try {
									updateBoardField(sockCtx, boardId, {archived: true});
									notify(NoteType.CHANGES_SAVED);
									navigate(DEFAULT_AUTHED_ROUTE);
								} catch (e) {
									notify(NoteType.PROJECT_DATA_ERROR, e);
								}

							}}
						>
							Archive Board
						</Button>
					</Group>
				</Stack>
			</Box>
		</Box>
	)
};

export default BoardSettingsPage;