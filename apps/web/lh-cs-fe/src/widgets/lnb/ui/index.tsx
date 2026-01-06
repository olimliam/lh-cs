import {
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import {
  Badge,
  IconButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from '@mui/material';
import React, { useState } from 'react';
import type { LNBWidgetProps, NavigationItem as NavItem } from '../model';
import {
  CollapseIcon,
  NavigationButton,
  NavigationItem,
  NavigationList,
  StyledDrawer,
  SubMenuContainer,
} from './lnb.styles';

const LNBWidget: React.FC<LNBWidgetProps> = ({
  navigationItems,
  isCollapsed = false,
  onItemClick,
  onToggleCollapse,
  currentPath = '',
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const handleToggleExpand = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const isItemActive = (item: NavItem): boolean => {
    return item.path === currentPath || item.isActive || false;
  };

  const renderNavigationItem = (item: NavItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const isActive = isItemActive(item);

    return (
      <React.Fragment key={item.id}>
        <NavigationItem>
          <NavigationButton
            isActive={isActive}
            depth={depth}
            onClick={() => {
              if (hasChildren) {
                handleToggleExpand(item.id);
              } else {
                onItemClick(item);
              }
            }}
          >
            {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}

            {!isCollapsed && (
              <>
                <ListItemText
                  primary={item.label}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontSize: depth > 0 ? '0.8rem' : '0.875rem',
                    },
                  }}
                />

                {item.badge && item.badge > 0 && (
                  <Badge
                    badgeContent={item.badge}
                    color='error'
                    sx={{ mr: 1 }}
                  />
                )}

                {hasChildren && (
                  <CollapseIcon expanded={isExpanded}>
                    <ExpandMoreIcon fontSize='small' />
                  </CollapseIcon>
                )}
              </>
            )}
          </NavigationButton>
        </NavigationItem>

        {hasChildren && !isCollapsed && (
          <SubMenuContainer in={isExpanded} timeout='auto' unmountOnExit>
            <NavigationList disablePadding>
              {item.children!.map((child) =>
                renderNavigationItem(child, depth + 1)
              )}
            </NavigationList>
          </SubMenuContainer>
        )}
      </React.Fragment>
    );
  };

  return (
    <StyledDrawer
      variant='permanent'
      className={isCollapsed ? 'collapsed' : ''}
      open={true}
    >
      <NavigationList>
        {navigationItems.map((item) => renderNavigationItem(item))}
      </NavigationList>

      {onToggleCollapse && (
        <Tooltip title={isCollapsed ? '메뉴 펼치기' : '메뉴 접기'}>
          <IconButton
            onClick={onToggleCollapse}
            sx={{
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'background.paper',
              border: 1,
              borderColor: 'divider',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <ChevronRightIcon
              sx={{
                transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)',
                transition: 'transform 0.2s',
              }}
            />
          </IconButton>
        </Tooltip>
      )}
    </StyledDrawer>
  );
};

export default LNBWidget;
