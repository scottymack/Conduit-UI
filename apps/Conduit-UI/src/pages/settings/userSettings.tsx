import React, { ReactElement } from 'react';
import SettingsLayout from '../../components/navigation/InnerLayouts/settingsLayout';
import dynamic from 'next/dynamic';
import LoaderComponent from '../../components/common/LoaderComponent';

const UserSettingsTab = dynamic(() => import('../../components/settings/UserSettingsLayout'), {
  loading: () => <LoaderComponent />,
});

const UserSettings = () => {
  return <UserSettingsTab />;
};

UserSettings.getLayout = function getLayout(page: ReactElement) {
  return <SettingsLayout>{page}</SettingsLayout>;
};

export default UserSettings;