import React from "react";
import { Combobox, Modal, TextInput, useCombobox } from "@mantine/core";
import type { ModalBaseProps } from "@mantine/core";

import { MdOutlineSearch } from "react-icons/md";
import "@trz/styles/ModalSearch.css";

export interface TRZModalSearchProps extends ModalBaseProps {}


const TRZModalSearch = (props: TRZModalSearchProps) => {
  const combobox = useCombobox({ defaultOpened: true });

  const getOptions = (object: any[]) => {
    return object.map((item) => (
      <Combobox.Option value={item} key={item}>
        <div>
          {item}
        </div>
      </Combobox.Option>
    ));
  }

  return (
    <Modal.Root
      transitionProps={{ transition: 'scale-y' }}
      opened={props.opened}
      onClose={props.onClose}>
      <Modal.Overlay
        backgroundOpacity={0.5}
        blur={6}/>
      <Modal.Content>
        <Combobox store={combobox}>
          <Combobox.EventsTarget>
            <TextInput
              className={"trz-ModalSearch-textInput"}
              autoFocus={true}
              size={"lg"}
              placeholder={"Search"}
              leftSection={<MdOutlineSearch size={"1.25rem"}/>}
            ></TextInput>
          </Combobox.EventsTarget>
        </Combobox>
      </Modal.Content>
    </Modal.Root>
  );
}

export default TRZModalSearch;
