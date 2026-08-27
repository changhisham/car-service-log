import React, { useState } from 'react';
import { COLORS, FONT_BODY } from '../../styles/theme';
import { TextField } from '../common/TextField';
import { SelectField } from '../common/SelectField';
import { PrimaryButton } from '../common/PrimaryButton';
import { EXPENSE_CATEGORIES } from '../../constants/expenseCategories';
import { uid } from '../../utils/format';
import { todayISO } from '../../utils/date';

export function ExpenseForm({ initial, onSave }) {
  const [e, setE] = useState(initial || {
    id: uid(), date: todayISO(), category: 'parking', amount: '', description: '',
  });
  const set = (k) => (val) => setE(s => ({ ...s, [k]: val }));
  const canSave = e.date && e.amount !== '';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <TextField label="Date" required type="date" value={e.date} onChange={set('date')} />
        <TextField label="Amount" required type="number" value={e.amount} onChange={set('amount')} suffix="RM" placeholder="25" />
      </div>
      <SelectField label="Category" value={e.category} onChange={set('category')}
        options={EXPENSE_CATEGORIES.map(c => ({ value: c.key, label: c.label }))} />
      <TextField label="Description" value={e.description} onChange={set('description')} placeholder="What was this for?" />
      <PrimaryButton full disabled={!canSave} onClick={() => onSave(e)}>
        {initial ? 'Save changes' : 'Add expense'}
      </PrimaryButton>
    </div>
  );
}
