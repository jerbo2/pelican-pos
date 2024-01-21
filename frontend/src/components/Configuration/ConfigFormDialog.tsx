
import { useContext } from 'react';

import FormDialog from '../custom_MUI/FormDialog';

import { Button } from '../Styled';

import { ConfigurationContext } from './Configuration';

export default function ConfigFormDialog() {
  const { openDialog, handleCloseDialog, handleSetItemName } = useContext(ConfigurationContext);

  return (
    <FormDialog
      openDialog={openDialog}
      handleCloseDialog={handleCloseDialog}
      setItemName={handleSetItemName}
      dialogTitle="Create a new item!"
      dialogContent="Enter a name for this item below. . ."
      dialogActions={
        <>
          <Button onClick={() => { handleSetItemName(''); handleCloseDialog() }}>Cancel</Button>
          <Button type="submit">Create</Button>
        </>
      }
    />
  );
}
