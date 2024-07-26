"use client";

import { RecoilRoot } from "recoil";
import SubChildrens from "./SubChildrens";
export default function Childrens({ children }: { children: React.ReactNode }) {
  return (
    <RecoilRoot>
      <SubChildrens 
      >
                {children} 

      </SubChildrens>
    </RecoilRoot>
  );
}
