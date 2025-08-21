'use client';

import { useTranslation } from 'react-i18next';
import {
  Box,
  Container,
  Typography,
  Link,
  Grid,
  Divider,
  useTheme,
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
} from '@mui/icons-material';

export function Footer() {
  const { t } = useTranslation();
  const theme = useTheme();

  const footerLinks = {
    product: [
      { label: 'Features', labelAr: 'المميزات', href: '/features' },
      { label: 'Pricing', labelAr: 'الأسعار', href: '/pricing' },
      { label: 'API', labelAr: 'واجهة برمجة', href: '/api' },
    ],
    company: [
      { label: 'About', labelAr: 'حول', href: '/about' },
      { label: 'Blog', labelAr: 'المدونة', href: '/blog' },
      { label: 'Careers', labelAr: 'الوظائف', href: '/careers' },
    ],
    support: [
      { label: 'Help Center', labelAr: 'مركز المساعدة', href: '/help' },
      { label: 'Contact', labelAr: 'اتصل بنا', href: '/contact' },
      { label: 'Privacy', labelAr: 'الخصوصية', href: '/privacy' },
    ],
    legal: [
      { label: 'Terms', labelAr: 'الشروط', href: '/terms' },
      { label: 'Privacy', labelAr: 'الخصوصية', href: '/privacy' },
      { label: 'Cookies', labelAr: 'ملفات تعريف الارتباط', href: '/cookies' },
    ],
  };

  const socialLinks = [
    { icon: <FacebookIcon />, href: 'https://facebook.com/awfr', label: 'Facebook' },
    { icon: <TwitterIcon />, href: 'https://twitter.com/awfr', label: 'Twitter' },
    { icon: <InstagramIcon />, href: 'https://instagram.com/awfr', label: 'Instagram' },
    { icon: <LinkedInIcon />, href: 'https://linkedin.com/company/awfr', label: 'LinkedIn' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        mt: 'auto',
        pt: 6,
        pb: 3,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Brand Section */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="h5"
              component="div"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(45deg, #1976d2 30%, #ff9800 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
              }}
            >
              {t('app_name')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {t('app_description')}
            </Typography>
            
            {/* Social Links */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'white',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  {social.icon}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Links Sections */}
          <Grid item xs={6} md={2}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Product
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {footerLinks.product.map((link) => (
                <Box component="li" key={link.href} sx={{ mb: 1 }}>
                  <Link
                    href={link.href}
                    sx={{
                      color: 'text.secondary',
                      textDecoration: 'none',
                      '&:hover': {
                        color: 'primary.main',
                      },
                    }}
                  >
                    {link.label}
                  </Link>
                </Box>
              ))}
            </Box>
          </Grid>

          <Grid item xs={6} md={2}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Company
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {footerLinks.company.map((link) => (
                <Box component="li" key={link.href} sx={{ mb: 1 }}>
                  <Link
                    href={link.href}
                    sx={{
                      color: 'text.secondary',
                      textDecoration: 'none',
                      '&:hover': {
                        color: 'primary.main',
                      },
                    }}
                  >
                    {link.label}
                  </Link>
                </Box>
              ))}
            </Box>
          </Grid>

          <Grid item xs={6} md={2}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Support
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {footerLinks.support.map((link) => (
                <Box component="li" key={link.href} sx={{ mb: 1 }}>
                  <Link
                    href={link.href}
                    sx={{
                      color: 'text.secondary',
                      textDecoration: 'none',
                      '&:hover': {
                        color: 'primary.main',
                      },
                    }}
                  >
                    {link.label}
                  </Link>
                </Box>
              ))}
            </Box>
          </Grid>

          <Grid item xs={6} md={2}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Legal
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {footerLinks.legal.map((link) => (
                <Box component="li" key={link.href} sx={{ mb: 1 }}>
                  <Link
                    href={link.href}
                    sx={{
                      color: 'text.secondary',
                      textDecoration: 'none',
                      '&:hover': {
                        color: 'primary.main',
                      },
                    }}
                  >
                    {link.label}
                  </Link>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Bottom Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', md: 'flex-start' },
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary" align="center">
            {t('footer_text')}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" align="center">
            {t('made_in_ksa')}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
