import React from "react";
import {Modal} from "@mantine/core";
import {useTRZ} from "../util/TRZ-context";
import {useSocket} from "../util/socket-context";
import CardDetails from "./CardDetails";

const SprintReportDetails = (): React.JSX.Element | null => {
    const trzCtx = useTRZ();
    const sockCtx = useSocket();

    const bgColor = "#323a40";
    const textColor = "#ffffff";
    const closeColor = "#9fadbc";

    const isOpen = !!trzCtx.openedSprintReport;

    const onCloseModal = () => {
        trzCtx.setOpenedSprintReport(false);
    }

    if(!sockCtx.boardData || !trzCtx.setOpenedSprintReport){
        return null;
    }

    return (
        <Modal.Root
            opened={isOpen}
            onClose={onCloseModal}
            centered
            size={"auto"}
        >
            <Modal.Overlay
                backgroundOpacity= {0.5}
                blur= {3}
            />
            <Modal.Content
                h={"90vh"}
                w={"75vw"}
                bg={bgColor}
                c={textColor}
                style={{
                    overflowX: "hidden",
                    overflowY: "scroll"
                }}
            >
                <Modal.CloseButton
                    variant="transparent"
                    c={closeColor}
                    style={{
                        position: "absolute",
                        top: "0.75rem",
                        right: "0.75rem",
                        hover: "green",
                    }}
                />
            </Modal.Content>
        </Modal.Root>
    )
}

export default SprintReportDetails;