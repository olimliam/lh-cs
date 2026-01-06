import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';

export const TourLayout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Outlet />
    </Box>
  );
};
