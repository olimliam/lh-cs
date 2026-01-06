import styled from '@emotion/styled';
import { Theme } from '@mui/material/styles';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  Typography,
  Collapse,
} from '@mui/material';

export const StyledDrawer = styled(Drawer)<{ theme?: Theme }>(({ theme }) => ({
  width: 240,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: 240,
    boxSizing: 'border-box',
    borderRight: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    top: 64, // GNB 높이만큼 아래로
    height: 'calc(100vh - 64px)',
  },

  '&.collapsed': {
    width: 64,
    '& .MuiDrawer-paper': {
      width: 64,
      overflow: 'hidden',
    },
  },

  [theme.breakpoints.down('md')]: {
    '& .MuiDrawer-paper': {
      top: 56, // 모바일에서 GNB 높이
      height: 'calc(100vh - 56px)',
    },
  },
}));

export const NavigationList = styled(List)<{ theme?: Theme }>(({ theme }) => ({
  padding: theme.spacing(1, 0),
  width: '100%',
}));

export const NavigationItem = styled(ListItem)(() => ({
  padding: 0,
  display: 'block',
}));

export const NavigationButton = styled(ListItemButton)<{
  isActive?: boolean;
  depth?: number;
  theme?: Theme;
}>(({ theme, isActive, depth = 0 }) => ({
  minHeight: 48,
  paddingLeft: theme.spacing(2 + depth * 2),
  paddingRight: theme.spacing(2),
  margin: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius,
  transition: theme.transitions.create(['background-color', 'padding'], {
    duration: theme.transitions.duration.short,
  }),

  ...(isActive && {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.contrastText,
    },
  }),

  '&:hover': {
    backgroundColor: isActive
      ? theme.palette.primary.dark
      : theme.palette.action.hover,
  },

  '& .MuiListItemIcon-root': {
    minWidth: 40,
    color: isActive
      ? theme.palette.primary.contrastText
      : theme.palette.text.secondary,
  },

  '& .MuiListItemText-root': {
    margin: 0,
    '& .MuiListItemText-primary': {
      fontSize: '0.875rem',
      fontWeight: isActive ? 600 : 400,
    },
  },
}));

export const SectionTitle = styled(Typography)<{ theme?: Theme }>(
  ({ theme }) => ({
    padding: theme.spacing(1, 2),
    fontSize: '0.75rem',
    fontWeight: 600,
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginTop: theme.spacing(2),

    '&:first-of-type': {
      marginTop: theme.spacing(1),
    },
  })
);

export const CollapseIcon = styled('div')<{
  expanded?: boolean;
  theme?: Theme;
}>(({ theme, expanded }) => ({
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
  marginLeft: 'auto',
}));

export const SubMenuContainer = styled(Collapse)(() => ({
  '& .MuiCollapse-wrapper': {
    '& .MuiCollapse-wrapperInner': {
      paddingLeft: 0,
    },
  },
}));
