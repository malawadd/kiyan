import React, { useState, useCallback } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

interface AgentEditorProps {
  agent: {
    _id: Id<"agents">;
    name: string;
    fleekId: string;
    fleekData: any;
  };
  apiKey: string;
  sessionId: Id<"sessions">;
}

export function AgentEditor({ agent, apiKey, sessionId }: AgentEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [characterData, setCharacterData] = useState(() => {
    try {
      return JSON.parse(agent.fleekData.characterFile);
    } catch (e) {
      return null;
    }
  });

  const updateAgent = useAction(api.fleekAgents.updateAgentViaFleek);

  const handleSave = useCallback(async () => {
    try {
      setError(null);
      await updateAgent({
        sessionId,
        agentId: agent._id,
        apiKey,
        updateData: {
          name: characterData.name,
          characterFile: JSON.stringify(characterData)
        }
      });
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message);
    }
  }, [agent._id, apiKey, characterData, sessionId, updateAgent]);

  const updateField = useCallback((path: string[], value: any) => {
    setCharacterData(prev => {
      const newData = { ...prev };
      let current = newData;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return newData;
    });
  }, []);

  if (!characterData) {
    return <div className="nb-panel-warning p-4">Invalid character data</div>;
  }

  return (
    <div className="nb-panel p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold">{agent.name}</h3>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="nb-button-accent px-4 py-2"
        >
          {isEditing ? 'Save Changes' : 'Edit Agent'}
        </button>
      </div>

      {error && (
        <div className="nb-panel-warning p-4">
          <p className="text-sm font-bold">Error: {error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="nb-panel-white p-4">
          <h4 className="text-lg font-bold mb-3">Basic Info</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">Name</label>
              <input
                type="text"
                value={characterData.name}
                onChange={(e) => updateField(['name'], e.target.value)}
                disabled={!isEditing}
                className="nb-input w-full px-4 py-2"
              />
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="nb-panel-white p-4">
          <h4 className="text-lg font-bold mb-3">Bio</h4>
          <div className="space-y-2">
            {characterData.bio.map((item: string, index: number) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const newBio = [...characterData.bio];
                    newBio[index] = e.target.value;
                    updateField(['bio'], newBio);
                  }}
                  disabled={!isEditing}
                  className="nb-input w-full px-4 py-2"
                />
                {isEditing && (
                  <button
                    onClick={() => {
                      const newBio = characterData.bio.filter((_: any, i: number) => i !== index);
                      updateField(['bio'], newBio);
                    }}
                    className="nb-button-warning px-3"
                  >
                    X
                  </button>
                )}
              </div>
            ))}
            {isEditing && (
              <button
                onClick={() => updateField(['bio'], [...characterData.bio, ''])}
                className="nb-button w-full py-2"
              >
                + Add Bio Line
              </button>
            )}
          </div>
        </div>

        {/* Lore Section */}
        <div className="nb-panel-accent p-4">
          <h4 className="text-lg font-bold mb-3">Lore</h4>
          <div className="space-y-2">
            {characterData.lore.map((item: string, index: number) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const newLore = [...characterData.lore];
                    newLore[index] = e.target.value;
                    updateField(['lore'], newLore);
                  }}
                  disabled={!isEditing}
                  className="nb-input w-full px-4 py-2"
                />
                {isEditing && (
                  <button
                    onClick={() => {
                      const newLore = characterData.lore.filter((_: any, i: number) => i !== index);
                      updateField(['lore'], newLore);
                    }}
                    className="nb-button-warning px-3"
                  >
                    X
                  </button>
                )}
              </div>
            ))}
            {isEditing && (
              <button
                onClick={() => updateField(['lore'], [...characterData.lore, ''])}
                className="nb-button w-full py-2"
              >
                + Add Lore Line
              </button>
            )}
          </div>
        </div>

        {/* Knowledge Section */}
        <div className="nb-panel-success p-4">
          <h4 className="text-lg font-bold mb-3">Knowledge</h4>
          <div className="space-y-2">
            {characterData.knowledge.map((item: string, index: number) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const newKnowledge = [...characterData.knowledge];
                    newKnowledge[index] = e.target.value;
                    updateField(['knowledge'], newKnowledge);
                  }}
                  disabled={!isEditing}
                  className="nb-input w-full px-4 py-2"
                />
                {isEditing && (
                  <button
                    onClick={() => {
                      const newKnowledge = characterData.knowledge.filter((_: any, i: number) => i !== index);
                      updateField(['knowledge'], newKnowledge);
                    }}
                    className="nb-button-warning px-3"
                  >
                    X
                  </button>
                )}
              </div>
            ))}
            {isEditing && (
              <button
                onClick={() => updateField(['knowledge'], [...characterData.knowledge, ''])}
                className="nb-button w-full py-2"
              >
                + Add Knowledge
              </button>
            )}
          </div>
        </div>

        {/* Plugins Section */}
        <div className="nb-panel-warning p-4">
          <h4 className="text-lg font-bold mb-3">Plugins</h4>
          <div className="space-y-2">
            {characterData.plugins.map((plugin: string, index: number) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={plugin}
                  onChange={(e) => {
                    const newPlugins = [...characterData.plugins];
                    newPlugins[index] = e.target.value;
                    updateField(['plugins'], newPlugins);
                  }}
                  disabled={!isEditing}
                  className="nb-input w-full px-4 py-2"
                />
                {isEditing && (
                  <button
                    onClick={() => {
                      const newPlugins = characterData.plugins.filter((_: any, i: number) => i !== index);
                      updateField(['plugins'], newPlugins);
                    }}
                    className="nb-button-warning px-3"
                  >
                    X
                  </button>
                )}
              </div>
            ))}
            {isEditing && (
              <button
                onClick={() => updateField(['plugins'], [...characterData.plugins, '@elizaos/plugin-'])}
                className="nb-button w-full py-2"
              >
                + Add Plugin
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}