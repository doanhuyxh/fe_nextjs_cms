'use client';

import { useState } from 'react';
import type { Editor } from 'grapesjs';
import GrapesJsStudio, {
  StudioCommands,
  ToastVariant,
} from '@grapesjs/studio-sdk/react';
import '@grapesjs/studio-sdk/style';


export default function Home() {

  const BASE_URL = 'http://160.30.161.87:9090';
  const PROJECT_ID = 'my_project_id';

  const [editor, setEditor] = useState<Editor>();

  const onReady = (editor: Editor) => {
    console.log('Editor ready:', editor);
    setEditor(editor);
  };

  const showToast = (id: string) =>
    editor?.runCommand(StudioCommands.toastAdd, {
      id,
      header: 'Toast header',
      content: 'Data logged in console',
      variant: ToastVariant.Info,
    });


  const getExportData = () => {
    if (editor) {
      console.log({ html: editor?.getHtml(), css: editor?.getCss() });
      fetch(`${BASE_URL}/public/${PROJECT_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: editor?.getHtml(), css: editor?.getCss() }),
      })
        .then((response) => response.json())
        .then((result) => {
          console.log('Export result:', result);
          showToast('export-data');
        })
        .catch((error) => {
          console.error('Error exporting data:', error);
          showToast('export-data');
        });
      

    }
  };

  return (
    <main className="flex h-screen flex-col justify-between p-5 gap-2">
      <div className="p-1 flex gap-5">
        
    
        <button className="border rounded px-2" onClick={getExportData}>
          publuclish
        </button>
      </div>
      <div className="flex-1 w-full h-full overflow-hidden">
        <GrapesJsStudio
          onReady={onReady}
          options={{
            licenseKey: '21b143842ebd4deba85b0392024b5c06d563db7ddd744a25a5cc46b38c7358a5',
            project: {
              type:"web",
            },
            assets:{
              storageType: 'self',
              onUpload: async ({ files }) => {
                const body = new FormData();
                for (const file of files) {
                  body.append('files', file);
                }
                const response = await fetch(`${BASE_URL}/upload`, { method: 'POST', body });
                const result = await response.json();
                return result;
              },
              onLoad: async () => {
                // Load assets from your server
                const response = await fetch(`${BASE_URL}/assets`);
                const result = await response.json();
                // you can also provide default assets here
                return [ { src: `${BASE_URL}/assets` }, ...result ];
              },
              // Provide a custom handler for deleting assets
              onDelete: async ({ assets }) => {
                const body = JSON.stringify(assets);
                await fetch(`${BASE_URL}/delete_assets`, { method: 'DELETE', body });
              }
            }, 
            storage: {
              type: 'self',
              onSave: async ({ project }) => {
                try {
                  const response = await fetch(`${BASE_URL}/save_project`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ project: { ...project, id: PROJECT_ID } }),
                  });
                  const result = await response.json();
                  console.log('Save result:', result);
                } catch (error) {
                  console.error('Error saving project:', error);
                }
              },
              onLoad: async () => {
                try {
                  const response = await fetch(`${BASE_URL}/load_project/${PROJECT_ID}`);
                  if (response.ok) {
                    const result = await response.json();
                    console.log('Load result:', result.project);
                    return result; // Đảm bảo rằng bạn trả về đúng cấu trúc
                  } else {
                    console.error('Error loading project:', response.statusText);
                    return null;
                  }
                } catch (error) {
                  console.error('Error loading project:', error);
                  return null;
                }
              },              
              autosaveChanges: 100,
              autosaveIntervalMs: 10000
            },
          }          
        }
        />
      </div>
    </main>
  );
}
