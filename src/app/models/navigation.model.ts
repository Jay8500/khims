export interface NavDocument {
  doc_id: string;
  doc_name: string;
  doc_route: string;
  doc_icon: string;
  doc_status?: boolean;
}

export interface NavModule {
  mod_id: string;
  mod_name: string;
  mod_icon: string;
  mod_order: number;
  documents: NavDocument[];
}