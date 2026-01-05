import { IoMdClose } from 'react-icons/io';

import { ButtonProps, IconButton } from '@mui/material';

const CloseBtn = (props: ButtonProps) => {
  return (
    <IconButton {...props}>
      <IoMdClose />
    </IconButton>
  );
};

export default CloseBtn;
