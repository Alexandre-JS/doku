export type FormField = {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'textarea' | 'select';
  placeholder?: string;
  required?: boolean;
  options?: string[];
  source: 'profile' | 'user_input'; // 'profile' pode vir pré-preenchido
};

export type FormSection = {
  section: string;
  fields: FormField[];
};

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export interface Company {
  id: string;
  name: string;
  logo_url: string;
}

export interface Template {
  id: string;
  title: string;
  description?: string;
  slug: string;
  price?: string;
  popular?: boolean;
  category_id?: string;
  category?: Category;
  companies?: Company[];
  content_html?: string;
  form_schema?: any;
  is_active?: boolean;
}
