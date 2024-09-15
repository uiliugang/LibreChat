import { useMemo } from 'react';
import { createAvatar } from '@dicebear/core';
import { initials } from '@dicebear/collection';
const avatarCache = {};
const useAvatar = (user) => {
    return useMemo(() => {
        if (!user?.username) {
            return '';
        }
        if (user.avatar) {
            return user.avatar;
        }
        const { username } = user;
        if (avatarCache[username]) {
            return avatarCache[username];
        }
        const avatar = createAvatar(initials, {
            seed: username,
            fontFamily: ['Verdana'],
            fontSize: 36,
        });
        let avatarDataUri = '';
        avatar
            .toDataUri()
            .then((dataUri) => {
            avatarDataUri = dataUri;
            avatarCache[username] = dataUri; // Store in cache
        })
            .catch((error) => {
            console.error('Failed to generate avatar:', error);
        });
        return avatarDataUri;
    }, [user]);
};
export default useAvatar;
