import { proxy } from "valtio";

interface Policy {
  id: string;
  navTitle: string;
  title: string;
  content: string;
}

interface LegalPageData {
  title: string;
  slug?: string;
  policies: Policy[];
}

interface LegalStore {
  legalPage: LegalPageData | null;
  isLoading: boolean;
  setLegalPage: (data: LegalPageData) => void;
  setLoading: (loading: boolean) => void;
}

export const legalStore = proxy<LegalStore>({
  legalPage: null,
  isLoading: true,

  setLegalPage(data: LegalPageData) {
    this.legalPage = data;
    this.isLoading = false;
  },

  setLoading(loading: boolean) {
    this.isLoading = loading;
  },
});