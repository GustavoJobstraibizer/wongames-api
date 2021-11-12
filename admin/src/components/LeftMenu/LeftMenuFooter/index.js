import React from 'react';
import Wrapper, { A } from './Wrapper';

 function LeftMenuFooter() {
   // PROJECT_TYPE is an env variable defined in the webpack config
   // eslint-disable-next-line no-undef
   return (
     <Wrapper>
       <div className="poweredBy">
         Powered By&nbsp;
          <A
            href="https://reactavancado.com.br"
            key="github"
            target="_blank"
            rel="noopener noreferrer"
          >
            React Avançado
          </A>
       </div>
     </Wrapper>
   );
 }

 export default LeftMenuFooter;
