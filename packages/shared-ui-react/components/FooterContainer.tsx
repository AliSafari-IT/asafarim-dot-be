import React, { PropsWithChildren } from 'react'
export default function FooterContainer({children}: PropsWithChildren) {
    return (
      <footer className="border-t w-full">
        {children}
        {!children && (
          <div className="w-full max-w-6xl mx-auto px-4 py-3 text-center">
            {new Date().getFullYear()} ASafariM — All rights reserved.
          </div>
        )}
      </footer>
    );
}