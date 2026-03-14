import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '@/components/confirm-dialog';

interface CancelSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function CancelSessionDialog({
  open,
  onOpenChange,
  onConfirm,
}: CancelSessionDialogProps) {
  const { t } = useTranslation();

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title={t('session.cancelTitle')}
      description={t('session.cancelDescription')}
      cancelLabel={t('session.cancel')}
      confirmLabel={t('session.confirmCancel')}
    />
  );
}
