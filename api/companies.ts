import { apiRequest } from "./client";

export type Company = {
  id: number;
  name: string;
  description: string;
  secteur: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  site_web?: string;
  logo?: string;
};

type Paginated<T> = {
  results?: T[];
};

const normalizeList = <T>(data: T[] | Paginated<T>) =>
  Array.isArray(data) ? data : data.results ?? [];

export const companyService = {
  async getAll(): Promise<Company[]> {
    const data = await apiRequest<Company[] | Paginated<Company>>(
      "companies/",
    );
    return normalizeList(data);
  },

  getById(id: number): Promise<Company> {
    return apiRequest<Company>(`companies/${id}/`);
  },
};
