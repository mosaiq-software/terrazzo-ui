import React from 'react';

import {
    TextInput,
    useCombobox,
    Combobox
} from "@mantine/core"

const Autocomplete = ({placeholder, ...props}) => {
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });

    return (
        <Combobox store={combobox}>
            <Combobox.Target>
                <TextInput
                    variant="default"
                    placeholder={placeholder}>
                </TextInput>
            </Combobox.Target>
        </Combobox>
    )
}

export default Autocomplete;
