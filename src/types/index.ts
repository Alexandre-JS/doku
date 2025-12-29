export type FormField = {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'textarea';
  placeholder?: string;
  source: 'profile' | 'user_input'; // 'profile' pode vir pré-preenchido
};

export type FormSection = {
  section: string;
  fields: FormField[];
};
