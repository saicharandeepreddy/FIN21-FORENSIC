import React from 'react';
import { UploadForm } from '../../components/UploadForm';
import { Actor } from '../../lib/types';

interface SubmitProps {
  user: Actor;
  onSubmit: (formData: FormData) => Promise<void>;
  isSubmitting: boolean;
}

export const SubmitView: React.FC<SubmitProps> = ({ user, onSubmit, isSubmitting }) => {
  return (
    <div className="w-full">
      <UploadForm user={user} onSubmit={onSubmit} isSubmitting={isSubmitting} />
    </div>
  );
};
