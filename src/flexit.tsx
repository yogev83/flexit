import React from "react";
import { BoxContainer } from "./boxContainer";

import "./flexit.css";

export function Flexit({ children, filtered, ...rest }) {
  return (
    <BoxContainer filtered={filtered} {...rest}>
      {children}
    </BoxContainer>
  );
}
