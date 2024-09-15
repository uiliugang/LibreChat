// hooks/Plugins/usePluginInstall.ts
import { useCallback } from 'react';
import { useUpdateUserPluginsMutation } from 'librechat-data-provider/react-query';
import { useSetRecoilState } from 'recoil';
import store from '~/store';
export default function usePluginInstall(handlers = {}) {
    const setAvailableTools = useSetRecoilState(store.availableTools);
    const { onInstallError, onInstallSuccess, onUninstallError, onUninstallSuccess } = handlers;
    const updateUserPlugins = useUpdateUserPluginsMutation();
    const installPlugin = useCallback((pluginAction, plugin) => {
        updateUserPlugins.mutate(pluginAction, {
            onError: (error) => {
                if (onInstallError) {
                    onInstallError(error);
                }
            },
            onSuccess: (...rest) => {
                setAvailableTools((prev) => {
                    return { ...prev, [plugin.pluginKey]: plugin };
                });
                if (onInstallSuccess) {
                    onInstallSuccess(...rest);
                }
            },
        });
    }, [updateUserPlugins, onInstallError, onInstallSuccess, setAvailableTools]);
    const uninstallPlugin = useCallback((plugin) => {
        updateUserPlugins.mutate({ pluginKey: plugin, action: 'uninstall', auth: null }, {
            onError: (error) => {
                if (onUninstallError) {
                    onUninstallError(error);
                }
            },
            onSuccess: (...rest) => {
                setAvailableTools((prev) => {
                    const newAvailableTools = { ...prev };
                    delete newAvailableTools[plugin];
                    return newAvailableTools;
                });
                if (onUninstallSuccess) {
                    onUninstallSuccess(...rest);
                }
            },
        });
    }, [updateUserPlugins, onUninstallError, onUninstallSuccess, setAvailableTools]);
    return {
        installPlugin,
        uninstallPlugin,
    };
}
