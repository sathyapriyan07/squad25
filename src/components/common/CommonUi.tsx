import type { ReactNode } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export function PageHeader({
  title,
  subtitle,
  actions,
  badge,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  badge?: ReactNode;
}) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{
        mb: 3,
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
      }}
    >
      <Box>
        <Stack direction="row" spacing={1.5} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', md: '1.85rem' } }}>
            {title}
          </Typography>
          {badge}
        </Stack>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {actions && (
        <Stack direction="row" spacing={1.25} useFlexGap sx={{ flexWrap: 'wrap' }}>
          {actions}
        </Stack>
      )}
    </Stack>
  );
}

export function StatCard({
  label,
  value,
  sublabel,
  icon,
  accentColor = '#3B82F6',
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: ReactNode;
  accentColor?: string;
}) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.25 }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}
            >
              {label}
            </Typography>
            <Typography variant="h4" className="tabular-nums" sx={{ mt: 0.75, fontWeight: 700 }}>
              {value}
            </Typography>
            {sublabel && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {sublabel}
              </Typography>
            )}
          </Box>
          {icon && (
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: `${accentColor}1E`,
                color: accentColor,
                border: `1px solid ${accentColor}33`,
              }}
            >
              {icon}
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

export function EmptyState({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <Card sx={{ p: 4, textAlign: 'center' }}>
      <Stack spacing={1.5} sx={{ alignItems: 'center', maxWidth: 460, mx: 'auto' }}>
        {icon && (
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '14px',
              bgcolor: 'rgba(59,130,246,0.12)',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        )}
        <Typography variant="h6">{title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
        {action && <Box sx={{ pt: 1 }}>{action}</Box>}
      </Stack>
    </Card>
  );
}

export function LoadingState({ count = 4, height = 120 }: { count?: number; height?: number }) {
  return (
    <Stack spacing={2}>
      {Array.from({ length: count }).map((_, idx) => (
        <Skeleton
          key={idx}
          variant="rounded"
          height={height}
          sx={{ borderRadius: '14px', bgcolor: 'rgba(255,255,255,0.05)' }}
        />
      ))}
    </Stack>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  return (
    <TextField
      size="small"
      fullWidth
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            </InputAdornment>
          ),
        },
      }}
    />
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  confirmColor = 'error',
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmColor?: 'error' | 'primary' | 'warning';
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onCancel} color="inherit">
          Cancel
        </Button>
        <Button onClick={onConfirm} color={confirmColor} variant="contained">
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
