import React from 'react';
import SharedLayout from './sharedLayout';
import { Sms } from '@material-ui/icons';

const SMSLayout: React.FC = ({ children }) => {
  const pathNames = ['/sms/send', '/sms/provider-details'];

  const labels = [
    { name: 'send', id: 'send' },
    { name: 'provider-details', id: 'provider-details' },
  ];

  return (
    <SharedLayout
      title={'SMS'}
      labels={labels}
      pathNames={pathNames}
      swagger={'cms'}
      icon={<Sms />}>
      {children}
    </SharedLayout>
  );
};

export default SMSLayout;
