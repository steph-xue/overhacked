import { create } from "zustand";

interface UserStore {
  name: string;
  yearsOfExperience: number;
  favouriteLanguage: string;
  setUser: (data: {
    name: string;
    yearsOfExperience: number;
    favouriteLanguage: string;
  }) => void;
}

const useUserStore = create<UserStore>((set) => ({
  name: "",
  yearsOfExperience: 1,
  favouriteLanguage: "",
  setUser: (data) => set(data),
}));

export default useUserStore;
