'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Language as LanguageIcon,
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  Home as HomeIcon,
  Info as InfoIcon,
  ContactSupport as ContactIcon,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '@/hooks';
import { setLanguage, setTheme } from '@/store/settingsSlice';

export function Header() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useAppDispatch();
  const { language, theme: currentTheme } = useAppSelector((state) => state.settings);

  const [languageAnchor, setLanguageAnchor] = useState<null | HTMLElement>(null);
  const [themeAnchor, setThemeAnchor] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLanguageClick = (event: React.MouseEvent<HTMLElement>) => {
    setLanguageAnchor(event.currentTarget);
  };

  const handleThemeClick = (event: React.MouseEvent<HTMLElement>) => {
    setThemeAnchor(event.currentTarget);
  };

  const handleLanguageClose = () => {
    setLanguageAnchor(null);
  };

  const handleThemeClose = () => {
    setThemeAnchor(null);
  };

  const handleLanguageChange = (newLanguage: 'ar' | 'en') => {
    dispatch(setLanguage(newLanguage));
    handleLanguageClose();
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    dispatch(setTheme(newTheme));
    handleThemeClose();
  };

  const navigationItems = [
    { label: t('app_name'), labelAr: t('app_name'), href: '/', icon: <HomeIcon /> },
    { label: 'About', labelAr: 'حول', href: '/about', icon: <InfoIcon /> },
    { label: 'Contact', labelAr: 'اتصل بنا', href: '/contact', icon: <ContactIcon /> },
  ];

  const renderDesktopMenu = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {navigationItems.map((item) => (
        <Button
          key={item.href}
          color="inherit"
          href={item.href}
          sx={{ textTransform: 'none' }}
        >
          {language === 'ar' ? item.labelAr : item.label}
        </Button>
      ))}
    </Box>
  );

  const renderMobileMenu = () => (
    <>
      <IconButton
        color="inherit"
        onClick={() => setMobileMenuOpen(true)}
        sx={{ display: { md: 'none' } }}
      >
        <MenuIcon />
      </IconButton>
      
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        sx={{ display: { md: 'none' } }}
      >
        <Box sx={{ width: 250, pt: 2 }}>
          <List>
            {navigationItems.map((item) => (
              <ListItem
                key={item.href}
                button
                component="a"
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={language === 'ar' ? item.labelAr : item.label}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Logo and Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(45deg, #1976d2 30%, #ff9800 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              cursor: 'pointer',
            }}
            onClick={() => window.location.href = '/'}
          >
            {t('app_name')}
          </Typography>
        </Box>

        {/* Desktop Navigation */}
        {!isMobile && renderDesktopMenu()}

        {/* Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Language Toggle */}
          <IconButton
            color="inherit"
            onClick={handleLanguageClick}
            aria-label="Language"
            sx={{ color: 'text.primary' }}
          >
            <LanguageIcon />
          </IconButton>
          
          <Menu
            anchorEl={languageAnchor}
            open={Boolean(languageAnchor)}
            onClose={handleLanguageClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={() => handleLanguageChange('en')}>
              English
            </MenuItem>
            <MenuItem onClick={() => handleLanguageChange('ar')}>
              العربية
            </MenuItem>
          </Menu>

          {/* Theme Toggle */}
          <IconButton
            color="inherit"
            onClick={handleThemeClick}
            aria-label="Theme"
            sx={{ color: 'text.primary' }}
          >
            {currentTheme === 'dark' ? <LightIcon /> : <DarkIcon />}
          </IconButton>
          
          <Menu
            anchorEl={themeAnchor}
            open={Boolean(themeAnchor)}
            onClose={handleThemeClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={() => handleThemeChange('light')}>
              {t('light')}
            </MenuItem>
            <MenuItem onClick={() => handleThemeChange('dark')}>
              {t('dark')}
            </MenuItem>
            <MenuItem onClick={() => handleThemeChange('system')}>
              {t('system')}
            </MenuItem>
          </Menu>

          {/* Mobile Menu */}
          {renderMobileMenu()}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
