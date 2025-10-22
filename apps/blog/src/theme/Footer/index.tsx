import React from 'react';
import { FooterContainer } from '@asafarim/shared-ui-react';
import './styles.css';

export default function Footer(): JSX.Element {
  return (
    <div className="blog-footer-wrapper">
      <FooterContainer key={"blog-footer"} />
    </div>
  );
}
