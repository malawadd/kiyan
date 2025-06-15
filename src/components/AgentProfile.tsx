import React from 'react';

interface AgentProfileProps {
  fleekData: {
    avatar: string | null;
    characterFile: {
      name: string;
      plugins: string[];
      bio: string[];
      lore: string[];
      knowledge: string[];
    };
  };
}

export function AgentProfile({ fleekData }: AgentProfileProps) {
    const { avatar } = fleekData;
    const characterFile = typeof fleekData.characterFile === "string"
    ? JSON.parse(fleekData.characterFile)
    : fleekData.characterFile;

    console.log('AgentProfile', { fleekData, avatar, characterFile });
    const { name, plugins = [], bio = [], lore = [], knowledge = [] } = characterFile || {};
    console.log('knowledge ', knowledge);
    console.log('bio ', bio);
    return (
      <div className="nb-panel p-6 space-y-6">
        <h2 className="text-2xl font-bold mb-4">Agent Profile</h2>
  
        {/* Avatar */}
        {avatar && (
          <div className="nb-panel-white p-4">
            <img 
              src={`data:image/png;base64,${avatar}`}
              alt={name}
              className="w-full rounded-lg border-4 border-black shadow-brutal"
            />
          </div>
        )}
  
        {/* Bio Section */}
        <div className="nb-panel-white p-4">
          <h3 className="text-xl font-bold mb-3">🎭 Bio</h3>
          <ul className="space-y-2">
            {(bio || []).map((item: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined, index: React.Key | null | undefined) => (
              <li key={index} className="font-medium">{item}</li>
            ))}
          </ul>
        </div>
  
        {/* Lore Section */}
        <div className="nb-panel-accent p-4">
          <h3 className="text-xl font-bold mb-3">📚 Lore</h3>
          <ul className="space-y-2">
            {(lore || []).map((item: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined, index: React.Key | null | undefined) => (
              <li key={index} className="font-medium">{item}</li>
            ))}
          </ul>
        </div>
  
        {/* Plugins Section */}
        <div className="nb-panel-success p-4">
          <h3 className="text-xl font-bold mb-3">🔌 Plugins</h3>
          <div className="flex flex-wrap gap-2">
            {(plugins || []).map((plugin: string, index: React.Key | null | undefined) => (
              <span key={index} className="nb-badge">
                {plugin.replace('@elizaos/plugin-', '')}
              </span>
            ))}
          </div>
        </div>
  
        {/* Knowledge Section */}
        <div className="nb-panel-warning p-4">
          <h3 className="text-xl font-bold mb-3">🧠 Knowledge</h3>
          <ul className="space-y-2">
            {(knowledge || []).map((item: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined, index: React.Key | null | undefined) => (
              <li key={index} className="font-medium">{item}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
  