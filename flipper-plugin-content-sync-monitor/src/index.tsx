import React from 'react';
import { PluginClient, usePlugin, createState, useValue, Layout } from 'flipper-plugin';
import { Button, Tooltip, Space, DataTable } from 'antd';
import { ReloadOutlined, ClearOutlined, InfoOutlined } from '@ant-design/icons';

type Data = {
  id: string;
  type: string;
  operation: string;
  status: string;
  message: string;
  timestamp: string
};

type Events = {
  contentSyncData: Data;
};

export function plugin(client: PluginClient<Events, {}>) {
  const data = createState<Record<string, Data>>({}, { persist: 'data' });

  client.onMessage('contentSyncData', (contentSyncData) => {
    data.update((draft) => {
      draft[contentSyncData.id] = contentSyncData;
    });
  });

  const syncRequest = (params: string) => {
    client
      .send('runSynchronizer', {
        params,
      })
  };

  const clearTable = ()=>{
    data.set({});
  }

  client.addMenuEntry({
    action: 'clear',
    handler: async () => {
      data.set({});
    },
    accelerator: 'ctrl+l',
  });

  return {
    data,
    syncRequest,
    clearTable
  };
}


export function Component() {
  const instance = usePlugin(plugin);
  const data = useValue(instance.data);

  return (
    <Layout.ScrollContainer>
      <Space direction="vertical">
        <Space wrap>
          <Tooltip title="Request app full sync">
            <Button
              onClick={() => instance.syncRequest("sync_everything")}
            >Full Sync</Button>
          </Tooltip>
          <Tooltip title="Only resync markups">
            <Button
              onClick={() => instance.syncRequest("resync_markups")}
            >Markup Resync</Button>
          </Tooltip>
          <Tooltip title="Clear">
          <Button
              icon={<ClearOutlined />}
              onClick={() => instance.clearTable()}
            />
          </Tooltip>
        </Space>
      </Space>
      <table>
        <thead>
          <HeaderComponent/>
        </thead>
        <tbody>
          {Object.entries(data).map(([id, d]) => (
            <DataComponent data={d}></DataComponent>
          ))}
        </tbody>
      </table>
    </Layout.ScrollContainer>
  );
}


function DataComponent({ data: Data }) {
  const tableRowStyle = {
    border: '1px solid Gainsboro',
  }
  return (
    <tr key={Data.id} style={tableRowStyle}>
      <td>{Data.type}</td>
      <td>{Data.operation}</td>
      <td>{Data.status}</td>
      <td>{Data.timestamp}</td>
      <td>{Data.message}</td>
      <td><Button icon={<InfoOutlined />}></Button></td>
    </tr>
  )
}

function HeaderComponent() {
  const tableHeaderStyle = {
    textAlign: 'left',
    fontWeight: 'bold'
  };

  return (
    <tr style={tableHeaderStyle}>
      <th>Type</th>
      <th>Operation</th>
      <th>Status</th>
      <th>Time</th>
      <th>Message</th>
      <th>Inspect</th>
    </tr>
  )
}
