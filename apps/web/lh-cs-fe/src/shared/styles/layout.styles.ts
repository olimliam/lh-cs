import styled from '@emotion/styled';
import { Theme } from '@mui/material/styles';
import { Box, Paper, AppBar, Drawer } from '@mui/material';

export const MainLayoutContainer = styled.div`
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.05);
  padding: 16px 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;

  border-radius: 8px;

  /* 태블릿 범위 (768px-1024px) - Figma 기준 */
  @media (min-width: 768px) and (max-width: 1024px) {
    padding: 18px 22px;
    gap: 22px;
  }

  /* 데스크톱 (1024px 이상) */
  @media (min-width: 1024px) {
    padding: 20px 24px;
    gap: 24px;
  }

  /* 모바일 (768px 이하) */
  @media (max-width: 768px) {
    padding: 14px 16px;
    gap: 16px;
  }

  /* 작은 모바일 (480px 이하) */
  @media (max-width: 480px) {
    padding: 12px 14px;
    gap: 14px;
  }
`;
// 메인 레이아웃 컨테이너
export const AdminLayoutContainer = styled(Box)<{ theme?: Theme }>(
  ({ theme }) => ({
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: theme.palette.grey[50],

    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
    },
  })
);

// GNB 스타일드 컴포넌트
export const StyledAppBar = styled(AppBar)<{ theme?: Theme }>(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: theme.palette.primary.main,
  boxShadow: theme.shadows[2],

  '& .MuiToolbar-root': {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    minHeight: 64,

    [theme.breakpoints.down('sm')]: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
      minHeight: 56,
    },
  },
}));

// 사이드바 드로어
export const StyledDrawer = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== 'collapsed',
})<{ collapsed?: boolean; theme?: Theme }>(({ theme, collapsed }) => ({
  width: collapsed ? 64 : 280,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),

  '& .MuiDrawer-paper': {
    width: collapsed ? 64 : 280,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
    backgroundColor: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
  },

  [theme.breakpoints.down('md')]: {
    width: 280,
    '& .MuiDrawer-paper': {
      width: 280,
    },
  },
}));

// 메인 컨텐츠 영역
export const MainContent = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'sidebarCollapsed',
})<{ sidebarCollapsed?: boolean; theme?: Theme }>(
  ({ theme, sidebarCollapsed }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    marginTop: 64,
    marginLeft: sidebarCollapsed ? 64 : 280,
    minHeight: 'calc(100vh - 64px)',
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),

    [theme.breakpoints.down('md')]: {
      marginLeft: 0,
      padding: theme.spacing(2),
    },

    [theme.breakpoints.down('sm')]: {
      marginTop: 56,
      padding: theme.spacing(1),
      minHeight: 'calc(100vh - 56px)',
    },
  })
);

// 프로필 위젯 컨테이너
export const ProfileWidgetContainer = styled(Paper)<{ theme?: Theme }>(
  ({ theme }) => ({
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(1),
    boxShadow: theme.shadows[1],

    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1.5),
      marginBottom: theme.spacing(1),
    },
  })
);

// 그리드 컨테이너 (상담실 목록/상세)
export const GridContainer = styled(Box)<{ theme?: Theme }>(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: theme.spacing(3),
  height: '100%',

  [theme.breakpoints.down('lg')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(2),
  },

  [theme.breakpoints.down('sm')]: {
    gap: theme.spacing(1),
  },
}));

// 컨테이너 카드
export const ContainerCard = styled(Paper)<{ theme?: Theme }>(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(1.5),
  boxShadow: theme.shadows[2],
  minHeight: 'calc(100vh - 200px)',

  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2),
    minHeight: 'auto',
  },

  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5),
    borderRadius: theme.spacing(1),
  },
}));

// 검색 필터 컨테이너
export const FilterContainer = styled(Box)<{ theme?: Theme }>(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.grey[50],
  borderRadius: theme.spacing(1),

  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    gap: theme.spacing(1.5),
  },

  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5),
    marginBottom: theme.spacing(2),
  },
}));

// 액션 버튼 그룹
export const ActionButtonGroup = styled(Box)<{ theme?: Theme }>(
  ({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'center',

    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      alignItems: 'stretch',
      '& > *': {
        width: '100%',
      },
    },
  })
);

// 반응형 테이블 컨테이너
export const ResponsiveTableContainer = styled(Box)<{ theme?: Theme }>(
  ({ theme }) => ({
    width: '100%',
    overflow: 'auto',

    '& .MuiDataGrid-root': {
      border: 'none',
      '& .MuiDataGrid-cell': {
        borderBottom: `1px solid ${theme.palette.divider}`,
      },
      '& .MuiDataGrid-columnHeaders': {
        backgroundColor: theme.palette.grey[100],
        borderBottom: `2px solid ${theme.palette.primary.main}`,
      },
    },

    [theme.breakpoints.down('md')]: {
      '& .MuiDataGrid-root': {
        '& .MuiDataGrid-columnHeaderTitle': {
          fontSize: '0.75rem',
        },
        '& .MuiDataGrid-cell': {
          fontSize: '0.75rem',
          padding: theme.spacing(0.5),
        },
      },
    },
  })
);

// 상태 배지
export const StatusBadge = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'status',
})<{ status: string; theme?: Theme }>(({ theme, status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'READY':
        return {
          backgroundColor: theme.palette.success.light,
          color: theme.palette.success.dark,
        };
      case 'IN_PROGRESS':
        return {
          backgroundColor: theme.palette.warning.light,
          color: theme.palette.warning.dark,
        };
      case 'COMPLETED':
        return {
          backgroundColor: theme.palette.info.light,
          color: theme.palette.info.dark,
        };
      case 'CANCELLED':
        return {
          backgroundColor: theme.palette.error.light,
          color: theme.palette.error.dark,
        };
      default:
        return {
          backgroundColor: theme.palette.grey[200],
          color: theme.palette.grey[800],
        };
    }
  };

  const statusColors = getStatusColor();

  return {
    display: 'inline-flex',
    alignItems: 'center',
    padding: theme.spacing(0.5, 1),
    borderRadius: theme.spacing(1),
    fontSize: '0.75rem',
    fontWeight: 600,
    ...statusColors,

    [theme.breakpoints.down('sm')]: {
      fontSize: '0.6875rem',
      padding: theme.spacing(0.25, 0.75),
    },
  };
});
