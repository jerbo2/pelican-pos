import * as React from 'react';
import { Checkbox } from '../Styled';

interface ControlledCheckboxProps {
    checked: boolean;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    }

export default function ControlledCheckbox({checked, onChange}: ControlledCheckboxProps) {

  return (
    <Checkbox
      checked={checked}
      onChange={onChange}
      inputProps={{ 'aria-label': 'controlled' }}
    />
  );
}
