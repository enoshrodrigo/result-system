// resources/js/components/Footer.jsx

import React from 'react';

const Footer = () => {
  return (
    <center> 
                <footer className="bg-white text-black p-4 text-center mt-20">
      &copy; 
      {
          new Date().getFullYear()
      }
      { ' ' }BCI Campus. All rights reserved.
    </footer>
          </center>
  );
};

export default Footer;
