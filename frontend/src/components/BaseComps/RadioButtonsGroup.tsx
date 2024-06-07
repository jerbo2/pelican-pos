import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import { Typography } from '@mui/material';

interface RadioButtonsGroupProps {
    options: string[];
    row?: boolean;
    selectedValue: string;
    setSelectedValue: (value: string) => void;
}

export default function RadioButtonsGroup({options, row, selectedValue, setSelectedValue}: RadioButtonsGroupProps) {
  return (
    <FormControl>
      <RadioGroup
        aria-labelledby="demo-radio-buttons-group-label"
        defaultValue="female"
        name="radio-buttons-group"
        row={row}
        value={selectedValue}
        onChange={(e) => setSelectedValue(e.target.value)}
        sx={{
            '& .MuiSvgIcon-root': {
              fontSize: 28,
            },
          }}
      >
        {options.map((option, index) => (
            <FormControlLabel key={index} value={option} control={<Radio />} label={<Typography variant='h6'>{option}</Typography>}/>
        ))}
      </RadioGroup>
    </FormControl>
  );
}
