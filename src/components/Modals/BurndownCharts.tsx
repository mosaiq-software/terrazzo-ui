import {Modal} from "@mantine/core";
import {useTRZ} from "../../util/TRZ-context";
import {useSocket} from "../../util/socket-context";

const BurndownCharts = (): React.JSX.Element | null => {
    const trzCtx = useTRZ();
    const sockCtx = useSocket();
    const isOpen = !!trzCtx.openedCardModal;

    const onCloseModal = () => {
        trzCtx.setOpenedCardModal(null);
    }

    return (
        <Modal.Root
            opened={isOpen}
            onClose={onCloseModal}
        >
            <Modal.Overlay
                backgroundOpacity= {0.5}
                blur= {3}
            >
                <Modal.Header>
                    <Modal.Title>
                        hello
                    </Modal.Title>
                </Modal.Header>
            </Modal.Overlay>
        </Modal.Root>
    )
}

export default BurndownCharts;