import { Box } from "@mui/material";


export default function Logo() {
    return (
        <Box
            component='img'
            src="/pelican-logo-1-no-bg-trimmed.png"
            alt="logo"
            sx={{
                height: '12.5rem',
                width: '12.5rem',
                '&:hover': { transform: 'scale(1.05)' },
                transition: 'all 0.15s ease-in-out, transform 0.15s ease-in-out',
            }}
            loading='lazy'
        />
    )
}