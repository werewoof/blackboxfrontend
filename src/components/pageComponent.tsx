import React, { FC } from "react";

interface pageProps {
  children: React.ReactNode; //buttons
}

const Page: FC<pageProps> = ({ children }) => {
  return (
    <div className="flex grow min-h-screen flex-col bg-shade-4">
      {children}
    </div>
  );
};

export default Page;
