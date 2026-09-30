import React from 'react';
import { LoginPage } from './LoginPage';
import { Actor } from '../lib/types';

interface RoleSelectProps {
  onSelect: (actor: Actor) => void;
  onBack?: () => void;
}

export const RoleSelect: React.FC<RoleSelectProps> = ({ onSelect }) => {
  return <LoginPage onSuccess={onSelect} />;
};
