import React from 'react';
import {PluginClient, usePlugin, createState, useValue, Layout} from 'flipper-plugin';
import { Button, Tooltip, Space } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

type Data = {
  id: string;
  event?: string;
  timestamp
};

type Events = {
  newData: Data;
};

// Read more: https://fbflipper.com/docs/tutorial/js-custom#creating-a-first-plugin
// API: https://fbflipper.com/docs/extending/flipper-plugin#pluginclient
export function plugin(client: PluginClient<Events, {}>) {
  const data = createState<Record<string, Data>>({}, {persist: 'data'});

  client.onMessage('newData', (newData) => {
    data.update((draft) => {
      draft[newData.id] = newData;
    });
  });

  const fullSyncRequest = (params: string) => {
    client
      .send('fullsync', {
        params,
      })};

  client.addMenuEntry({
    action: 'clear',
    handler: async () => {
      data.set({});
    },
    accelerator: 'ctrl+l',
  });

  return {
    data,
    fullSyncRequest
  };
}

// Read more: https://fbflipper.com/docs/tutorial/js-custom#building-a-user-interface-for-the-plugin
// API: https://fbflipper.com/docs/extending/flipper-plugin#react-hooks
export function Component() {
  const instance = usePlugin(plugin);
  const data:Data = useValue(instance.data);

  return (
    <Layout.ScrollContainer>
      <Space direction="vertical">
    <Space wrap>
    <Tooltip title="full sync">
        <Button 
        icon={<ReloadOutlined />} 
        onClick={() => instance.fullSyncRequest("")}
        />
      </Tooltip>
    </Space>
  </Space>
      {Object.entries(data).map(([id, d]) => (
        <pre key={id} data-testid={id}>
          
          {console.log(id, d)}
          {JSON.stringify(d)}
        </pre>
      ))}
    </Layout.ScrollContainer>
  );
}